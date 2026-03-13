import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Validates Wompi webhook using HMAC-SHA256.
 * Wompi sends the hash in the `wompi_hash` header.
 * The hash is HMAC-SHA256 of the raw body using the API Secret as the key.
 */
function validateWebhook(rawBody, receivedHash) {
  if (!receivedHash || !rawBody) return false;

  const computed = createHmac('sha256', process.env.WOMPI_API_SECRET)
    .update(rawBody)
    .digest('hex');

  return computed === receivedHash;
}

export const config = {
  api: {
    // Need raw body for HMAC validation
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

  // ── 1. Read raw body and validate HMAC ─────────────────────
  const rawBody = await getRawBody(req);
  const wompiHash = req.headers['wompi_hash'] || req.headers['wompi-hash'];

  if (!validateWebhook(rawBody, wompiHash)) {
    console.error('Webhook HMAC validation failed');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // ── 2. Extract webhook data ────────────────────────────────
  // Wompi SV webhook format:
  // {
  //   IdTransaccion, ResultadoTransaccion, Monto,
  //   EnlacePago: { Id, IdentificadorEnlaceComercio, NombreProducto },
  //   ...
  // }
  const resultado = body.ResultadoTransaccion;
  const transactionId = body.IdTransaccion;
  const orderId = body.EnlacePago?.IdentificadorEnlaceComercio;

  if (!orderId) {
    console.error('Webhook missing IdentificadorEnlaceComercio:', body);
    return res.status(200).json({ message: 'No order reference, skipping' });
  }

  // ── 3. Find payment by order_id ────────────────────────────
  const { data: payment } = await supabase
    .from('payments')
    .select('id, status, order_id')
    .eq('order_id', orderId)
    .single();

  if (!payment) {
    console.error('No payment found for order:', orderId);
    return res.status(200).json({ message: 'Payment not found, skipping' });
  }

  // ── 4. Idempotency check ───────────────────────────────────
  if (['approved', 'declined'].includes(payment.status)) {
    return res.status(200).json({ message: 'Already processed' });
  }

  // ── 5. Process result ──────────────────────────────────────
  // ResultadoTransaccion: "ExitosaAprobada" = approved, anything else = declined
  const isApproved = resultado === 'ExitosaAprobada';
  const newPaymentStatus = isApproved ? 'approved' : 'declined';
  const newOrderStatus = isApproved ? 'confirmed' : 'cancelled';

  // Update payment
  await supabase
    .from('payments')
    .update({
      status: newPaymentStatus,
      provider_transaction_id: transactionId || payment.provider_transaction_id,
      raw_response: body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id);

  // Update order status
  await supabase
    .from('orders')
    .update({
      status: newOrderStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  // Insert status history
  await supabase
    .from('order_status_history')
    .insert({ order_id: orderId, status: newOrderStatus });

  console.log(
    `Webhook: Payment ${payment.id} → ${newPaymentStatus}, Order ${orderId} → ${newOrderStatus}`
  );

  return res.status(200).json({ message: 'Processed' });
}
