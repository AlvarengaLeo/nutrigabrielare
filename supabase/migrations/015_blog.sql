-- 015_blog.sql
-- "Fluir Femenino" editorial blog. Posts are Markdown documents managed
-- from /admin/fluir-femenino and surfaced publicly at /fluir-femenino
-- and /fluir-femenino/articulos/:slug.
--
-- Schema is additive: nothing else in the DB changes. Posts can reference
-- products via the related_product_ids text[] (no FK to allow soft references
-- to products that may later be deactivated).

-- ─── post_categories ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone read active post categories" ON public.post_categories;
CREATE POLICY "Anyone read active post categories"
  ON public.post_categories FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Editors manage post categories" ON public.post_categories;
CREATE POLICY "Editors manage post categories"
  ON public.post_categories FOR ALL
  USING (public.is_editor())
  WITH CHECK (public.is_editor());

-- ─── posts ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  body_md text NOT NULL DEFAULT '',
  cover_image_url text,
  category_id text REFERENCES public.post_categories(id) ON DELETE SET NULL,
  related_product_ids text[] NOT NULL DEFAULT '{}',
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reading_minutes int,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  og_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_published_at
  ON public.posts(published, published_at DESC)
  WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_posts_category_published
  ON public.posts(category_id, published_at DESC)
  WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);

-- Reuse the existing set_updated_at trigger function (defined in 008_catalog_v2.sql)
DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone read published posts" ON public.posts;
CREATE POLICY "Anyone read published posts"
  ON public.posts FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Editors read all posts" ON public.posts;
CREATE POLICY "Editors read all posts"
  ON public.posts FOR SELECT
  USING (public.is_editor());

DROP POLICY IF EXISTS "Editors manage posts" ON public.posts;
CREATE POLICY "Editors manage posts"
  ON public.posts FOR ALL
  USING (public.is_editor())
  WITH CHECK (public.is_editor());

-- ─── post_tags ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_tags (
  id text PRIMARY KEY,
  name text NOT NULL
);

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone read post tags" ON public.post_tags;
CREATE POLICY "Anyone read post tags"
  ON public.post_tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Editors manage post tags" ON public.post_tags;
CREATE POLICY "Editors manage post tags"
  ON public.post_tags FOR ALL
  USING (public.is_editor())
  WITH CHECK (public.is_editor());

-- ─── post_to_tag ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_to_tag (
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id text REFERENCES public.post_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE public.post_to_tag ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone read post_to_tag" ON public.post_to_tag;
CREATE POLICY "Anyone read post_to_tag"
  ON public.post_to_tag FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Editors manage post_to_tag" ON public.post_to_tag;
CREATE POLICY "Editors manage post_to_tag"
  ON public.post_to_tag FOR ALL
  USING (public.is_editor())
  WITH CHECK (public.is_editor());

-- ─── Storage bucket for blog cover images ──────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read of blog-images
DROP POLICY IF EXISTS "Public read blog-images" ON storage.objects;
CREATE POLICY "Public read blog-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- Editors can upload/replace
DROP POLICY IF EXISTS "Editors upload blog-images" ON storage.objects;
CREATE POLICY "Editors upload blog-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND public.is_editor());

DROP POLICY IF EXISTS "Editors update blog-images" ON storage.objects;
CREATE POLICY "Editors update blog-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-images' AND public.is_editor());

DROP POLICY IF EXISTS "Editors delete blog-images" ON storage.objects;
CREATE POLICY "Editors delete blog-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND public.is_editor());
