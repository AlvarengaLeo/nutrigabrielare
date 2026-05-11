// Quick probe to see which migrations are already applied in the live DB.
// Reads creds from .env (manual parse, no dotenv dependency).
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return out;
}

const env = loadEnv();
const url = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

(async () => {
  console.log('Connected to', url, '\n');

  const checks = [
    { table: 'home_content', col: 'featured', label: '011 featured JSONB column' },
    { table: 'product_categories', col: 'id', label: '   product_categories table' },
    { table: 'posts', col: 'slug', label: '015 posts table' },
    { table: 'post_categories', col: 'slug', label: '015 post_categories table' },
    { table: 'post_tags', col: 'id', label: '015 post_tags table' },
    { table: 'email_logs', col: 'template', label: '014 email_logs table' },
  ];

  for (const c of checks) {
    try {
      const { error } = await sb.from(c.table).select(c.col).limit(1);
      if (error) console.log('  [ ] ' + c.label + '  →  ' + error.message.substring(0, 80));
      else console.log('  [x] ' + c.label);
    } catch (e) {
      console.log('  [!] ' + c.label + '  →  ' + e.message);
    }
  }

  // Probe RPC
  try {
    const { error } = await sb.rpc('decrement_order_stock', { p_order_id: '__probe__' });
    if (error && /Could not find the function/i.test(error.message)) {
      console.log('  [ ] 013 decrement_order_stock RPC  →  not yet created');
    } else {
      console.log('  [x] 013 decrement_order_stock RPC');
    }
  } catch (e) {
    console.log('  [!] 013 RPC probe failed:', e.message);
  }

  // Check legacy categories status (012)
  try {
    const { data, error } = await sb
      .from('product_categories')
      .select('id, active')
      .in('id', ['ropa', 'accesorios', 'edicion-limitada']);
    if (error) {
      console.log('  [!] 012 legacy categories probe failed:', error.message);
    } else {
      const anyActive = (data || []).some((r) => r.active);
      if (!data || data.length === 0) {
        console.log('  [-] 012 legacy categories not present (skip)');
      } else if (anyActive) {
        console.log('  [ ] 012 legacy categories still active (deactivation not applied yet) — rows:', data.length);
      } else {
        console.log('  [x] 012 legacy categories all deactivated');
      }
    }
  } catch (e) {
    console.log('  [!] 012 probe failed:', e.message);
  }

  // Existing baseline check
  console.log('\nBaseline sanity:');
  const baseline = ['profiles', 'products', 'orders', 'reservations', 'payments'];
  for (const t of baseline) {
    const { error, count } = await sb.from(t).select('*', { count: 'exact', head: true });
    console.log('  ' + (error ? '[!]' : '[x]') + ' ' + t + (error ? '  →  ' + error.message : '  rows: ' + count));
  }
})().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
