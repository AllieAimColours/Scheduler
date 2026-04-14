"use client";

import { useState } from "react";
import type { AvailabilityRule, AvailabilityOverride } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Plus, Trash2, CalendarOff, Sun } from "lucide-react";
import { saveAvailabilityRules, addOverride, deleteOverride } from "./actions";
import { toast } from "sonner";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface DaySchedule {
  enabled: boolean;
  start_time: string;
  end_time: string;
}

export function AvailabilityEditor({
  rules,
  overrides,
  timezone,
}: {
  rules: AvailabilityRule[];
  overrides: AvailabilityOverride[];
  timezone: string;
}) {
  const [saving, setSaving] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);

  // Build initial schedule from existing rules
  const initialSchedule: DaySchedule[] = DAYS.map((_, dayIndex) => {
    const rule = rules.find((r) => r.day_of_week === dayIndex && r.is_active);
    return {
      enabled: !!rule,
      start_time: rule?.start_time?.slice(0, 5) || "09:00",
      end_time: rule?.end_time?.slice(0, 5) || "17:00",
    };
  });

  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);

  function updateDay(index: number, updates: Partial<DaySchedule>) {
    setSchedule((prev) =>
      prev.map((day, i) => (i === index ? { ...day, ...updates } : day))
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const activeRules = schedule
        .map((day, index) => ({
          day_of_week: index,
          start_time: day.start_time,
          end_time: day.end_time,
          is_active: day.enabled,
        }))
        .filter((r) => r.is_active);

      await saveAvailabilityRules(activeRules);
      toast.success("Availability saved!");
    } catch {
      toast.error("Failed to save availability");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-8">
      {/* Weekly Schedule — magazine style */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-200/30 blur-3xl pointer-events-none" />

        <div className="relative p-5 sm:p-8 md:p-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-3">
                <Clock className="h-3 w-3 text-blue-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Weekly hours</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-gray-800 mb-1">Your week, your way</h2>
              <p className="text-sm text-gray-500">
                {timezone.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          {/* Day rows */}
          <div className="space-y-2">
            {DAYS.map((day, index) => (
              <div
                key={day}
                className={`group relative flex items-center gap-5 px-5 py-4 rounded-2xl transition-all duration-300 ${
                  schedule[index].enabled
                    ? "bg-gradient-to-r from-purple-50/60 via-pink-50/40 to-transparent border border-purple-100/80"
                    : "hover:bg-gray-50/80 border border-transparent"
                }`}
              >
                {/* Active indicator dot */}
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    schedule[index].enabled
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/40"
                      : "bg-gray-200"
                  }`}
                />

                {/* Day name */}
                <button
                  type="button"
                  onClick={() => updateDay(index, { enabled: !schedule[index].enabled })}
                  className={`w-20 sm:w-32 shrink-0 text-left font-display text-lg sm:text-xl transition-all ${
                    schedule[index].enabled ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {day}
                </button>

                {/* Times or placeholder */}
                {schedule[index].enabled ? (
                  <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
                    <div className="relative flex-1 min-w-0 max-w-[140px]">
                      <Input
                        type="time"
                        value={schedule[index].start_time}
                        onChange={(e) => updateDay(index, { start_time: e.target.value })}
                        className="bg-white border-purple-200 text-gray-800 font-medium focus:border-purple-400 focus:ring-purple-400/20 rounded-xl px-2 sm:px-3"
                      />
                    </div>
                    <span className="text-gray-300 font-light text-lg shrink-0">→</span>
                    <div className="relative flex-1 min-w-0 max-w-[140px]">
                      <Input
                        type="time"
                        value={schedule[index].end_time}
                        onChange={(e) => updateDay(index, { end_time: e.target.value })}
                        className="bg-white border-purple-200 text-gray-800 font-medium focus:border-purple-400 focus:ring-purple-400/20 rounded-xl px-2 sm:px-3"
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateDay(index, { enabled: true })}
                    className="text-sm text-gray-400 italic flex-1 text-left hover:text-purple-500 transition-colors"
                  >
                    Tap to add hours
                  </button>
                )}

                {/* Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={schedule[index].enabled}
                  onClick={() => updateDay(index, { enabled: !schedule[index].enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shrink-0 ${
                    schedule[index].enabled
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-md"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      schedule[index].enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {schedule.filter((d) => d.enabled).length} of 7 days active
            </p>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 px-6"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Date Overrides — magazine style */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-200/30 blur-3xl pointer-events-none" />

        <div className="relative p-5 sm:p-8 md:p-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 mb-3">
                <CalendarOff className="h-3 w-3 text-amber-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Exceptions</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-gray-800 mb-1">Days off & extras</h2>
              <p className="text-sm text-gray-500">
                Vacations, holidays, or special hours
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setOverrideDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add date
            </Button>
          </div>

          {overrides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <div className="inline-flex p-5 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100">
                  <Sun className="h-8 w-8 text-amber-500" />
                </div>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-300/30 to-orange-300/30 blur-2xl -z-10" />
              </div>
              <h3 className="font-display text-xl text-gray-700 mb-2">All clear</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                No exceptions yet. Add one to block a vacation day or extend your hours for a special occasion.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {overrides.map((override) => (
                <div
                  key={override.id}
                  className="group flex items-center justify-between gap-4 py-4 px-5 rounded-2xl bg-gradient-to-r from-gray-50/80 via-white to-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <Badge
                      className={`rounded-full border-0 font-medium px-3 py-1 ${
                        override.is_blocked
                          ? "bg-gradient-to-r from-red-50 to-rose-50 text-red-600 border border-red-100"
                          : "bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 border border-green-100"
                      }`}
                    >
                      {override.is_blocked ? "Blocked" : "Extra hours"}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-lg text-gray-800 truncate">
                        {new Date(override.date + "T00:00").toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {override.start_time && override.end_time
                          ? `${override.start_time.slice(0, 5)} – ${override.end_time.slice(0, 5)}`
                          : "All day"}
                        {override.reason && (
                          <span className="ml-2 italic">· {override.reason}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteOverride(override.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Override Dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="rounded-2xl border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Add Date Override</DialogTitle>
          </DialogHeader>
          <OverrideForm onClose={() => setOverrideDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OverrideForm({ onClose }: { onClose: () => void }) {
  const [isBlocked, setIsBlocked] = useState(true);
  const [allDay, setAllDay] = useState(true);
  const [pending, setPending] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function handleSubmit(formData: FormData) {
    setPending(true);
    formData.set("is_blocked", String(isBlocked));
    if (allDay) {
      formData.delete("start_time");
      formData.delete("end_time");
    }
    try {
      await addOverride(formData);
      onClose();
      // Friendly success message: distinguish single-day vs range
      const isRange = endDate && endDate !== startDate;
      toast.success(isRange ? "Date range blocked!" : "Date override added!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add override"
      );
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-gray-800 font-medium">
            Start date
          </Label>
          <Input
            id="date"
            name="date"
            type="date"
            required
            value={startDate}
            onChange={(e) => {
              const v = e.target.value;
              setStartDate(v);
              // If the current end date is now before the new start, bump it
              if (!endDate || endDate < v) setEndDate(v);
            }}
            className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date" className="text-gray-800 font-medium">
            End date{" "}
            <span className="text-xs font-normal text-gray-400">
              (same day if blank)
            </span>
          </Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="(optional)"
            className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
          />
        </div>
      </div>
      {startDate && endDate && endDate > startDate && (
        <div className="text-xs text-purple-600 font-medium flex items-center gap-1.5 -mt-1">
          <CalendarOff className="h-3 w-3" />
          {countDaysInclusive(startDate, endDate)} days will be blocked
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          className={
            isBlocked
              ? "bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-sm"
              : "border-gray-200 text-gray-400"
          }
          variant={isBlocked ? "default" : "outline"}
          onClick={() => setIsBlocked(true)}
        >
          Block Off
        </Button>
        <Button
          type="button"
          size="sm"
          className={
            !isBlocked
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm"
              : "border-gray-200 text-gray-400"
          }
          variant={!isBlocked ? "default" : "outline"}
          onClick={() => setIsBlocked(false)}
        >
          Extra Hours
        </Button>
      </div>

      {isBlocked && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant={allDay ? "default" : "outline"}
            size="sm"
            className={
              allDay
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-sm"
                : "border-gray-200 text-gray-400"
            }
            onClick={() => setAllDay(true)}
          >
            All Day
          </Button>
          <Button
            type="button"
            variant={!allDay ? "default" : "outline"}
            size="sm"
            className={
              !allDay
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-sm"
                : "border-gray-200 text-gray-400"
            }
            onClick={() => setAllDay(false)}
          >
            Specific Hours
          </Button>
        </div>
      )}

      {(!allDay || !isBlocked) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_time" className="text-gray-800 font-medium">Start</Label>
            <Input id="start_time" name="start_time" type="time" required className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time" className="text-gray-800 font-medium">End</Label>
            <Input id="end_time" name="end_time" type="time" required className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="reason" className="text-gray-800 font-medium">Reason (optional)</Label>
        <Input
          id="reason"
          name="reason"
          placeholder="Vacation, holiday, training..."
          className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
        />
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="flex gap-2">
        <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0" disabled={pending}>
          {pending ? "Adding..." : "Add Override"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="border-gray-200">
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** Count days inclusive between two YYYY-MM-DD strings (1 for same day). */
function countDaysInclusive(startYmd: string, endYmd: string): number {
  const start = new Date(startYmd + "T00:00:00Z").getTime();
  const end = new Date(endYmd + "T00:00:00Z").getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}
