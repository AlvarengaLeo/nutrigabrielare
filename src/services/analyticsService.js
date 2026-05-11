import { supabase } from '../lib/supabase.js';

// Orders in these statuses count as "real revenue" — cancelled or stuck in
// pending_payment do NOT count.
const REVENUE_STATUSES = ['confirmed', 'preparing', 'shipped', 'delivered'];

function daysAgoIso(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function dayKey(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

/**
 * Returns the full commercial KPI bundle for a period.
 * Aggregations happen client-side (data volume is small for v1).
 */
export async function getCommercialKPIs({ days = 30 } = {}) {
  const sinceIso = daysAgoIso(days);

  const [
    { data: ordersInPeriod, error: ordersErr },
    { data: allRecentOrders, error: allErr },
    { data: variants, error: variantsErr },
    { data: reservations, error: reservationsErr },
  ] = await Promise.all([
    // Orders within the period — revenue + AOV + count
    supabase
      .from('orders')
      .select('id, user_id, total, status, created_at')
      .gte('created_at', sinceIso),
    // Last 90d for repeat-rate (always uses 90d window, independent of period selector)
    supabase
      .from('orders')
      .select('user_id, status, created_at')
      .gte('created_at', daysAgoIso(90))
      .in('status', REVENUE_STATUSES),
    // Stock critical (across all variants — always current snapshot)
    supabase
      .from('product_variants')
      .select('id, size, color_name, stock, product_id, products!inner(name, active, kind)')
      .lte('stock', 5)
      .eq('active', true)
      .order('stock', { ascending: true }),
    // Upcoming / pending reservations
    supabase
      .from('reservations')
      .select('id, contact_name, contact_email, preferred_date, preferred_time, status, created_at, products(name)')
      .in('status', ['pendiente', 'contactado', 'confirmado'])
      .order('preferred_date', { ascending: true, nullsFirst: false })
      .limit(8),
  ]);

  if (ordersErr) console.error('[analytics] orders error:', ordersErr.message);
  if (allErr) console.error('[analytics] 90d orders error:', allErr.message);
  if (variantsErr) console.error('[analytics] variants error:', variantsErr.message);
  if (reservationsErr) console.error('[analytics] reservations error:', reservationsErr.message);

  const ordersAll = ordersInPeriod || [];
  const ordersRev = ordersAll.filter((o) => REVENUE_STATUSES.includes(o.status));

  const revenue = ordersRev.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const aov = ordersRev.length > 0 ? revenue / ordersRev.length : 0;

  // Cart abandonment proxy:
  //   orders_started   = todos los `orders` (incluye pending_payment)
  //   orders_confirmed = ordersRev.length
  //   proxy_conversion = ordersRev.length / max(orders_started, 1)
  const conversionProxy = ordersAll.length > 0 ? ordersRev.length / ordersAll.length : null;

  // Repeat rate over 90d
  const userOrderCounts = {};
  for (const row of allRecentOrders || []) {
    if (!row.user_id) continue;
    userOrderCounts[row.user_id] = (userOrderCounts[row.user_id] || 0) + 1;
  }
  const totalBuyers = Object.keys(userOrderCounts).length;
  const repeatBuyers = Object.values(userOrderCounts).filter((c) => c > 1).length;
  const repeatRate = totalBuyers > 0 ? repeatBuyers / totalBuyers : 0;

  // Revenue per day (line chart)
  const dailyMap = {};
  for (let i = days - 1; i >= 0; i--) {
    dailyMap[dayKey(daysAgoIso(i))] = 0;
  }
  for (const o of ordersRev) {
    const k = dayKey(o.created_at);
    if (k in dailyMap) dailyMap[k] += Number(o.total || 0);
  }
  const revenueByDay = Object.entries(dailyMap).map(([day, total]) => ({
    day,
    total: Math.round(total * 100) / 100,
  }));

  // Order status distribution (donut) — uses ordersAll incl. pending/cancelled
  const statusCounts = {};
  for (const o of ordersAll) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  }
  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  // Top products — need to fetch order_items joined to products for ordersRev IDs
  const orderIds = ordersRev.map((o) => o.id);
  let topProducts = [];
  if (orderIds.length > 0) {
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, product_name, price, quantity')
      .in('order_id', orderIds);
    const agg = {};
    for (const it of items || []) {
      const k = it.product_id;
      if (!agg[k]) agg[k] = { productId: k, name: it.product_name, units: 0, revenue: 0 };
      agg[k].units += it.quantity ?? 0;
      agg[k].revenue += Number(it.price || 0) * (it.quantity ?? 0);
    }
    topProducts = Object.values(agg).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }

  const stockCritical = (variants || []).map((v) => ({
    id: v.id,
    productName: v.products?.name || '',
    size: v.size,
    color: v.color_name,
    stock: v.stock,
  }));

  const upcomingReservations = (reservations || []).map((r) => ({
    id: r.id,
    contactName: r.contact_name,
    productName: r.products?.name || 'Reserva',
    preferredDate: r.preferred_date,
    preferredTime: r.preferred_time,
    status: r.status,
    createdAt: r.created_at,
  }));

  return {
    period: { days, since: sinceIso },
    revenue,
    aov,
    ordersConfirmed: ordersRev.length,
    ordersStarted: ordersAll.length,
    conversionProxy,
    repeatRate,
    repeatBuyers,
    totalBuyers,
    revenueByDay,
    statusDistribution,
    topProducts,
    stockCritical,
    upcomingReservations,
  };
}
