// ─── Email module ───────────────────────────────────────────────
// Centralises Resend initialisation, brand template, and the
// three transactional templates the storefront sends:
//   1. Physical purchase confirmation (Wompi webhook)
//   2. Digital purchase + download links (Fase 6)
//   3. Reservation confirmation (Fase 7)
//
// The senders fail silently if RESEND_API_KEY is unset so that the
// caller (e.g. a Wompi webhook) never blocks order processing on
// an email outage. Errors are logged.
// ────────────────────────────────────────────────────────────────

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Paleta de marca (nutri-* en tailwind.config.js)
const BRAND = {
  name: 'Nutrigabriela',
  bg: '#FDF1F4', // rose-mist
  surface: '#FFFFFF',
  text: '#3A1A22', // ink
  textMuted: '#8A6068', // ink-mute
  accent: '#EE7699', // rose — acentos decorativos
  accentDeep: '#D6517B', // rose-deep — botones y links (mejor contraste con blanco)
  rose: '#EE7699',
  border: '#F7D7DE', // line
};

let cachedClient = null;
let cachedLogsClient = null;

function getResendClient() {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set; emails will be skipped');
    return null;
  }
  cachedClient = new Resend(apiKey);
  return cachedClient;
}

function getLogsClient() {
  if (cachedLogsClient) return cachedLogsClient;
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  cachedLogsClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedLogsClient;
}

async function recordEmailLog({
  template,
  recipientEmail,
  status,
  errorMessage = null,
  providerMessageId = null,
  relatedOrderId = null,
  relatedUserId = null,
}) {
  try {
    const supabase = getLogsClient();
    if (!supabase) return;
    const { error } = await supabase.from('email_logs').insert({
      provider: 'resend',
      template,
      recipient_email: recipientEmail,
      status,
      error_message: errorMessage ? String(errorMessage).slice(0, 1000) : null,
      provider_message_id: providerMessageId,
      related_order_id: relatedOrderId,
      related_user_id: relatedUserId,
    });
    if (error) {
      // Never let a logging failure escape — just emit a console warning.
      console.warn('[email] log insert failed (non-blocking):', error.message);
    }
  } catch (err) {
    console.warn('[email] log insert threw (non-blocking):', err);
  }
}

function resolveFrom() {
  return (
    process.env.EMAIL_FROM?.trim() ||
    'Nutrigabriela <shop@nutrigabrielare.com>'
  );
}

function resolveReplyTo() {
  return process.env.EMAIL_REPLY_TO?.trim() || undefined;
}

function resolveAppUrl() {
  return process.env.APP_URL?.trim() || 'https://nutrigabrielare.com';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(amount) {
  const n = Number(amount ?? 0);
  return `$${n.toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-SV', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Brand layout ─────────────────────────────────────────────

function brandLayout({ preheader = '', heading, intro, body, cta }) {
  const appUrl = resolveAppUrl();
  const helpEmail = resolveReplyTo() ?? 'shop@nutrigabrielare.com';
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${BRAND.text};">
    <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}${'&zwnj;&nbsp;'.repeat(30)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
            <tr>
              <td align="center" style="padding:0 8px 10px;">
                <a href="${appUrl}" style="text-decoration:none;border:0;outline:none;">
                  <img src="${appUrl}/media/logo-nutri.png" width="56" height="56" alt="${BRAND.name}" style="display:block;border:0;outline:none;font-size:14px;color:${BRAND.text};" />
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 8px 28px;">
                <a href="${appUrl}" style="text-decoration:none;color:${BRAND.text};font-weight:800;font-size:20px;letter-spacing:-0.01em;">${BRAND.name}</a>
              </td>
            </tr>

            <tr>
              <td style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:24px;padding:44px 32px 40px;">
                <h1 style="margin:0 0 14px;font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.01em;color:${BRAND.text};text-align:center;">
                  ${heading}
                </h1>
                <table role="presentation" align="center" width="48" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 24px;">
                  <tr><td height="3" bgcolor="${BRAND.accent}" style="font-size:1px;line-height:3px;border-radius:999px;">&nbsp;</td></tr>
                </table>
                ${intro ? `<p style="margin:0 0 28px;color:${BRAND.textMuted};font-size:16px;line-height:1.55;text-align:center;">${intro}</p>` : ''}
                ${body}
                ${
                  cta
                    ? `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:32px auto 0;">
                        <tr>
                          <td align="center" bgcolor="${BRAND.accentDeep}" style="border-radius:999px;">
                            <a href="${escapeHtml(cta.href)}"
                               style="display:inline-block;background:${BRAND.accentDeep};color:#FFFFFF;text-decoration:none;padding:14px 30px;border-radius:999px;font-weight:700;font-size:15px;letter-spacing:0.02em;">
                              ${escapeHtml(cta.label)}
                            </a>
                          </td>
                        </tr>
                      </table>`
                    : ''
                }
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:28px 8px;color:${BRAND.textMuted};font-size:12px;line-height:1.6;text-align:center;">
                <p style="margin:0 0 6px;">Gracias por confiar en ${BRAND.name}.</p>
                <p style="margin:0;">
                  Si necesitás ayuda escribínos a
                  <a href="mailto:${escapeHtml(helpEmail)}" style="color:${BRAND.accentDeep};font-weight:700;">${escapeHtml(helpEmail)}</a>.
                </p>
              </td>
            </tr>
          </table>
          <!--[if mso]></td></tr></table><![endif]-->
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function itemRow(item) {
  const price = formatCurrency((item.price ?? 0) * (item.quantity ?? 1));
  const variant = [item.size, item.color].filter((v) => v && v !== 'Único' && v !== 'Estándar').join(' · ');
  return `<tr>
    <td style="padding:14px 0;border-bottom:1px solid ${BRAND.border};vertical-align:top;">
      <div style="font-size:14px;font-weight:700;color:${BRAND.text};">${escapeHtml(item.product_name ?? item.name)}</div>
      ${variant ? `<div style="font-size:12px;color:${BRAND.textMuted};margin-top:2px;">${escapeHtml(variant)}</div>` : ''}
      <div style="font-size:12px;color:${BRAND.textMuted};margin-top:2px;">Cantidad: ${item.quantity ?? 1}</div>
    </td>
    <td align="right" style="padding:14px 0;border-bottom:1px solid ${BRAND.border};vertical-align:top;font-size:14px;font-weight:700;color:${BRAND.text};">
      ${price}
    </td>
  </tr>`;
}

function totalsBlock({ subtotal, shippingCost, total }) {
  const rows = [
    { label: 'Subtotal', value: formatCurrency(subtotal) },
    shippingCost > 0 ? { label: 'Envío', value: formatCurrency(shippingCost) } : null,
    { label: 'Total', value: formatCurrency(total), bold: true },
  ].filter(Boolean);

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
    ${rows
      .map(
        (r) => `<tr>
          <td style="padding:6px 0;font-size:${r.bold ? '16px' : '13px'};color:${BRAND.textMuted};${r.bold ? `font-weight:700;color:${BRAND.text};` : ''}">${r.label}</td>
          <td align="right" style="padding:6px 0;font-size:${r.bold ? '16px' : '13px'};color:${r.bold ? BRAND.text : BRAND.textMuted};${r.bold ? 'font-weight:800;' : ''}">${r.value}</td>
        </tr>`
      )
      .join('')}
  </table>`;
}

// ─── Templates ────────────────────────────────────────────────

export function purchasePhysicalTemplate({ order, items, customer }) {
  const appUrl = resolveAppUrl();
  const intro = `Hola ${escapeHtml(customer?.firstName ?? '')}, recibimos tu pago y ya estamos preparando tu pedido. Te avisaremos cuando salga en camino.`;
  const itemsTable = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <thead>
        <tr>
          <th align="left" style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:${BRAND.textMuted};font-weight:700;padding:0 0 10px;border-bottom:1px solid ${BRAND.border};">Producto</th>
          <th align="right" style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:${BRAND.textMuted};font-weight:700;padding:0 0 10px;border-bottom:1px solid ${BRAND.border};">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(itemRow).join('')}
      </tbody>
    </table>
    ${totalsBlock({ subtotal: order.subtotal, shippingCost: order.shipping_cost, total: order.total })}
  `;

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td align="center" bgcolor="${BRAND.bg}" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:16px;padding:18px 20px;font-size:13px;line-height:1.6;color:${BRAND.text};text-align:center;">
          <div style="color:${BRAND.accentDeep};font-size:11px;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px;">Número de pedido</div>
          <div style="font-weight:800;font-size:18px;">${escapeHtml(order.id)}</div>
          ${order.tracking_code ? `<div style="margin-top:8px;color:${BRAND.textMuted};font-size:12px;">Código de seguimiento: <span style="color:${BRAND.text};font-weight:700;">${escapeHtml(order.tracking_code)}</span></div>` : ''}
        </td>
      </tr>
    </table>
    ${itemsTable}
  `;

  const trackingUrl = order.tracking_code
    ? `${appUrl}/tracking/${encodeURIComponent(order.tracking_code)}`
    : `${appUrl}/cuenta`;

  return brandLayout({
    preheader: `Confirmamos tu pedido ${order.id}`,
    heading: 'Tu pedido está confirmado',
    intro,
    body,
    cta: { label: 'Seguir mi pedido', href: trackingUrl },
  });
}

export function purchaseDigitalTemplate({ order, items, customer, downloadLinks = [], orderUrl }) {
  const intro = `Hola ${escapeHtml(customer?.firstName ?? '')}, gracias por tu compra. Aquí están los enlaces para descargar lo que adquiriste.`;
  const linksHtml = downloadLinks.length
    ? downloadLinks
        .map(
          (link) => `<tr>
            <td align="center" style="padding:16px 0;border-bottom:1px solid ${BRAND.border};text-align:center;">
              <div style="font-size:14px;font-weight:700;color:${BRAND.text};margin-bottom:10px;">${escapeHtml(link.name)}</div>
              <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${BRAND.accentDeep}" style="border-radius:999px;">
                    <a href="${escapeHtml(link.url)}" style="display:inline-block;background:${BRAND.accentDeep};color:#FFFFFF;text-decoration:none;padding:10px 22px;border-radius:999px;font-weight:700;font-size:13px;">Descargar</a>
                  </td>
                </tr>
              </table>
              ${link.expiresAt ? `<div style="margin-top:10px;color:${BRAND.textMuted};font-size:11px;">Disponible hasta el ${formatDate(link.expiresAt)}</div>` : ''}
            </td>
          </tr>`
        )
        .join('')
    : `<tr><td align="center" style="padding:14px 0;color:${BRAND.textMuted};font-size:13px;text-align:center;">Te enviaremos los enlaces de descarga en un momento.</td></tr>`;

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td align="center" bgcolor="${BRAND.bg}" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:16px;padding:18px 20px;font-size:13px;line-height:1.6;color:${BRAND.text};text-align:center;">
          <div style="color:${BRAND.accentDeep};font-size:11px;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px;">Número de pedido</div>
          <div style="font-weight:800;font-size:18px;">${escapeHtml(order.id)}</div>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${linksHtml}</table>
    ${totalsBlock({ subtotal: order.subtotal, shippingCost: 0, total: order.total })}
    <p style="margin-top:24px;font-size:12px;line-height:1.6;color:${BRAND.textMuted};">
      Los enlaces de este correo duran 7 días. Si vencen, podés generar enlaces nuevos desde la página de tu pedido — sin iniciar sesión.
    </p>
  `;

  return brandLayout({
    preheader: `Tus descargas están listas — pedido ${order.id}`,
    heading: '¡Listo! Tus productos digitales',
    intro,
    body,
    cta: { label: 'Ver mi pedido', href: orderUrl || `${resolveAppUrl()}/gracias?order=${encodeURIComponent(order.id)}` },
  });
}

export function reservationConfirmationTemplate({ reservation, service, customer }) {
  const intro = `Hola ${escapeHtml(customer?.firstName ?? reservation.contact_name ?? '')}, recibimos tu solicitud. Te confirmaremos la fecha exacta a la brevedad.`;
  const dateLine = reservation.preferred_date
    ? `<div style="color:${BRAND.textMuted};font-size:12px;">Fecha preferida: <span style="color:${BRAND.text};font-weight:700;">${formatDate(reservation.preferred_date)}${reservation.preferred_time ? ` · ${escapeHtml(reservation.preferred_time)}` : ''}</span></div>`
    : '';
  const notesLine = reservation.notes
    ? `<div style="margin-top:10px;color:${BRAND.textMuted};font-size:12px;">Notas: <span style="color:${BRAND.text};">${escapeHtml(reservation.notes)}</span></div>`
    : '';

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td align="center" bgcolor="${BRAND.bg}" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:16px;padding:18px 20px;font-size:13px;line-height:1.6;text-align:center;">
          <div style="color:${BRAND.accentDeep};font-size:11px;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px;">Servicio</div>
          <div style="font-weight:800;font-size:18px;color:${BRAND.text};">${escapeHtml(service?.name ?? 'Consulta')}</div>
          ${dateLine}
          ${notesLine}
        </td>
      </tr>
    </table>
    <p style="margin:0;color:${BRAND.textMuted};font-size:13px;line-height:1.6;">
      Te contactaremos por correo o WhatsApp para coordinar el día y la hora final. Si necesitás reagendar, simplemente respondé este correo.
    </p>
  `;

  return brandLayout({
    preheader: `Recibimos tu reserva — ${service?.name ?? 'Consulta'}`,
    heading: 'Tu reserva está en revisión',
    intro,
    body,
  });
}

// ─── Senders ──────────────────────────────────────────────────

async function send({ to, subject, html, meta }) {
  const template = meta?.template ?? 'unknown';
  const relatedOrderId = meta?.relatedOrderId ?? null;
  const relatedUserId = meta?.relatedUserId ?? null;
  const recipientForLog = to ?? '(missing)';

  const client = getResendClient();
  if (!client) {
    await recordEmailLog({
      template,
      recipientEmail: recipientForLog,
      status: 'skipped',
      errorMessage: 'RESEND_API_KEY not set',
      relatedOrderId,
      relatedUserId,
    });
    return { skipped: true };
  }
  if (!to) {
    console.warn('[email] missing "to" address; skipping');
    await recordEmailLog({
      template,
      recipientEmail: recipientForLog,
      status: 'skipped',
      errorMessage: 'Missing recipient address',
      relatedOrderId,
      relatedUserId,
    });
    return { skipped: true };
  }

  try {
    const result = await client.emails.send({
      from: resolveFrom(),
      to,
      // Resend v6 espera camelCase; con reply_to el SDK lo descarta en silencio
      replyTo: resolveReplyTo(),
      subject,
      html,
    });
    if (result.error) {
      console.error('[email] send failed:', result.error);
      await recordEmailLog({
        template,
        recipientEmail: to,
        status: 'failed',
        errorMessage: result.error?.message || JSON.stringify(result.error),
        relatedOrderId,
        relatedUserId,
      });
      return { error: result.error };
    }
    await recordEmailLog({
      template,
      recipientEmail: to,
      status: 'sent',
      providerMessageId: result.data?.id ?? null,
      relatedOrderId,
      relatedUserId,
    });
    return { id: result.data?.id };
  } catch (err) {
    console.error('[email] send threw:', err);
    await recordEmailLog({
      template,
      recipientEmail: to,
      status: 'failed',
      errorMessage: err?.message || String(err),
      relatedOrderId,
      relatedUserId,
    });
    return { error: err };
  }
}

export function sendPurchaseConfirmationEmail({ order, items, customer }) {
  return send({
    to: order.contact_email || customer?.email,
    subject: `Confirmamos tu pedido ${order.id}`,
    html: purchasePhysicalTemplate({ order, items, customer }),
    meta: {
      template: 'purchase_confirm',
      relatedOrderId: order.id,
      relatedUserId: order.user_id ?? null,
    },
  });
}

export function sendDigitalDownloadEmail({ order, items, customer, downloadLinks, orderUrl }) {
  return send({
    to: order.contact_email || customer?.email,
    subject: `Tus descargas están listas — ${order.id}`,
    html: purchaseDigitalTemplate({ order, items, customer, downloadLinks, orderUrl }),
    meta: {
      template: 'digital_download',
      relatedOrderId: order.id,
      relatedUserId: order.user_id ?? null,
    },
  });
}

export function sendReservationConfirmationEmail({ reservation, service, customer }) {
  return send({
    to: reservation.contact_email || customer?.email,
    subject: `Recibimos tu reserva: ${service?.name ?? 'consulta'}`,
    html: reservationConfirmationTemplate({ reservation, service, customer }),
    meta: {
      template: 'reservation_confirm',
      relatedOrderId: null,
      relatedUserId: reservation.user_id ?? null,
    },
  });
}
