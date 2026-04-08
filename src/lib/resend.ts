// Email sending via Resend
// Install: npm install resend

export async function sendBookingConfirmation({
  to,
  clientName,
  serviceName,
  serviceEmoji,
  providerName,
  dateTime,
  duration,
  price,
}: {
  to: string;
  clientName: string;
  serviceName: string;
  serviceEmoji: string;
  providerName: string;
  dateTime: string;
  duration: number;
  price: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const formattedDate = new Date(dateTime).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(dateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  await resend.emails.send({
    from: "Scheduler <noreply@scheduler.app>",
    to,
    subject: `${serviceEmoji} Booking Confirmed — ${serviceName} with ${providerName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 10px;">${serviceEmoji || "✅"}</div>
          <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">Booking Confirmed!</h1>
        </div>

        <p style="color: #666; font-size: 16px;">Hi ${clientName},</p>
        <p style="color: #666; font-size: 16px;">Your appointment has been confirmed. Here are the details:</p>

        <div style="background: #f8f4ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Service</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Date</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Time</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${formattedTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Duration</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${duration} min</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Provider</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${providerName}</td>
            </tr>
            <tr style="border-top: 1px solid #e0d8f0;">
              <td style="padding: 12px 0 0; color: #888; font-size: 14px; font-weight: 600;">Paid</td>
              <td style="padding: 12px 0 0; text-align: right; font-weight: 700; color: #1a1a1a; font-size: 18px;">${price}</td>
            </tr>
          </table>
        </div>

        <p style="color: #888; font-size: 13px; text-align: center; margin-top: 30px;">
          Need to cancel or reschedule? Reply to this email.
        </p>
      </div>
    `,
  });
}
