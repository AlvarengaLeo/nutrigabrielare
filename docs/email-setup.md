# Email setup

Transactional emails (purchase confirmations, digital download links, reservation confirmations) are sent through **Resend** from the serverless layer.

## What you need

1. A verified Resend account ([resend.com](https://resend.com))
2. Your custom domain configured in Resend with DNS records added at the registrar
3. Two environment variables in Vercel (Production + Preview)

## Step 1 — Add the domain in Resend

1. Open Resend → **Domains** → **Add domain**
2. Enter `nutrigabriela.com` (or whichever domain the site uses)
3. Resend will show a list of DNS records to add at the domain registrar (CNAME for DKIM, TXT for SPF, optionally a TXT for DMARC)
4. Add those records in the domain's DNS panel (Cloudflare, Hostinger, Namecheap, etc.)
5. Wait for Resend to mark the domain as **Verified** (5–30 minutes typically)

## Step 2 — Issue an API key

1. Resend → **API Keys** → **Create API Key**
2. Scope it to **Sending access** for your verified domain
3. Copy the key — it starts with `re_…`

## Step 3 — Configure environment variables

In **Vercel** (Project Settings → Environment Variables) add:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Nutrigabriela <noreply@nutrigabriela.com>
EMAIL_REPLY_TO=hola@nutrigabriela.com
```

`EMAIL_FROM` controls the visible sender. The address must use the verified domain. `EMAIL_REPLY_TO` is optional but recommended so customers replying go to the inbox the nutritionist actually reads (e.g., a Hostinger or Cloudflare-routed inbox).

For local development, mirror the same vars in `.env`. Without `RESEND_API_KEY` the senders log a warning and skip silently — webhooks and other flows continue to work.

## Step 4 — Receiving inbox (optional)

`EMAIL_REPLY_TO` only matters if customers can actually receive mail at that address. Two cheap setups:

- **Cloudflare Email Routing** (free) — forward `compras@nutrigabriela.com` → personal Gmail. Receives only.
- **Hostinger Mail / Zoho Mail / Google Workspace** — full inbox the nutritionist can use to send and receive.

Both coexist with Resend: Resend handles outgoing transactional mail, the routing/inbox provider handles replies.

## Templates

Three templates live in `api/_lib/email.js`:

| Function | Trigger |
|---|---|
| `sendPurchaseConfirmationEmail` | Wompi webhook approves a physical order |
| `sendDigitalDownloadEmail` | Wompi webhook approves a digital order (download links populated in Fase 6) |
| `sendReservationConfirmationEmail` | Reservation creation flow (Fase 7) |

Each template uses a single `brandLayout` wrapper so visual changes (palette, typography, logo) are made in one place.
