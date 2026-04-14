import { createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  loadServerRuntimeConfig,
  sendServerConfigError,
} from '../_lib/runtimeConfig.js';

const ORDER_STATUS_SCOPE = 'wompi/order-status';
const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'WOMPI_API_SECRET',
];

function getSupabaseAdminClient(serverConfig) {
  return createClient(
    serverConfig.SUPABASE_URL,
    serverConfig.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function createOrderAccessKey(orderId, secret) {
  return createHmac('sha256', secret).update(orderId).digest('hex');
}

function transformOrder(row, items = [], statusHistory = []) {
  return {
    id: row.id,
    trackingCode: row.tracking_code,
    userId: row.user_id,
    items: items.map((item) => ({
      productId: item.product_id,
      name: item.product_name,
      size: item.size,
      color: item.color,
      price: Number(item.price),
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
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost),
    total: Number(row.total),
    status: row.status,
    statusHistory: statusHistory.map((entry) => ({
      status: entry.status,
      timestamp: entry.created_at,
    })),
    createdAt: row.created_at,
  };
}

async function getAuthenticatedUser(supabase, authHeader) {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { config: serverConfig, missing } = loadServerRuntimeConfig({
    scope: ORDER_STATUS_SCOPE,
    required: REQUIRED_ENV,
  });

  if (missing.length > 0) {
    return sendServerConfigError(res, ORDER_STATUS_SCOPE, missing);
  }

  const orderId = String(req.query.order || '').trim();
  const providedKey = String(req.query.key || '').trim();

  if (!orderId) {
    return res.status(400).json({ error: 'order es requerido' });
  }

  const supabase = getSupabaseAdminClient(serverConfig);

  try {
    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !orderRow) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const expectedKey = createOrderAccessKey(orderId, serverConfig.WOMPI_API_SECRET);
    const hasGuestAccess = Boolean(providedKey) && providedKey === expectedKey;
    const user = await getAuthenticatedUser(supabase, req.headers.authorization);
    const hasUserAccess = Boolean(user && orderRow.user_id && orderRow.user_id === user.id);

    if (!hasGuestAccess && !hasUserAccess) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta orden' });
    }

    const [itemsResult, historyResult, paymentResult] = await Promise.all([
      supabase.from('order_items').select('*').eq('order_id', orderId),
      supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true }),
      supabase
        .from('payments')
        .select(
          'id, order_id, status, provider_transaction_id, amount, currency, created_at',
        )
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1),
    ]);

    if (itemsResult.error) {
      throw new Error(`No se pudieron leer los articulos: ${itemsResult.error.message}`);
    }

    if (historyResult.error) {
      throw new Error(
        `No se pudo leer el historial de la orden: ${historyResult.error.message}`,
      );
    }

    if (paymentResult.error) {
      throw new Error(`No se pudo leer el pago: ${paymentResult.error.message}`);
    }

    const payment = paymentResult.data?.[0] ?? null;

    return res.status(200).json({
      order: transformOrder(orderRow, itemsResult.data ?? [], historyResult.data ?? []),
      payment: payment
        ? {
            ...payment,
            amount: Number(payment.amount),
          }
        : null,
    });
  } catch (error) {
    console.error(`[${ORDER_STATUS_SCOPE}]`, error);
    return res.status(500).json({
      error: error.message || 'No se pudo consultar el estado del pedido.',
    });
  }
}
