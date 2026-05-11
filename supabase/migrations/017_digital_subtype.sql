-- 017_digital_subtype.sql
-- Agrega un subtipo opcional a productos digitales (ebook, curso, guía,
-- evento grabado, programa, contenido). Permite filtrado en /pleno/digitales
-- y agrupación en admin. Nullable porque productos no-digitales no lo usan.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS digital_subtype text
  CHECK (digital_subtype IN ('ebook', 'curso', 'guia', 'evento_grabado', 'programa', 'contenido'));

CREATE INDEX IF NOT EXISTS idx_products_digital_subtype
  ON public.products(digital_subtype)
  WHERE digital_subtype IS NOT NULL;

-- Seed: aplicar subtype a los 8 productos digitales ya cargados.
UPDATE public.products SET digital_subtype = 'ebook'           WHERE id = 'dig-001';
UPDATE public.products SET digital_subtype = 'ebook'           WHERE id = 'dig-002';
UPDATE public.products SET digital_subtype = 'guia'            WHERE id = 'dig-003';
UPDATE public.products SET digital_subtype = 'curso'           WHERE id = 'dig-004';
UPDATE public.products SET digital_subtype = 'curso'           WHERE id = 'dig-005';
UPDATE public.products SET digital_subtype = 'evento_grabado'  WHERE id = 'dig-006';
UPDATE public.products SET digital_subtype = 'guia'            WHERE id = 'dig-007';
UPDATE public.products SET digital_subtype = 'programa'        WHERE id = 'dig-008';
