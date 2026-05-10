import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Minus, Plus } from 'lucide-react';
import { getProductsByKind, SLUG_TO_KIND } from '../services/productService';
import ProductCard from '../components/ProductCard';

gsap.registerPlugin(ScrollTrigger);

const COPY = {
  digitales: {
    eyebrow: 'Productos digitales',
    titleLine1: 'Aprende',
    titleLine2: 'a tu ritmo.',
    subtitle: 'Ebooks, guías y recetarios listos para descargar. Compralos una vez, consultalos cuando quieras.',
    emptyMessage: 'Pronto vas a encontrar nuevos productos digitales aquí.',
  },
  suplementos: {
    eyebrow: 'Suplementos',
    titleLine1: 'Apoyo a',
    titleLine2: 'tu bienestar.',
    subtitle: 'Suplementación seleccionada para acompañar tu plan nutricional. Envíos a todo El Salvador.',
    emptyMessage: 'Pronto vas a encontrar suplementos disponibles aquí.',
  },
  servicios: {
    eyebrow: 'Servicios',
    titleLine1: 'Acompañamiento',
    titleLine2: '1:1.',
    subtitle: 'Consultas presenciales y online con enfoque holístico en salud hormonal y bienestar integral.',
    emptyMessage: 'Pronto vas a encontrar servicios disponibles aquí.',
  },
};

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recomendados' },
  { value: 'name', label: 'Alfabético' },
  { value: 'price-asc', label: 'Precio ↑' },
  { value: 'price-desc', label: 'Precio ↓' },
];

const PRICE_BUCKETS = [
  { id: 'lt25', label: 'Menos de $25', test: (p) => Number(p.price) < 25 },
  { id: '25-75', label: '$25 — $75', test: (p) => Number(p.price) >= 25 && Number(p.price) <= 75 },
  { id: 'gt75', label: 'Más de $75', test: (p) => Number(p.price) > 75 },
];

function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center mb-3.5 font-body text-[13px] font-semibold text-pleno-ink"
      >
        <span>{title}</span>
        {open ? <Minus size={14} strokeWidth={2} /> : <Plus size={14} strokeWidth={2} />}
      </button>
      {open && <div className="flex flex-col gap-2.5 text-[13px] text-pleno-ink-soft">{children}</div>}
    </div>
  );
}

function CheckboxLabel({ checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <span
        className={`w-3.5 h-3.5 inline-block rounded-[3px] border ${
          checked ? 'bg-pleno-deep border-pleno-deep' : 'bg-white border-pleno-line'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span>{children}</span>
    </label>
  );
}

export default function PlenoCategoryPage() {
  const { kindSlug } = useParams();
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recommended');
  const [priceFilters, setPriceFilters] = useState([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const kind = SLUG_TO_KIND[kindSlug];
  const copy = COPY[kindSlug];

  useEffect(() => {
    if (!kind) return;
    let cancelled = false;
    setLoading(true);
    getProductsByKind(kind)
      .then((rows) => {
        if (!cancelled) setProducts(rows);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pleno-cat-hero-el', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.1,
      });
    });
    return () => ctx.revert();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (featuredOnly) list = list.filter((p) => p.featured);

    if (priceFilters.length) {
      list = list.filter((p) =>
        priceFilters.some((id) => PRICE_BUCKETS.find((b) => b.id === id)?.test(p))
      );
    }

    switch (sort) {
      case 'name':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'price-asc':
        list.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
        break;
      case 'price-desc':
        list.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
        break;
      default:
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [products, sort, priceFilters, featuredOnly]);

  useEffect(() => {
    if (loading || filteredProducts.length === 0) return;
    gsap.fromTo(
      '.product-card',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
    );
  }, [loading, filteredProducts.length]);

  if (!kind || !copy) {
    return <Navigate to="/pleno" replace />;
  }

  const togglePriceFilter = (id) => {
    setPriceFilters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-pleno-paper text-pleno-ink min-h-screen">
      {/* Spacer for floating Navbar */}
      <div className="pt-28" />

      {/* ── PLP Header ── */}
      <section
        ref={heroRef}
        className="px-6 sm:px-10 lg:px-14 pt-10 pb-6 border-b border-pleno-line"
      >
        <div className="max-w-7xl mx-auto">
          <div className="pleno-cat-hero-el font-body text-[12px] tracking-[0.04em] text-pleno-ink-mute mb-3">
            <Link to="/" className="hover:text-pleno-green transition-colors">
              Inicio
            </Link>{' '}
            ·{' '}
            <Link to="/pleno" className="hover:text-pleno-green transition-colors">
              Pleno
            </Link>{' '}
            · <span className="text-pleno-ink">{copy.eyebrow}</span>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <span className="pleno-cat-hero-el font-body text-[11px] font-medium uppercase tracking-[0.18em] text-pleno-ink-soft">
                — {loading ? '…' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'referencia' : 'referencias'}`} —
              </span>
              <h1 className="pleno-cat-hero-el font-drama text-4xl md:text-5xl lg:text-6xl mt-2.5 m-0 font-normal leading-tight text-pleno-ink">
                {copy.titleLine1}{' '}
                <em className="italic font-normal text-pleno-deep">{copy.titleLine2}</em>
              </h1>
              <p className="pleno-cat-hero-el font-body text-base text-pleno-ink-soft max-w-xl mt-4 mb-0 leading-relaxed">
                {copy.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[13px] shrink-0">
              <span className="text-pleno-ink-mute">Ordenar</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2.5 border border-pleno-line rounded-full bg-white text-[13px] text-pleno-ink"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLP Body ── */}
      <section ref={gridRef} className="px-6 sm:px-10 lg:px-14 py-10 lg:py-14 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-12">
          {/* Sidebar */}
          <aside className="flex flex-col gap-8 text-[13px]">
            <FilterGroup title="Categoría">
              <CheckboxLabel checked={true} onChange={() => {}}>
                {copy.eyebrow}
              </CheckboxLabel>
            </FilterGroup>

            <FilterGroup title="Beneficio">
              <CheckboxLabel
                checked={featuredOnly}
                onChange={() => setFeaturedOnly((v) => !v)}
              >
                Solo destacados
              </CheckboxLabel>
            </FilterGroup>

            <FilterGroup title="Precio">
              {PRICE_BUCKETS.map((b) => (
                <CheckboxLabel
                  key={b.id}
                  checked={priceFilters.includes(b.id)}
                  onChange={() => togglePriceFilter(b.id)}
                >
                  {b.label}
                </CheckboxLabel>
              ))}
            </FilterGroup>

            {(featuredOnly || priceFilters.length > 0 || sort !== 'recommended') && (
              <button
                onClick={() => {
                  setPriceFilters([]);
                  setFeaturedOnly(false);
                  setSort('recommended');
                }}
                className="self-start text-[12px] text-pleno-green underline underline-offset-4 hover:text-pleno-deep transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </aside>

          {/* Grid */}
          <main>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-pleno-line border-t-pleno-green rounded-full animate-spin" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 gap-y-12">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="product-card">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="font-body text-pleno-ink-mute text-base">{copy.emptyMessage}</p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
