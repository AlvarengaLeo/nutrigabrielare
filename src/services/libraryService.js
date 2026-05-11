import { supabase } from '../lib/supabase.js';

/**
 * Returns the digital library for the authenticated user — every product
 * they have ever purchased (as recorded in user_purchases). Deduplicates
 * by product_id (a user may have multiple orders for the same product).
 */
export async function getUserDigitalLibrary(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('user_purchases')
    .select(
      `id, product_id, order_id, purchased_at, expires_at,
       products ( id, slug, name, kind, digital_file_path, product_images ( url, sort_order ) )`,
    )
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false });

  if (error) {
    console.error('[library] fetch error:', error.message);
    throw error;
  }

  const rows = (data || []).filter(
    (row) => row.products && row.products.kind === 'digital',
  );

  // Dedupe by product_id, keep most recent purchase
  const seen = new Map();
  for (const row of rows) {
    if (!seen.has(row.product_id)) {
      const product = row.products;
      const cover = (product.product_images || [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
      seen.set(row.product_id, {
        productId: row.product_id,
        slug: product.slug,
        name: product.name,
        cover: cover?.url || null,
        orderId: row.order_id,
        purchasedAt: row.purchased_at,
      });
    }
  }

  return Array.from(seen.values());
}

/**
 * Calls the server endpoint that validates ownership and returns a fresh
 * 24h signed URL for downloading the digital asset.
 */
export async function refreshDownloadUrl(productId) {
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr || !sessionData?.session?.access_token) {
    throw new Error('Sesión no válida — iniciá sesión de nuevo');
  }

  const response = await fetch('/api/digital/refresh-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionData.session.access_token}`,
    },
    body: JSON.stringify({ product_id: productId }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || 'No se pudo generar el enlace');
  }
  return payload;
}
