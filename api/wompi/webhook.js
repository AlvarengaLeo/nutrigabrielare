import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function validateSignature(body) {
  const { signature, timestamp } = body;
  if (!signature?.properties || !signature?.checksum || !timestamp) {
    return false;
  }

  // Build concatenated string from properties in order
  const values = signature.properties.map((prop) => {
    return prop.split('.').reduce((obj, key) => obj?.[key], body);
  });

  const concatenated =
    values.join('') + timestamp + process.env.WOMPI_EVENT_SECRET;
  const hash = createHash('sha256').update(concatenated).digest('hex');

  return hash === signature.checksum;
}

async function processPayment(
  payment,
  transactionId,
  transactionStatus,
  rawBody
) {
  // Already processed — idempotent
  if (['approved', 'declined'].includes(payment.status)) {
    return { alreadyProcessed: true };
  }

  const orderId = payment.order_id;
  const isApproved = transactionStatus === 'APPROVED';
  const newPaymentStatus = isApproved ? 'approved' : 'declined';
  const newOrderStatus = isApproved ? 'confirmed' : 'cancelled';

  // Update payment
  await supabase
    .from('payments')
    .update({
      status: newPaymentStatus,
      provider_transaction_id: transactionId,
      raw_response: rawBody,
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
    `Payment ${payment.id} → ${newPaymentStatus}, Order ${orderId} → ${newOrderStatus}`
  );
  return { alreadyProcessed: false };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;

  // ── 1. Validate signature ──────────────────────────────────
  if (!validateSignature(body)) {
    console.error('Webhook signature validation failed');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // ── 2. Extract transaction data ────────────────────────────
  const transaction = body.transaction || body.data?.transaction;
  if (!transaction) {
    return res
      .status(200)
      .json({ message: 'No transaction data, skipping' });
  }

  const transactionId = transaction.id;
  const transactionStatus = transaction.status; // APPROVED, DECLINED, VOIDED, ERROR
  const reference =
    transaction.reference ||
    transaction.merchant_reference ||
    transaction.identificadorEnlaceComercio;

  // ── 3. Find payment by order_id (reference = orderId) ──────
  const { data: payment } = await supabase
    .from('payments')
    .select('id, status, order_id')
    .eq('order_id', reference)
    .single();

  if (!payment) {
    console.error('No payment found for reference:', reference);
    return res
      .status(200)
      .json({ message: 'Payment not found, skipping' });
  }

  // ── 4. Process payment ─────────────────────────────────────
  const result = await processPayment(
    payment,
    transactionId,
    transactionStatus,
    body
  );

  if (result.alreadyProcessed) {
    return res.status(200).json({ message: 'Already processed' });
  }

  return res.status(200).json({ message: 'Processed' });
}
