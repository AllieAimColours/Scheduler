// Email sending via Resend.
//
// All functions are best-effort: if RESEND_API_KEY is missing or the send
// fails, we log + return { ok: false } so the caller can record it in the
// notifications table without breaking the booking flow.

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS || "Bloom <bookings@resend.dev>";

export interface SendResult {
  ok: boolean;
  error?: string;
}

export async function sendBookingConfirmation({
  to,
  clientName,
  serviceName,
  serviceEmoji,
  providerName,
  dateTime,
  duration,
  priceCents,
  servicePriceCents,
  currency = "USD",
  cancellationUrl,
  customMessage,
}: {
  to: string;
  clientName: string;
  serviceName: string;
  serviceEmoji: string;
  providerName: string;
  dateTime: string;
  duration: number;
  priceCents: number;
  servicePriceCents?: number;
  currency?: string;
  cancellationUrl?: string;
  customMessage?: string;
}): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email");
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  try {
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

    const price = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(priceCents / 100);

    const emoji = serviceEmoji || "✨";
    const totalPrice = servicePriceCents && servicePriceCents > 0
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(servicePriceCents / 100)
      : null;
    const isDeposit = priceCents > 0 && servicePriceCents && priceCents < servicePriceCents;
    const remainderCents = isDeposit ? servicePriceCents - priceCents : 0;
    const remainderPrice = remainderCents > 0
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(remainderCents / 100)
      : null;

    const cancelBlock = cancellationUrl
      ? `
        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e8e2f0;">
          <a href="${cancellationUrl}" style="color: #7c3aed; text-decoration: none; font-size: 13px; font-weight: 500;">
            Need to cancel or reschedule?
          </a>
        </div>
      `
      : `
        <p style="color: #888; font-size: 13px; text-align: center; margin-top: 30px;">
          Need to cancel or reschedule? Reply to this email.
        </p>
      `;

    // Payment rows — adapt to deposit vs full-pay vs free
    let paymentRows = "";
    if (totalPrice) {
      paymentRows += `
        <tr style="border-top: 1px solid #e8e2f0;">
          <td style="padding: 14px 0 0; color: #888; font-size: 14px; font-weight: 600;">Total</td>
          <td style="padding: 14px 0 0; text-align: right; font-weight: 700; color: #1a1a1a; font-size: 20px;">${totalPrice}</td>
        </tr>`;
      if (isDeposit) {
        paymentRows += `
        <tr>
          <td style="padding: 6px 0 0; color: #888; font-size: 13px;">Deposit paid</td>
          <td style="padding: 6px 0 0; text-align: right; font-weight: 600; color: #16a34a; font-size: 14px;">${price}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0 0; color: #888; font-size: 13px;">Due at appointment</td>
          <td style="padding: 6px 0 0; text-align: right; font-weight: 600; color: #1a1a1a; font-size: 14px;">${remainderPrice}</td>
        </tr>`;
      } else if (priceCents === 0) {
        paymentRows += `
        <tr>
          <td style="padding: 6px 0 0; color: #888; font-size: 13px;">Due at appointment</td>
          <td style="padding: 6px 0 0; text-align: right; font-weight: 600; color: #1a1a1a; font-size: 14px;">${totalPrice}</td>
        </tr>`;
      }
    }

    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `${emoji} Booking Confirmed — ${serviceName} with ${providerName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <!-- Bloom logo/brand -->
          <div style="text-align: center; margin-bottom: 8px;">
            <span style="font-size: 14px; font-weight: 700; letter-spacing: 0.08em; background: linear-gradient(135deg, #7c3aed, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">BLOOM</span>
          </div>

          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 56px; line-height: 1; margin-bottom: 12px;">${emoji}</div>
            <h1 style="font-size: 28px; color: #1a1a1a; margin: 0 0 8px; font-weight: 700;">You're booked!</h1>
            <p style="color: #888; font-size: 15px; margin: 0;">${
              customMessage
                ? customMessage.replace(/\{name\}/gi, clientName)
                : `We'll see you soon, ${clientName}.`
            }</p>
          </div>

          <div style="background: linear-gradient(135deg, #f8f4ff 0%, #fdf2f8 100%); border-radius: 16px; padding: 24px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Service</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Date</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Time</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${formattedTime}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Duration</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${duration} min</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 14px;">With</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${providerName}</td>
              </tr>
              ${paymentRows}
            </table>
          </div>

          ${cancelBlock}

          <p style="text-align: center; margin-top: 40px; color: #ccc; font-size: 11px;">
            Powered by Bloom · bloomrdv.com
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend send error:", error);
      return { ok: false, error: error.message || String(error) };
    }

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Email send threw:", message);
    return { ok: false, error: message };
  }
}
