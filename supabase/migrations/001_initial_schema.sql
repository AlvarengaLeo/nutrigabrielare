-- ═══════════════════════════════════════════════════════════════════
-- Majes de Sivar — Phase 2: Initial Schema
-- ═══════════════════════════════════════════════════════════════════

-- ─── PROFILES ────────────────────────────────────────────────────

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

-- ─── PRODUCT CATEGORIES ─────────────────────────────────────────

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

-- ─── PRODUCTS ────────────────────────────────────────────────────

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

-- ─── PRODUCT IMAGES ──────────────────────────────────────────────

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

-- ─── PRODUCT VARIANTS ────────────────────────────────────────────

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

-- ─── ORDERS ──────────────────────────────────────────────────────

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

-- ─── ORDER ITEMS ─────────────────────────────────────────────────

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

-- ─── ORDER STATUS HISTORY ────────────────────────────────────────

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

-- ─── PAYMENTS (Phase 4 prep) ─────────────────────────────────────

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

-- ─── RPC: Generate next order ID ─────────────────────────────────

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
  where id like 'MJS-' || current_year || '-%';

  order_id := 'MJS-' || current_year || '-' || lpad(next_num::text, 4, '0');
  return order_id;
end;
$$;
