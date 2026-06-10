-- 020_pickup_zones.sql
-- Adds `is_pickup` flag to shipping_zones so checkout can skip the
-- address/city/department fields when the customer picks up in person.
-- Idempotent. RLS policies on shipping_zones already cover this column.

ALTER TABLE public.shipping_zones
  ADD COLUMN IF NOT EXISTS is_pickup boolean NOT NULL DEFAULT false;

-- One-time seed: mark existing pickup-style zones by name.
-- After this seed, the flag is managed from the admin panel (/admin/envios).
UPDATE public.shipping_zones
SET is_pickup = true
WHERE is_pickup = false
  AND (name ILIKE '%recoger%' OR name ILIKE '%retiro%' OR name ILIKE '%pickup%');
