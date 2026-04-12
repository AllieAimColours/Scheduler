-- ─────────────────────────────────────────────────────────────
--  Per-service minimum booking notice + daily cap
-- ─────────────────────────────────────────────────────────────
--
--  Adds two more nullable columns to services so providers can
--  override the provider-wide minimum booking notice AND cap how
--  many of a specific service they're willing to do in one day.
--
--  min_notice_hours
--    NULL = inherit providers.branding.min_booking_notice_hours
--    0    = this specific service has no minimum notice
--    N    = this service needs N hours of advance notice
--
--  max_per_day
--    NULL = unlimited (default behaviour)
--    N    = hard cap — once N bookings of this service exist on
--           a given date, no more slots are offered that day.
--           Used for exhausting or messy services — e.g. "only
--           1 hair color per day" while cuts stay unlimited.
--

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS min_notice_hours int,
  ADD COLUMN IF NOT EXISTS max_per_day int;

COMMENT ON COLUMN services.min_notice_hours IS
  'Override for provider-wide minimum booking notice. NULL = inherit provider default, 0+ = hard override.';
COMMENT ON COLUMN services.max_per_day IS
  'Max bookings of this service per day. NULL = unlimited.';
