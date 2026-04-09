// Helper for logging notifications to the notifications table.
// Best-effort: we never throw — failure to log shouldn't break the booking flow.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Channel = "email" | "sms" | "whatsapp";
type Status = "pending" | "sent" | "failed";

export async function logNotification(
  supabase: SupabaseClient<Database>,
  args: {
    bookingId: string | null;
    channel: Channel;
    recipient: string;
    template: string;
    status: Status;
    errorMessage?: string;
  }
): Promise<void> {
  try {
    await supabase.from("notifications").insert({
      booking_id: args.bookingId,
      channel: args.channel,
      recipient: args.recipient,
      template: args.template,
      status: args.status,
      error_message: args.errorMessage || null,
      sent_at: args.status === "sent" ? new Date().toISOString() : null,
    });
  } catch (e) {
    console.error("Failed to log notification:", e);
  }
}
