-- 023_home_section_order.sql
-- Permite que la administradora ordene y muestre/oculte las secciones del
-- inicio desde el panel (/admin/home → tab "Orden"). Nueva columna JSONB
-- section_order: array ordenado de { id, visible }. El Hero queda fijo arriba.
-- Idempotente. Las policies RLS existentes cubren la columna nueva.

ALTER TABLE public.home_content
  ADD COLUMN IF NOT EXISTS section_order JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Orden por defecto: barra de casos de éxito primero, luego filosofía,
-- recursos, pleno market, testimonios y acerca de mí.
UPDATE public.home_content
SET section_order = '[
  {"id": "stats", "visible": true},
  {"id": "philosophy", "visible": true},
  {"id": "digital_resources", "visible": true},
  {"id": "featured", "visible": true},
  {"id": "testimonials", "visible": true},
  {"id": "why_choose_us", "visible": true}
]'::jsonb
WHERE id = 'main' AND (section_order = '[]'::jsonb OR section_order IS NULL);
