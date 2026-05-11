import { supabase } from '../lib/supabase.js';

const POSTS = 'posts';
const CATEGORIES = 'post_categories';
const BUCKET = 'blog-images';

// ─── Public reads ──────────────────────────────────────────────────

export async function getPostCategories() {
  const { data, error } = await supabase
    .from(CATEGORIES)
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[blog] categories fetch error:', error.message);
    return [];
  }
  return data || [];
}

export async function getPublishedPosts({
  category = null,
  limit = 12,
  offset = 0,
  search = '',
} = {}) {
  let query = supabase
    .from(POSTS)
    .select(
      'id, slug, title, excerpt, cover_image_url, category_id, reading_minutes, published_at',
      { count: 'exact' },
    )
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (category) query = query.eq('category_id', category);
  if (search?.trim()) {
    const term = `%${search.trim().replace(/[%_]/g, '')}%`;
    query = query.ilike('title', term);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error('[blog] posts fetch error:', error.message);
    return { rows: [], total: 0 };
  }

  return { rows: data || [], total: count ?? data?.length ?? 0 };
}

export async function getLatestPosts(limit = 4) {
  const { rows } = await getPublishedPosts({ limit, offset: 0 });
  return rows;
}

export async function getPostBySlug(slug) {
  const { data, error } = await supabase
    .from(POSTS)
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    console.error('[blog] post by slug error:', error.message);
    return null;
  }
  if (!data) return null;

  // Fetch category name + related products (best-effort, swallow errors)
  let categoryName = null;
  if (data.category_id) {
    const { data: cat } = await supabase
      .from(CATEGORIES)
      .select('name, slug')
      .eq('id', data.category_id)
      .maybeSingle();
    if (cat) categoryName = cat;
  }

  let relatedProducts = [];
  if (Array.isArray(data.related_product_ids) && data.related_product_ids.length) {
    const { data: products } = await supabase
      .from('products')
      .select(
        'id, slug, name, price, kind, product_images ( url, sort_order )',
      )
      .in('id', data.related_product_ids)
      .eq('active', true);
    if (products) {
      relatedProducts = products.map((p) => ({
        ...p,
        cover:
          (p.product_images || [])
            .slice()
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url || null,
      }));
    }
  }

  return { ...data, category: categoryName, relatedProducts };
}

// ─── Admin reads ───────────────────────────────────────────────────

export async function getAllPostsAdmin({ limit = 50, offset = 0 } = {}) {
  const { data, error, count } = await supabase
    .from(POSTS)
    .select(
      'id, slug, title, excerpt, cover_image_url, category_id, published, published_at, updated_at',
      { count: 'exact' },
    )
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[blog] admin posts fetch error:', error.message);
    throw error;
  }
  return { rows: data || [], total: count ?? 0 };
}

export async function getPostByIdAdmin(id) {
  const { data, error } = await supabase
    .from(POSTS)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ─── Admin mutations ───────────────────────────────────────────────

export async function createPost(payload) {
  const row = sanitizePostPayload(payload);
  if (row.published && !row.published_at) row.published_at = new Date().toISOString();

  const { data, error } = await supabase
    .from(POSTS)
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePost(id, payload) {
  const row = sanitizePostPayload(payload);
  if (row.published && !row.published_at) row.published_at = new Date().toISOString();
  if (row.published === false) row.published_at = null;

  const { data, error } = await supabase
    .from(POSTS)
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePost(id) {
  const { error } = await supabase.from(POSTS).delete().eq('id', id);
  if (error) throw error;
}

function sanitizePostPayload(p) {
  const out = {};
  if (p.slug !== undefined) out.slug = p.slug;
  if (p.title !== undefined) out.title = p.title;
  if (p.excerpt !== undefined) out.excerpt = p.excerpt;
  if (p.body_md !== undefined) out.body_md = p.body_md;
  if (p.cover_image_url !== undefined) out.cover_image_url = p.cover_image_url;
  if (p.category_id !== undefined) out.category_id = p.category_id || null;
  if (p.related_product_ids !== undefined) {
    out.related_product_ids = Array.isArray(p.related_product_ids) ? p.related_product_ids : [];
  }
  if (p.author_id !== undefined) out.author_id = p.author_id || null;
  if (p.reading_minutes !== undefined) {
    const n = parseInt(p.reading_minutes, 10);
    out.reading_minutes = Number.isFinite(n) && n > 0 ? n : null;
  }
  if (p.published !== undefined) out.published = !!p.published;
  if (p.published_at !== undefined) out.published_at = p.published_at;
  if (p.seo_title !== undefined) out.seo_title = p.seo_title;
  if (p.seo_description !== undefined) out.seo_description = p.seo_description;
  if (p.og_image_url !== undefined) out.og_image_url = p.og_image_url;
  return out;
}

// ─── Storage ───────────────────────────────────────────────────────

export async function uploadPostCover(file, slug) {
  const safeSlug = (slug || 'post').toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60);
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `covers/${safeSlug}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) {
    console.error('[blog] cover upload error:', error.message);
    throw error;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPostInlineImage(file) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `inline/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) {
    console.error('[blog] inline image upload error:', error.message);
    throw error;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Slug helper ───────────────────────────────────────────────────

export function slugifyTitle(title) {
  return (title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}
