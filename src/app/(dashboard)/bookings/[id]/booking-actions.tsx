"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function BookingActions({
  bookingId,
  currentStatus,
  currentNotes,
}: {
  bookingId: string;
  currentStatus: string;
  currentNotes: string;
}) {
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function saveNotes() {
    setSaving(true);
    const { error } = await supabase
      .from("bookings")
      .update({ provider_notes: notes })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to save notes");
    } else {
      toast.success("Notes saved!");
    }
    setSaving(false);
  }

  async function updateStatus(status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show") {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Booking marked as ${status}`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Your Notes (private)
        </h4>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add internal notes about this appointment..."
          rows={3}
        />
        <Button
          size="sm"
          className="mt-2"
          onClick={saveNotes}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Notes"}
        </Button>
      </div>

      {currentStatus !== "cancelled" && currentStatus !== "completed" && (
        <div className="flex gap-2 pt-2">
          {currentStatus === "confirmed" && (
            <Button
              size="sm"
              variant="default"
              onClick={() => updateStatus("completed")}
            >
              Mark Completed
            </Button>
          )}
          {currentStatus === "confirmed" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateStatus("no_show")}
            >
              No Show
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              if (confirm("Cancel this booking?")) {
                updateStatus("cancelled");
              }
            }}
          >
            Cancel Booking
          </Button>
        </div>
      )}
    </div>
  );
}
