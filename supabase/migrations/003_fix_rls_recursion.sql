-- ============================================================
-- Migration 003: Fix RLS infinite recursion on profiles table
-- ============================================================
-- Problem: Admin policies query public.profiles to check role,
-- but that triggers the SELECT policy on profiles again → infinite loop.
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

-- ── profiles ──
create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- ── product_categories ──
create policy "Anyone can read active categories"
  on public.product_categories for select
  using (active = true);

create policy "Admins can manage categories"
  on public.product_categories for all
  using (public.is_admin());

-- ── products ──
create policy "Anyone can read active products"
  on public.products for select
  using (active = true);

create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());

-- ── product_images ──
create policy "Anyone can read images"
  on public.product_images for select
  using (true);

create policy "Admins can manage images"
  on public.product_images for all
  using (public.is_admin());

-- ── product_variants ──
create policy "Anyone can read active variants"
  on public.product_variants for select
  using (active = true);

create policy "Admins can manage variants"
  on public.product_variants for all
  using (public.is_admin());

-- ── orders ──
create policy "Users can read own orders"
  on public.orders for select
  using (user_id = auth.uid());

create policy "Users can insert own orders"
  on public.orders for insert
  with check (user_id = auth.uid());

create policy "Admins can manage orders"
  on public.orders for all
  using (public.is_admin());

-- ── order_items ──
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

-- ── order_status_history ──
create policy "Anyone can read status history"
  on public.order_status_history for select
  using (true);

create policy "Admins can manage status history"
  on public.order_status_history for all
  using (public.is_admin());

-- ── payments ──
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
