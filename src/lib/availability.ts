import type { SupabaseClient } from "@supabase/supabase-js";
import { getDay, parseISO, addDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { Database } from "@/types/database";

export interface TimeSlot {
  start: string; // ISO datetime
  end: string; // ISO datetime
}

/**
 * A time window represented as minutes-since-midnight in the provider's
 * local timezone. This keeps interval arithmetic simple and avoids
 * floating-point Date comparisons.
 */
interface MinuteWindow {
  start: number; // minutes from midnight
  end: number; // minutes from midnight
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse "HH:MM:SS" or "HH:MM" into minutes since midnight. */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Convert an ISO datetime string to minutes-since-midnight in the given
 * timezone.
 */
function isoToLocalMinutes(iso: string, tz: string): number {
  const zoned = toZonedTime(parseISO(iso), tz);
  return zoned.getHours() * 60 + zoned.getMinutes();
}

/**
 * Subtract a list of "busy" windows from a list of "free" windows.
 * All values are minutes-since-midnight.  Returns the remaining free
 * windows, sorted and non-overlapping.
 */
function subtractWindows(
  free: MinuteWindow[],
  busy: MinuteWindow[]
): MinuteWindow[] {
  let result: MinuteWindow[] = [...free];

  for (const b of busy) {
    const next: MinuteWindow[] = [];
    for (const f of result) {
      // No overlap
      if (b.start >= f.end || b.end <= f.start) {
        next.push(f);
        continue;
      }
      // Left remainder
      if (b.start > f.start) {
        next.push({ start: f.start, end: b.start });
      }
      // Right remainder
      if (b.end < f.end) {
        next.push({ start: b.end, end: f.end });
      }
    }
    result = next;
  }

  return result.sort((a, b) => a.start - b.start);
}

/**
 * Merge overlapping or adjacent windows into a minimal sorted list.
 */
function mergeWindows(windows: MinuteWindow[]): MinuteWindow[] {
  if (windows.length === 0) return [];
  const sorted = [...windows].sort((a, b) => a.start - b.start);
  const merged: MinuteWindow[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i].start <= last.end) {
      last.end = Math.max(last.end, sorted[i].end);
    } else {
      merged.push(sorted[i]);
    }
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Main algorithm
// ---------------------------------------------------------------------------

/**
 * Resolve a service's effective buffer times. Per-service override wins,
 * then provider default, then 0.
 */
function resolveBuffers(
  serviceBefore: number | null | undefined,
  serviceAfter: number | null | undefined,
  providerDefaults: { before: number; after: number }
): { before: number; after: number } {
  return {
    before:
      serviceBefore === null || serviceBefore === undefined
        ? providerDefaults.before
        : serviceBefore,
    after:
      serviceAfter === null || serviceAfter === undefined
        ? providerDefaults.after
        : serviceAfter,
  };
}

/**
 * Parse the booking defaults from a provider's branding JSON.
 */
/**
 * Derive the best "nice" slot interval from a service's duration.
 * Picks the largest of 15, 30, or 60 that divides evenly into the
 * duration. Falls back to 15 if nothing divides cleanly (e.g. 45 min).
 */
function autoSlotInterval(durationMinutes: number): number {
  if (durationMinutes >= 60 && durationMinutes % 60 === 0) return 60;
  if (durationMinutes >= 30 && durationMinutes % 30 === 0) return 30;
  return 15;
}

function parseBookingDefaults(branding: unknown): {
  slotIntervalRaw: number; // 0 = auto, 15/30/60 = fixed
  defaultBufferBefore: number;
  defaultBufferAfter: number;
  minNoticeHours: number;
} {
  const b = (branding || {}) as Record<string, unknown>;
  const slot = typeof b.default_slot_minutes === "number" ? b.default_slot_minutes : 0;
  const before = typeof b.default_buffer_before_minutes === "number" ? b.default_buffer_before_minutes : 0;
  const after = typeof b.default_buffer_after_minutes === "number" ? b.default_buffer_after_minutes : 0;
  const notice = typeof b.min_booking_notice_hours === "number" ? b.min_booking_notice_hours : 0;
  return {
    slotIntervalRaw: [0, 15, 30, 60].includes(slot) ? slot : 0,
    defaultBufferBefore: Math.max(0, Math.min(120, before)),
    defaultBufferAfter: Math.max(0, Math.min(120, after)),
    minNoticeHours: Math.max(0, Math.min(720, notice)),
  };
}

function resolveSlotInterval(raw: number, durationMinutes: number): number {
  return raw === 0 ? autoSlotInterval(durationMinutes) : raw;
}

export async function getAvailableSlots(
  supabase: SupabaseClient<Database>,
  providerId: string,
  serviceId: string,
  date: string // ISO date string like "2026-04-15"
): Promise<TimeSlot[]> {
  // ------ 1. Fetch target service -------------------------------------------
  const { data: service, error: serviceErr } = await supabase
    .from("services")
    .select(
      "duration_minutes, buffer_before_minutes, buffer_after_minutes, min_notice_hours, max_per_day"
    )
    .eq("id", serviceId)
    .single();

  if (serviceErr || !service) {
    throw new Error(`Service not found: ${serviceId}`);
  }

  const durationMinutes = service.duration_minutes;

  // ------ 2. Fetch provider + booking defaults ------------------------------
  const { data: provider, error: providerErr } = await supabase
    .from("providers")
    .select("timezone, branding")
    .eq("id", providerId)
    .single();

  if (providerErr || !provider) {
    throw new Error(`Provider not found: ${providerId}`);
  }

  const tz = provider.timezone;
  const { slotIntervalRaw, defaultBufferBefore, defaultBufferAfter, minNoticeHours } =
    parseBookingDefaults(provider.branding);
  const slotInterval = resolveSlotInterval(slotIntervalRaw, durationMinutes);

  // Per-service minimum notice override. NULL = inherit provider default,
  // any number (including 0) is a hard override.
  const effectiveMinNoticeHours =
    service.min_notice_hours === null || service.min_notice_hours === undefined
      ? minNoticeHours
      : Math.max(0, Math.min(720, service.min_notice_hours));

  // Earliest moment a client is allowed to book. Any slot starting before
  // this instant gets filtered out at the end.
  const earliestBookableMs = Date.now() + effectiveMinNoticeHours * 60 * 60 * 1000;

  // Resolve the NEW booking's effective buffers (service override → provider default)
  const newBuffers = resolveBuffers(
    service.buffer_before_minutes,
    service.buffer_after_minutes,
    { before: defaultBufferBefore, after: defaultBufferAfter }
  );

  // ------ 3. Day of week ----------------------------------------------------
  // Use noon UTC to avoid the midnight-rollback problem: parseISO("2026-04-13")
  // gives midnight UTC, which in western timezones (e.g. America/New_York at
  // UTC-4) converts to April 12 at 8pm — wrong day. Noon UTC stays on the
  // correct calendar date for every timezone from UTC-12 to UTC+12.
  const dateObj = parseISO(`${date}T12:00:00Z`);
  const zonedDate = toZonedTime(dateObj, tz);
  const dayOfWeek = getDay(zonedDate); // 0 = Sunday

  // ------ 4. Availability rules ---------------------------------------------
  const { data: rules } = await supabase
    .from("availability_rules")
    .select("start_time, end_time")
    .eq("provider_id", providerId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true);

  let freeWindows: MinuteWindow[] = (rules ?? []).map((r) => ({
    start: timeToMinutes(r.start_time),
    end: timeToMinutes(r.end_time),
  }));

  // ------ 5. Availability overrides -----------------------------------------
  const { data: overrides } = await supabase
    .from("availability_overrides")
    .select("start_time, end_time, is_blocked")
    .eq("provider_id", providerId)
    .eq("date", date);

  for (const o of overrides ?? []) {
    // 8a. Whole-day block
    if (o.is_blocked && o.start_time === null) {
      return [];
    }

    if (o.is_blocked && o.start_time !== null && o.end_time !== null) {
      // 8c. Blocked time range — subtract it
      freeWindows = subtractWindows(freeWindows, [
        {
          start: timeToMinutes(o.start_time),
          end: timeToMinutes(o.end_time),
        },
      ]);
    }

    if (!o.is_blocked && o.start_time !== null && o.end_time !== null) {
      // 8d. Extra availability — add it
      freeWindows.push({
        start: timeToMinutes(o.start_time),
        end: timeToMinutes(o.end_time),
      });
      freeWindows = mergeWindows(freeWindows);
    }
  }

  // ------ 6. Existing bookings ----------------------------------------------
  // Build the day boundaries in UTC so we can query ISO datetime columns.
  const dayStartUTC = fromZonedTime(
    new Date(`${date}T00:00:00`),
    tz
  ).toISOString();
  const dayEndUTC = fromZonedTime(
    new Date(`${date}T23:59:59`),
    tz
  ).toISOString();

  // Fetch all this provider's services so we can look up each existing
  // booking's own buffer times (bookings can be for different services, each
  // with its own buffer_before/after).
  const { data: allServices } = await supabase
    .from("services")
    .select("id, buffer_before_minutes, buffer_after_minutes")
    .eq("provider_id", providerId);

  const servicesById = new Map<
    string,
    { before: number | null; after: number | null }
  >();
  for (const s of allServices ?? []) {
    servicesById.set(s.id, {
      before: s.buffer_before_minutes,
      after: s.buffer_after_minutes,
    });
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("starts_at, ends_at, service_id")
    .eq("provider_id", providerId)
    .not("status", "in", '("cancelled")')
    .gte("starts_at", dayStartUTC)
    .lte("starts_at", dayEndUTC);

  // Daily cap — if this service has a max_per_day and we're already at
  // the limit, the whole day is closed regardless of free windows.
  if (service.max_per_day !== null && service.max_per_day !== undefined) {
    const todayCount = (bookings ?? []).filter(
      (b) => b.service_id === serviceId
    ).length;
    if (todayCount >= service.max_per_day) {
      return [];
    }
  }

  // Each existing booking gets PADDED by its own service's buffers, so the
  // "don't touch" zone fully encapsulates prep and cleanup time.
  const bookingBusy: MinuteWindow[] = (bookings ?? []).map((b) => {
    const bookingSvc = servicesById.get(b.service_id);
    const bufs = resolveBuffers(
      bookingSvc?.before ?? null,
      bookingSvc?.after ?? null,
      { before: defaultBufferBefore, after: defaultBufferAfter }
    );
    return {
      start: isoToLocalMinutes(b.starts_at, tz) - bufs.before,
      end: isoToLocalMinutes(b.ends_at, tz) + bufs.after,
    };
  });

  freeWindows = subtractWindows(freeWindows, bookingBusy);

  // ------ 7. External busy times --------------------------------------------
  const { data: externalBusy } = await supabase
    .from("external_busy_times")
    .select("starts_at, ends_at")
    .eq("provider_id", providerId)
    .lte("starts_at", dayEndUTC)
    .gte("ends_at", dayStartUTC);

  const externalBusyWindows: MinuteWindow[] = (externalBusy ?? []).map((e) => ({
    start: isoToLocalMinutes(e.starts_at, tz),
    end: isoToLocalMinutes(e.ends_at, tz),
  }));

  freeWindows = subtractWindows(freeWindows, externalBusyWindows);

  // ------ 7. Generate candidate slots --------------------------------------
  //
  //  For each free window, we iterate start times at the provider's chosen
  //  interval. The new booking needs `newBuffers.before` minutes of empty
  //  time BEFORE its start and `newBuffers.after` minutes AFTER its end,
  //  all inside the same free window. So a candidate start time `s` is
  //  valid only if:
  //
  //    s >= window.start + newBuffers.before
  //    s + durationMinutes + newBuffers.after <= window.end
  //
  const slots: TimeSlot[] = [];

  for (const window of freeWindows) {
    // First valid start accounting for the new booking's prep buffer
    let cursor = window.start + newBuffers.before;
    // Align to the next slot interval boundary
    if (cursor % slotInterval !== 0) {
      cursor = cursor + (slotInterval - (cursor % slotInterval));
    }

    while (cursor + durationMinutes + newBuffers.after <= window.end) {
      // Convert minutes-since-midnight back to UTC ISO strings
      const startLocal = new Date(`${date}T00:00:00`);
      startLocal.setMinutes(startLocal.getMinutes() + cursor);

      const endLocal = new Date(`${date}T00:00:00`);
      endLocal.setMinutes(endLocal.getMinutes() + cursor + durationMinutes);

      const startUTC = fromZonedTime(startLocal, tz);
      const endUTC = fromZonedTime(endLocal, tz);

      // Respect minimum booking notice — skip anything starting too soon
      if (startUTC.getTime() >= earliestBookableMs) {
        slots.push({
          start: startUTC.toISOString(),
          end: endUTC.toISOString(),
        });
      }

      cursor += slotInterval;
    }
  }

  return slots;
}

// ---------------------------------------------------------------------------
//  Batched month-view availability counts
//
//  Given a date range, returns slot/capacity counts per day in one pass.
//  Used by the public availability calendar on the booking page so it can
//  color-code days by how full they are.
// ---------------------------------------------------------------------------

export interface DayAvailability {
  slots: number; // actually bookable slots right now
  capacity: number; // max slots possible if nothing were booked
}

/**
 * Format a Date as YYYY-MM-DD in a given timezone (provider-local calendar day).
 */
function formatLocalDate(d: Date, tz: string): string {
  const z = toZonedTime(d, tz);
  const year = z.getFullYear();
  const month = String(z.getMonth() + 1).padStart(2, "0");
  const day = String(z.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Count bookable slots in a set of free windows for a given service duration,
 * respecting the new booking's before/after buffers and the provider's chosen
 * slot interval.
 */
function countSlots(
  windows: MinuteWindow[],
  durationMinutes: number,
  opts: { slotInterval: number; bufferBefore: number; bufferAfter: number }
): number {
  const { slotInterval, bufferBefore, bufferAfter } = opts;
  let total = 0;
  for (const w of windows) {
    let cursor = w.start + bufferBefore;
    if (cursor % slotInterval !== 0) {
      cursor = cursor + (slotInterval - (cursor % slotInterval));
    }
    while (cursor + durationMinutes + bufferAfter <= w.end) {
      total += 1;
      cursor += slotInterval;
    }
  }
  return total;
}

/**
 * Get day-by-day availability for a range. Does ONE query per table,
 * then computes per-day in memory. Much faster than calling
 * getAvailableSlots() in a loop (4 queries → 124+ for a month).
 *
 * @param startDate  Provider-local "YYYY-MM-DD" start, inclusive
 * @param endDate    Provider-local "YYYY-MM-DD" end, inclusive
 * @returns map of "YYYY-MM-DD" → { slots, capacity }
 */
export async function getAvailabilityCounts(
  supabase: SupabaseClient<Database>,
  providerId: string,
  serviceId: string,
  startDate: string,
  endDate: string
): Promise<Record<string, DayAvailability>> {
  // ── 1. Fetch target service + provider + all provider's services ────────
  //
  //  We fetch ALL of the provider's services in one shot so we can look up
  //  each existing booking's own buffer times (different services may have
  //  different buffers).
  //
  const [serviceRes, providerRes, allServicesRes] = await Promise.all([
    supabase
      .from("services")
      .select(
        "duration_minutes, buffer_before_minutes, buffer_after_minutes, min_notice_hours, max_per_day"
      )
      .eq("id", serviceId)
      .single(),
    supabase
      .from("providers")
      .select("timezone, branding")
      .eq("id", providerId)
      .single(),
    supabase
      .from("services")
      .select("id, buffer_before_minutes, buffer_after_minutes")
      .eq("provider_id", providerId),
  ]);

  if (serviceRes.error || !serviceRes.data) {
    throw new Error(`Service not found: ${serviceId}`);
  }
  if (providerRes.error || !providerRes.data) {
    throw new Error(`Provider not found: ${providerId}`);
  }

  const durationMinutes = serviceRes.data.duration_minutes;
  const tz = providerRes.data.timezone;
  const { slotIntervalRaw, defaultBufferBefore, defaultBufferAfter, minNoticeHours } =
    parseBookingDefaults(providerRes.data.branding);
  const slotInterval = resolveSlotInterval(slotIntervalRaw, durationMinutes);

  // Per-service minimum notice override (same logic as getAvailableSlots)
  const effectiveMinNoticeHours =
    serviceRes.data.min_notice_hours === null ||
    serviceRes.data.min_notice_hours === undefined
      ? minNoticeHours
      : Math.max(0, Math.min(720, serviceRes.data.min_notice_hours));

  const earliestBookableMs = Date.now() + effectiveMinNoticeHours * 60 * 60 * 1000;

  const maxPerDay = serviceRes.data.max_per_day ?? null;

  // NEW booking's effective buffers (per-service override → provider default → 0)
  const newBuffers = resolveBuffers(
    serviceRes.data.buffer_before_minutes,
    serviceRes.data.buffer_after_minutes,
    { before: defaultBufferBefore, after: defaultBufferAfter }
  );

  // Lookup map of service id → that service's own buffers (for existing bookings)
  const servicesById = new Map<
    string,
    { before: number | null; after: number | null }
  >();
  for (const s of allServicesRes.data ?? []) {
    servicesById.set(s.id, {
      before: s.buffer_before_minutes,
      after: s.buffer_after_minutes,
    });
  }

  // ── 2. Fetch all recurring rules ─────────────────────────────────────────
  const { data: allRules } = await supabase
    .from("availability_rules")
    .select("day_of_week, start_time, end_time")
    .eq("provider_id", providerId)
    .eq("is_active", true);

  // Bucket rules by day-of-week (0-6)
  const rulesByDay = new Map<number, MinuteWindow[]>();
  for (let i = 0; i < 7; i++) rulesByDay.set(i, []);
  for (const r of allRules ?? []) {
    rulesByDay.get(r.day_of_week)?.push({
      start: timeToMinutes(r.start_time),
      end: timeToMinutes(r.end_time),
    });
  }

  // ── 3. Fetch all overrides in range ──────────────────────────────────────
  const { data: allOverrides } = await supabase
    .from("availability_overrides")
    .select("date, start_time, end_time, is_blocked")
    .eq("provider_id", providerId)
    .gte("date", startDate)
    .lte("date", endDate);

  const overridesByDate = new Map<
    string,
    Array<{
      start_time: string | null;
      end_time: string | null;
      is_blocked: boolean;
    }>
  >();
  for (const o of allOverrides ?? []) {
    const list = overridesByDate.get(o.date) ?? [];
    list.push(o);
    overridesByDate.set(o.date, list);
  }

  // ── 4. Fetch all bookings in range ───────────────────────────────────────
  // We expand the range by 1 day on each side to catch bookings that span
  // midnight in the provider's timezone.
  const rangeStartUTC = fromZonedTime(
    new Date(`${startDate}T00:00:00`),
    tz
  ).toISOString();
  const rangeEndUTC = fromZonedTime(
    new Date(`${endDate}T23:59:59`),
    tz
  ).toISOString();

  const { data: allBookings } = await supabase
    .from("bookings")
    .select("starts_at, ends_at, service_id")
    .eq("provider_id", providerId)
    .not("status", "in", '("cancelled")')
    .gte("starts_at", rangeStartUTC)
    .lte("starts_at", rangeEndUTC);

  // Bucket bookings by local date — each booking padded by ITS OWN service's
  // buffer_before and buffer_after (resolved against provider defaults).
  // We also count how many of the TARGET service are booked per day, so
  // the daily cap (max_per_day) can close out a date entirely.
  const bookingsByDate = new Map<string, MinuteWindow[]>();
  const targetServiceCountByDate = new Map<string, number>();
  for (const b of allBookings ?? []) {
    const localDate = formatLocalDate(parseISO(b.starts_at), tz);
    const list = bookingsByDate.get(localDate) ?? [];
    const bookingSvc = servicesById.get(b.service_id);
    const bufs = resolveBuffers(
      bookingSvc?.before ?? null,
      bookingSvc?.after ?? null,
      { before: defaultBufferBefore, after: defaultBufferAfter }
    );
    list.push({
      start: isoToLocalMinutes(b.starts_at, tz) - bufs.before,
      end: isoToLocalMinutes(b.ends_at, tz) + bufs.after,
    });
    bookingsByDate.set(localDate, list);

    if (b.service_id === serviceId) {
      targetServiceCountByDate.set(
        localDate,
        (targetServiceCountByDate.get(localDate) ?? 0) + 1
      );
    }
  }

  // ── 5. Fetch external busy times in range ────────────────────────────────
  const { data: allExternal } = await supabase
    .from("external_busy_times")
    .select("starts_at, ends_at")
    .eq("provider_id", providerId)
    .lte("starts_at", rangeEndUTC)
    .gte("ends_at", rangeStartUTC);

  const externalByDate = new Map<string, MinuteWindow[]>();
  for (const e of allExternal ?? []) {
    const localDate = formatLocalDate(parseISO(e.starts_at), tz);
    const list = externalByDate.get(localDate) ?? [];
    list.push({
      start: isoToLocalMinutes(e.starts_at, tz),
      end: isoToLocalMinutes(e.ends_at, tz),
    });
    externalByDate.set(localDate, list);
  }

  // ── 6. Iterate each day and compute slots + capacity ─────────────────────
  const result: Record<string, DayAvailability> = {};

  // Use noon to avoid DST/TZ flipping on the date boundary
  const start = parseISO(`${startDate}T12:00:00Z`);
  const end = parseISO(`${endDate}T12:00:00Z`);

  for (
    let cursor = start;
    cursor <= end;
    cursor = addDays(cursor, 1)
  ) {
    const dateStr = formatLocalDate(cursor, tz);
    const dayOfWeek = getDay(toZonedTime(cursor, tz));

    // Base free windows from recurring rules
    let free: MinuteWindow[] = (rulesByDay.get(dayOfWeek) ?? []).map((w) => ({ ...w }));

    // Apply overrides
    const overrides = overridesByDate.get(dateStr) ?? [];
    let skipDay = false;
    for (const o of overrides) {
      if (o.is_blocked && o.start_time === null) {
        skipDay = true;
        break;
      }
      if (o.is_blocked && o.start_time !== null && o.end_time !== null) {
        free = subtractWindows(free, [
          { start: timeToMinutes(o.start_time), end: timeToMinutes(o.end_time) },
        ]);
      }
      if (!o.is_blocked && o.start_time !== null && o.end_time !== null) {
        free.push({
          start: timeToMinutes(o.start_time),
          end: timeToMinutes(o.end_time),
        });
        free = mergeWindows(free);
      }
    }

    if (skipDay) {
      result[dateStr] = { slots: 0, capacity: 0 };
      continue;
    }

    // Daily cap — if this service has a max_per_day and today is at
    // or over that limit, close the day entirely for slots AND capacity.
    if (
      maxPerDay !== null &&
      (targetServiceCountByDate.get(dateStr) ?? 0) >= maxPerDay
    ) {
      result[dateStr] = { slots: 0, capacity: 0 };
      continue;
    }

    // Apply minimum booking notice — if this day starts before the
    // earliest bookable moment, subtract the "too soon" portion from
    // free windows. This keeps capacity + slots consistent so the
    // month-view color coding reflects the real constraint.
    if (minNoticeHours > 0) {
      const dayStartMs = fromZonedTime(
        new Date(`${dateStr}T00:00:00`),
        tz
      ).getTime();
      const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000;

      if (dayEndMs <= earliestBookableMs) {
        // Whole day is inside the notice window
        result[dateStr] = { slots: 0, capacity: 0 };
        continue;
      }

      if (dayStartMs < earliestBookableMs) {
        // Partial — block midnight up to the earliest bookable minute
        const blockedMinutes = Math.ceil(
          (earliestBookableMs - dayStartMs) / 60000
        );
        free = subtractWindows(free, [{ start: 0, end: blockedMinutes }]);
      }
    }

    // Capacity = slot count WITHOUT subtracting bookings
    const capacity = countSlots(free, durationMinutes, {
      slotInterval,
      bufferBefore: newBuffers.before,
      bufferAfter: newBuffers.after,
    });

    // Actual = subtract bookings + external busy
    const bookingBusy = bookingsByDate.get(dateStr) ?? [];
    const externalBusy = externalByDate.get(dateStr) ?? [];
    const busy = [...bookingBusy, ...externalBusy];

    const available = subtractWindows(free, busy);
    const slots = countSlots(available, durationMinutes, {
      slotInterval,
      bufferBefore: newBuffers.before,
      bufferAfter: newBuffers.after,
    });

    result[dateStr] = { slots, capacity };
  }

  return result;
}
