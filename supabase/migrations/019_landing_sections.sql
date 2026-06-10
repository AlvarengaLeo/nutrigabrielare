-- 019_landing_sections.sql
-- Adds `pleno_hero`, `nutri_hero` and `fluir_content` JSONB columns to
-- home_content for the hero texts of /pleno, /nutrigabrielare and
-- /fluir-femenino.
-- Idempotent. RLS is row-level, so the existing home_content policies
-- (public SELECT, editors INSERT/UPDATE) already cover the new columns.

ALTER TABLE public.home_content
  ADD COLUMN IF NOT EXISTS pleno_hero JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.home_content
  ADD COLUMN IF NOT EXISTS nutri_hero JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.home_content
  ADD COLUMN IF NOT EXISTS fluir_content JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.home_content
SET pleno_hero = '{
  "titleLine1": "Bienestar en su forma",
  "titleLine2": "más plena.",
  "subtitle": "Productos digitales, suplementos seleccionados y consultas con acompañamiento real. Una sola tienda para tu bienestar integral."
}'::jsonb
WHERE id = 'main' AND pleno_hero = '{}'::jsonb;

UPDATE public.home_content
SET nutri_hero = '{
  "titleLine1": "Recursos y consultas",
  "titleHighlight": "para tu camino.",
  "subtitle": "Ebooks, guías y consultas 1:1 con enfoque holístico. Descargables al instante y acompañamiento real cuando lo necesitás."
}'::jsonb
WHERE id = 'main' AND nutri_hero = '{}'::jsonb;

UPDATE public.home_content
SET fluir_content = '{
  "heroTitle": "Un espacio para fluir",
  "heroHighlight": "en tu propio tiempo.",
  "heroSubtitle": "Lecturas, recursos y una comunidad para acompañar tu salud hormonal, tu mente y tu ciclo — sin prisa, sin pausa forzada.",
  "lecturasTitle": "Lecturas",
  "lecturasHighlight": "recientes.",
  "resourcesTitleLine1": "Lo que la lectura",
  "resourcesTitleLine2": "no alcanza a cubrir.",
  "resourcesSubtitle": "Ebooks, cursos y guías diseñados por Gabriela para acompañarte más allá del artículo."
}'::jsonb
WHERE id = 'main' AND fluir_content = '{}'::jsonb;
