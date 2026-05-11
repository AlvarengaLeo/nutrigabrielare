// Seed digital products covering every subtype in the spec:
// cursos, ebooks, guías descargables, eventos grabados, programas digitales.
// Idempotent: upserts by id.

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8')
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^['"]|['"]$/g, '')]),
);

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const products = [
  {
    id: 'dig-001',
    slug: 'ebook-reset-hormonal-4-semanas',
    name: 'Reset Hormonal en 4 Semanas',
    subtype: 'Ebook',
    description: 'Ebook práctico de 80 páginas para reorganizar tu alimentación según tu ciclo. Incluye plan semanal, lista de compras y ejercicios sugeridos.',
    description_long: 'Una guía completa basada en evidencia para que entiendas tu ciclo, identifiques desbalances comunes y construyas hábitos sostenibles. Incluye 4 semanas de planificación, recetas, recordatorios diarios y bibliografía.',
    price: 19.99,
    featured: true,
    featured_order: 1,
    digital_file_path: 'ebooks/reset-hormonal-4-semanas.pdf',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=80',
  },
  {
    id: 'dig-002',
    slug: 'ebook-recetario-fluir-50-recetas',
    name: 'Recetario Fluir · 50 recetas salvadoreñas',
    subtype: 'Ebook',
    description: '50 recetas reales con ingredientes accesibles en El Salvador. Desayunos, snacks, comidas principales y postres conscientes.',
    description_long: 'Recetario diseñado para la mujer salvadoreña que quiere comer rico sin complicarse. Cada receta indica fase del ciclo recomendada, perfil nutricional, dificultad y tiempo total.',
    price: 14.99,
    featured: true,
    featured_order: 2,
    digital_file_path: 'ebooks/recetario-fluir-50.pdf',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80',
  },
  {
    id: 'dig-003',
    slug: 'guia-leer-etiqueta-nutricional',
    name: 'Guía: Cómo leer una etiqueta nutricional',
    subtype: 'Guía descargable',
    description: 'PDF corto y directo para no caer en marketing engañoso al ir al supermercado. 20 páginas, infografías incluidas.',
    description_long: 'Aprende a decodificar lo que dicen (y lo que no dicen) las etiquetas. Sodios escondidos, azúcares disfrazadas, claims sin sustento. Imprimile y llévalo al super.',
    price: 4.99,
    featured: false,
    digital_file_path: 'guias/leer-etiqueta-nutricional.pdf',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80',
  },
  {
    id: 'dig-004',
    slug: 'curso-nutricion-ciclo-menstrual',
    name: 'Curso: Nutrición para tu Ciclo Menstrual',
    subtype: 'Curso',
    description: 'Curso en video (6 módulos, 4 horas). Acceso permanente. Incluye PDFs descargables, planilla de seguimiento y comunidad.',
    description_long: 'Aprende a leer tu ciclo y a alinear tu nutrición con cada fase. Módulos: anatomía hormonal, fase menstrual, folicular, ovulatoria, lútea, y construcción de hábitos sostenibles. Acceso de por vida.',
    price: 49.00,
    featured: true,
    featured_order: 3,
    digital_file_path: 'cursos/nutricion-ciclo-menstrual.zip',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80',
  },
  {
    id: 'dig-005',
    slug: 'curso-construye-tu-plan-alimentario',
    name: 'Curso: Construye tu Plan Alimentario',
    subtype: 'Curso',
    description: 'Aprende a armar tu propio plan adaptado a tus objetivos, tu rutina y tu cuerpo. 5 módulos + plantillas + 2 sesiones live al mes.',
    description_long: 'Curso autogestionable que combina teoría aplicada y plantillas listas. Diseñado para quienes ya entienden lo básico y quieren personalizar. Incluye 8 plantillas Excel/Notion y un grupo cerrado.',
    price: 39.00,
    featured: false,
    digital_file_path: 'cursos/construye-tu-plan.zip',
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200&q=80',
  },
  {
    id: 'dig-006',
    slug: 'evento-grabado-webinar-salud-hormonal',
    name: 'Webinar grabado: Salud Hormonal 101',
    subtype: 'Evento grabado',
    description: 'Grabación del webinar abierto de salud hormonal (2 horas). Incluye Q&A con audiencia y material de apoyo.',
    description_long: 'Webinar realizado en marzo 2026 con más de 200 asistentes en vivo. Cubre estrógeno, progesterona, cortisol, insulina y cómo se conectan con energía, sueño y peso. Incluye PDF resumen.',
    price: 9.99,
    featured: false,
    digital_file_path: 'eventos/webinar-salud-hormonal-mar-2026.mp4',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80',
  },
  {
    id: 'dig-007',
    slug: 'guia-snacks-sanos-express',
    name: 'Guía: Snacks Sanos Express',
    subtype: 'Guía descargable',
    description: '15 ideas de snacks de 5 minutos para tener listos durante la semana. Incluye lista de compras.',
    description_long: 'Para esos días donde no querés cocinar pero tampoco picotear porquerías. Cada snack es bajo en azúcares añadidas, con proteína y se prepara en máximo 5 minutos.',
    price: 2.99,
    featured: false,
    digital_file_path: 'guias/snacks-sanos-express.pdf',
    image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=1200&q=80',
  },
  {
    id: 'dig-008',
    slug: 'programa-21-dias-habitos',
    name: 'Programa: 21 días de Hábitos Conscientes',
    subtype: 'Programa digital',
    description: 'Programa de 21 días con micro-acciones diarias para construir hábitos sostenibles. Email diario + check-in semanal.',
    description_long: 'Cada día recibís un email con una micro-acción (5-10 min). Al final de cada semana hay un check-in con plantilla. Pensado para integrarse a tu rutina, no para reemplazarla.',
    price: 29.99,
    featured: true,
    featured_order: 4,
    digital_file_path: 'programas/21-dias-habitos.zip',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80',
  },
];

(async () => {
  for (const p of products) {
    const productPayload = {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category_id: 'digitales',
      kind: 'digital',
      price: p.price,
      description: p.description,
      description_long: p.description_long || null,
      featured: p.featured || false,
      featured_order: p.featured_order || 0,
      digital_file_path: p.digital_file_path,
      active: true,
      updated_at: new Date().toISOString(),
    };

    const { error: prodErr } = await sb
      .from('products')
      .upsert(productPayload, { onConflict: 'id' });
    if (prodErr) {
      console.log('[x] product', p.id, '→', prodErr.message);
      continue;
    }

    // Replace product images (idempotent)
    await sb.from('product_images').delete().eq('product_id', p.id);
    if (p.image) {
      const { error: imgErr } = await sb
        .from('product_images')
        .insert({ product_id: p.id, url: p.image, sort_order: 0 });
      if (imgErr) console.log('  [x] image:', imgErr.message);
    }

    console.log('[ok] ' + p.subtype.padEnd(18) + p.name + '  ($' + p.price + ')');
  }

  console.log('\nDone. View at:');
  console.log('  Public:  http://localhost:5173/pleno/digitales');
  console.log('  Admin:   http://localhost:5173/admin/productos');
})();
