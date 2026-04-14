"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalIcon,
  Clock,
  User,
  Mail,
  Phone,
  DollarSign,
  Plus,
  X,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ───

interface CalBooking {
  id: string;
  starts_at: string;
  ends_at: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  status: string;
  payment_status: string;
  payment_amount_cents: number;
  client_notes: string;
  provider_notes: string;
  service: {
    id: string;
    name: string;
    emoji: string;
    color: string;
    duration_minutes: number;
    price_cents: number;
  } | null;
}

interface CalEvent {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  is_all_day: boolean;
  color: string;
  notes: string;
}

interface AvailRule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

type ViewMode = "week" | "day" | "month";

// ─── Helpers ───

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function fmtDateLong(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function fmtMonthYear(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function fmtIso(d: Date): string {
  return d.toISOString();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(min).padStart(2, "0")} ${ampm}`;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

// ─── Constants ───

const HOUR_HEIGHT = 60; // px per hour
const DAY_START_HOUR = 6; // show from 6am
const DAY_END_HOUR = 22; // to 10pm
const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;

// ─── Main Component ───

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date()));
  const [bookings, setBookings] = useState<CalBooking[]>([]);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [rules, setRules] = useState<AvailRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<CalBooking | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockDate, setBlockDate] = useState<Date | null>(null);
  const [blockHour, setBlockHour] = useState(12);

  // Compute date range based on view
  const range = useMemo(() => {
    if (view === "day") {
      return { start: anchor, end: addDays(anchor, 1) };
    }
    if (view === "month") {
      const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
      return { start: first, end: addDays(last, 1) };
    }
    // week
    return { start: anchor, end: addDays(anchor, 7) };
  }, [view, anchor]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/calendar?start=${fmtIso(range.start)}&end=${fmtIso(range.end)}`
    );
    if (res.ok) {
      const data = await res.json();
      setBookings(data.bookings);
      setEvents(data.personalEvents);
      setRules(data.availabilityRules);
    }
    setLoading(false);
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigation
  function goToday() {
    if (view === "week") setAnchor(startOfWeek(new Date()));
    else if (view === "day") setAnchor(new Date());
    else setAnchor(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  }

  function goPrev() {
    if (view === "week") setAnchor(addDays(anchor, -7));
    else if (view === "day") setAnchor(addDays(anchor, -1));
    else setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1));
  }

  function goNext() {
    if (view === "week") setAnchor(addDays(anchor, 7));
    else if (view === "day") setAnchor(addDays(anchor, 1));
    else setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1));
  }

  // Get working hours for a specific day-of-week
  function getWorkingHours(dayOfWeek: number): { start: number; end: number }[] {
    return rules
      .filter((r) => r.day_of_week === dayOfWeek)
      .map((r) => ({
        start: timeToMinutes(r.start_time),
        end: timeToMinutes(r.end_time),
      }));
  }

  // Header label
  const headerLabel = useMemo(() => {
    if (view === "day") return fmtDateLong(anchor);
    if (view === "month") return fmtMonthYear(anchor);
    const endDay = addDays(anchor, 6);
    if (anchor.getMonth() === endDay.getMonth()) {
      return `${anchor.toLocaleDateString("en-US", { month: "long" })} ${anchor.getDate()}–${endDay.getDate()}, ${anchor.getFullYear()}`;
    }
    return `${fmtDate(anchor)} – ${fmtDate(endDay)}`;
  }, [view, anchor]);

  // Block time
  async function handleBlockTime(title: string, startTime: string, endTime: string, dateStr: string) {
    const starts_at = new Date(`${dateStr}T${startTime}:00`).toISOString();
    const ends_at = new Date(`${dateStr}T${endTime}:00`).toISOString();

    const res = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, starts_at, ends_at }),
    });

    if (res.ok) {
      toast.success("Time blocked!");
      setBlockDialogOpen(false);
      fetchData();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Failed to block time");
    }
  }

  async function handleDeleteEvent(id: string) {
    const res = await fetch(`/api/calendar/events?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Block removed");
      fetchData();
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Calendar
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setBlockDate(new Date());
              setBlockHour(12);
              setBlockDialogOpen(true);
            }}
            className="border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Block Time
          </Button>
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={goPrev} className="h-8 w-8 p-0 border-gray-200">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={goToday} className="h-8 border-gray-200 text-xs">
            Today
          </Button>
          <Button size="sm" variant="outline" onClick={goNext} className="h-8 w-8 p-0 border-gray-200">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-display font-semibold text-gray-800 ml-2">
            {headerLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["day", "week", "month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                if (v === "week") setAnchor(startOfWeek(anchor));
                setView(v);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                view === v
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar body */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mr-2" />
          Loading…
        </div>
      ) : view === "month" ? (
        <MonthView
          anchor={anchor}
          bookings={bookings}
          events={events}
          rules={rules}
          onDayClick={(d) => {
            setAnchor(d);
            setView("day");
          }}
        />
      ) : (
        <TimeGrid
          days={
            view === "day"
              ? [anchor]
              : Array.from({ length: 7 }, (_, i) => addDays(anchor, i))
          }
          bookings={bookings}
          events={events}
          getWorkingHours={getWorkingHours}
          onBookingClick={setSelectedBooking}
          onEventDelete={handleDeleteEvent}
          onSlotClick={(date, hour) => {
            setBlockDate(date);
            setBlockHour(hour);
            setBlockDialogOpen(true);
          }}
          isDay={view === "day"}
        />
      )}

      {/* Booking detail dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(o) => !o && setSelectedBooking(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-gray-800">
                  <span className="text-xl">{selectedBooking.service?.emoji || "📅"}</span>
                  {selectedBooking.service?.name || "Appointment"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Booking details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {fmtDateLong(new Date(selectedBooking.starts_at))} ·{" "}
                  {fmtTime(new Date(selectedBooking.starts_at))} –{" "}
                  {fmtTime(new Date(selectedBooking.ends_at))}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4 text-gray-400" />
                  {selectedBooking.client_name}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${selectedBooking.client_email}`} className="underline">
                    {selectedBooking.client_email}
                  </a>
                </div>
                {selectedBooking.client_phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${selectedBooking.client_phone}`} className="underline">
                      {selectedBooking.client_phone}
                    </a>
                  </div>
                )}
                {(() => {
                  const svcPrice = selectedBooking.service?.price_cents || 0;
                  const paid = selectedBooking.payment_amount_cents;
                  const owed = Math.max(0, svcPrice - paid);
                  return (
                    <div className="flex items-start gap-2 text-gray-600">
                      <DollarSign className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        {paid > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Paid in Bloom</span>
                            <span className="font-semibold text-emerald-700">{formatPrice(paid)}</span>
                          </div>
                        )}
                        {owed > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Due at appt</span>
                            <span className="font-semibold text-amber-700">{formatPrice(owed)}</span>
                          </div>
                        )}
                        {paid === 0 && owed === 0 && (
                          <span className="text-xs text-gray-400 italic">Free</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
                {selectedBooking.client_notes && (
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-600">
                    <p className="text-xs font-medium text-gray-400 mb-1">Client notes</p>
                    {selectedBooking.client_notes}
                  </div>
                )}
                <div className="pt-2">
                  <a
                    href={`/bookings/${selectedBooking.id}`}
                    className="text-xs font-medium text-purple-600 hover:text-purple-700 underline"
                  >
                    View full booking details →
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Block time dialog */}
      <BlockTimeDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        date={blockDate || new Date()}
        defaultHour={blockHour}
        onSubmit={handleBlockTime}
      />
    </div>
  );
}

// ─── Time Grid (Week + Day views) ───

function TimeGrid({
  days,
  bookings,
  events,
  getWorkingHours,
  onBookingClick,
  onEventDelete,
  onSlotClick,
  isDay,
}: {
  days: Date[];
  bookings: CalBooking[];
  events: CalEvent[];
  getWorkingHours: (dow: number) => { start: number; end: number }[];
  onBookingClick: (b: CalBooking) => void;
  onEventDelete: (id: string) => void;
  onSlotClick: (date: Date, hour: number) => void;
  isDay: boolean;
}) {
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => DAY_START_HOUR + i);
  const today = new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Day headers */}
      <div className={`grid border-b border-gray-100 ${isDay ? "grid-cols-[60px_1fr]" : "grid-cols-[60px_repeat(7,1fr)]"}`}>
        <div className="p-2" />
        {days.map((d, i) => {
          const isToday = isSameDay(d, today);
          return (
            <div
              key={i}
              className={`text-center py-3 border-l border-gray-100 ${
                isToday ? "bg-purple-50/50" : ""
              }`}
            >
              <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                {d.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div
                className={`text-lg font-display font-bold ${
                  isToday
                    ? "bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto"
                    : "text-gray-700"
                }`}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className={`grid ${isDay ? "grid-cols-[60px_1fr]" : "grid-cols-[60px_repeat(7,1fr)]"}`} style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
        {/* Hour labels */}
        <div className="relative">
          {hours.map((h) => (
            <div
              key={h}
              className="absolute w-full text-right pr-2 text-[10px] text-gray-400 -translate-y-1/2"
              style={{ top: (h - DAY_START_HOUR) * HOUR_HEIGHT }}
            >
              {minutesToTime(h * 60)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((d, dayIdx) => {
          const isToday = isSameDay(d, today);
          const workHours = getWorkingHours(d.getDay());

          // Filter bookings + events for this day
          const dayBookings = bookings.filter((b) => isSameDay(new Date(b.starts_at), d));
          const dayEvents = events.filter((e) => !e.is_all_day && isSameDay(new Date(e.starts_at), d));

          return (
            <div
              key={dayIdx}
              className={`relative border-l border-gray-100 ${isToday ? "bg-purple-50/20" : ""}`}
            >
              {/* Hour gridlines */}
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute w-full border-t border-gray-100 cursor-pointer hover:bg-purple-50/30 transition-colors"
                  style={{ top: (h - DAY_START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  onClick={() => onSlotClick(d, h)}
                />
              ))}

              {/* Working hours highlight */}
              {workHours.map((w, i) => {
                const topMin = Math.max(w.start, DAY_START_HOUR * 60);
                const botMin = Math.min(w.end, DAY_END_HOUR * 60);
                if (botMin <= topMin) return null;
                return (
                  <div
                    key={i}
                    className="absolute left-0 right-0 bg-emerald-50/40 border-l-2 border-emerald-300 pointer-events-none"
                    style={{
                      top: ((topMin - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT,
                      height: ((botMin - topMin) / 60) * HOUR_HEIGHT,
                    }}
                  />
                );
              })}

              {/* Current time indicator */}
              {isToday && (() => {
                const now = new Date();
                const nowMin = now.getHours() * 60 + now.getMinutes();
                if (nowMin < DAY_START_HOUR * 60 || nowMin > DAY_END_HOUR * 60) return null;
                return (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: ((nowMin - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                      <div className="flex-1 h-px bg-red-500" />
                    </div>
                  </div>
                );
              })()}

              {/* Booking blocks */}
              {dayBookings.map((b) => {
                const startMin = new Date(b.starts_at).getHours() * 60 + new Date(b.starts_at).getMinutes();
                const endMin = new Date(b.ends_at).getHours() * 60 + new Date(b.ends_at).getMinutes();
                const top = ((startMin - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;
                const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 24);
                const color = b.service?.color || "#6366f1";

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onBookingClick(b)}
                    className="absolute left-1 right-1 z-10 rounded-lg overflow-hidden cursor-pointer hover:brightness-95 transition-all text-left group shadow-sm"
                    style={{
                      top,
                      height,
                      backgroundColor: `${color}18`,
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    <div className="px-2 py-1 h-full flex flex-col justify-start overflow-hidden">
                      <div className="text-[11px] font-semibold truncate" style={{ color }}>
                        {b.service?.emoji} {b.service?.name || "Booking"}
                      </div>
                      {height > 36 && (
                        <div className="text-[10px] text-gray-500 truncate">
                          {b.client_name}
                        </div>
                      )}
                      {height > 52 && (() => {
                        const svcPrice = b.service?.price_cents || 0;
                        const owed = Math.max(0, svcPrice - b.payment_amount_cents);
                        return owed > 0 ? (
                          <div className="text-[10px] font-bold text-amber-600">
                            Due ${(owed / 100).toFixed(0)}
                          </div>
                        ) : b.payment_amount_cents > 0 ? (
                          <div className="text-[10px] font-bold text-emerald-600">
                            Paid
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-400">
                            {fmtTime(new Date(b.starts_at))}
                          </div>
                        );
                      })()}
                    </div>
                  </button>
                );
              })}

              {/* Personal event blocks */}
              {dayEvents.map((e) => {
                const startMin = new Date(e.starts_at).getHours() * 60 + new Date(e.starts_at).getMinutes();
                const endMin = new Date(e.ends_at).getHours() * 60 + new Date(e.ends_at).getMinutes();
                const top = ((startMin - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;
                const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 24);

                return (
                  <div
                    key={e.id}
                    className="absolute left-1 right-1 z-10 rounded-lg overflow-hidden bg-gray-100 border-l-3 border-gray-400 group"
                    style={{ top, height, borderLeft: "3px solid #94a3b8" }}
                  >
                    <div className="px-2 py-1 h-full flex items-start justify-between">
                      <div className="overflow-hidden">
                        <div className="text-[11px] font-semibold text-gray-600 truncate">
                          {e.title}
                        </div>
                        {height > 36 && (
                          <div className="text-[10px] text-gray-400">
                            {fmtTime(new Date(e.starts_at))} – {fmtTime(new Date(e.ends_at))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onEventDelete(e.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition-all"
                      >
                        <X className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Month View ───

function MonthView({
  anchor,
  bookings,
  events,
  rules,
  onDayClick,
}: {
  anchor: Date;
  bookings: CalBooking[];
  events: CalEvent[];
  rules: AvailRule[];
  onDayClick: (d: Date) => void;
}) {
  const today = new Date();
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  function countForDay(d: Date) {
    const b = bookings.filter((bk) => isSameDay(new Date(bk.starts_at), d)).length;
    const e = events.filter((ev) => isSameDay(new Date(ev.starts_at), d)).length;
    return { bookings: b, events: e };
  }

  function hasWorkingHours(d: Date) {
    return rules.some((r) => r.day_of_week === d.getDay());
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-100">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center py-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (!d) {
            return <div key={i} className="h-24 border-t border-l border-gray-100 bg-gray-50/50" />;
          }
          const isToday = isSameDay(d, today);
          const counts = countForDay(d);
          const working = hasWorkingHours(d);

          return (
            <button
              key={i}
              type="button"
              onClick={() => onDayClick(d)}
              className={`h-24 border-t border-l border-gray-100 p-2 text-left hover:bg-purple-50/30 transition-colors cursor-pointer ${
                !working ? "bg-gray-50/50" : ""
              }`}
            >
              <div
                className={`text-sm font-medium ${
                  isToday
                    ? "bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                    : "text-gray-700"
                }`}
              >
                {d.getDate()}
              </div>
              {counts.bookings > 0 && (
                <div className="mt-1 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span className="text-[10px] text-purple-600 font-medium">
                    {counts.bookings} booking{counts.bookings > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {counts.events > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span className="text-[10px] text-gray-500">
                    {counts.events} blocked
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Block Time Dialog ───

function BlockTimeDialog({
  open,
  onOpenChange,
  date,
  defaultHour,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  date: Date;
  defaultHour: number;
  onSubmit: (title: string, startTime: string, endTime: string, dateStr: string) => void;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtDateVal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const [title, setTitle] = useState("Personal time");
  const [startTime, setStartTime] = useState(`${pad(defaultHour)}:00`);
  const [endTime, setEndTime] = useState(`${pad(Math.min(defaultHour + 1, 23))}:00`);
  const [blockDate, setBlockDate] = useState(fmtDateVal(date));

  useEffect(() => {
    setStartTime(`${pad(defaultHour)}:00`);
    setEndTime(`${pad(Math.min(defaultHour + 1, 23))}:00`);
    setBlockDate(fmtDateVal(date));
  }, [date, defaultHour]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-gray-800">Block Time</DialogTitle>
          <DialogDescription className="text-gray-400">
            Block off time so clients can&apos;t book during this period
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lunch, personal errand..."
              className="border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Date</Label>
            <Input
              type="date"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              className="border-gray-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-800 font-medium">Start</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (e.target.value >= endTime) {
                    const [h, m] = e.target.value.split(":").map(Number);
                    const newEnd = h * 60 + m + 60;
                    setEndTime(`${pad(Math.min(Math.floor(newEnd / 60), 23))}:${pad(newEnd % 60)}`);
                  }
                }}
                className="border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-800 font-medium">End</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                min={startTime}
                className="border-gray-200"
              />
            </div>
          </div>
          <Button
            onClick={() => {
              if (endTime <= startTime) {
                toast.error("End time must be after start time");
                return;
              }
              onSubmit(title || "Blocked", startTime, endTime, blockDate);
            }}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            Block This Time
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
