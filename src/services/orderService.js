import { supabase } from '../lib/supabase.js';

/**
 * Maps a DB order row + related items + status history to the UI shape.
 */
export function transformOrder(row, items = [], statusHistory = []) {
  return {
    id: row.id,
    trackingCode: row.tracking_code,
    userId: row.user_id,
    items: items.map((item) => ({
      productId: item.product_id,
      name: item.product_name,
      size: item.size,
      color: item.color,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    contact: {
      name: row.contact_name,
      email: row.contact_email,
      phone: row.contact_phone,
    },
    shipping: {
      address: row.shipping_address,
      city: row.shipping_city,
      department: row.shipping_department,
      notes: row.shipping_notes,
    },
    subtotal: row.subtotal,
    shippingCost: row.shipping_cost,
    total: row.total,
    status: row.status,
    statusHistory: statusHistory.map((h) => ({
      status: h.status,
      timestamp: h.created_at,
    })),
    createdAt: row.created_at,
  };
}

/**
 * Creates a new order. Generates an order ID via RPC, inserts the order row,
 * order items, and an initial status history entry.
 *
 * @param {Object} orderData — UI-shaped order data
 * @returns {Object} UI-shaped order
 */
export async function createOrder(orderData) {
  // Generate next order ID
  const { data: generatedId, error: rpcError } = await supabase.rpc('generate_order_id');
  if (rpcError) throw new Error(`Failed to generate order ID: ${rpcError.message}`);

  const orderId = generatedId;
  const trackingCode = `${orderId}-TRK`;
  const initialStatus = orderData.status ?? 'confirmed';

  // Insert order row
  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      tracking_code: trackingCode,
      user_id: orderData.userId,
      contact_name: orderData.contact.name,
      contact_email: orderData.contact.email,
      contact_phone: orderData.contact.phone,
      shipping_address: orderData.shipping.address,
      shipping_city: orderData.shipping.city,
      shipping_department: orderData.shipping.department,
      shipping_notes: orderData.shipping.notes ?? null,
      subtotal: orderData.subtotal,
      shipping_cost: orderData.shippingCost,
      total: orderData.total,
      status: initialStatus,
    })
    .select()
    .single();

  if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

  // Insert order items
  const itemRows = orderData.items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    product_name: item.name,
    size: item.size,
    color: item.color,
    price: item.price,
    quantity: item.quantity,
    image: item.image ?? null,
  }));

  const { data: insertedItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(itemRows)
    .select();

  if (itemsError) throw new Error(`Failed to insert order items: ${itemsError.message}`);

  // Insert initial status history entry
  const { data: historyRow, error: historyError } = await supabase
    .from('order_status_history')
    .insert({ order_id: orderId, status: initialStatus })
    .select()
    .single();

  if (historyError) throw new Error(`Failed to insert status history: ${historyError.message}`);

  return transformOrder(orderRow, insertedItems, [historyRow]);
}

/**
 * Fetches a single order by its ID, including items and status history.
 *
 * @param {string} orderId — e.g. 'MJS-2026-0001'
 * @returns {Object|null} UI-shaped order or null if not found
 */
export async function getOrderById(orderId) {
  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError) {
    if (orderError.code === 'PGRST116') return null; // not found
    throw new Error(`Failed to fetch order: ${orderError.message}`);
  }

  const [itemsResult, historyResult] = await Promise.all([
    supabase.from('order_items').select('*').eq('order_id', orderId),
    supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true }),
  ]);

  if (itemsResult.error) throw new Error(`Failed to fetch order items: ${itemsResult.error.message}`);
  if (historyResult.error) throw new Error(`Failed to fetch status history: ${historyResult.error.message}`);

  return transformOrder(orderRow, itemsResult.data, historyResult.data);
}

/**
 * Fetches a single order by its tracking code.
 *
 * @param {string} code — e.g. 'MJS-2026-0001-TRK'
 * @returns {Object|null} UI-shaped order or null if not found
 */
export async function getOrderByTracking(code) {
  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('tracking_code', code)
    .single();

  if (orderError) {
    if (orderError.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch order by tracking code: ${orderError.message}`);
  }

  const [itemsResult, historyResult] = await Promise.all([
    supabase.from('order_items').select('*').eq('order_id', orderRow.id),
    supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderRow.id)
      .order('created_at', { ascending: true }),
  ]);

  if (itemsResult.error) throw new Error(`Failed to fetch order items: ${itemsResult.error.message}`);
  if (historyResult.error) throw new Error(`Failed to fetch status history: ${historyResult.error.message}`);

  return transformOrder(orderRow, itemsResult.data, historyResult.data);
}

/**
 * Fetches all orders for a given user, with items and status history batch-fetched.
 *
 * @param {string} userId — UUID
 * @returns {Object[]} Array of UI-shaped orders sorted by created_at descending
 */
export async function getOrdersByUser(userId) {
  const { data: orderRows, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (ordersError) throw new Error(`Failed to fetch user orders: ${ordersError.message}`);
  if (!orderRows || orderRows.length === 0) return [];

  const orderIds = orderRows.map((o) => o.id);

  const [itemsResult, historyResult] = await Promise.all([
    supabase.from('order_items').select('*').in('order_id', orderIds),
    supabase
      .from('order_status_history')
      .select('*')
      .in('order_id', orderIds)
      .order('created_at', { ascending: true }),
  ]);

  if (itemsResult.error) throw new Error(`Failed to fetch order items: ${itemsResult.error.message}`);
  if (historyResult.error) throw new Error(`Failed to fetch status history: ${historyResult.error.message}`);

  // Group items and history by order_id for efficient lookup
  const itemsByOrder = itemsResult.data.reduce((acc, item) => {
    (acc[item.order_id] ??= []).push(item);
    return acc;
  }, {});

  const historyByOrder = historyResult.data.reduce((acc, h) => {
    (acc[h.order_id] ??= []).push(h);
    return acc;
  }, {});

  return orderRows.map((row) =>
    transformOrder(row, itemsByOrder[row.id] ?? [], historyByOrder[row.id] ?? [])
  );
}

/**
 * Updates the status of an order and appends a new status history entry.
 *
 * @param {string} orderId
 * @param {string} status — new status value
 * @returns {Object} updated UI-shaped order
 */
export async function updateOrderStatus(orderId, status) {
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (updateError) throw new Error(`Failed to update order status: ${updateError.message}`);

  const { error: historyError } = await supabase
    .from('order_status_history')
    .insert({ order_id: orderId, status });

  if (historyError) throw new Error(`Failed to insert status history entry: ${historyError.message}`);

  return getOrderById(orderId);
}

/**
 * Fetches all orders in the system (for admin use), with items and status history
 * batch-fetched for efficiency.
 *
 * @returns {Object[]} Array of UI-shaped orders sorted by created_at descending
 */
export async function getAllOrders() {
  const { data: orderRows, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (ordersError) throw new Error(`Failed to fetch all orders: ${ordersError.message}`);
  if (!orderRows || orderRows.length === 0) return [];

  const orderIds = orderRows.map((o) => o.id);

  const [itemsResult, historyResult] = await Promise.all([
    supabase.from('order_items').select('*').in('order_id', orderIds),
    supabase
      .from('order_status_history')
      .select('*')
      .in('order_id', orderIds)
      .order('created_at', { ascending: true }),
  ]);

  if (itemsResult.error) throw new Error(`Failed to fetch order items: ${itemsResult.error.message}`);
  if (historyResult.error) throw new Error(`Failed to fetch status history: ${historyResult.error.message}`);

  const itemsByOrder = itemsResult.data.reduce((acc, item) => {
    (acc[item.order_id] ??= []).push(item);
    return acc;
  }, {});

  const historyByOrder = historyResult.data.reduce((acc, h) => {
    (acc[h.order_id] ??= []).push(h);
    return acc;
  }, {});

  return orderRows.map((row) =>
    transformOrder(row, itemsByOrder[row.id] ?? [], historyByOrder[row.id] ?? [])
  );
}
