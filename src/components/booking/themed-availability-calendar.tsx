"use client";

/**
 * ThemedAvailabilityCalendar
 *
 * A fully themed calendar for the public booking flow. Fetches per-day
 * slot counts from /api/availability/month and color-codes each cell:
 *
 *   🟢 Green    — lots of slots free (>= 60% capacity)
 *   🟡 Yellow   — some taken (30-60%)
 *   🟠 Orange   — filling up (10-30%)
 *   🔴 Red      — last slot or two (> 0, < 10%)
 *   ⚫ Grey     — closed or fully booked
 *
 * All visual styles are driven by the active template so the calendar
 * matches whatever vibe the provider picked.
 */

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { cn } from "@/lib/utils";

export type CalendarRange = "week" | "2weeks" | "month" | "3months";

interface DayInfo {
  slots: number;
  capacity: number;
}

interface Props {
  providerId: string;
  serviceId: string;
  /** Initially-selected date (YYYY-MM-DD). */
  value?: string;
  onSelect: (date: string) => void;
  /** How much of the calendar to show at once. Default "month". */
  range?: CalendarRange;
}

// ─────────────────────────────────────────────────────────────
//  Date helpers — all in UTC so nothing depends on browser TZ.
// ─────────────────────────────────────────────────────────────

function fmtYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d.getTime());
  next.setUTCDate(next.getUTCDate() + n);
  return next;
}

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function endOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function dayOfWeek(d: Date): number {
  return d.getUTCDay(); // 0 = Sunday
}

// ─────────────────────────────────────────────────────────────
//  Range helpers — compute the visible window based on anchor + range
// ─────────────────────────────────────────────────────────────

function computeVisibleRange(
  anchor: Date,
  range: CalendarRange
): { start: Date; end: Date } {
  if (range === "week") {
    // Week starting Sunday that contains the anchor
    const start = addDays(anchor, -dayOfWeek(anchor));
    return { start, end: addDays(start, 6) };
  }
  if (range === "2weeks") {
    const start = addDays(anchor, -dayOfWeek(anchor));
    return { start, end: addDays(start, 13) };
  }
  if (range === "3months") {
    // Anchor month + next 2
    const start = startOfMonth(anchor);
    const endAnchor = new Date(
      Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 2, 1)
    );
    return { start, end: endOfMonth(endAnchor) };
  }
  // "month" — current month
  return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
}

function rangeLabel(anchor: Date, range: CalendarRange): string {
  if (range === "month") return monthLabel(anchor);
  if (range === "3months") {
    const end = new Date(
      Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 2, 1)
    );
    return `${monthLabel(anchor)} – ${monthLabel(end)}`;
  }
  const { start, end } = computeVisibleRange(anchor, range);
  const s = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const e = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return `${s} – ${e}`;
}

function nextAnchor(anchor: Date, range: CalendarRange, direction: 1 | -1): Date {
  if (range === "week") return addDays(anchor, direction * 7);
  if (range === "2weeks") return addDays(anchor, direction * 14);
  if (range === "3months") {
    return new Date(
      Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + direction * 3, 1)
    );
  }
  // month
  return new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + direction, 1)
  );
}

// ─────────────────────────────────────────────────────────────
//  Availability → color class
// ─────────────────────────────────────────────────────────────

type AvailLevel = "closed" | "full" | "tight" | "filling" | "some" | "open";

function availLevelFor(info: DayInfo | undefined): AvailLevel {
  if (!info || info.capacity === 0) return "closed";
  if (info.slots === 0) return "full";
  const ratio = info.slots / info.capacity;
  if (ratio <= 0.1) return "tight";
  if (ratio <= 0.3) return "filling";
  if (ratio <= 0.6) return "some";
  return "open";
}

const LEVEL_COLORS: Record<AvailLevel, string> = {
  // Uses inline style so it adapts to template backgrounds
  closed: "",
  full: "",
  tight: "rgb(239, 68, 68)", // red-500
  filling: "rgb(249, 115, 22)", // orange-500
  some: "rgb(250, 204, 21)", // yellow-400
  open: "rgb(34, 197, 94)", // green-500
};

// ─────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────

export function ThemedAvailabilityCalendar({
  providerId,
  serviceId,
  value,
  onSelect,
  range = "month",
}: Props) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  // Anchor = the first day currently shown in the calendar header
  const [anchor, setAnchor] = useState<Date>(() => {
    if (value) return parseYmd(value);
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });

  const [data, setData] = useState<Record<string, DayInfo>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { start, end } = useMemo(
    () => computeVisibleRange(anchor, range),
    [anchor, range]
  );

  // Fetch availability whenever the range changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/availability/month?providerId=${providerId}&serviceId=${serviceId}&start=${fmtYmd(start)}&end=${fmtYmd(end)}`;
        const res = await fetch(url);
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as Record<string, DayInfo>;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [providerId, serviceId, start, end]);

  // Build the grid of cells — always 7 columns
  // For month view we pad the start with days from the previous month
  // so the grid aligns to Sunday.
  const cells = useMemo(() => {
    const first = start;
    const last = end;
    const leadingBlanks = dayOfWeek(first);
    const days: Array<{ date: Date | null; inRange: boolean }> = [];

    if (range === "month" || range === "3months") {
      // Pad with blanks to align Sunday-Saturday grid
      for (let i = 0; i < leadingBlanks; i++) days.push({ date: null, inRange: false });
    }

    let cursor = first;
    while (cursor <= last) {
      days.push({ date: cursor, inRange: true });
      cursor = addDays(cursor, 1);
    }

    return days;
  }, [start, end, range]);

  const today = fmtYmd(new Date());

  function handlePick(dateStr: string) {
    const info = data[dateStr];
    if (!info || info.slots === 0) return;
    if (dateStr < today) return;
    onSelect(dateStr);
  }

  return (
    <div
      className={cn(
        "rounded-3xl p-5 md:p-6 transition-all duration-500",
        template.classes.summaryBox
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => setAnchor(nextAnchor(anchor, range, -1))}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110",
            template.classes.timeSlot
          )}
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <div
            className={cn(
              template.classes.heading,
              "text-lg md:text-xl leading-none"
            )}
          >
            {rangeLabel(anchor, range)}
          </div>
          {loading && (
            <div className="text-[10px] opacity-50 mt-1">Loading…</div>
          )}
          {error && (
            <div className="text-[10px] text-red-500 mt-1">{error}</div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setAnchor(nextAnchor(anchor, range, 1))}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110",
            template.classes.timeSlot
          )}
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-bold uppercase tracking-wider opacity-50"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={i} />;
          const dateStr = fmtYmd(cell.date);
          const info = data[dateStr];
          const level = availLevelFor(info);
          const isPast = dateStr < today;
          const isSelected = value === dateStr;
          const isToday = dateStr === today;

          const disabled = isPast || level === "closed" || level === "full";
          const dotColor = LEVEL_COLORS[level];

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handlePick(dateStr)}
              disabled={disabled}
              className={cn(
                "relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all duration-200",
                disabled
                  ? "opacity-25 cursor-not-allowed"
                  : "hover:scale-105 cursor-pointer active:scale-95",
                isSelected && "ring-2 ring-offset-2",
                isToday && !isSelected && "font-bold"
              )}
              style={{
                backgroundColor: isSelected
                  ? "var(--template-accent)"
                  : disabled
                  ? "transparent"
                  : "var(--template-surface)",
                color: isSelected
                  ? "var(--primary-foreground, #fff)"
                  : "var(--foreground)",
                border: disabled
                  ? "1px dashed rgba(128,128,128,0.15)"
                  : isToday
                  ? "2px solid var(--template-accent)"
                  : "1px solid rgba(255,255,255,0.1)",
              }}
              aria-label={cell.date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
              title={
                info && info.capacity > 0
                  ? `${info.slots} slot${info.slots === 1 ? "" : "s"} free`
                  : undefined
              }
            >
              <span>{cell.date.getUTCDate()}</span>
              {!disabled && dotColor && (
                <span
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-current/10 flex items-center justify-center gap-3 flex-wrap text-[10px] font-medium opacity-60">
        <LegendDot color={LEVEL_COLORS.open} label="Lots free" />
        <LegendDot color={LEVEL_COLORS.some} label="Some free" />
        <LegendDot color={LEVEL_COLORS.filling} label="Filling up" />
        <LegendDot color={LEVEL_COLORS.tight} label="Last slots" />
        <LegendDot color="rgba(128,128,128,0.3)" label="Closed / full" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1">
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  );
}
