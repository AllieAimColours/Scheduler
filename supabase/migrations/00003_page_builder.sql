-- ─────────────────────────────────────────────────────────────
--  Page Builder — digital products + storage bucket
-- ─────────────────────────────────────────────────────────────

-- Digital products (e-books, guides, manuals)
CREATE TABLE IF NOT EXISTS digital_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  cover_image_url text,
  file_path text, -- path inside the digital-products storage bucket
  preview_image_url text, -- optional sample page preview
  price_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  is_active boolean NOT NULL DEFAULT true,
  sales_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS digital_products_provider_idx ON digital_products(provider_id);

-- Sales records — one per purchase
CREATE TABLE IF NOT EXISTS digital_product_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES digital_products(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  buyer_email text NOT NULL,
  buyer_name text DEFAULT '',
  amount_cents int NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  download_token text UNIQUE NOT NULL,
  download_expires_at timestamptz NOT NULL,
  download_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS digital_product_sales_provider_idx ON digital_product_sales(provider_id);
CREATE INDEX IF NOT EXISTS digital_product_sales_token_idx ON digital_product_sales(download_token);

-- RLS
ALTER TABLE digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_product_sales ENABLE ROW LEVEL SECURITY;

-- Providers manage their own products
CREATE POLICY "providers_own_products" ON digital_products
  FOR ALL USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- Public can read active products (for the booking page)
CREATE POLICY "public_read_active_products" ON digital_products
  FOR SELECT USING (is_active = true);

-- Providers see their own sales
CREATE POLICY "providers_read_own_sales" ON digital_product_sales
  FOR SELECT USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- Trigger to update updated_at on digital_products
CREATE OR REPLACE FUNCTION update_digital_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS digital_products_updated_at ON digital_products;
CREATE TRIGGER digital_products_updated_at
  BEFORE UPDATE ON digital_products
  FOR EACH ROW EXECUTE FUNCTION update_digital_products_updated_at();

-- ─────────────────────────────────────────────────────────────
--  Storage buckets (need to be created via Supabase dashboard
--  or `supabase storage create-bucket` because RLS lives in the
--  storage schema and is created differently per project)
-- ─────────────────────────────────────────────────────────────

-- Required buckets (create manually in Supabase Dashboard → Storage):
--
--   1. page-assets   (PUBLIC)   — hero images, gallery photos, etc.
--   2. digital-products (PRIVATE) — actual PDF/ebook files
--
-- After creating, run these policies in SQL editor:
--
--   -- Allow authenticated providers to upload to page-assets
--   CREATE POLICY "providers_upload_page_assets" ON storage.objects
--     FOR INSERT TO authenticated
--     WITH CHECK (bucket_id = 'page-assets');
--
--   CREATE POLICY "providers_update_page_assets" ON storage.objects
--     FOR UPDATE TO authenticated
--     USING (bucket_id = 'page-assets');
--
--   CREATE POLICY "providers_delete_page_assets" ON storage.objects
--     FOR DELETE TO authenticated
--     USING (bucket_id = 'page-assets');
--
--   CREATE POLICY "public_read_page_assets" ON storage.objects
--     FOR SELECT USING (bucket_id = 'page-assets');
--
--   -- Digital products: providers manage, no public read (only via signed URLs)
--   CREATE POLICY "providers_manage_digital_products" ON storage.objects
--     FOR ALL TO authenticated
--     USING (bucket_id = 'digital-products');
