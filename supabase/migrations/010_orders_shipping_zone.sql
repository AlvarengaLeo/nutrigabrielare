-- ============================================================
-- Migration 010: Link orders to shipping zones (Fase 8)
-- ============================================================
-- Adds nullable FK to shipping_zones plus a denormalized name
-- snapshot so historical orders keep their zone label even if
-- the zone is later renamed or deleted.
-- ============================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_zone_id uuid
    REFERENCES public.shipping_zones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS shipping_zone_name text;

CREATE INDEX IF NOT EXISTS orders_shipping_zone_idx
  ON public.orders (shipping_zone_id);
