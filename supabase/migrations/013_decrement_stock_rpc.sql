-- 013_decrement_stock_rpc.sql
-- Atomically decrements product_variants.stock for every physical item in
-- an order. Called from the Wompi webhook when an order transitions to
-- 'confirmed'. Idempotent in the sense that if called twice the second
-- call will further reduce stock — the webhook is responsible for not
-- re-processing an already-approved payment (which it already does via
-- the `if (['approved','declined'].includes(payment.status))` guard).
--
-- For order_items that don't match a row in product_variants
-- (digital products, services, or items without variants), the row is
-- silently skipped — we only decrement what exists.

CREATE OR REPLACE FUNCTION public.decrement_order_stock(p_order_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT oi.product_id, oi.size, oi.color, oi.quantity
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = p_order_id
      AND p.kind = 'physical'
      AND oi.quantity > 0
  LOOP
    UPDATE public.product_variants
    SET stock = GREATEST(stock - rec.quantity, 0)
    WHERE product_id = rec.product_id
      AND COALESCE(size, '') = COALESCE(rec.size, '')
      AND COALESCE(color_name, '') = COALESCE(rec.color, '');
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.decrement_order_stock(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrement_order_stock(text) TO service_role;
