import type { SupabaseClient } from "@supabase/supabase-js";
import { getDay, parseISO } from "date-fns";
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

export async function getAvailableSlots(
  supabase: SupabaseClient<Database>,
  providerId: string,
  serviceId: string,
  date: string // ISO date string like "2026-04-15"
): Promise<TimeSlot[]> {
  // ------ 1. Fetch service --------------------------------------------------
  const { data: service, error: serviceErr } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .single();

  if (serviceErr || !service) {
    throw new Error(`Service not found: ${serviceId}`);
  }

  const durationMinutes = service.duration_minutes;

  // ------ 2. Fetch provider -------------------------------------------------
  const { data: provider, error: providerErr } = await supabase
    .from("providers")
    .select("timezone")
    .eq("id", providerId)
    .single();

  if (providerErr || !provider) {
    throw new Error(`Provider not found: ${providerId}`);
  }

  const tz = provider.timezone;

  // ------ 3. Day of week ----------------------------------------------------
  // parseISO gives us midnight UTC for the date string.  We need the
  // day-of-week *in the provider's timezone*.
  const dateObj = parseISO(date);
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

  const { data: bookings } = await supabase
    .from("bookings")
    .select("starts_at, ends_at")
    .eq("provider_id", providerId)
    .not("status", "in", '("cancelled")')
    .gte("starts_at", dayStartUTC)
    .lte("starts_at", dayEndUTC);

  const bookingBusy: MinuteWindow[] = (bookings ?? []).map((b) => ({
    start: isoToLocalMinutes(b.starts_at, tz),
    end: isoToLocalMinutes(b.ends_at, tz),
  }));

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

  // ------ 8g. Generate 15-minute interval slots -----------------------------
  const SLOT_INTERVAL = 15;
  const slots: TimeSlot[] = [];

  for (const window of freeWindows) {
    let cursor = window.start;
    // Align cursor to next 15-minute boundary
    if (cursor % SLOT_INTERVAL !== 0) {
      cursor = cursor + (SLOT_INTERVAL - (cursor % SLOT_INTERVAL));
    }

    while (cursor + durationMinutes <= window.end) {
      // Convert minutes-since-midnight back to UTC ISO strings
      const startLocal = new Date(`${date}T00:00:00`);
      startLocal.setMinutes(startLocal.getMinutes() + cursor);

      const endLocal = new Date(`${date}T00:00:00`);
      endLocal.setMinutes(endLocal.getMinutes() + cursor + durationMinutes);

      const startUTC = fromZonedTime(startLocal, tz);
      const endUTC = fromZonedTime(endLocal, tz);

      slots.push({
        start: startUTC.toISOString(),
        end: endUTC.toISOString(),
      });

      cursor += SLOT_INTERVAL;
    }
  }

  return slots;
}
