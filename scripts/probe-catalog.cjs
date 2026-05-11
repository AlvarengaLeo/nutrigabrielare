// Snapshot of catalog by kind/category for the spec audit.
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

(async () => {
  const { data: cats } = await sb
    .from('product_categories')
    .select('id, title, active')
    .order('sort_order');
  console.log('CATEGORIES:');
  cats.forEach((c) => console.log('  ' + c.id.padEnd(20) + (c.active ? 'active   ' : 'inactive ') + (c.title || '')));

  console.log('\nPRODUCTS by kind/category:');
  const { data: prods } = await sb
    .from('products')
    .select('id, slug, name, kind, category_id, price, featured, active, digital_file_path')
    .eq('active', true)
    .order('kind')
    .order('category_id');
  const byKind = {};
  prods.forEach((p) => {
    byKind[p.kind] = byKind[p.kind] || [];
    byKind[p.kind].push(p);
  });
  for (const [kind, items] of Object.entries(byKind)) {
    console.log(`\n  [${kind}] (${items.length})`);
    items.forEach((p) => {
      const flags = [
        p.featured ? 'featured' : null,
        p.digital_file_path ? 'has-file' : null,
      ].filter(Boolean).join(',');
      console.log('    - ' + p.name.padEnd(40) + ' $' + Number(p.price).toFixed(2).padStart(6) + '  /' + p.category_id + (flags ? '  [' + flags + ']' : ''));
    });
  }

  console.log('\nVARIANTS WITH STOCK:');
  const { data: vars } = await sb
    .from('product_variants')
    .select('product_id, size, color_name, stock')
    .eq('active', true);
  console.log('  total active variants: ' + vars.length);
  const totalStock = vars.reduce((s, v) => s + v.stock, 0);
  console.log('  total units in stock:  ' + totalStock);

  console.log('\nSHIPPING ZONES:');
  const { data: zones } = await sb.from('shipping_zones').select('name, cost, free_threshold, active');
  zones.forEach((z) => console.log('  - ' + z.name + '  cost=$' + z.cost + '  free≥$' + (z.free_threshold || '—') + '  ' + (z.active ? 'active' : 'inactive')));
})();
