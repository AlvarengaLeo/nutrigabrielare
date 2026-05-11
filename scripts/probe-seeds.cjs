// Verify seeds for 011 (home_content.featured) and 016 (post_categories) landed.
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8')
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^['"]|['"]$/g, '')])
);

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

(async () => {
  // 011 seed: home_content.featured should have the carousel config
  const { data: home, error: homeErr } = await sb
    .from('home_content')
    .select('id, featured')
    .eq('id', 'main')
    .single();
  if (homeErr) console.log('home_content fetch error:', homeErr.message);
  else console.log('home_content.featured =', JSON.stringify(home.featured, null, 2));

  // 016 seed: post_categories should have 5 rows
  const { data: cats, error: catErr } = await sb
    .from('post_categories')
    .select('id, name, sort_order, active')
    .order('sort_order');
  if (catErr) console.log('post_categories fetch error:', catErr.message);
  else {
    console.log('\npost_categories (' + cats.length + ' rows):');
    cats.forEach((c) => console.log('  ' + c.id.padEnd(20) + c.name + (c.active ? '' : ' [inactive]')));
  }

  // Storage: blog-images bucket
  const { data: buckets } = await sb.storage.listBuckets();
  const blog = (buckets || []).find((b) => b.id === 'blog-images');
  console.log('\nblog-images bucket:', blog ? 'created (public=' + blog.public + ')' : 'NOT FOUND');
})();
