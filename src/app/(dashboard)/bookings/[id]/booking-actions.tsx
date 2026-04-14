"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function BookingActions({
  bookingId,
  currentStatus,
  currentNotes,
  servicePriceCents,
  paymentAmountCents,
  amountCollectedInPersonCents,
}: {
  bookingId: string;
  currentStatus: string;
  currentNotes: string;
  servicePriceCents: number;
  paymentAmountCents: number;
  amountCollectedInPersonCents: number;
}) {
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);
  const [collectedInPerson, setCollectedInPerson] = useState(amountCollectedInPersonCents);
  const [markingPaid, setMarkingPaid] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const owed = Math.max(0, servicePriceCents - paymentAmountCents - collectedInPerson);
  const fullyPaid = collectedInPerson + paymentAmountCents >= servicePriceCents;

  async function togglePaidInPerson() {
    setMarkingPaid(true);
    // If already fully paid in person, unset it. Otherwise set to fill the remainder.
    const newAmount = fullyPaid ? 0 : Math.max(0, servicePriceCents - paymentAmountCents);
    const { error } = await supabase
      .from("bookings")
      .update({ amount_collected_in_person_cents: newAmount })
      .eq("id", bookingId);
    if (error) {
      toast.error("Failed to update payment");
      setMarkingPaid(false);
      return;
    }
    setCollectedInPerson(newAmount);
    toast.success(newAmount > 0 ? "Marked as paid in person" : "Payment cleared");
    router.refresh();
    setMarkingPaid(false);
  }

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
      {/* Payment collection — only if there's money to track */}
      {servicePriceCents > 0 && (
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-600" />
            <h4 className="text-sm font-semibold text-gray-700">Payment</h4>
          </div>

          <div className="space-y-1 text-xs">
            {paymentAmountCents > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Deposit paid online</span>
                <span className="font-semibold text-emerald-700">
                  {formatPrice(paymentAmountCents)}
                </span>
              </div>
            )}
            {collectedInPerson > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Paid at appointment</span>
                <span className="font-semibold text-emerald-700">
                  {formatPrice(collectedInPerson)}
                </span>
              </div>
            )}
            <div className={`flex justify-between pt-1 ${owed > 0 ? "text-amber-700 font-semibold" : "text-gray-500"}`}>
              <span>{owed > 0 ? "Still owed" : "Total"}</span>
              <span>{formatPrice(owed > 0 ? owed : servicePriceCents)}</span>
            </div>
          </div>

          {owed > 0 || fullyPaid ? (
            <button
              onClick={togglePaidInPerson}
              disabled={markingPaid}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                fullyPaid
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-sm"
              }`}
            >
              {markingPaid ? (
                "Saving…"
              ) : fullyPaid ? (
                <>
                  <Check className="h-4 w-4" />
                  Paid — click to undo
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Mark {formatPrice(owed)} as paid at appointment
                </>
              )}
            </button>
          ) : null}
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2">
          Your Notes (private)
        </h4>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add internal notes about this appointment..."
          rows={3}
          className="border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
        />
        <Button
          size="sm"
          className="mt-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          onClick={saveNotes}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Notes"}
        </Button>
      </div>

      {currentStatus !== "cancelled" && currentStatus !== "completed" && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className="flex gap-2 pt-1">
            {currentStatus === "confirmed" && (
              <Button
                size="sm"
                onClick={() => updateStatus("completed")}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-sm"
              >
                Mark Completed
              </Button>
            )}
            {currentStatus === "confirmed" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus("no_show")}
                className="border-gray-200 hover:bg-gray-50"
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
        </>
      )}
    </div>
  );
}
