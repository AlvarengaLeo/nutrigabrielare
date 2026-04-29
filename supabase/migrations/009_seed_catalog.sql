-- ============================================================
-- Migration 009: Seed Nutrigabrielare catalog
-- ============================================================
-- Adds the three storefront categories the brand actually uses
-- (digitales, suplementos, servicios) and migrates the six 1:1
-- consultation services from the Home CMS into the unified
-- catalog as kind='service' products. The nutritionist can edit
-- prices, descriptions and images for any of these from the
-- admin panel.
--
-- The legacy Majes de Sivar seed (migration 002) is left intact;
-- those rows can be deactivated or deleted from the admin UI.
-- ============================================================

-- ─── CATEGORIES ──────────────────────────────────────────────────

INSERT INTO public.product_categories (id, num, title, tagline, description, cta, sort_order) VALUES
  ('digitales',   '01', 'Productos digitales', 'Aprende a tu ritmo',
   'Ebooks, guías y recetarios para llevar el bienestar a tu día a día. Descarga inmediata después de la compra.',
   'Ver digitales', 1),
  ('suplementos', '02', 'Suplementos', 'Apoyo a tu bienestar',
   'Suplementación seleccionada para acompañar tu plan nutricional. Envíos a todo El Salvador.',
   'Ver suplementos', 2),
  ('servicios',   '03', 'Servicios', 'Acompañamiento 1:1',
   'Consultas presenciales y online con enfoque holístico en salud hormonal y bienestar integral.',
   'Ver servicios', 3)
ON CONFLICT (id) DO NOTHING;

-- ─── SERVICES (migrated from Home CMS Features section) ─────────

INSERT INTO public.products
  (id, slug, name, category_id, kind, price, description, description_long, active, featured, featured_order)
VALUES
  ('srv-001', 'consulta-presencial', 'Consulta Presencial', 'servicios', 'service', 35.00,
   'Te recibo en Santa Ana para una evaluación integral: composición corporal, salud hormonal y un plan que conecte con tu estilo de vida real.',
   'Una consulta presencial donde evaluamos tu composición corporal, indicadores de salud hormonal y construimos un plan nutricional adaptado a tu estilo de vida. Incluye seguimiento por la app exclusiva para pacientes.',
   true, true, 1),

  ('srv-002', 'consulta-online-nacional', 'Consulta Online Nacional', 'servicios', 'service', 30.00,
   'Desde cualquier punto de El Salvador. Trabajamos juntas tu balance hormonal, alimentación y bienestar a través de mi app de seguimiento.',
   'Sesión online para pacientes en El Salvador. Mismo enfoque holístico que la consulta presencial, con seguimiento continuo a través de la app exclusiva. Ideal si vivís lejos de Santa Ana o preferís la comodidad de tu casa.',
   true, true, 2),

  ('srv-003', 'consulta-online-internacional', 'Consulta Online Internacional', 'servicios', 'service', 40.00,
   'Donde sea que estés en el mundo, te acompaño con un enfoque holístico adaptado a tu contexto, cultura alimentaria y objetivos.',
   'Consulta online para pacientes fuera de El Salvador. Adapto el plan a tu contexto cultural, disponibilidad de alimentos y objetivos personales. Incluye seguimiento por la app sin importar tu zona horaria.',
   true, false, 3),

  ('srv-004', 'consulta-en-pareja', 'Consulta en Pareja', 'servicios', 'service', 60.00,
   'Metas compartidas, resultados potenciados. Diseño un plan para dos personas que quieren transformar su salud juntas.',
   'Sesión para dos personas que quieren acompañarse en el proceso. Evaluación individual de cada quien y plan compartido cuando lo amerite. Disponible presencial u online.',
   true, false, 4),

  ('srv-005', 'paquete-familiar', 'Paquete Familiar', 'servicios', 'service', 90.00,
   'Bienestar integral para tu hogar. Asesoría personalizada para 3 miembros de la familia con objetivos individuales.',
   'Paquete para tres miembros de la familia. Cada persona recibe una evaluación y plan individual; se coordinan recetas y compras compartidas para que el cambio sea sostenible en el hogar.',
   true, false, 5),

  ('srv-006', 'consulta-empresarial', 'Consulta Empresarial VIP', 'servicios', 'service', 0.00,
   'Llevo el bienestar a tu oficina. Charlas de salud hormonal, nutrición preventiva y hábitos para equipos de trabajo.',
   'Programa para empresas: charlas, talleres y acompañamiento nutricional para equipos de trabajo. El precio se cotiza según tamaño del equipo y alcance del programa. Reservá una llamada y conversemos sobre tu compañía.',
   true, false, 6)
ON CONFLICT (id) DO NOTHING;
