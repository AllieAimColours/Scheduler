-- Add cancellation policy fields to providers
ALTER TABLE providers ADD COLUMN IF NOT EXISTS cancellation_policy jsonb DEFAULT '{}';

-- The cancellation_policy JSON structure:
-- {
--   "enabled": true,
--   "rules": [
--     { "hours_before": 48, "refund_percent": 100 },
--     { "hours_before": 24, "refund_percent": 50 },
--     { "hours_before": 0, "refund_percent": 0 }
--   ],
--   "policy_text": "Custom cancellation policy text...",
--   "require_deposit_above_cents": 0,  -- auto-require deposit for services above this price (0 = use per-service setting)
--   "default_deposit_percent": 50       -- default deposit percentage when auto-calculated
-- }

-- Add cancellation fields to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason text DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount_cents int DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_token text UNIQUE;
