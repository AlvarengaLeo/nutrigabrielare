-- ============================================================
-- Migration 007: Home Content CMS
-- Single-row table with JSONB columns for each homepage section
-- ============================================================

-- ─── TABLE ───────────────────────────────────────────────────

CREATE TABLE public.home_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  hero JSONB NOT NULL DEFAULT '{}',
  philosophy JSONB NOT NULL DEFAULT '{}',
  why_choose_us JSONB NOT NULL DEFAULT '{}',
  features JSONB NOT NULL DEFAULT '{}',
  protocol JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public site needs this)
CREATE POLICY "Anyone can read home content"
  ON public.home_content FOR SELECT
  USING (true);

-- Only editors (and admins) can modify
CREATE POLICY "Editors can manage home content"
  ON public.home_content FOR ALL
  USING (public.is_editor());

-- ─── SEED with current hardcoded content ─────────────────────

INSERT INTO public.home_content (id, hero, philosophy, why_choose_us, features, protocol)
VALUES (
  'main',

  -- hero
  '{
    "badge": "Enfoque Holístico",
    "titleLine1": "Armonía entre",
    "titleHighlight1": "Cuerpo—",
    "titleLine2": "y Salud",
    "titleHighlight2": "Hormonal",
    "subtitle": "Te acompaño a lograr un balance integral conectando alma, mente y cuerpo. Alcanza tus objetivos físicos cuidando tu salud hormonal, metabólica y digestiva en todo momento.",
    "primaryCta": { "text": "Explorar Servicios", "href": "#servicios" },
    "secondaryCta": { "text": "Recursos y Ebooks", "href": "#recursos" },
    "heroImage": "/media/hero_model.png",
    "showDecorativeLeaves": true
  }'::jsonb,

  -- philosophy
  '{
    "badge": "Mi Filosofía",
    "titleLine1": "Bienestar",
    "titleHighlight1": "Integral—",
    "titleLine2": "para la Mujer de",
    "titleHighlight2": "Hoy",
    "values": [
      { "icon": "Heart", "label": "Cercanía" },
      { "icon": "Activity", "label": "Salud Hormonal" },
      { "icon": "Brain", "label": "Mente y Alma" }
    ],
    "description": "Te ofrezco un espacio lleno de calma y motivación. Creo firmemente en que los resultados físicos llegan por sí solos cuando construimos una base sólida de hábitos, cuidando nuestro entorno emocional y nuestro balance hormonal interno.",
    "stats": [
      { "value": "99%", "label": "Casos de Éxito" },
      { "value": "12+", "label": "Años de Experiencia" },
      { "value": "1,200+", "label": "Planes Creados" },
      { "value": "200+", "label": "Recursos Disponibles" }
    ],
    "decorativeImages": {
      "topLeft": "/media/ora.png",
      "midLeft": "/media/pom.png",
      "topRight": "/media/tom.png",
      "midRight": "/media/broc.png"
    }
  }'::jsonb,

  -- why_choose_us
  '{
    "badge": "Tu Diferenciador",
    "titleLine1": "Más que una",
    "titleHighlight1": "Dieta—",
    "titleLine2": "Un Estilo de",
    "titleHighlight2": "Vida",
    "reasons": [
      {
        "icon": "Scale",
        "title": "Especialización en Salud Hormonal",
        "description": "Enfocamos nuestros planes en el cuidado de tu metabolismo y balance hormonal, un pilar fundamental para la pérdida de peso sostenible en la mujer."
      },
      {
        "icon": "HeartPulse",
        "title": "Enfoque Holístico Integral",
        "description": "No solo contamos calorías. Evaluamos tu calidad de sueño, salud mental, digestiva y opciones de movimiento para crear una rutina verdaderamente adaptada a ti."
      },
      {
        "icon": "Carrot",
        "title": "Herramientas Digitales y App",
        "description": "A través de una app exclusiva podrás visualizar tu progreso y acceder a tu plan. También encontrarás guías y recetarios desde la tienda online."
      }
    ],
    "plateImage": "/media/healthy_plate.png"
  }'::jsonb,

  -- features
  '{
    "badge": "Catálogo",
    "titleLine1": "Mis Servicios—",
    "titleLine2": "Tu Salud, Mi Prioridad",
    "services": [
      { "num": "01", "title": "Consulta Presencial", "description": "Te recibo en Santa Ana para una evaluación integral: composición corporal, salud hormonal y un plan que conecte con tu estilo de vida real.", "price": "$35.00", "isVip": false },
      { "num": "02", "title": "Consulta Online Nacional", "description": "Desde cualquier punto de El Salvador. Trabajamos juntas tu balance hormonal, alimentación y bienestar a través de mi app de seguimiento.", "price": "$30.00", "isVip": false },
      { "num": "03", "title": "Consulta Online Internacional", "description": "Donde sea que estés en el mundo, te acompaño con un enfoque holístico adaptado a tu contexto, cultura alimentaria y objetivos.", "price": "$40.00", "isVip": false },
      { "num": "04", "title": "Consulta en Pareja", "description": "Metas compartidas, resultados potenciados. Diseño un plan para dos personas que quieren transformar su salud juntas.", "price": "$60.00", "isVip": false },
      { "num": "05", "title": "Paquete Familiar", "description": "Bienestar integral para tu hogar. Asesoría personalizada para 3 miembros de la familia con objetivos individuales.", "price": "$90.00", "isVip": false },
      { "num": "VIP", "title": "Consulta Empresarial", "description": "Llevo el bienestar a tu oficina. Charlas de salud hormonal, nutrición preventiva y hábitos para equipos de trabajo.", "price": "Cotizar", "isVip": true }
    ]
  }'::jsonb,

  -- protocol
  '{
    "badge": "Reservas",
    "titleLine1": "Agenda tu Cita—",
    "titleLine2": "Tu Transformación Inicia Aquí",
    "steps": [
      { "num": "01", "title": "Conversemos", "description": "Escríbeme por WhatsApp al 7628-4719. Platiquemos sobre tus metas, cómo te sientes y qué esperas de este proceso. Juntas encontramos el mejor horario para ti." },
      { "num": "02", "title": "Reserva tu espacio", "description": "Asegura tu cita con una transferencia de $10.00. El resto se cancela el día de la consulta. Tu compromiso me permite darte la atención y el tiempo que mereces." },
      { "num": "03", "title": "Horarios y Políticas", "description": "Horarios: Mar y Jue (9:00am a 5:30pm), Mié (7:00am a 3:30pm), Vie (1:00pm a 7:00pm), Sáb (8:00am a 5:00pm). Si cancelas con 48h de anticipación, tu anticipo se devuelve completo." }
    ]
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ─── STORAGE BUCKET for home images ──────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('home-images', 'home-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read home images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'home-images');

CREATE POLICY "Editors can upload home images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'home-images' AND public.is_editor());

CREATE POLICY "Editors can update home images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'home-images' AND public.is_editor());

CREATE POLICY "Editors can delete home images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'home-images' AND public.is_editor());
