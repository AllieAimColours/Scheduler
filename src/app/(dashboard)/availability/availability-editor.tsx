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
    <div className="space-y-6">
      {/* Weekly Schedule */}
      <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-gray-800">
            <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            Weekly Hours
          </CardTitle>
          <CardDescription className="text-gray-400">
            Set your regular working hours ({timezone.replace(/_/g, " ")})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {DAYS.map((day, index) => (
            <div
              key={day}
              className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-200 ${
                schedule[index].enabled
                  ? "bg-gradient-to-r from-purple-50/80 to-pink-50/50 border border-purple-100/60"
                  : "hover:bg-gray-50"
              }`}
            >
              <Button
                type="button"
                size="sm"
                className={`w-28 transition-all ${
                  schedule[index].enabled
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-sm"
                    : "border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
                variant={schedule[index].enabled ? "default" : "outline"}
                onClick={() =>
                  updateDay(index, { enabled: !schedule[index].enabled })
                }
              >
                {day.slice(0, 3)}
                {schedule[index].enabled ? " ✓" : ""}
              </Button>

              {schedule[index].enabled ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={schedule[index].start_time}
                    onChange={(e) =>
                      updateDay(index, { start_time: e.target.value })
                    }
                    className="w-32 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <Input
                    type="time"
                    value={schedule[index].end_time}
                    onChange={(e) =>
                      updateDay(index, { end_time: e.target.value })
                    }
                    className="w-32 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400 italic">
                  Not available
                </span>
              )}
            </div>
          ))}

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-4" />

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {saving ? "Saving..." : "Save Weekly Hours"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Date Overrides */}
      <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2.5 text-gray-800">
                <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  <CalendarOff className="h-4 w-4 text-white" />
                </div>
                Date Overrides
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Block off specific dates for vacations, holidays, or special
                hours
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setOverrideDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Override
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {overrides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                <Sun className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 max-w-xs">
                No date overrides yet. Add one to block a day off for vacation or set special hours.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {overrides.map((override) => (
                <div
                  key={override.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50/80 border border-gray-100 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`rounded-full border-0 font-medium ${
                        override.is_blocked
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {override.is_blocked ? "Blocked" : "Open"}
                    </Badge>
                    <span className="font-medium text-gray-800">
                      {new Date(override.date + "T00:00").toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                    {override.start_time && override.end_time && (
                      <span className="text-sm text-gray-400">
                        {override.start_time.slice(0, 5)} -{" "}
                        {override.end_time.slice(0, 5)}
                      </span>
                    )}
                    {!override.start_time && (
                      <span className="text-sm text-gray-400">
                        All day
                      </span>
                    )}
                    {override.reason && (
                      <span className="text-sm text-gray-400 italic">
                        — {override.reason}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteOverride(override.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
      toast.success("Override added!");
    } catch {
      toast.error("Failed to add override");
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date" className="text-gray-800 font-medium">Date</Label>
        <Input id="date" name="date" type="date" required className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20" />
      </div>

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
