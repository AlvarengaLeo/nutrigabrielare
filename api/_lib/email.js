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

const BRAND = {
  name: 'Nutrigabriela',
  bg: '#F5F0EB',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#6F6A65',
  accent: '#1A1A1A',
  rose: '#FB7185',
  border: '#E8E2DA',
};

let cachedClient = null;

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

function resolveFrom() {
  return (
    process.env.EMAIL_FROM?.trim() ||
    'Nutrigabriela <noreply@nutrigabriela.com>'
  );
}

function resolveReplyTo() {
  return process.env.EMAIL_REPLY_TO?.trim() || undefined;
}

function resolveAppUrl() {
  return process.env.APP_URL?.trim() || 'https://nutrigabriela.com';
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
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${BRAND.text};">
    <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
            <tr>
              <td align="left" style="padding:0 8px 24px;">
                <a href="${appUrl}" style="text-decoration:none;color:${BRAND.text};font-weight:800;font-size:20px;letter-spacing:-0.01em;">
                  ${BRAND.name}
                </a>
              </td>
            </tr>

            <tr>
              <td style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:24px;padding:40px 32px;">
                <h1 style="margin:0 0 16px;font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.01em;color:${BRAND.text};">
                  ${heading}
                </h1>
                ${intro ? `<p style="margin:0 0 28px;color:${BRAND.textMuted};font-size:16px;line-height:1.55;">${intro}</p>` : ''}
                ${body}
                ${
                  cta
                    ? `<div style="margin-top:32px;">
                        <a href="${escapeHtml(cta.href)}"
                           style="display:inline-block;background:${BRAND.accent};color:#FFFFFF;text-decoration:none;padding:14px 26px;border-radius:999px;font-weight:700;font-size:14px;letter-spacing:0.02em;">
                          ${escapeHtml(cta.label)}
                        </a>
                      </div>`
                    : ''
                }
              </td>
            </tr>

            <tr>
              <td style="padding:24px 8px;color:${BRAND.textMuted};font-size:12px;line-height:1.6;">
                <p style="margin:0 0 6px;">Gracias por confiar en Nutrigabriela.</p>
                <p style="margin:0;">
                  Si necesitás ayuda escribínos a
                  <a href="mailto:${escapeHtml(resolveReplyTo() ?? 'hola@nutrigabriela.com')}" style="color:${BRAND.text};">${escapeHtml(resolveReplyTo() ?? 'hola@nutrigabriela.com')}</a>.
                </p>
              </td>
            </tr>
          </table>
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
          <th align="right" style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:${BRAND.textMuted};font-weight:700;padding:0 0 10px;border-bottom:1px solid ${BRAND.border};">Importe</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(itemRow).join('')}
      </tbody>
    </table>
    ${totalsBlock({ subtotal: order.subtotal, shippingCost: order.shipping_cost, total: order.total })}
  `;

  const body = `
    <div style="background:${BRAND.bg};border-radius:16px;padding:18px 20px;margin-bottom:24px;font-size:13px;line-height:1.6;color:${BRAND.text};">
      <div style="color:${BRAND.textMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px;">Número de pedido</div>
      <div style="font-weight:800;font-size:18px;">${escapeHtml(order.id)}</div>
      ${order.tracking_code ? `<div style="margin-top:8px;color:${BRAND.textMuted};font-size:12px;">Código de seguimiento: <span style="color:${BRAND.text};font-weight:700;">${escapeHtml(order.tracking_code)}</span></div>` : ''}
    </div>
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

export function purchaseDigitalTemplate({ order, items, customer, downloadLinks = [] }) {
  const intro = `Hola ${escapeHtml(customer?.firstName ?? '')}, gracias por tu compra. Aquí están los enlaces para descargar lo que adquiriste.`;
  const linksHtml = downloadLinks.length
    ? downloadLinks
        .map(
          (link) => `<tr>
            <td style="padding:14px 0;border-bottom:1px solid ${BRAND.border};">
              <div style="font-size:14px;font-weight:700;color:${BRAND.text};margin-bottom:6px;">${escapeHtml(link.name)}</div>
              <a href="${escapeHtml(link.url)}" style="display:inline-block;background:${BRAND.accent};color:#FFFFFF;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:700;font-size:12px;">Descargar</a>
              ${link.expiresAt ? `<div style="margin-top:8px;color:${BRAND.textMuted};font-size:11px;">Disponible hasta el ${formatDate(link.expiresAt)}</div>` : ''}
            </td>
          </tr>`
        )
        .join('')
    : `<tr><td style="padding:14px 0;color:${BRAND.textMuted};font-size:13px;">Te enviaremos los enlaces de descarga en un momento.</td></tr>`;

  const body = `
    <div style="background:${BRAND.bg};border-radius:16px;padding:18px 20px;margin-bottom:24px;font-size:13px;line-height:1.6;color:${BRAND.text};">
      <div style="color:${BRAND.textMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px;">Número de pedido</div>
      <div style="font-weight:800;font-size:18px;">${escapeHtml(order.id)}</div>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${linksHtml}</table>
    ${totalsBlock({ subtotal: order.subtotal, shippingCost: 0, total: order.total })}
    <p style="margin-top:24px;font-size:12px;line-height:1.6;color:${BRAND.textMuted};">
      Los enlaces tienen una validez de 7 días. Si tu sesión expira, podés volver a descargar tus productos desde tu cuenta.
    </p>
  `;

  return brandLayout({
    preheader: `Tus descargas están listas — pedido ${order.id}`,
    heading: '¡Listo! Tus productos digitales',
    intro,
    body,
    cta: { label: 'Ir a mi cuenta', href: `${resolveAppUrl()}/cuenta` },
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
    <div style="background:${BRAND.bg};border-radius:16px;padding:18px 20px;margin-bottom:24px;font-size:13px;line-height:1.6;">
      <div style="color:${BRAND.textMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px;">Servicio</div>
      <div style="font-weight:800;font-size:18px;color:${BRAND.text};">${escapeHtml(service?.name ?? 'Consulta')}</div>
      ${dateLine}
      ${notesLine}
    </div>
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

async function send({ to, subject, html }) {
  const client = getResendClient();
  if (!client) return { skipped: true };
  if (!to) {
    console.warn('[email] missing "to" address; skipping');
    return { skipped: true };
  }

  try {
    const result = await client.emails.send({
      from: resolveFrom(),
      to,
      reply_to: resolveReplyTo(),
      subject,
      html,
    });
    if (result.error) {
      console.error('[email] send failed:', result.error);
      return { error: result.error };
    }
    return { id: result.data?.id };
  } catch (err) {
    console.error('[email] send threw:', err);
    return { error: err };
  }
}

export function sendPurchaseConfirmationEmail({ order, items, customer }) {
  return send({
    to: order.contact_email || customer?.email,
    subject: `Confirmamos tu pedido ${order.id}`,
    html: purchasePhysicalTemplate({ order, items, customer }),
  });
}

export function sendDigitalDownloadEmail({ order, items, customer, downloadLinks }) {
  return send({
    to: order.contact_email || customer?.email,
    subject: `Tus descargas están listas — ${order.id}`,
    html: purchaseDigitalTemplate({ order, items, customer, downloadLinks }),
  });
}

export function sendReservationConfirmationEmail({ reservation, service, customer }) {
  return send({
    to: reservation.contact_email || customer?.email,
    subject: `Recibimos tu reserva: ${service?.name ?? 'consulta'}`,
    html: reservationConfirmationTemplate({ reservation, service, customer }),
  });
}
