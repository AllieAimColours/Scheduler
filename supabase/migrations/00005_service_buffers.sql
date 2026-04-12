-- ─────────────────────────────────────────────────────────────
--  Per-service buffer times
-- ─────────────────────────────────────────────────────────────
--
--  Adds two nullable columns to the services table so providers can
--  override the provider-wide buffer defaults for specific services
--  that need more or less cleanup time.
--
--  NULL means "use the provider default" (stored in providers.branding).
--  A numeric value (including 0) means "this specific service has a
--  hard override — ignore the provider default".
--

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS buffer_before_minutes int,
  ADD COLUMN IF NOT EXISTS buffer_after_minutes int;

COMMENT ON COLUMN services.buffer_before_minutes IS
  'Buffer time (minutes) reserved before this service. NULL = use provider default.';
COMMENT ON COLUMN services.buffer_after_minutes IS
  'Buffer time (minutes) reserved after this service. NULL = use provider default.';
