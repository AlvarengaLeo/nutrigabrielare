-- ============================================================
-- Migration 004: Admin roles, RLS updates, Storage bucket
-- ============================================================

-- 1. Expand role constraint to include editor and gestor
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'editor', 'gestor'));

-- 2. Create is_editor() — returns true for editor OR admin
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

-- 3. Create is_gestor() — returns true for gestor OR admin
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
-- NOTE: Create the bucket 'product-images' in Supabase Dashboard first (Storage → New bucket → Public)
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
