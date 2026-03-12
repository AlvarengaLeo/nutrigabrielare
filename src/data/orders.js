// ─── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'majes-orders';

// ─── Internal Helpers ──────────────────────────────────────────────────────────

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // localStorage unavailable (SSR / private mode quota exceeded) — silently ignore
  }
}

function generateOrderId(orders) {
  const year = new Date().getFullYear();
  const existing = orders.filter((o) => o.id && o.id.startsWith(`MJS-${year}-`));
  const nextNum = String(existing.length + 1).padStart(4, '0');
  return `MJS-${year}-${nextNum}`;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Create and persist a new order.
 * @param {Object} orderData - { userId, items, contact, shipping, subtotal, shippingCost, total }
 * @returns {Object} The saved order with generated id, trackingCode, status and statusHistory.
 */
export function createOrder(orderData) {
  const orders = loadOrders();
  const id = generateOrderId(orders);
  const trackingCode = `${id}-TRK`;
  const now = new Date().toISOString();

  const order = {
    id,
    trackingCode,
    userId: orderData.userId ?? null,
    items: orderData.items ?? [],
    contact: orderData.contact ?? {},
    shipping: orderData.shipping ?? {},
    subtotal: orderData.subtotal ?? 0,
    shippingCost: orderData.shippingCost ?? 0,
    total: orderData.total ?? 0,
    status: 'confirmed',
    statusHistory: [{ status: 'confirmed', timestamp: now }],
    createdAt: now,
  };

  orders.push(order);
  saveOrders(orders);
  return order;
}

/**
 * Find an order by its ID.
 * @param {string} orderId
 * @returns {Object|null}
 */
export function getOrderById(orderId) {
  const orders = loadOrders();
  return orders.find((o) => o.id === orderId) ?? null;
}

/**
 * Find an order by its tracking code.
 * @param {string} code
 * @returns {Object|null}
 */
export function getOrderByTracking(code) {
  const orders = loadOrders();
  return orders.find((o) => o.trackingCode === code) ?? null;
}

/**
 * Return all orders belonging to a user.
 * @param {string} userId
 * @returns {Object[]}
 */
export function getOrdersByUser(userId) {
  const orders = loadOrders();
  return orders.filter((o) => o.userId === userId);
}

/**
 * Append a new status entry to an order's statusHistory and update its current status.
 * @param {string} orderId
 * @param {'confirmed'|'preparing'|'shipped'|'delivered'} status
 * @returns {Object|null} Updated order or null if not found.
 */
export function updateOrderStatus(orderId, status) {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;

  const updated = {
    ...orders[idx],
    status,
    statusHistory: [
      ...orders[idx].statusHistory,
      { status, timestamp: new Date().toISOString() },
    ],
  };

  orders[idx] = updated;
  saveOrders(orders);
  return updated;
}

/**
 * Return every order stored in localStorage.
 * @returns {Object[]}
 */
export function getAllOrders() {
  return loadOrders();
}
