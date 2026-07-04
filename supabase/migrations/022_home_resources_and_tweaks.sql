-- 022_home_resources_and_tweaks.sql
-- Home feedback round (Gabriela):
--   1. Nueva sección editable "Recursos" en el home (bloque "recursos para
--      profundizar") — antes tenía textos fijos en el código.
--   2. Pleno Market: separar "Seleccionados por Gabriela..." como subtítulo.
-- Idempotente. Las policies RLS row-level existentes ya cubren la columna nueva.

-- ─── 1. Columna nueva: digital_resources ───────────────────────────────
ALTER TABLE public.home_content
  ADD COLUMN IF NOT EXISTS digital_resources JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.home_content
SET digital_resources = '{
  "eyebrow": "APRENDE CON GABRIELA",
  "titleLine1": "Recursos que puedes",
  "titleLine2": "usar hoy.",
  "subtitle": "Ebooks, guías y cursos diseñados por Gabriela. Cómpralos de una vez y úsalos ¡siempre!"
}'::jsonb
WHERE id = 'main' AND digital_resources = '{}'::jsonb;

-- ─── 2. Pleno Market: título limpio + subtítulo aparte ──────────────────
-- Antes titleLine2 = "Market. Seleccionados por Gabriela para tu bienestar".
-- Guarda `subtitle IS NULL` para no pisar ediciones del admin si se re-ejecuta.
UPDATE public.home_content
SET featured = featured
  || jsonb_build_object(
       'titleLine2', 'Market.',
       'subtitle', 'Seleccionados por Gabriela para tu bienestar'
     )
WHERE id = 'main' AND (featured ->> 'subtitle') IS NULL;
