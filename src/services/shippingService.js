import { supabase } from '../lib/supabase.js';

function transformZone(row) {
  return {
    id: row.id,
    name: row.name,
    cost: Number(row.cost),
    freeThreshold:
      row.free_threshold == null ? null : Number(row.free_threshold),
    active: row.active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getActiveZones() {
  const { data, error } = await supabase
    .from('shipping_zones')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`Failed to fetch shipping zones: ${error.message}`);
  return (data ?? []).map(transformZone);
}

export async function getAllZones() {
  const { data, error } = await supabase
    .from('shipping_zones')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`Failed to fetch shipping zones: ${error.message}`);
  return (data ?? []).map(transformZone);
}

export async function createZone(input) {
  const { data, error } = await supabase
    .from('shipping_zones')
    .insert({
      name: input.name,
      cost: input.cost,
      free_threshold: input.freeThreshold ?? null,
      active: input.active ?? true,
      sort_order: input.sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create shipping zone: ${error.message}`);
  return transformZone(data);
}

export async function updateZone(id, input) {
  const update = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.cost !== undefined) update.cost = input.cost;
  if (input.freeThreshold !== undefined) update.free_threshold = input.freeThreshold;
  if (input.active !== undefined) update.active = input.active;
  if (input.sortOrder !== undefined) update.sort_order = input.sortOrder;

  const { data, error } = await supabase
    .from('shipping_zones')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update shipping zone: ${error.message}`);
  return transformZone(data);
}

export async function deleteZone(id) {
  const { error } = await supabase.from('shipping_zones').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete shipping zone: ${error.message}`);
}

/**
 * Computes the shipping cost for a given zone and order subtotal.
 * Returns 0 if subtotal meets the zone's free_threshold.
 */
export function calculateShippingCost(zone, subtotal) {
  if (!zone) return 0;
  const threshold = zone.freeThreshold;
  if (threshold != null && Number(subtotal) >= Number(threshold)) {
    return 0;
  }
  return Number(zone.cost) || 0;
}
