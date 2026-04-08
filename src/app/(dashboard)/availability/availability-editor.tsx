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
import { Clock, Plus, Trash2, CalendarOff } from "lucide-react";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Hours
          </CardTitle>
          <CardDescription>
            Set your regular working hours ({timezone.replace(/_/g, " ")})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAYS.map((day, index) => (
            <div
              key={day}
              className="flex items-center gap-4 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Button
                type="button"
                variant={schedule[index].enabled ? "default" : "outline"}
                size="sm"
                className="w-28"
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
                    className="w-32"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={schedule[index].end_time}
                    onChange={(e) =>
                      updateDay(index, { end_time: e.target.value })
                    }
                    className="w-32"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Not available
                </span>
              )}
            </div>
          ))}

          <div className="pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Weekly Hours"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Date Overrides */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarOff className="h-5 w-5" />
                Date Overrides
              </CardTitle>
              <CardDescription>
                Block off specific dates for vacations, holidays, or special
                hours
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setOverrideDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Override
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {overrides.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No date overrides set. Add one to block a day off or change hours
              for a specific date.
            </p>
          ) : (
            <div className="space-y-2">
              {overrides.map((override) => (
                <div
                  key={override.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={override.is_blocked ? "destructive" : "default"}>
                      {override.is_blocked ? "Blocked" : "Open"}
                    </Badge>
                    <span className="font-medium">
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
                      <span className="text-sm text-muted-foreground">
                        {override.start_time.slice(0, 5)} -{" "}
                        {override.end_time.slice(0, 5)}
                      </span>
                    )}
                    {!override.start_time && (
                      <span className="text-sm text-muted-foreground">
                        All day
                      </span>
                    )}
                    {override.reason && (
                      <span className="text-sm text-muted-foreground italic">
                        — {override.reason}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteOverride(override.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Date Override</DialogTitle>
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
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={isBlocked ? "default" : "outline"}
          size="sm"
          onClick={() => setIsBlocked(true)}
        >
          Block Off
        </Button>
        <Button
          type="button"
          variant={!isBlocked ? "default" : "outline"}
          size="sm"
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
            onClick={() => setAllDay(true)}
          >
            All Day
          </Button>
          <Button
            type="button"
            variant={!allDay ? "default" : "outline"}
            size="sm"
            onClick={() => setAllDay(false)}
          >
            Specific Hours
          </Button>
        </div>
      )}

      {(!allDay || !isBlocked) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_time">Start</Label>
            <Input id="start_time" name="start_time" type="time" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End</Label>
            <Input id="end_time" name="end_time" type="time" required />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="reason">Reason (optional)</Label>
        <Input
          id="reason"
          name="reason"
          placeholder="Vacation, holiday, training..."
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? "Adding..." : "Add Override"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
