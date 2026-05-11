-- 011_featured_section.sql
-- Adds `featured` JSONB column to home_content for the "Pleno Market"
-- carousel section (title, CTA, product limit). Idempotent.

ALTER TABLE public.home_content
  ADD COLUMN IF NOT EXISTS featured JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.home_content
SET featured = '{
  "titleLine1": "Pleno",
  "titleLine2": "Market.",
  "ctaLabel": "Ver todo",
  "ctaTo": "/pleno",
  "productLimit": 5
}'::jsonb
WHERE id = 'main' AND featured = '{}'::jsonb;
