import { supabase } from '../lib/supabase.js';

/**
 * Calls the serverless function to create a Wompi payment link.
 *
 * @param {string} orderId — e.g. 'MJS-2026-0001'
 * @param {string} accessToken — Supabase JWT access token
 * @returns {{ urlEnlace: string }}
 */
export async function createPaymentLink(orderId, accessToken) {
  const res = await fetch('/api/wompi/create-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ orderId }),
  });

  if (!res.ok) {
    let errorMsg = 'Error al crear enlace de pago';
    try {
      const errData = await res.json();
      errorMsg = errData.error || errorMsg;
    } catch {
      if (res.status === 404) {
        errorMsg = 'Servicio de pagos no disponible. Verificá que estás en el entorno de producción.';
      }
    }
    throw new Error(errorMsg);
  }

  return await res.json();
}

/**
 * Fetches the payment record for a given order.
 *
 * @param {string} orderId — e.g. 'MJS-2026-0001'
 * @returns {Object|null} payment record or null
 */
export async function getPaymentByOrderId(orderId) {
  const { data, error } = await supabase
    .from('payments')
    .select(
      'id, order_id, status, provider_transaction_id, amount, currency, created_at'
    )
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw new Error(`Failed to fetch payment: ${error.message}`);
  }

  return data;
}
