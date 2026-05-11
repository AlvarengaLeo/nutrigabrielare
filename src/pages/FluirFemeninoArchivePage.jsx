import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, ArrowLeft } from 'lucide-react';
import { getPublishedPosts, getPostCategories } from '../services/blogService';

const PAGE_SIZE = 12;

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-SV', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function FluirFemeninoArchivePage() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPostCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPublishedPosts({
      category: activeCategory,
      search,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    })
      .then(({ rows, total: t }) => {
        if (cancelled) return;
        setPosts(rows);
        setTotal(t);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCategory, search, page]);

  function handleCategoryChange(id) {
    setActiveCategory(id);
    setPage(0);
  }

  function handleSearchChange(value) {
    setSearch(value);
    setPage(0);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-fluir-mist text-fluir-ink pb-20">
      <Helmet>
        <title>Diario · Fluir Femenino</title>
        <meta name="description" content="Artículos sobre nutrición, salud hormonal, recetas y bienestar femenino." />
      </Helmet>

      {/* Header */}
      <section className="px-6 pt-28 pb-12">
        <div className="container mx-auto max-w-6xl">
          <Link
            to="/fluir-femenino"
            className="inline-flex items-center gap-2 text-sm font-body text-fluir-ink/60 hover:text-fluir-magenta transition-colors"
          >
            <ArrowLeft size={16} />
            Fluir Femenino
          </Link>

          <h1 className="font-display font-light text-5xl md:text-6xl lg:text-7xl mt-6 leading-[1.05]">
            Diario <span className="italic text-fluir-magenta">de Fluir.</span>
          </h1>
          <p className="font-body text-lg text-fluir-ink/70 mt-5 max-w-2xl">
            Artículos sobre nutrición, salud hormonal, recetas y bienestar femenino.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 mb-10">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-widest transition-colors ${
                activeCategory === null
                  ? 'bg-fluir-magenta text-white'
                  : 'bg-white text-fluir-ink/60 hover:text-fluir-ink'
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-widest transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-fluir-magenta text-white'
                    : 'bg-white text-fluir-ink/60 hover:text-fluir-ink'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <label className="relative md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fluir-ink/40" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por título…"
              className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white border border-fluir-ink/10 font-body text-sm focus:outline-none focus:border-fluir-magenta/40"
            />
          </label>
        </div>
      </section>

      {/* Grid */}
      <section className="px-6">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-fluir-magenta/20 border-t-fluir-magenta rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 font-body text-fluir-ink/50">
              No hay artículos publicados con esos filtros.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 rounded-full bg-white border border-fluir-ink/10 font-body text-sm disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="font-body text-sm text-fluir-ink/60">
                    Página {page + 1} de {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 rounded-full bg-white border border-fluir-ink/10 font-body text-sm disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function PostCard({ post }) {
  return (
    <Link
      to={`/fluir-femenino/articulos/${post.slug}`}
      className="group block bg-white rounded-[1.5rem] overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[4/3] bg-fluir-mist relative overflow-hidden">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-fluir-rose/30" />
        )}
      </div>
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-3 text-[11px] font-body uppercase tracking-[0.2em] text-fluir-magenta/80 mb-3">
          {post.reading_minutes ? <span>{post.reading_minutes} min</span> : null}
          {post.published_at && <span className="text-fluir-ink/40">{formatDate(post.published_at)}</span>}
        </div>
        <h3 className="font-display font-light text-xl md:text-2xl leading-tight text-fluir-ink group-hover:text-fluir-magenta transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="font-body text-sm text-fluir-ink/65 mt-2 line-clamp-2">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
