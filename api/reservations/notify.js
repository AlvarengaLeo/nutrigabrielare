import { createClient } from '@supabase/supabase-js';
import {
  loadServerRuntimeConfig,
  sendServerConfigError,
} from '../_lib/runtimeConfig.js';
import { sendReservationConfirmationEmail } from '../_lib/email.js';

const SCOPE = 'reservations/notify';
const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

function getUserClient(serverConfig, accessToken) {
  return createClient(serverConfig.SUPABASE_URL, serverConfig.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { config: serverConfig, missing } = loadServerRuntimeConfig({
    scope: SCOPE,
    required: REQUIRED_ENV,
  });

  if (missing.length > 0) {
    return sendServerConfigError(res, SCOPE, missing);
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  const reservationId = req.body?.reservationId;
  if (!reservationId) {
    return res.status(400).json({ error: 'Missing reservationId' });
  }

  const supabase = getUserClient(serverConfig, token);

  const { data: reservation, error } = await supabase
    .from('reservations')
    .select(
      `id, contact_name, contact_email, contact_phone, preferred_date,
       preferred_time, notes, status, products ( id, name, slug )`
    )
    .eq('id', reservationId)
    .single();

  if (error || !reservation) {
    console.error(`[${SCOPE}] reservation not found:`, error);
    return res.status(404).json({ error: 'Reservation not found' });
  }

  const customer = {
    firstName: (reservation.contact_name || '').split(' ')[0] || '',
    lastName: (reservation.contact_name || '').split(' ').slice(1).join(' '),
    email: reservation.contact_email,
  };

  // Customer confirmation — never block on email failure.
  try {
    await sendReservationConfirmationEmail({
      reservation,
      service: reservation.products,
      customer,
    });
  } catch (err) {
    console.error(`[${SCOPE}] customer email failed:`, err);
  }

  // Optional admin notification (set ADMIN_NOTIFY_EMAIL in Vercel).
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (adminEmail) {
    try {
      const { Resend } = await import('resend');
      const apiKey = process.env.RESEND_API_KEY?.trim();
      if (apiKey) {
        const client = new Resend(apiKey);
        const dateLine = reservation.preferred_date
          ? `<p>Fecha preferida: <strong>${reservation.preferred_date}</strong>${reservation.preferred_time ? ` · ${reservation.preferred_time}` : ''}</p>`
          : '';
        const notesLine = reservation.notes
          ? `<p>Notas: ${reservation.notes}</p>`
          : '';
        await client.emails.send({
          from: process.env.EMAIL_FROM || 'Nutrigabriela <noreply@nutrigabriela.com>',
          to: adminEmail,
          subject: `Nueva reserva: ${reservation.products?.name ?? 'Servicio'}`,
          html: `<p>Recibiste una nueva reserva.</p>
            <p>Servicio: <strong>${reservation.products?.name ?? '—'}</strong></p>
            <p>Cliente: <strong>${reservation.contact_name}</strong> (${reservation.contact_email}${reservation.contact_phone ? `, ${reservation.contact_phone}` : ''})</p>
            ${dateLine}
            ${notesLine}
            <p>Revisala en el panel: <a href="${process.env.APP_URL || ''}/admin/reservas">/admin/reservas</a></p>`,
        });
      }
    } catch (err) {
      console.error(`[${SCOPE}] admin notification failed:`, err);
    }
  }

  return res.status(200).json({ ok: true });
}
