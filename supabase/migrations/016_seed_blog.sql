-- 016_seed_blog.sql
-- Initial categories for the Fluir Femenino blog. Idempotent via ON CONFLICT.

INSERT INTO public.post_categories (id, name, slug, description, sort_order, active) VALUES
  ('nutricion', 'Nutrición', 'nutricion', 'Educación nutricional, ciencia accesible, mitos y mejores prácticas.', 10, true),
  ('hormonas', 'Salud Hormonal', 'hormonas', 'Ciclos, balance hormonal, fertilidad y bienestar femenino.', 20, true),
  ('recetas', 'Recetas', 'recetas', 'Recetas reales con ingredientes accesibles para El Salvador.', 30, true),
  ('bienestar', 'Bienestar Integral', 'bienestar', 'Hábitos, mente, descanso y movimiento.', 40, true),
  ('estilo-de-vida', 'Estilo de Vida', 'estilo-de-vida', 'Reflexiones, manifiestos, rituales y vida diaria.', 50, true)
ON CONFLICT (id) DO NOTHING;
