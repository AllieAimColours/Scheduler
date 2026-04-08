-- ============================================
-- PROVIDERS (the business owners)
-- ============================================
CREATE TABLE providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  logo_url text,
  timezone text NOT NULL DEFAULT 'America/New_York',
  currency text NOT NULL DEFAULT 'USD',
  phone text,
  email text,
  website text,
  social_links jsonb DEFAULT '{}',
  stripe_account_id text,
  stripe_onboarding_complete boolean DEFAULT false,
  branding jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- SERVICES (what providers offer)
-- ============================================
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  duration_minutes int NOT NULL,
  price_cents int NOT NULL,
  deposit_cents int DEFAULT 0,
  category text DEFAULT 'general',
  color text DEFAULT '#6366f1',
  emoji text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- AVAILABILITY RULES (recurring weekly schedule)
-- ============================================
CREATE TABLE availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- AVAILABILITY OVERRIDES (specific date blocks/opens)
-- ============================================
CREATE TABLE availability_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time,
  end_time time,
  is_blocked boolean DEFAULT true,
  reason text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id),
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  client_notes text DEFAULT '',
  provider_notes text DEFAULT '',
  payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'deposit_paid', 'paid', 'refunded')),
  payment_amount_cents int DEFAULT 0,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  calendar_event_id text,
  calendar_provider text,
  reminder_sent boolean DEFAULT false,
  timezone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PERSONAL EVENTS
-- ============================================
CREATE TABLE personal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_all_day boolean DEFAULT false,
  color text DEFAULT '#94a3b8',
  notes text DEFAULT '',
  recurrence_rule text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CALENDAR CONNECTIONS
-- ============================================
CREATE TABLE calendar_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  calendar_type text NOT NULL
    CHECK (calendar_type IN ('google', 'microsoft', 'caldav')),
  calendar_name text DEFAULT '',
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  caldav_url text,
  caldav_username text,
  caldav_password text,
  external_calendar_id text,
  is_read_enabled boolean DEFAULT true,
  is_write_enabled boolean DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- EXTERNAL BUSY TIMES (cached from calendar sync)
-- ============================================
CREATE TABLE external_busy_times (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES calendar_connections(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  title text DEFAULT 'Busy',
  synced_at timestamptz DEFAULT now()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'email')),
  recipient text NOT NULL,
  template text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_providers_slug ON providers(slug);
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_services_provider ON services(provider_id) WHERE is_active = true;
CREATE INDEX idx_bookings_provider_date ON bookings(provider_id, starts_at);
CREATE INDEX idx_bookings_status ON bookings(provider_id, status);
CREATE INDEX idx_availability_rules_provider ON availability_rules(provider_id);
CREATE INDEX idx_external_busy_provider ON external_busy_times(provider_id, starts_at, ends_at);
CREATE INDEX idx_personal_events_provider ON personal_events(provider_id, starts_at);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Providers
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_provider" ON providers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "public_read_providers" ON providers
  FOR SELECT USING (true);

-- Services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_own_services" ON services
  FOR ALL USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE POLICY "public_read_active_services" ON services
  FOR SELECT USING (is_active = true);

-- Availability Rules
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_own_rules" ON availability_rules
  FOR ALL USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE POLICY "public_read_rules" ON availability_rules
  FOR SELECT USING (true);

-- Availability Overrides
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_own_overrides" ON availability_overrides
  FOR ALL USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE POLICY "public_read_overrides" ON availability_overrides
  FOR SELECT USING (true);

-- Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_own_bookings" ON bookings
  FOR ALL USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE POLICY "public_insert_bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_read_own_booking" ON bookings
  FOR SELECT USING (true);

-- Personal Events
ALTER TABLE personal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_own_events" ON personal_events
  FOR ALL USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- Calendar Connections
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_own_connections" ON calendar_connections
  FOR ALL USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- External Busy Times
ALTER TABLE external_busy_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_own_busy_times" ON external_busy_times
  FOR ALL USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE POLICY "public_read_busy_times" ON external_busy_times
  FOR SELECT USING (true);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_read_notifications" ON notifications
  FOR SELECT USING (
    booking_id IN (
      SELECT b.id FROM bookings b
      JOIN providers p ON b.provider_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON personal_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON calendar_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
