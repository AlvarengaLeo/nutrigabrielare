import { supabase } from '../lib/supabase.js';

const PRODUCT_SELECT = `
  id, slug, name, category_id, price, description, description_long, active, featured,
  product_images ( url, sort_order ),
  product_variants ( size, color_name, color_hex, stock, active )
`.trim();

/**
 * Maps a raw DB product row to the UI-expected shape.
 */
function transformProduct(row) {
  const variants = (row.product_variants ?? []).filter((v) => v.active);

  // Deduplicate sizes (preserve insertion order)
  const seenSizes = new Set();
  const sizes = [];
  for (const v of variants) {
    if (v.size && !seenSizes.has(v.size)) {
      seenSizes.add(v.size);
      sizes.push(v.size);
    }
  }

  // Deduplicate colors by name (preserve insertion order)
  const seenColors = new Set();
  const colors = [];
  for (const v of variants) {
    if (v.color_name && !seenColors.has(v.color_name)) {
      seenColors.add(v.color_name);
      colors.push({ name: v.color_name, hex: v.color_hex });
    }
  }

  // Total stock across all active variants
  const totalStock = variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);

  // Per-variant stock map keyed by "size__colorName"
  const variantStock = {};
  for (const v of variants) {
    if (v.size && v.color_name) {
      variantStock[`${v.size}__${v.color_name}`] = v.stock ?? 0;
    }
  }

  // Images sorted by sort_order
  const images = (row.product_images ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((img) => img.url);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category_id,
    price: row.price,
    description: row.description,
    descriptionLong: row.description_long,
    active: row.active,
    featured: row.featured,
    images,
    variants: {
      sizes,
      colors,
    },
    stock: totalStock,
    variantStock,
  };
}

/**
 * Fetch all active categories ordered by sort_order.
 * Maps DB `description` to UI `desc`.
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('product_categories')
    .select('id, num, title, tagline, description, cta, sort_order')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    num: row.num,
    title: row.title,
    tagline: row.tagline,
    desc: row.description,
    cta: row.cta,
  }));
}

/**
 * Fetch a single category by its primary-key id.
 * Maps DB `description` to UI `desc`.
 */
export async function getCategoryById(categoryId) {
  const { data, error } = await supabase
    .from('product_categories')
    .select('id, num, title, tagline, description, cta, sort_order')
    .eq('id', categoryId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    num: data.num,
    title: data.title,
    tagline: data.tagline,
    desc: data.description,
    cta: data.cta,
  };
}

/**
 * Fetch all active products belonging to a given category,
 * including joined images and variants.
 */
export async function getProductsByCategory(categoryId) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category_id', categoryId)
    .eq('active', true);

  if (error) throw error;

  return data.map(transformProduct);
}

/**
 * Fetch a single product by its unique slug with full details.
 */
export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .single();

  if (error) throw error;

  return transformProduct(data);
}

/**
 * Fetch all active products across all categories,
 * including joined images and variants.
 */
export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('active', true);

  if (error) throw error;

  return data.map(transformProduct);
}

/**
 * Fetch all products including inactive (for admin).
 */
export async function getAllProductsAdmin() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT);

  if (error) throw error;
  return data.map(transformProduct);
}

/**
 * Create a new product.
 */
export async function createProduct({ name, slug, categoryId, price, description, descriptionLong, active = true, featured = false }) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      id: slug,
      slug,
      name,
      category_id: categoryId,
      price,
      description,
      description_long: descriptionLong,
      active,
      featured,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a product.
 */
export async function updateProduct(id, updates) {
  const row = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.slug !== undefined) row.slug = updates.slug;
  if (updates.categoryId !== undefined) row.category_id = updates.categoryId;
  if (updates.price !== undefined) row.price = updates.price;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.descriptionLong !== undefined) row.description_long = updates.descriptionLong;
  if (updates.active !== undefined) row.active = updates.active;
  if (updates.featured !== undefined) row.featured = updates.featured;

  const { data, error } = await supabase
    .from('products')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Soft-delete a product (set active=false).
 */
export async function deleteProduct(id) {
  return updateProduct(id, { active: false });
}

/**
 * Create a product variant.
 */
export async function createVariant(productId, { size, colorName, colorHex, stock, active = true }) {
  const { data, error } = await supabase
    .from('product_variants')
    .insert({
      product_id: productId,
      size,
      color_name: colorName,
      color_hex: colorHex,
      stock,
      active,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a product variant.
 */
export async function updateVariant(variantId, updates) {
  const row = {};
  if (updates.size !== undefined) row.size = updates.size;
  if (updates.colorName !== undefined) row.color_name = updates.colorName;
  if (updates.colorHex !== undefined) row.color_hex = updates.colorHex;
  if (updates.stock !== undefined) row.stock = updates.stock;
  if (updates.active !== undefined) row.active = updates.active;

  const { data, error } = await supabase
    .from('product_variants')
    .update(row)
    .eq('id', variantId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a product variant.
 */
export async function deleteVariant(variantId) {
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', variantId);

  if (error) throw error;
}

/**
 * Upload a product image to Supabase Storage.
 */
export async function uploadProductImage(productId, file) {
  const filePath = `${productId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  // Get current max sort_order for this product
  const { data: existing } = await supabase
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      url: publicUrl,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a product image from Storage and database.
 */
export async function deleteProductImage(imageId, url) {
  // Extract storage path from URL
  const match = url.match(/product-images\/(.+)$/);
  if (match) {
    await supabase.storage.from('product-images').remove([match[1]]);
  }

  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId);

  if (error) throw error;
}
