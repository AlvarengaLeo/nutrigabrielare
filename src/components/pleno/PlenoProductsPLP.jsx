import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Minus, Plus, Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { getProductsByKind } from '../../services/productService';
import ProductCard from '../ProductCard';

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
        style={
          checked
            ? { backgroundColor: '#196b41', borderColor: '#196b41' }
            : undefined
        }
        className={`w-[18px] h-[18px] inline-flex items-center justify-center rounded-[4px] border-[1.5px] transition-colors ${
          checked ? '' : 'bg-white border-pleno-line-soft'
        }`}
      >
        {checked && <Check size={12} strokeWidth={3} className="text-white" />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className={checked ? 'text-pleno-ink font-medium' : ''}>{children}</span>
    </label>
  );
}

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`group inline-flex items-center gap-3 pl-5 pr-4 py-2.5 rounded-full border bg-white text-pleno-ink text-[13px] font-medium transition-all ${
          open
            ? 'border-pleno-deep shadow-[0_8px_24px_-12px_rgba(10,77,46,0.35)]'
            : 'border-pleno-line hover:border-pleno-ink-mute'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-pleno-ink-mute font-normal">Ordenar</span>
        <span className="text-pleno-ink">{current.label}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`text-pleno-ink-soft transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 z-30 min-w-[14rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-pleno-line bg-white shadow-[0_18px_60px_-20px_rgba(0,0,0,0.18)] overflow-hidden p-1.5 origin-top-right"
        >
          {SORT_OPTIONS.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-[13px] text-left transition-colors ${
                  active
                    ? 'bg-pleno-soft text-pleno-deep font-medium'
                    : 'text-pleno-ink hover:bg-pleno-mist'
                }`}
              >
                <span>{o.label}</span>
                {active && <Check size={14} strokeWidth={2.5} className="text-pleno-deep" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Reusable Pleno PLP body (toolbar + sidebar filters + product grid).
 *
 * @param {{
 *   kind: 'physical' | 'digital' | 'service',
 *   categoryLabel: string,           // shown in the "Categoría" filter checkbox
 *   emptyMessage?: string,
 *   anchorId?: string,               // optional id for in-page links
 * }} props
 */
export default function PlenoProductsPLP({
  kind,
  categoryLabel,
  emptyMessage = 'Pronto vas a encontrar productos disponibles aquí.',
  anchorId,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recommended');
  const [priceFilters, setPriceFilters] = useState([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);

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
      '.pleno-plp-card',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
    );
  }, [loading, filteredProducts.length]);

  const togglePriceFilter = (id) => {
    setPriceFilters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = priceFilters.length + (featuredOnly ? 1 : 0);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (!filtersOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setFiltersOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener('keydown', onKey);
    };
  }, [filtersOpen]);

  const filtersContent = (
    <>
      <FilterGroup title="Categoría">
        <CheckboxLabel checked={true} onChange={() => {}}>
          {categoryLabel}
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
    </>
  );

  return (
    <div id={anchorId} className="bg-white">
      {/* Toolbar */}
      <div className="border-b border-pleno-line bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-4 flex items-center justify-between gap-3">
          {/* Mobile filters trigger */}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-pleno-line bg-white text-pleno-ink text-[13px] font-medium hover:border-pleno-ink-mute transition-colors"
            aria-haspopup="dialog"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={14} strokeWidth={2} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-pleno-deep text-white text-[10px] font-semibold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="font-body text-[13px] text-pleno-ink-mute hidden sm:block">
            Mostrando {loading ? '…' : filteredProducts.length}{' '}
            {filteredProducts.length === 1 ? 'producto' : 'productos'}
          </span>
          <div className="ml-auto">
            <SortDropdown value={sort} onChange={setSort} />
          </div>
        </div>
      </div>

      {/* Body */}
      <section className="px-6 sm:px-10 lg:px-14 py-10 lg:py-16 pb-24 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-12">
          {/* Sidebar — solo lg+ */}
          <aside className="hidden lg:flex flex-col gap-8 text-[13px]">
            {filtersContent}
          </aside>

          <main>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-pleno-line border-t-pleno-green rounded-full animate-spin" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 gap-y-12">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="pleno-plp-card">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="font-body text-pleno-ink-mute text-base">{emptyMessage}</p>
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Mobile filters drawer (<lg) */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${filtersOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!filtersOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${filtersOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setFiltersOpen(false)}
        />
        {/* Sheet */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filtros"
          className={`absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col bg-white rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${
            filtersOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Grabber + header */}
          <div className="px-6 pt-3 pb-3 border-b border-pleno-line-soft">
            <div className="mx-auto h-1 w-10 rounded-full bg-pleno-line mb-3" aria-hidden />
            <div className="flex items-center justify-between">
              <h3 className="font-drama text-xl text-pleno-ink m-0">Filtros</h3>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="grid place-items-center w-9 h-9 rounded-full hover:bg-pleno-mist transition-colors"
                aria-label="Cerrar filtros"
              >
                <X size={18} strokeWidth={2} className="text-pleno-ink-soft" />
              </button>
            </div>
          </div>

          {/* Filter content */}
          <div className="px-6 py-5 flex flex-col gap-7 overflow-y-auto text-[13px]">
            {filtersContent}
          </div>

          {/* Apply CTA */}
          <div className="px-6 py-4 border-t border-pleno-line-soft">
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="w-full py-3.5 rounded-full bg-pleno-deep text-white font-semibold text-sm hover:bg-pleno-green transition-colors"
            >
              Mostrar {loading ? '…' : filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
