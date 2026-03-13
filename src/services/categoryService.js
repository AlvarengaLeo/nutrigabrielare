import { supabase } from '../lib/supabase.js';

/**
 * Fetch all categories including inactive (for admin).
 */
export async function getAllCategoriesAdmin() {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    num: row.num,
    title: row.title,
    tagline: row.tagline,
    desc: row.description,
    cta: row.cta,
    sortOrder: row.sort_order,
    active: row.active,
  }));
}

/**
 * Create a new category.
 */
export async function createCategory({ id, num, title, tagline, description, cta, sortOrder, active = true }) {
  const { data, error } = await supabase
    .from('product_categories')
    .insert({
      id,
      num,
      title,
      tagline,
      description,
      cta,
      sort_order: sortOrder,
      active,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing category.
 */
export async function updateCategory(id, updates) {
  const row = {};
  if (updates.num !== undefined) row.num = updates.num;
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.tagline !== undefined) row.tagline = updates.tagline;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.cta !== undefined) row.cta = updates.cta;
  if (updates.sortOrder !== undefined) row.sort_order = updates.sortOrder;
  if (updates.active !== undefined) row.active = updates.active;

  const { data, error } = await supabase
    .from('product_categories')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a category.
 */
export async function deleteCategory(id) {
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
