-- ============================================================
-- Migration 006: Add 'pending_payment' to orders status check
-- ============================================================
-- Note: The constraint name may be auto-generated. Run this query first
-- to find the actual name if the DROP fails:
--   SELECT conname FROM pg_constraint
--   WHERE conrelid = 'public.orders'::regclass AND contype = 'c';

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending_payment', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'));
