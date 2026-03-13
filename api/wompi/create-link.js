import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── 1. Extract and verify JWT ──────────────────────────────
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const token = authHeader.slice(7);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // ── 2. Validate input ──────────────────────────────────────
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'orderId es requerido' });
  }

  // ── 3. Fetch order and validate ownership + status ─────────
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, total, status')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return res.status(400).json({ error: 'Orden no encontrada' });
  }

  if (order.user_id !== user.id) {
    return res.status(403).json({ error: 'No tenés permiso para esta orden' });
  }

  if (order.status !== 'pending_payment') {
    return res.status(400).json({ error: 'Esta orden no está pendiente de pago' });
  }

  // ── 4. Create Wompi payment link ───────────────────────────
  const appUrl = process.env.APP_URL || 'https://majesdesiver.com';
  const returnUrl = `${appUrl}/gracias?order=${orderId}`;

  let wompiResponse;
  try {
    const wompiRes = await fetch('https://api.wompi.sv/EnlacePago', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WOMPI_API_SECRET}`,
        'X-App-Id': process.env.WOMPI_APP_ID,
      },
      body: JSON.stringify({
        identificadorEnlaceComercio: orderId,
        monto: parseFloat(order.total),
        nombreProducto: `Orden ${orderId} — Majes de Sivar`,
        urlRetorno: returnUrl,
      }),
    });

    wompiResponse = await wompiRes.json();

    if (!wompiRes.ok || !wompiResponse.urlEnlace) {
      console.error('Wompi error:', wompiResponse);
      return res.status(500).json({ error: 'Error al crear enlace de pago en Wompi' });
    }
  } catch (err) {
    console.error('Wompi fetch error:', err);
    return res.status(500).json({ error: 'No se pudo conectar con Wompi' });
  }

  // ── 5. Insert payment record ───────────────────────────────
  const { error: paymentError } = await supabase.from('payments').insert({
    order_id: orderId,
    provider: 'wompi',
    provider_transaction_id: wompiResponse.idEnlace,
    amount: parseFloat(order.total),
    currency: 'USD',
    status: 'pending',
  });

  if (paymentError) {
    console.error('Payment insert error:', paymentError);
    // Don't fail — the payment link was already created
  }

  // ── 6. Return payment URL ──────────────────────────────────
  return res.status(200).json({ urlEnlace: wompiResponse.urlEnlace });
}
