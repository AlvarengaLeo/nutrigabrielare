---
name: Manual actions to perform after all phases ship
description: Consolidated post-implementation checklist (DB migrations, env vars, third-party setup, asset uploads) — covers Fases 1–9
type: project
originSessionId: 1783e0e8-917d-4e8c-a0af-93ea3a7191e4
---
The 9 rebuild phases are merged. The code is ready in every case; the items below are human-only setup the code cannot do itself.

## DB migrations (Supabase)
Apply if not yet run on prod (idempotent, safe to re-run):
- `008_catalog_v2.sql` — kinds, reservations, shipping_zones, user_purchases, private bucket `digital-products`
- `009_seed_catalog.sql` — seed catalog data
- `010_orders_shipping_zone.sql` — `shipping_zone_id` + `shipping_zone_name` on `orders` (Fase 8)

Then verify: `/admin/envios` shows the seed zone, and the `digital-products` bucket is **private** in Storage.

## Vercel env vars (Prod + Preview)
- **Wompi:** `WOMPI_APP_ID`, `WOMPI_API_SECRET`, `WOMPI_EVENT_SECRET`, `VITE_WOMPI_APP_ID`
- **Supabase:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` (required by `api/reservations/notify.js` — Fase 7), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Resend (Fase 5):** `RESEND_API_KEY`, `EMAIL_FROM=Nutrigabriela <noreply@nutrigabriela.com>`, `EMAIL_REPLY_TO=hola@nutrigabriela.com`
- **App:** `APP_URL`, `ADMIN_NOTIFY_EMAIL=hola@nutrigabriela.com` (optional copy of each reservation)

## Resend (Fase 5)
Without `RESEND_API_KEY` the senders in `api/_lib/email.js` no-op silently — webhook keeps working but no emails go out.
1. Create Resend account, add `nutrigabriela.com`
2. Copy DKIM + SPF DNS records into the registrar (Hostinger). Wait for **Verified**
3. Issue API key scoped to domain
4. Set Vercel envs above
5. Sandbox test: physical order email + 100% digital order email
Reference: `docs/email-setup.md`

## Wompi (Fases 4, 6)
- Configure webhook URL in Wompi dashboard → `https://<APP_URL>/api/wompi/webhook`
- Confirm `WOMPI_EVENT_SECRET` matches the dashboard
- Sandbox test: physical end-to-end + 100% digital (verify signed URL email + `user_purchases` row)
- Switch to production credentials only after both pass

## Storage / digital products (Fase 6)
- Upload real digital files via `/admin/productos/:id` "Archivo digital"
- Confirm `digital-products` bucket is private
- Validate a logged-in user sees the file in `/cuenta` and the signed URL expires in 7 days

## Reservations (Fase 7)
- End-to-end test on `/reservar/:slug` while logged in
- Confirm user gets confirmation email (requires Resend)
- Confirm `ADMIN_NOTIFY_EMAIL` receives copy
- Status updates work on `/admin/reservas`

## Shipping zones (Fase 8)
- Define real zones in `/admin/envios` (per departamento or grouped)
- Test checkout: zone change recalculates total; free-shipping threshold zeros it out
- After first real shipment: fill courier name + tracking code on `/admin/ordenes/:id` and verify it surfaces on `/tracking/:code`

## Fluir Femenino assets (Fase 9 — pending)
- Provide Fluir Femenino logo + decorative assets → apply in a follow-up PR
- Routes already work: `/fluir-femenino` canonical, `/comunidad` redirects

## Housekeeping
- Verify legacy redirects: `/tienda` → `/pleno`, `/donacion` → `/nutricion-con-alma`, `/comunidad` → `/fluir-femenino`
- Update Google Analytics / Search Console for new URLs (`/pleno/*`, `/fluir-femenino`)
- Optional: code-split main bundle (build warns at ~692 kB, gzip 205 kB) — not blocking
