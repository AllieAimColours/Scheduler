-- ─────────────────────────────────────────────────────────────
--  Track money collected in person (cash, tap, Square, etc.)
-- ─────────────────────────────────────────────────────────────
--
--  Bloom already tracks payment_amount_cents (what was collected
--  via Stripe at checkout) but had no way to record the rest of
--  the service price being paid in person at the appointment.
--  Providers couldn't see their true total revenue.
--
--  This column lets the provider mark a booking as "paid in
--  person" which updates the dashboard revenue calculation.
--

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS amount_collected_in_person_cents int NOT NULL DEFAULT 0;

COMMENT ON COLUMN bookings.amount_collected_in_person_cents IS
  'Amount the provider collected at the appointment (cash, tap, etc.) on top of payment_amount_cents. Total collected = payment_amount_cents + amount_collected_in_person_cents.';
