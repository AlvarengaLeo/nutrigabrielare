import { createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  loadServerRuntimeConfig,
  sendServerConfigError,
} from '../_lib/runtimeConfig.js';

const CREATE_LINK_SCOPE = 'wompi/create-link';
const DEFAULT_APP_URL = 'https://nutrigabrielare.vercel.app';
const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'WOMPI_APP_ID',
  'WOMPI_API_SECRET',
];
const SHIPPING_COST = 5;

function getSupabaseAdminClient(serverConfig) {
  return createClient(
    serverConfig.SUPABASE_URL,
    serverConfig.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function createOrderAccessKey(orderId, secret) {
  return createHmac('sha256', secret).update(orderId).digest('hex');
}

function getAppUrl(req) {
  const configured = process.env.APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol =
    req.headers['x-forwarded-proto'] ||
    (host && host.includes('localhost') ? 'http' : 'https');

  if (host) {
    return `${protocol}://${host}`;
  }

  console.warn(
    `[${CREATE_LINK_SCOPE}] Missing APP_URL and request host. Falling back to ${DEFAULT_APP_URL}.`,
  );
  return DEFAULT_APP_URL;
}

function pickPrimaryImage(product) {
  const images = (product.product_images ?? []).slice().sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  return images[0]?.url ?? null;
}

function normalizeCheckout(checkout) {
  const items = Array.isArray(checkout?.items) ? checkout.items : [];

  return {
    items,
    contact: {
      name: checkout?.contact?.name?.trim() || '',
      email: checkout?.contact?.email?.trim().toLowerCase() || '',
      phone: checkout?.contact?.phone?.trim() || '',
    },
    shipping: {
      address: checkout?.shipping?.address?.trim() || '',
      city: checkout?.shipping?.city?.trim() || '',
      department: checkout?.shipping?.department?.trim() || '',
      notes: checkout?.shipping?.notes?.trim() || '',
    },
  };
}

function validateCheckout(checkout) {
  if (!checkout.items.length) {
    return 'El checkout debe incluir al menos un producto.';
  }

  const requiredFields = [
    checkout.contact.name,
    checkout.contact.email,
    checkout.contact.phone,
    checkout.shipping.address,
    checkout.shipping.city,
    checkout.shipping.department,
  ];

  if (requiredFields.some((value) => !value)) {
    return 'Faltan datos obligatorios del checkout.';
  }

  const emailPattern = /\S+@\S+\.\S+/;
  if (!emailPattern.test(checkout.contact.email)) {
    return 'El correo del checkout no es valido.';
  }

  const invalidItem = checkout.items.find(
    (item) =>
      !item?.productId ||
      !item?.size ||
      !item?.color ||
      !Number.isInteger(Number(item?.quantity)) ||
      Number(item.quantity) <= 0,
  );

  if (invalidItem) {
    return 'Hay productos del carrito con datos invalidos.';
  }

  return null;
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
    const authError = new Error('Token invalido o expirado');
    authError.statusCode = 401;
    throw authError;
  }

  return user;
}

async function createOrderFromCheckout(supabase, checkout, userId = null) {
  const productIds = [...new Set(checkout.items.map((item) => item.productId))];
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, slug, name, price, active, product_images ( url, sort_order )')
    .in('id', productIds);

  if (productsError) {
    throw new Error(`No se pudieron validar los productos: ${productsError.message}`);
  }

  const productMap = new Map((products ?? []).map((product) => [product.id, product]));
  const normalizedItems = checkout.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product || !product.active) {
      throw new Error('Uno de los productos del carrito ya no esta disponible.');
    }

    const quantity = Number(item.quantity);
    const price = Number(product.price);

    return {
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      size: item.size.trim(),
      color: item.color.trim(),
      quantity,
      price,
      image: pickPrimaryImage(product) || item.image || null,
    };
  });

  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal + SHIPPING_COST;

  const { data: generatedId, error: idError } = await supabase.rpc(
    'generate_order_id',
  );

  if (idError || !generatedId) {
    throw new Error('No se pudo generar el identificador de la orden.');
  }

  const orderId = generatedId;
  const trackingCode = `${orderId}-TRK`;
  const orderStatus = 'pending_payment';

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      tracking_code: trackingCode,
      user_id: userId,
      contact_name: checkout.contact.name,
      contact_email: checkout.contact.email,
      contact_phone: checkout.contact.phone,
      shipping_address: checkout.shipping.address,
      shipping_city: checkout.shipping.city,
      shipping_department: checkout.shipping.department,
      shipping_notes: checkout.shipping.notes || null,
      subtotal,
      shipping_cost: SHIPPING_COST,
      total,
      status: orderStatus,
    })
    .select('id, user_id, total, status')
    .single();

  if (orderError || !order) {
    throw new Error(`No se pudo crear la orden: ${orderError?.message || 'unknown error'}`);
  }

  const { error: itemsError } = await supabase.from('order_items').insert(
    normalizedItems.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.productName,
      size: item.size,
      color: item.color,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
  );

  if (itemsError) {
    throw new Error(`No se pudieron guardar los articulos: ${itemsError.message}`);
  }

  const { error: historyError } = await supabase
    .from('order_status_history')
    .insert({ order_id: orderId, status: orderStatus });

  if (historyError) {
    throw new Error(
      `No se pudo registrar el estado inicial de la orden: ${historyError.message}`,
    );
  }

  return order;
}

async function getPendingOrderForUser(supabase, orderId, userId) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, total, status')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error('Orden no encontrada');
  }

  if (order.user_id !== userId) {
    const forbidden = new Error('No tienes permiso para esta orden');
    forbidden.statusCode = 403;
    throw forbidden;
  }

  if (order.status !== 'pending_payment') {
    throw new Error('Esta orden no esta pendiente de pago');
  }

  return order;
}

async function getWompiToken(serverConfig) {
  const res = await fetch('https://id.wompi.sv/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      audience: 'wompi_api',
      client_id: serverConfig.WOMPI_APP_ID,
      client_secret: serverConfig.WOMPI_API_SECRET,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Wompi auth failed: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

async function createWompiLink({ supabase, order, serverConfig, req }) {
  const wompiToken = await getWompiToken(serverConfig);
  const orderKey = createOrderAccessKey(order.id, serverConfig.WOMPI_API_SECRET);
  const appUrl = getAppUrl(req);
  const returnUrl = `${appUrl}/gracias?order=${encodeURIComponent(order.id)}&key=${encodeURIComponent(orderKey)}`;
  const webhookUrl = `${appUrl}/api/wompi/webhook`;

  const wompiRes = await fetch('https://api.wompi.sv/EnlacePago', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${wompiToken}`,
    },
    body: JSON.stringify({
      identificadorEnlaceComercio: order.id,
      monto: Number(order.total),
      nombreProducto: `Orden ${order.id} - Nutrigabrielare`,
      configuracion: {
        urlRedirect: returnUrl,
        urlWebhook: webhookUrl,
      },
    }),
  });

  const wompiResponse = await wompiRes.json();
  if (!wompiRes.ok || !wompiResponse.urlEnlace) {
    console.error('Wompi error:', wompiResponse);
    throw new Error('Error al crear el enlace de pago en Wompi');
  }

  const { error: paymentError } = await supabase.from('payments').insert({
    order_id: order.id,
    provider: 'wompi',
    provider_transaction_id: String(wompiResponse.idEnlace),
    amount: Number(order.total),
    currency: 'USD',
    status: 'pending',
  });

  if (paymentError) {
    console.error('Payment insert error:', paymentError);
  }

  return {
    orderId: order.id,
    orderKey,
    urlEnlace: wompiResponse.urlEnlace,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { config: serverConfig, missing } = loadServerRuntimeConfig({
    scope: CREATE_LINK_SCOPE,
    required: REQUIRED_ENV,
  });

  if (missing.length > 0) {
    return sendServerConfigError(res, CREATE_LINK_SCOPE, missing);
  }

  const supabase = getSupabaseAdminClient(serverConfig);

  try {
    const user = await getAuthenticatedUser(supabase, req.headers.authorization);
    const { checkout, orderId } = req.body ?? {};

    let order;

    if (checkout) {
      const normalizedCheckout = normalizeCheckout(checkout);
      const validationError = validateCheckout(normalizedCheckout);

      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      order = await createOrderFromCheckout(supabase, normalizedCheckout, user?.id ?? null);
    } else if (orderId) {
      if (!user) {
        return res.status(401).json({ error: 'Token de autenticacion requerido' });
      }

      order = await getPendingOrderForUser(supabase, orderId, user.id);
    } else {
      return res.status(400).json({ error: 'checkout es requerido' });
    }

    const paymentLink = await createWompiLink({
      supabase,
      order,
      serverConfig,
      req,
    });

    return res.status(200).json(paymentLink);
  } catch (error) {
    console.error(`[${CREATE_LINK_SCOPE}]`, error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      error:
        error.message || 'No se pudo preparar el checkout para el pago.',
    });
  }
}
