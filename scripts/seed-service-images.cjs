// Adds cover images to the 6 service products (consultas).
// Idempotent: deletes existing product_images for each before insert.

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

// Unsplash photos elegidas para que se sientan como las consultas reales,
// no como stock fotos genéricas.
const images = [
  // Consulta Presencial — nutricionista con cuaderno, escena clínica suave
  { product: 'srv-001', url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=85&auto=format&fit=crop' },
  // Consulta Online Nacional — laptop con notas, escritorio claro
  { product: 'srv-002', url: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=1200&q=85&auto=format&fit=crop' },
  // Consulta Online Internacional — laptop con mate / vista de escritorio
  { product: 'srv-003', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=85&auto=format&fit=crop' },
  // Consulta en Pareja — dos manos sobre una mesa, conversación íntima
  { product: 'srv-004', url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=85&auto=format&fit=crop' },
  // Paquete Familiar — mesa familiar con comida
  { product: 'srv-005', url: 'https://images.unsplash.com/photo-1543352634-99a5d50ae78e?w=1200&q=85&auto=format&fit=crop' },
  // Consulta Empresarial VIP — escena corporativa neutra
  { product: 'srv-006', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=85&auto=format&fit=crop' },
];

(async () => {
  for (const item of images) {
    const { data: prod, error: prodErr } = await sb
      .from('products')
      .select('id, name')
      .eq('id', item.product)
      .maybeSingle();
    if (prodErr || !prod) {
      console.log('[x] ' + item.product + ' → producto no existe');
      continue;
    }

    // Replace existing images
    const { error: delErr } = await sb
      .from('product_images')
      .delete()
      .eq('product_id', item.product);
    if (delErr) {
      console.log('[!] delete error for ' + item.product + ':', delErr.message);
    }

    const { error: insErr } = await sb
      .from('product_images')
      .insert({ product_id: item.product, url: item.url, sort_order: 0 });
    if (insErr) {
      console.log('[x] insert error for ' + item.product + ':', insErr.message);
      continue;
    }

    console.log('[ok] ' + item.product.padEnd(8) + prod.name);
  }
})();
