-- ─────────────────────────────────────────────────────────────
--  Calendar connection enhancements for two-way sync
-- ─────────────────────────────────────────────────────────────
--
--  Adds support for multi-account calendar sync with one
--  designated "primary" write target per provider.
--

ALTER TABLE calendar_connections
  ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_email text,
  ADD COLUMN IF NOT EXISTS sync_error text,
  ADD COLUMN IF NOT EXISTS webhook_channel_id text,
  ADD COLUMN IF NOT EXISTS webhook_expires_at timestamptz;

-- Only one primary connection per provider
CREATE UNIQUE INDEX IF NOT EXISTS calendar_connections_one_primary
  ON calendar_connections (provider_id)
  WHERE is_primary = true;

COMMENT ON COLUMN calendar_connections.is_primary IS
  'The one designated write target for this provider. Only one row per provider can have is_primary = true.';
COMMENT ON COLUMN calendar_connections.account_email IS
  'Email of the connected account (google/microsoft) or Apple ID. Shown in the UI so users can tell their accounts apart.';
COMMENT ON COLUMN calendar_connections.sync_error IS
  'Last error from a sync attempt. NULL when healthy.';
COMMENT ON COLUMN calendar_connections.webhook_channel_id IS
  'Google channel ID or Microsoft subscription ID for push notifications.';
COMMENT ON COLUMN calendar_connections.webhook_expires_at IS
  'When the current webhook channel expires and must be renewed.';
