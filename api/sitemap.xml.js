import { createClient } from '@supabase/supabase-js';

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/pleno', priority: '0.9', changefreq: 'weekly' },
  { path: '/pleno/digitales', priority: '0.8', changefreq: 'weekly' },
  { path: '/pleno/suplementos', priority: '0.8', changefreq: 'weekly' },
  { path: '/pleno/servicios', priority: '0.7', changefreq: 'weekly' },
  { path: '/fluir-femenino', priority: '0.9', changefreq: 'weekly' },
  { path: '/fluir-femenino/articulos', priority: '0.8', changefreq: 'daily' },
  { path: '/contactanos', priority: '0.4', changefreq: 'monthly' },
];

function getBaseUrl(req) {
  const configured = process.env.APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || (host && host.includes('localhost') ? 'http' : 'https');
  if (host) return `${protocol}://${host}`;

  return 'https://nutrigabrielare.vercel.app';
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const baseUrl = getBaseUrl(req);
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim();

  let posts = [];
  let products = [];

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const [postsRes, productsRes] = await Promise.all([
        supabase
          .from('posts')
          .select('slug, published_at, updated_at')
          .eq('published', true)
          .order('published_at', { ascending: false })
          .limit(500),
        supabase
          .from('products')
          .select('slug, updated_at')
          .eq('active', true)
          .limit(500),
      ]);

      posts = postsRes.data || [];
      products = productsRes.data || [];
    } catch (err) {
      console.error('[sitemap] supabase fetch failed:', err);
    }
  } else {
    console.warn('[sitemap] SUPABASE_URL or anon key missing; returning static routes only');
  }

  const now = new Date().toISOString();

  const urls = [
    ...STATIC_ROUTES.map((r) => ({
      loc: `${baseUrl}${r.path}`,
      lastmod: now,
      changefreq: r.changefreq,
      priority: r.priority,
    })),
    ...posts.map((p) => ({
      loc: `${baseUrl}/fluir-femenino/articulos/${p.slug}`,
      lastmod: p.updated_at || p.published_at || now,
      changefreq: 'monthly',
      priority: '0.7',
    })),
    ...products.map((p) => ({
      loc: `${baseUrl}/producto/${p.slug}`,
      lastmod: p.updated_at || now,
      changefreq: 'weekly',
      priority: '0.6',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${escapeXml(u.lastmod)}</lastmod>
    <changefreq>${escapeXml(u.changefreq)}</changefreq>
    <priority>${escapeXml(u.priority)}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
