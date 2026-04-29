import { supabase } from '../lib/supabase.js';

const RESERVATION_SELECT = `
  id, user_id, product_id, contact_name, contact_email, contact_phone,
  preferred_date, preferred_time, notes, status, created_at, updated_at,
  products ( name, slug )
`.trim();

function transformReservation(row) {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    productName: row.products?.name ?? '',
    productSlug: row.products?.slug ?? '',
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const RESERVATION_STATUSES = [
  'pendiente',
  'contactado',
  'confirmado',
  'completado',
  'cancelado',
];

export async function createReservation({
  userId,
  productId,
  contactName,
  contactEmail,
  contactPhone,
  preferredDate,
  preferredTime,
  notes,
}) {
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      user_id: userId,
      product_id: productId,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone || '',
      preferred_date: preferredDate || null,
      preferred_time: preferredTime || null,
      notes: notes || '',
    })
    .select(RESERVATION_SELECT)
    .single();

  if (error) throw error;
  return transformReservation(data);
}

export async function getReservationsByUser(userId) {
  const { data, error } = await supabase
    .from('reservations')
    .select(RESERVATION_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(transformReservation);
}

export async function getAllReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select(RESERVATION_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(transformReservation);
}

export async function updateReservationStatus(id, status) {
  const { data, error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', id)
    .select(RESERVATION_SELECT)
    .single();

  if (error) throw error;
  return transformReservation(data);
}

/**
 * Asks the serverless layer to fire the customer confirmation email
 * (and optionally the admin notification) for a reservation.
 * Failure here should not roll back the reservation creation.
 */
export async function notifyReservation(reservationId, accessToken) {
  if (!reservationId || !accessToken) return { skipped: true };
  try {
    const res = await fetch('/api/reservations/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ reservationId }),
    });
    if (!res.ok) {
      console.warn('notifyReservation failed:', res.status);
      return { error: true };
    }
    return await res.json();
  } catch (err) {
    console.warn('notifyReservation threw:', err);
    return { error: err };
  }
}
