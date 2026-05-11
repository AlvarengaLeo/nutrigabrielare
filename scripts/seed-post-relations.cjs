// Wires related_product_ids on the 5 demo blog posts → digital products.
// Idempotent: overwrites the array each run.

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

// Map slug → related product IDs (2-3 per post)
const relations = {
  'sincronizar-nutricion-con-tu-ciclo': ['dig-001', 'dig-004', 'dig-008'],
  // Reset Hormonal ebook · Curso Nutrición Ciclo · Programa 21 días
  'pupusas-saludables-receta-base':     ['dig-002', 'dig-007'],
  // Recetario Fluir · Snacks Express
  'mitos-sobre-el-desayuno':            ['dig-003', 'dig-007', 'dig-005'],
  // Guía leer etiqueta · Snacks Express · Curso Construye tu Plan
  'no-es-pereza-es-tu-fase-lutea':      ['dig-001', 'dig-008', 'dig-006'],
  // Reset Hormonal · 21 días · Webinar Salud Hormonal
  'manifiesto-fluir':                   ['dig-006', 'dig-005'],
  // Webinar Salud Hormonal · Construye tu Plan
};

(async () => {
  for (const [slug, ids] of Object.entries(relations)) {
    const { error } = await sb
      .from('posts')
      .update({ related_product_ids: ids })
      .eq('slug', slug);
    if (error) {
      console.log('[x]', slug, '→', error.message);
    } else {
      console.log('[ok]', slug.padEnd(40), '→', ids.length, 'productos');
    }
  }
})();
