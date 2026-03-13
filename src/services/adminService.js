import { supabase } from '../lib/supabase.js';

/**
 * Fetch dashboard metrics.
 */
export async function getDashboardMetrics() {
  // Total sales (sum of delivered orders)
  const { data: salesData } = await supabase
    .from('orders')
    .select('total')
    .eq('status', 'delivered');
  const totalSales = (salesData ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0);

  // Pending orders count
  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'confirmed');

  // Active products count
  const { count: activeProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  // Total users count
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  return {
    totalSales,
    pendingOrders: pendingOrders ?? 0,
    activeProducts: activeProducts ?? 0,
    totalUsers: totalUsers ?? 0,
  };
}

/**
 * Fetch product variants with stock below threshold.
 */
export async function getLowStockVariants(threshold = 5) {
  const { data, error } = await supabase
    .from('product_variants')
    .select('id, size, color_name, stock, product_id, products(name)')
    .lt('stock', threshold)
    .eq('active', true)
    .order('stock', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((v) => ({
    id: v.id,
    productName: v.products?.name ?? '',
    size: v.size,
    colorName: v.color_name,
    stock: v.stock,
  }));
}

/**
 * Fetch most recent orders.
 */
export async function getRecentOrders(limit = 10) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, tracking_code, contact_name, contact_email, total, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((o) => ({
    id: o.id,
    trackingCode: o.tracking_code,
    contactName: o.contact_name,
    contactEmail: o.contact_email,
    total: o.total,
    status: o.status,
    createdAt: o.created_at,
  }));
}
