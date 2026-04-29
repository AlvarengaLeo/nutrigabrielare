import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';
import {
  loadServerRuntimeConfig,
  sendServerConfigError,
} from '../_lib/runtimeConfig.js';
import {
  sendPurchaseConfirmationEmail,
  sendDigitalDownloadEmail,
} from '../_lib/email.js';

const WEBHOOK_SCOPE = 'wompi/webhook';
const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'WOMPI_API_SECRET',
];

function getSupabaseAdminClient(serverConfig) {
  return createClient(
    serverConfig.SUPABASE_URL,
    serverConfig.SUPABASE_SERVICE_ROLE_KEY
  );
}

function validateWebhook(rawBody, receivedHash, apiSecret) {
  if (!receivedHash || !rawBody || !apiSecret) {
    return false;
  }

  const computed = createHmac('sha256', apiSecret)
    .update(rawBody)
    .digest('hex');

  return computed === receivedHash;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { config: serverConfig, missing } = loadServerRuntimeConfig({
    scope: WEBHOOK_SCOPE,
    required: REQUIRED_ENV,
  });

  if (missing.length > 0) {
    return sendServerConfigError(res, WEBHOOK_SCOPE, missing);
  }

  const supabase = getSupabaseAdminClient(serverConfig);
  const rawBody = await getRawBody(req);
  const wompiHash = req.headers['wompi_hash'] || req.headers['wompi-hash'];

  if (!validateWebhook(rawBody, wompiHash, serverConfig.WOMPI_API_SECRET)) {
    console.error('Webhook HMAC validation failed');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const resultado = body.ResultadoTransaccion;
  const transactionId = body.IdTransaccion;
  const orderId = body.EnlacePago?.IdentificadorEnlaceComercio;

  if (!orderId) {
    console.error('Webhook missing IdentificadorEnlaceComercio:', body);
    return res.status(200).json({ message: 'No order reference, skipping' });
  }

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('id, status, order_id, provider_transaction_id')
    .eq('order_id', orderId)
    .single();

  if (paymentError || !payment) {
    console.error('No payment found for order:', orderId, paymentError);
    return res.status(200).json({ message: 'Payment not found, skipping' });
  }

  if (['approved', 'declined'].includes(payment.status)) {
    return res.status(200).json({ message: 'Already processed' });
  }

  const isApproved = resultado === 'ExitosaAprobada';
  const newPaymentStatus = isApproved ? 'approved' : 'declined';
  const newOrderStatus = isApproved ? 'confirmed' : 'cancelled';

  await supabase
    .from('payments')
    .update({
      status: newPaymentStatus,
      provider_transaction_id:
        transactionId || payment.provider_transaction_id || null,
      raw_response: body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id);

  await supabase
    .from('orders')
    .update({
      status: newOrderStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  await supabase
    .from('order_status_history')
    .insert({ order_id: orderId, status: newOrderStatus });

  console.log(
    `Webhook: Payment ${payment.id} -> ${newPaymentStatus}, Order ${orderId} -> ${newOrderStatus}`
  );

  // Notify customer — never block the webhook on email delivery.
  if (isApproved) {
    try {
      await sendOrderConfirmation(supabase, orderId);
    } catch (err) {
      console.error('Email notification failed (non-blocking):', err);
    }
  }

  return res.status(200).json({ message: 'Processed' });
}

async function sendOrderConfirmation(supabase, orderId) {
  const { data: order } = await supabase
    .from('orders')
    .select(
      'id, tracking_code, subtotal, shipping_cost, total, contact_name, contact_email, user_id'
    )
    .eq('id', orderId)
    .single();

  if (!order) return;

  const { data: items } = await supabase
    .from('order_items')
    .select('product_name, size, color, price, quantity, products ( kind )')
    .eq('order_id', orderId);

  const itemsArray = items ?? [];

  let customer = {
    email: order.contact_email,
    firstName: (order.contact_name || '').split(' ')[0] || '',
    lastName: (order.contact_name || '').split(' ').slice(1).join(' '),
  };

  if (order.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', order.user_id)
      .single();
    if (profile) {
      customer = {
        email: profile.email || order.contact_email,
        firstName: profile.first_name || customer.firstName,
        lastName: profile.last_name || customer.lastName,
      };
    }
  }

  const allDigital =
    itemsArray.length > 0 &&
    itemsArray.every((it) => it.products?.kind === 'digital');

  if (allDigital) {
    // Fase 6 will populate downloadLinks with signed URLs; for now
    // the template renders a "we will send your links" placeholder.
    await sendDigitalDownloadEmail({
      order,
      items: itemsArray,
      customer,
      downloadLinks: [],
    });
  } else {
    await sendPurchaseConfirmationEmail({
      order,
      items: itemsArray,
      customer,
    });
  }
}
