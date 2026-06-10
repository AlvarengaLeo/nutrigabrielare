import { createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  loadServerRuntimeConfig,
  sendServerConfigError,
} from '../_lib/runtimeConfig.js';
import { sendDigitalDownloadEmail } from '../_lib/email.js';

const SCOPE = 'digital/resend-email';
const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'WOMPI_API_SECRET',
];
// Mismos roles que pueden ver /admin/ordenes (App.jsx)
const ALLOWED_ROLES = ['admin', 'gestor'];
const PAID_STATUSES = ['confirmed', 'preparing', 'shipped', 'delivered'];
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSupabaseAdminClient(serverConfig) {
  return createClient(
    serverConfig.SUPABASE_URL,
    serverConfig.SUPABASE_SERVICE_ROLE_KEY,
  );
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

  const supabase = getSupabaseAdminClient(serverConfig);

  try {
    const user = await getAuthenticatedUser(supabase, req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Autenticación requerida' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
      return res.status(403).json({ error: 'No tenés permiso para esta acción' });
    }

    const orderId = req.body?.orderId?.toString().trim();
    if (!orderId) {
      return res.status(400).json({ error: 'orderId es requerido' });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, contact_name, contact_email, user_id, status, subtotal, shipping_cost, total')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    if (!PAID_STATUSES.includes(order.status)) {
      return res.status(400).json({
        error: 'Solo se pueden reenviar enlaces de órdenes pagadas.',
      });
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, product_name, price, quantity, products ( kind, digital_file_path )')
      .eq('order_id', orderId);

    if (itemsError) {
      throw new Error(`No se pudieron leer los artículos: ${itemsError.message}`);
    }

    const digitalItems = (items ?? []).filter(
      (item) => item.products?.kind === 'digital',
    );

    if (digitalItems.length === 0) {
      return res.status(400).json({
        error: 'Esta orden no tiene productos digitales.',
      });
    }

    const expiresAtIso = new Date(
      Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
    ).toISOString();
    const downloadLinks = [];

    for (const item of digitalItems) {
      const path = item.products?.digital_file_path;
      if (!path) {
        console.warn(
          `[${SCOPE}] Order ${orderId}: product ${item.product_id} has no digital_file_path; skipping`,
        );
        continue;
      }

      const { data: signed, error: signErr } = await supabase.storage
        .from('digital-products')
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

      if (signErr || !signed?.signedUrl) {
        console.error(`[${SCOPE}] signed URL failed for ${path}:`, signErr);
        continue;
      }

      downloadLinks.push({
        name: item.product_name,
        url: signed.signedUrl,
        expiresAt: expiresAtIso,
      });
    }

    if (downloadLinks.length === 0) {
      return res.status(500).json({
        error: 'No se pudieron generar los enlaces de descarga. Verificá que los productos tengan archivo digital.',
      });
    }

    const appUrl = (process.env.APP_URL?.trim() || 'https://nutrigabrielare.com').replace(/\/$/, '');
    const orderKey = createHmac('sha256', serverConfig.WOMPI_API_SECRET)
      .update(order.id)
      .digest('hex');
    const orderUrl = `${appUrl}/gracias?order=${encodeURIComponent(order.id)}&key=${orderKey}`;

    const customer = {
      email: order.contact_email,
      firstName: (order.contact_name || '').split(' ')[0] || '',
    };

    const result = await sendDigitalDownloadEmail({
      order,
      items: digitalItems,
      customer,
      downloadLinks,
      orderUrl,
    });

    if (result?.error || result?.skipped) {
      return res.status(502).json({
        error: 'El correo no pudo enviarse. Revisá la configuración de Resend.',
      });
    }

    return res.status(200).json({
      ok: true,
      sentTo: order.contact_email,
      links: downloadLinks.length,
    });
  } catch (err) {
    console.error(`[${SCOPE}]`, err);
    return res.status(500).json({
      error: err.message || 'No se pudo reenviar el correo.',
    });
  }
}
