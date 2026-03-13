import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';
import {
  loadServerRuntimeConfig,
  sendServerConfigError,
} from '../_lib/runtimeConfig.js';

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

  return res.status(200).json({ message: 'Processed' });
}
