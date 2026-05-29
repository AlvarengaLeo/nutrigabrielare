-- 018_testimonials.sql
-- Adds `testimonials` JSONB column to home_content for the homepage
-- testimonials section (title, subtitle, and a dynamic list of reviews).
-- Idempotent. RLS is row-level, so the existing home_content policies
-- (public SELECT, editors INSERT/UPDATE) already cover this new column.

ALTER TABLE public.home_content
  ADD COLUMN IF NOT EXISTS testimonials JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.home_content
SET testimonials = '{
  "titleLine1": "Historias reales de",
  "titleHighlight1": "Mujeres",
  "titleLine2": "que recuperaron su",
  "titleHighlight2": "Equilibrio",
  "subtitle": "Acompañamiento cercano, sin dietas extremas. Esto es lo que viven quienes confían su salud hormonal, metabólica y digestiva a este proceso.",
  "items": [
    { "name": "Andrea Martínez", "role": "Plan Hormonal", "location": "San Salvador", "rating": 5, "quote": "Después de años con desórdenes hormonales, por fin entendí mi cuerpo. Me acompañó sin dietas extremas y hoy tengo energía toda la semana." },
    { "name": "Valeria Reyes", "role": "Acompañamiento Fluir", "location": "Santa Tecla", "rating": 5, "quote": "No solo bajé de peso, recuperé mi ciclo y mi calma. El enfoque integral cambió por completo mi relación con la comida." },
    { "name": "Karla Sánchez", "role": "Consulta 1:1", "location": "Antiguo Cuscatlán", "rating": 5, "quote": "Cada plan se sintió hecho para mí. Las guías y la app hicieron fácil sostener mis hábitos incluso en las semanas más ocupadas." },
    { "name": "Daniela Guzmán", "role": "Programa Digestivo", "location": "San Miguel", "rating": 5, "quote": "Mis problemas digestivos eran diarios. En pocas semanas noté la diferencia y aprendí a comer sin miedo." },
    { "name": "Mónica Portillo", "role": "Plan Metabólico", "location": "Soyapango", "rating": 4.5, "quote": "Profesional, cercana y honesta. Me explicó el porqué de cada cambio y eso me dio la confianza para sostenerlo en el tiempo." },
    { "name": "Gabriela Aguilar", "role": "Recursos & Ebooks", "location": "Online", "rating": 5, "quote": "Los ebooks son oro: información clara, recetas reales y un acompañamiento que se siente humano de principio a fin." }
  ]
}'::jsonb
WHERE id = 'main' AND testimonials = '{}'::jsonb;
