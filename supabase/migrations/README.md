# Supabase migrations

Migrations are plain SQL files applied in order by filename.

## Apply via Dashboard (recommended for ad-hoc)

1. Open Supabase dashboard → **SQL Editor** → **New query**.
2. Paste the contents of the next pending migration (lowest number not yet applied).
3. Run it. Verify success in the output panel.
4. Repeat for each subsequent file.

## Apply via Supabase CLI

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

`db push` applies any local migrations not yet present in the remote project. Run it after every new file is added here.

## Conventions

- Files are named `NNN_short_description.sql` and applied in numeric order.
- All schema objects live in the `public` schema unless explicitly noted.
- Every table has RLS enabled and explicit policies.
- Helper predicates (`is_admin`, `is_editor`, `is_gestor`) are defined in `004_admin_roles.sql`.
- Migrations should be **idempotent**: use `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, and `CREATE OR REPLACE` so re-running is safe.

## Current files

| File | Purpose |
|---|---|
| `001_initial_schema.sql` | Profiles, products, orders, payments, RLS |
| `002_seed_data.sql` | **Legacy** Majes de Sivar test data (can be deactivated from admin) |
| `003_fix_rls_recursion.sql` | RLS recursion fix on profiles |
| `004_admin_roles.sql` | `editor`/`gestor` roles, helper predicates, `product-images` bucket |
| `005_get_my_profile_rpc.sql` | RPC bypassing RLS lock issues |
| `006_pending_payment_status.sql` | Adds `pending_payment` to orders status enum |
| `007_home_content.sql` | Home CMS table + `home-images` bucket |
| `008_catalog_v2.sql` | Item kinds, reservations, shipping zones, user purchases, digital bucket |
| `009_seed_catalog.sql` | Nutrigabrielare categories + 6 service products |
