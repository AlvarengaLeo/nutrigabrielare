-- ============================================================
-- Migration 008: Catalog v2 — item kinds, reservations, shipping,
--                user purchases, digital products bucket
-- ============================================================
-- Introduces the unified catalog model where products, digital
-- goods and services share one table differentiated by `kind`.
-- Adds supporting tables for reservations, parametric shipping
-- zones, and a per-user purchase ledger that supports the future
-- "Mis productos" library. Provisions the private bucket for
-- downloadable digital goods.
-- ============================================================

-- ─── 1. PRODUCTS: kind, featured ordering, digital file ─────────

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'physical'
    CHECK (kind IN ('physical', 'digital', 'service')),
  ADD COLUMN IF NOT EXISTS featured_order int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS digital_file_path text;

CREATE INDEX IF NOT EXISTS products_kind_idx ON public.products (kind);
CREATE INDEX IF NOT EXISTS products_featured_idx
  ON public.products (featured, featured_order)
  WHERE featured = true;

-- ─── 2. ORDERS: courier tracking ────────────────────────────────

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS courier_name text,
  ADD COLUMN IF NOT EXISTS courier_tracking_code text;

-- ─── 3. SHIPPING ZONES (parametric) ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  cost decimal(10, 2) NOT NULL DEFAULT 0,
  free_threshold decimal(10, 2),
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active shipping zones"
  ON public.shipping_zones FOR SELECT
  USING (active = true);

CREATE POLICY "Editors can manage shipping zones"
  ON public.shipping_zones FOR ALL
  USING (public.is_editor());

-- Seed: El Salvador as the only active zone (initial coverage)
INSERT INTO public.shipping_zones (name, cost, free_threshold, sort_order)
VALUES ('El Salvador', 3.50, 50.00, 1)
ON CONFLICT (name) DO NOTHING;

-- ─── 4. USER PURCHASES (digital library, future Fase 9) ─────────

CREATE TABLE IF NOT EXISTS public.user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id text REFERENCES public.orders(id) ON DELETE SET NULL,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  UNIQUE (user_id, product_id, order_id)
);

CREATE INDEX IF NOT EXISTS user_purchases_user_idx
  ON public.user_purchases (user_id, purchased_at DESC);

ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own purchases"
  ON public.user_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Gestors can manage purchases"
  ON public.user_purchases FOR ALL
  USING (public.is_gestor());

-- ─── 5. RESERVATIONS (service bookings) ─────────────────────────

CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id text NOT NULL REFERENCES public.products(id),
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL DEFAULT '',
  preferred_date date,
  preferred_time text,
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'contactado', 'confirmado', 'completado', 'cancelado')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reservations_user_idx
  ON public.reservations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reservations_status_idx
  ON public.reservations (status, created_at DESC);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reservations"
  ON public.reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gestors can manage reservations"
  ON public.reservations FOR ALL
  USING (public.is_gestor());

-- ─── 6. DIGITAL PRODUCTS STORAGE BUCKET (private) ───────────────
-- Files here are NEVER public. Access only via signed URLs from
-- the serverless layer (Wompi webhook + admin downloads).

INSERT INTO storage.buckets (id, name, public)
VALUES ('digital-products', 'digital-products', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Editors can read digital products"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'digital-products' AND public.is_editor());

CREATE POLICY "Editors can upload digital products"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'digital-products' AND public.is_editor());

CREATE POLICY "Editors can update digital products"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'digital-products' AND public.is_editor());

CREATE POLICY "Editors can delete digital products"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'digital-products' AND public.is_editor());

-- ─── 7. HOME CONTENT: drop unused protocol column ───────────────

ALTER TABLE public.home_content DROP COLUMN IF EXISTS protocol;

-- ─── 8. UPDATED_AT TRIGGERS ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS shipping_zones_updated_at ON public.shipping_zones;
CREATE TRIGGER shipping_zones_updated_at
  BEFORE UPDATE ON public.shipping_zones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS reservations_updated_at ON public.reservations;
CREATE TRIGGER reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
