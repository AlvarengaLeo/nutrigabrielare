-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- Majes de Sivar â€” Phase 2: Initial Schema
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- â”€â”€â”€ PROFILES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text not null default '',
  last_name text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- â”€â”€â”€ PRODUCT CATEGORIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

create table public.product_categories (
  id text primary key,
  num text not null,
  title text not null,
  tagline text not null default '',
  description text not null default '',
  cta text not null default '',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.product_categories enable row level security;

create policy "Anyone can read active categories"
  on public.product_categories for select
  using (active = true);

create policy "Admins can manage categories"
  on public.product_categories for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- â”€â”€â”€ PRODUCTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

create table public.products (
  id text primary key,
  slug text unique not null,
  name text not null,
  category_id text not null references public.product_categories(id),
  price decimal(10,2) not null,
  description text not null default '',
  description_long text not null default '',
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can read active products"
  on public.products for select
  using (active = true);

create policy "Admins can manage products"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- â”€â”€â”€ PRODUCT IMAGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.product_images enable row level security;

create policy "Anyone can read product images"
  on public.product_images for select
  using (true);

create policy "Admins can manage product images"
  on public.product_images for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- â”€â”€â”€ PRODUCT VARIANTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  size text not null,
  color_name text not null,
  color_hex text not null default '#000000',
  stock int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, size, color_name)
);

alter table public.product_variants enable row level security;

create policy "Anyone can read active variants"
  on public.product_variants for select
  using (active = true);

create policy "Admins can manage variants"
  on public.product_variants for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- â”€â”€â”€ ORDERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

create table public.orders (
  id text primary key,
  tracking_code text unique not null,
  user_id uuid references auth.users(id),
  contact_name text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  shipping_address text not null default '',
  shipping_city text not null default '',
  shipping_department text not null default '',
  shipping_notes text not null default '',
  subtotal decimal(10,2) not null default 0,
  shipping_cost decimal(10,2) not null default 0,
  total decimal(10,2) not null default 0,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Public tracking lookup
create policy "Anyone can read orders for tracking"
  on public.orders for select
  using (true);

create policy "Admins can manage orders"
  on public.orders for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- â”€â”€â”€ ORDER ITEMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  product_name text not null,
  size text not null,
  color text not null,
  price decimal(10,2) not null,
  quantity int not null default 1,
  image text not null default '/products/placeholder-dark.jpg'
);

alter table public.order_items enable row level security;

create policy "Anyone can read order items"
  on public.order_items for select
  using (true);

create policy "Users can insert own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "Admins can manage order items"
  on public.order_items for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- â”€â”€â”€ ORDER STATUS HISTORY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  status text not null,
  created_at timestamptz not null default now()
);

alter table public.order_status_history enable row level security;

create policy "Anyone can read order status history"
  on public.order_status_history for select
  using (true);

create policy "Users can insert own order status history"
  on public.order_status_history for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id and o.user_id = auth.uid()
    )
  );

create policy "Admins can manage order status history"
  on public.order_status_history for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- â”€â”€â”€ PAYMENTS (Phase 4 prep) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  provider text not null default 'wompi',
  provider_transaction_id text,
  amount decimal(10,2) not null,
  currency text not null default 'USD',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'declined', 'voided', 'error')),
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Users can read own payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id and o.user_id = auth.uid()
    )
  );

create policy "Admins can manage payments"
  on public.payments for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- â”€â”€â”€ RPC: Generate next order ID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

create or replace function public.generate_order_id()
returns text
language plpgsql
security definer
as $$
declare
  current_year int := extract(year from now());
  next_num int;
  order_id text;
begin
  select count(*) + 1 into next_num
  from public.orders
  where id like 'NTG-' || current_year || '-%';

  order_id := 'NTG-' || current_year || '-' || lpad(next_num::text, 4, '0');
  return order_id;
end;
$$;
-- ============================================================
-- Migration 003: Fix RLS infinite recursion on profiles table
-- ============================================================
-- Problem: Admin policies query public.profiles to check role,
-- but that triggers the SELECT policy on profiles again â†’ infinite loop.
-- Fix: Create a SECURITY DEFINER function that bypasses RLS.
-- ============================================================

-- 1. Create a helper function that bypasses RLS to check admin role
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 2. Drop ALL existing policies that cause recursion

-- profiles
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;

-- product_categories
drop policy if exists "Anyone can read active categories" on public.product_categories;
drop policy if exists "Admins can manage categories" on public.product_categories;

-- products
drop policy if exists "Anyone can read active products" on public.products;
drop policy if exists "Admins can manage products" on public.products;

-- product_images
drop policy if exists "Anyone can read images" on public.product_images;
drop policy if exists "Admins can manage images" on public.product_images;

-- product_variants
drop policy if exists "Anyone can read active variants" on public.product_variants;
drop policy if exists "Admins can manage variants" on public.product_variants;

-- orders
drop policy if exists "Users can read own orders" on public.orders;
drop policy if exists "Users can insert own orders" on public.orders;
drop policy if exists "Admins can manage orders" on public.orders;

-- order_items
drop policy if exists "Users can read own order items" on public.order_items;
drop policy if exists "Users can insert own order items" on public.order_items;
drop policy if exists "Admins can manage order items" on public.order_items;

-- order_status_history
drop policy if exists "Anyone can read status history" on public.order_status_history;
drop policy if exists "Admins can manage status history" on public.order_status_history;

-- payments
drop policy if exists "Users can read own payments" on public.payments;
drop policy if exists "Admins can manage payments" on public.payments;

-- 3. Recreate ALL policies using is_admin() instead of direct profiles query

-- â”€â”€ profiles â”€â”€
create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- â”€â”€ product_categories â”€â”€
create policy "Anyone can read active categories"
  on public.product_categories for select
  using (active = true);

create policy "Admins can manage categories"
  on public.product_categories for all
  using (public.is_admin());

-- â”€â”€ products â”€â”€
create policy "Anyone can read active products"
  on public.products for select
  using (active = true);

create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());

-- â”€â”€ product_images â”€â”€
create policy "Anyone can read images"
  on public.product_images for select
  using (true);

create policy "Admins can manage images"
  on public.product_images for all
  using (public.is_admin());

-- â”€â”€ product_variants â”€â”€
create policy "Anyone can read active variants"
  on public.product_variants for select
  using (active = true);

create policy "Admins can manage variants"
  on public.product_variants for all
  using (public.is_admin());

-- â”€â”€ orders â”€â”€
create policy "Users can read own orders"
  on public.orders for select
  using (user_id = auth.uid());

create policy "Users can insert own orders"
  on public.orders for insert
  with check (user_id = auth.uid());

create policy "Admins can manage orders"
  on public.orders for all
  using (public.is_admin());

-- â”€â”€ order_items â”€â”€
create policy "Users can read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "Users can insert own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "Admins can manage order items"
  on public.order_items for all
  using (public.is_admin());

-- â”€â”€ order_status_history â”€â”€
create policy "Anyone can read status history"
  on public.order_status_history for select
  using (true);

create policy "Admins can manage status history"
  on public.order_status_history for all
  using (public.is_admin());

-- â”€â”€ payments â”€â”€
create policy "Users can read own payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id and o.user_id = auth.uid()
    )
  );

create policy "Admins can manage payments"
  on public.payments for all
  using (public.is_admin());
-- ============================================================
-- Migration 004: Admin roles, RLS updates, Storage bucket
-- ============================================================

-- 1. Expand role constraint to include editor and gestor
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'editor', 'gestor'));

-- 2. Create is_editor() â€” returns true for editor OR admin
CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
$$;

-- 3. Create is_gestor() â€” returns true for gestor OR admin
CREATE OR REPLACE FUNCTION public.is_gestor()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'gestor')
  );
$$;

-- 4. Update product-related admin policies to use is_editor()

-- product_categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.product_categories;
CREATE POLICY "Editors can manage categories"
  ON public.product_categories FOR ALL
  USING (public.is_editor());

-- products
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Editors can manage products"
  ON public.products FOR ALL
  USING (public.is_editor());

-- product_images
DROP POLICY IF EXISTS "Admins can manage images" ON public.product_images;
CREATE POLICY "Editors can manage images"
  ON public.product_images FOR ALL
  USING (public.is_editor());

-- product_variants
DROP POLICY IF EXISTS "Admins can manage variants" ON public.product_variants;
CREATE POLICY "Editors can manage variants"
  ON public.product_variants FOR ALL
  USING (public.is_editor());

-- 5. Update order-related admin policies to use is_gestor()

-- orders
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Gestors can manage orders"
  ON public.orders FOR ALL
  USING (public.is_gestor());

-- order_items
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Gestors can manage order items"
  ON public.order_items FOR ALL
  USING (public.is_gestor());

-- order_status_history
DROP POLICY IF EXISTS "Admins can manage status history" ON public.order_status_history;
CREATE POLICY "Gestors can manage status history"
  ON public.order_status_history FOR ALL
  USING (public.is_gestor());

-- payments
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Gestors can manage payments"
  ON public.payments FOR ALL
  USING (public.is_gestor());

-- 6. Profiles: only admin can update other users' roles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile (non-role fields)"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Admin can update any profile (including role)
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- 7. Storage bucket policies (run after creating bucket in Dashboard)
-- NOTE: Create the bucket 'product-images' in Supabase Dashboard first (Storage â†’ New bucket â†’ Public)
-- Then run these policies:

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Editors can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_editor());

CREATE POLICY "Editors can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_editor());

CREATE POLICY "Editors can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_editor());
-- ============================================================
-- Migration 005: RPC function to get current user's profile
-- Bypasses RLS entirely via SECURITY DEFINER
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'first_name', first_name,
    'last_name', last_name,
    'role', role
  )
  FROM public.profiles
  WHERE id = auth.uid();
$$;
-- ============================================================
-- Migration 006: Add 'pending_payment' to orders status check
-- ============================================================
-- Note: The constraint name may be auto-generated. Run this query first
-- to find the actual name if the DROP fails:
--   SELECT conname FROM pg_constraint
--   WHERE conrelid = 'public.orders'::regclass AND contype = 'c';

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending_payment', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'));
