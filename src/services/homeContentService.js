import { supabase } from '../lib/supabase.js';

const TABLE = 'home_content';
const ROW_ID = 'main';
const BUCKET = 'home-images';

/**
 * Fetch the entire home content row.
 * Returns the full row or null on failure.
 */
export async function getHomeContent() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', ROW_ID)
    .single();

  if (error) {
    console.error('[homeContent] fetch error:', error.message);
    return null;
  }
  return data;
}

/**
 * Update a single section of the home content.
 * @param {'hero'|'philosophy'|'why_choose_us'|'features'|'protocol'} sectionName
 * @param {object} sectionData — the JSONB payload for that section
 */
export async function updateHomeSection(sectionName, sectionData) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      [sectionName]: sectionData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ROW_ID)
    .select()
    .single();

  if (error) {
    console.error(`[homeContent] update ${sectionName} error:`, error.message);
    throw error;
  }
  return data;
}

/**
 * Upload an image to the home-images bucket.
 * Replaces existing file at the same path.
 * @param {File} file
 * @param {string} folder — e.g. 'hero', 'philosophy', 'why-choose-us'
 * @param {string} [fileName] — optional custom filename, defaults to original
 * @returns {string} public URL of the uploaded image
 */
export async function uploadHomeImage(file, folder, fileName) {
  const name = fileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const path = `${folder}/${name}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) {
    console.error('[homeContent] upload error:', error.message);
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Delete an image from the home-images bucket.
 * @param {string} fullUrl — the full public URL
 */
export async function deleteHomeImage(fullUrl) {
  // Extract path from URL: ...home-images/folder/file.png → folder/file.png
  const marker = `${BUCKET}/`;
  const idx = fullUrl.indexOf(marker);
  if (idx === -1) return;
  const path = fullUrl.substring(idx + marker.length);

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path]);

  if (error) {
    console.error('[homeContent] delete image error:', error.message);
    throw error;
  }
}
