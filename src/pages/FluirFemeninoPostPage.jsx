import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft, Clock } from 'lucide-react';
import { getPostBySlug } from '../services/blogService';
import ProductCard from '../components/ProductCard';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-SV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function FluirFemeninoPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    getPostBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
        } else {
          setPost(data);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-fluir-mist flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fluir-magenta/20 border-t-fluir-magenta rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-fluir-mist flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl text-fluir-ink mb-2">Artículo no encontrado</h1>
          <p className="font-body text-fluir-ink/60 mb-6">Puede que haya sido despublicado o que el enlace esté roto.</p>
          <Link to="/fluir-femenino" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-fluir-magenta text-white font-heading font-bold text-sm">
            Volver a Fluir Femenino
          </Link>
        </div>
      </div>
    );
  }

  const seoTitle = post.seo_title || `${post.title} · Fluir Femenino`;
  const seoDescription = post.seo_description || post.excerpt || '';
  const ogImage = post.og_image_url || post.cover_image_url || '';

  return (
    <article className="min-h-screen bg-fluir-mist text-fluir-ink pb-20">
      <Helmet>
        <title>{seoTitle}</title>
        {seoDescription && <meta name="description" content={seoDescription} />}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={seoTitle} />
        {seoDescription && <meta property="og:description" content={seoDescription} />}
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: seoDescription || undefined,
          image: ogImage || undefined,
          datePublished: post.published_at || undefined,
          dateModified: post.updated_at || undefined,
        })}</script>
      </Helmet>

      {/* Cover */}
      {post.cover_image_url && (
        <div className="w-full h-[40vh] md:h-[55vh] relative overflow-hidden">
          <img
            src={post.cover_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-fluir-ink/30 via-transparent to-fluir-mist" />
        </div>
      )}

      <div className="container mx-auto px-6 max-w-3xl">
        {/* Back link */}
        <div className="pt-8">
          <Link
            to="/fluir-femenino/articulos"
            className="inline-flex items-center gap-2 text-sm font-body text-fluir-ink/60 hover:text-fluir-magenta transition-colors"
          >
            <ArrowLeft size={16} />
            Volver a todos los artículos
          </Link>
        </div>

        {/* Header */}
        <header className="mt-6 mb-10">
          {post.category && (
            <span className="font-body text-[11px] uppercase tracking-[0.28em] text-fluir-magenta">
              {post.category.name}
            </span>
          )}
          <h1 className="font-display font-light text-4xl md:text-5xl lg:text-6xl leading-[1.05] mt-3">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="font-body text-lg text-fluir-ink/75 mt-5 leading-relaxed">
              {post.excerpt}
            </p>
          )}
          <div className="mt-6 flex items-center gap-4 text-xs font-body text-fluir-ink/50">
            {post.published_at && <span>{formatDate(post.published_at)}</span>}
            {post.reading_minutes ? (
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {post.reading_minutes} min lectura
              </span>
            ) : null}
          </div>
        </header>

        {/* Body */}
        <div className="prose prose-stone max-w-none font-body
                        prose-headings:font-display prose-headings:font-light prose-headings:tracking-tight
                        prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                        prose-a:text-fluir-magenta prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-fluir-ink prose-strong:font-semibold
                        prose-blockquote:border-l-fluir-magenta prose-blockquote:text-fluir-ink/80
                        prose-img:rounded-2xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {post.body_md || ''}
          </ReactMarkdown>
        </div>

        {/* Related products */}
        {post.relatedProducts?.length > 0 && (
          <section className="mt-16 pt-12 border-t border-fluir-ink/10">
            <h2 className="font-display font-light text-2xl md:text-3xl mb-6">
              También te puede interesar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {post.relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    price: p.price,
                    kind: p.kind,
                    images: p.cover ? [p.cover] : [],
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
