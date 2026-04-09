import { randomBytes } from "crypto";

export interface CancellationRule {
  hours_before: number;
  refund_percent: number;
}

export interface CancellationPolicy {
  enabled: boolean;
  rules: CancellationRule[];
  policy_text: string;
  require_deposit_above_cents: number;
  default_deposit_percent: number;
}

export const DEFAULT_POLICY: CancellationPolicy = {
  enabled: false,
  rules: [
    { hours_before: 48, refund_percent: 100 },
    { hours_before: 24, refund_percent: 50 },
    { hours_before: 0, refund_percent: 0 },
  ],
  policy_text: "",
  require_deposit_above_cents: 0,
  default_deposit_percent: 50,
};

/**
 * Parse raw JSON from the database into a typed CancellationPolicy.
 */
export function parseCancellationPolicy(raw: unknown): CancellationPolicy {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_POLICY };
  const obj = raw as Record<string, unknown>;
  return {
    enabled: Boolean(obj.enabled),
    rules: Array.isArray(obj.rules) ? obj.rules : [...DEFAULT_POLICY.rules],
    policy_text: typeof obj.policy_text === "string" ? obj.policy_text : "",
    require_deposit_above_cents:
      typeof obj.require_deposit_above_cents === "number"
        ? obj.require_deposit_above_cents
        : 0,
    default_deposit_percent:
      typeof obj.default_deposit_percent === "number"
        ? obj.default_deposit_percent
        : 50,
  };
}

/**
 * Calculate the refund amount based on cancellation timing and policy rules.
 * Rules are sorted by hours_before descending — the first rule whose hours_before
 * is <= the actual hours remaining determines the refund percentage.
 */
export function calculateRefund(
  policy: CancellationPolicy,
  bookingStartsAt: Date,
  cancelledAt: Date,
  paymentAmountCents: number
): number {
  if (!policy.enabled || policy.rules.length === 0) {
    return paymentAmountCents; // No policy = full refund
  }

  const hoursUntilBooking =
    (bookingStartsAt.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60);

  // Sort rules by hours_before descending
  const sorted = [...policy.rules].sort(
    (a, b) => b.hours_before - a.hours_before
  );

  // Find the applicable rule: the first rule where hoursUntilBooking >= hours_before
  let refundPercent = 0;
  for (const rule of sorted) {
    if (hoursUntilBooking >= rule.hours_before) {
      refundPercent = rule.refund_percent;
      break;
    }
  }

  return Math.round(paymentAmountCents * (refundPercent / 100));
}

/**
 * Generate a unique cancellation token for self-service cancellation links.
 */
export function generateCancellationToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Calculate effective deposit amount for a service, considering both
 * per-service deposit_cents and policy-level auto-deposit settings.
 */
export function getEffectiveDeposit(
  service: { price_cents: number; deposit_cents: number },
  policy: CancellationPolicy
): number {
  // If the service has its own explicit deposit, use that
  if (service.deposit_cents > 0) {
    return service.deposit_cents;
  }

  // If the policy auto-requires deposits above a threshold
  if (
    policy.enabled &&
    policy.require_deposit_above_cents > 0 &&
    service.price_cents > policy.require_deposit_above_cents
  ) {
    return Math.round(
      service.price_cents * (policy.default_deposit_percent / 100)
    );
  }

  // No deposit — charge full price
  return 0;
}

/**
 * Format the cancellation policy into human-readable text for display.
 */
export function formatCancellationPolicy(policy: CancellationPolicy): string {
  if (!policy.enabled) return "";

  if (policy.policy_text) return policy.policy_text;

  const sorted = [...policy.rules].sort(
    (a, b) => b.hours_before - a.hours_before
  );

  const lines = sorted.map((rule) => {
    if (rule.hours_before === 0) {
      return `No-show or same-day cancellation: ${rule.refund_percent}% refund`;
    }
    return `Cancel ${rule.hours_before}+ hours before: ${rule.refund_percent}% refund`;
  });

  return lines.join("\n");
}
