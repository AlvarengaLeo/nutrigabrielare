-- 021_reservations_paid.sql
-- Servicios con pago en línea: enlaza reservas con la orden que las pagó
-- y agrega el estado 'pagado' (el webhook de Wompi lo asigna al confirmarse
-- el pago). Idempotente.

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS order_id text REFERENCES public.orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS reservations_order_idx
  ON public.reservations (order_id)
  WHERE order_id IS NOT NULL;

-- Extender el CHECK de status para incluir 'pagado'
ALTER TABLE public.reservations
  DROP CONSTRAINT IF EXISTS reservations_status_check;

ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_status_check
  CHECK (status IN ('pendiente', 'pagado', 'contactado', 'confirmado', 'completado', 'cancelado'));
