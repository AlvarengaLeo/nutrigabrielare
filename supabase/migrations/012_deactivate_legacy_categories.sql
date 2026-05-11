-- 012_deactivate_legacy_categories.sql
-- Hide legacy categories from a previous brand/design iteration. Filas se
-- mantienen para no romper FKs si algún producto histórico todavía las
-- referencia, pero no se muestran en el frontend público (que filtra por
-- active=true en product_categories).

UPDATE public.product_categories
SET active = false
WHERE id IN ('ropa', 'accesorios', 'edicion-limitada');
