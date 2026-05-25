import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { Minus, Plus, Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { getProductsByKind, getAllProducts, DIGITAL_SUBTYPES } from '../../services/productService';
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

// Two visual themes. `pleno` = deep-green editorial; `nutri` = cream/primary brand
// matching the rest of the marketing site (used on /nutrigabrielare).
const THEMES = {
  pleno: {
    surface: 'bg-white',
    text: 'text-pleno-ink',
    textMute: 'text-pleno-ink-mute',
    textSoft: 'text-pleno-ink-soft',
    line: 'border-pleno-line',
    lineSoft: 'border-pleno-line-soft',
    sortHoverBorder: 'border-pleno-ink-mute',
    sortOpenBorder: 'border-pleno-deep',
    sortOpenShadow: 'shadow-[0_8px_24px_-12px_rgba(10,77,46,0.35)]',
    sortMenuHover: 'hover:bg-pleno-mist',
    sortMenuActiveBg: 'bg-pleno-soft',
    sortMenuActiveText: 'text-pleno-deep',
    sortIconActive: 'text-pleno-deep',
    drawerCloseHover: 'hover:bg-pleno-mist',
    grabber: 'bg-pleno-line',
    badgeBg: 'bg-pleno-deep',
    applyBtnBg: 'bg-pleno-deep',
    applyBtnHover: 'hover:bg-pleno-green',
    clearLink: 'text-pleno-green hover:text-pleno-deep',
    spinnerBorder: 'border-pleno-line border-t-pleno-green',
    activeChipBgHex: '#196b41',
    activeChipBorderHex: '#196b41',
    inactiveCheckboxBorder: 'border-pleno-line-soft',
  },
  nutri: {
    surface: 'bg-background',
    text: 'text-primary',
    textMute: 'text-primary/55',
    textSoft: 'text-primary/45',
    line: 'border-primary/12',
    lineSoft: 'border-primary/8',
    sortHoverBorder: 'border-primary/35',
    sortOpenBorder: 'border-primary',
    sortOpenShadow: 'shadow-[0_8px_24px_-12px_rgba(17,17,17,0.25)]',
    sortMenuHover: 'hover:bg-primary/5',
    sortMenuActiveBg: 'bg-primary/8',
    sortMenuActiveText: 'text-primary',
    sortIconActive: 'text-primary',
    drawerCloseHover: 'hover:bg-primary/5',
    grabber: 'bg-primary/15',
    badgeBg: 'bg-primary',
    applyBtnBg: 'bg-primary',
    applyBtnHover: 'hover:bg-primary/90',
    clearLink: 'text-primary underline-offset-4 hover:text-primary/70',
    spinnerBorder: 'border-primary/15 border-t-primary',
    activeChipBgHex: '#1A1A1A',
    activeChipBorderHex: '#1A1A1A',
    inactiveCheckboxBorder: 'border-primary/20',
  },
};

function FilterGroup({ title, children, defaultOpen = true, t }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex justify-between items-center mb-3.5 font-body text-[13px] font-semibold ${t.text}`}
      >
        <span>{title}</span>
        {open ? <Minus size={14} strokeWidth={2} /> : <Plus size={14} strokeWidth={2} />}
      </button>
      {open && <div className={`flex flex-col gap-2.5 text-[13px] ${t.textSoft}`}>{children}</div>}
    </div>
  );
}

function CheckboxLabel({ checked, onChange, children, t }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <span
        style={
          checked
            ? { backgroundColor: t.activeChipBgHex, borderColor: t.activeChipBorderHex }
            : undefined
        }
        className={`w-[18px] h-[18px] inline-flex items-center justify-center rounded-[4px] border-[1.5px] transition-colors ${
          checked ? '' : `bg-white ${t.inactiveCheckboxBorder}`
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
      <span className={checked ? `${t.text} font-medium` : ''}>{children}</span>
    </label>
  );
}

function SortDropdown({ value, onChange, t }) {
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
        className={`group inline-flex items-center gap-3 pl-5 pr-4 py-2.5 rounded-full border bg-white ${t.text} text-[13px] font-medium transition-all ${
          open
            ? `${t.sortOpenBorder} ${t.sortOpenShadow}`
            : `${t.line} hover:${t.sortHoverBorder}`
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`${t.textMute} font-normal`}>Ordenar</span>
        <span className={t.text}>{current.label}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`${t.textSoft} transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute right-0 mt-2 z-30 min-w-[14rem] max-w-[calc(100vw-2rem)] rounded-2xl border ${t.line} bg-white shadow-[0_18px_60px_-20px_rgba(0,0,0,0.18)] overflow-hidden p-1.5 origin-top-right`}
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
                    ? `${t.sortMenuActiveBg} ${t.sortMenuActiveText} font-medium`
                    : `${t.text} ${t.sortMenuHover}`
                }`}
              >
                <span>{o.label}</span>
                {active && <Check size={14} strokeWidth={2.5} className={t.sortIconActive} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Reusable PLP body (toolbar + sidebar filters + product grid).
 *
 * @param {{
 *   kind?: 'physical' | 'digital' | 'service',
 *   categoryLabel?: string,
 *   kinds?: Array<{ kind: 'physical' | 'digital' | 'service', label: string }>,
 *   emptyMessage?: string,
 *   anchorId?: string,
 *   theme?: 'pleno' | 'nutri',
 * }} props
 */
export default function PlenoProductsPLP({
  kind,
  categoryLabel,
  kinds,
  emptyMessage = 'Pronto vas a encontrar productos disponibles aquí.',
  anchorId,
  theme = 'pleno',
}) {
  const t = THEMES[theme] ?? THEMES.pleno;

  const kindList = useMemo(() => {
    if (kinds && kinds.length) return kinds;
    if (kind) return [{ kind, label: categoryLabel ?? kind }];
    return [];
  }, [kinds, kind, categoryLabel]);

  const multiKind = kindList.length > 1;
  const kindKeys = useMemo(() => kindList.map((k) => k.kind), [kindList]);
  const kindKeysSerialized = kindKeys.join(',');

  const [searchParams] = useSearchParams();
  const requestedKind = searchParams.get('categoria');
  const initialKindFilters = useMemo(() => {
    if (requestedKind && kindKeys.includes(requestedKind)) return [requestedKind];
    return kindKeys;
  }, [requestedKind, kindKeysSerialized]); // eslint-disable-line react-hooks/exhaustive-deps

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recommended');
  const [priceFilters, setPriceFilters] = useState([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [subtypeFilters, setSubtypeFilters] = useState([]);
  const [kindFilters, setKindFilters] = useState(initialKindFilters);

  useEffect(() => {
    setKindFilters(initialKindFilters);
  }, [initialKindFilters]);

  useEffect(() => {
    if (!requestedKind || !anchorId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(anchorId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(timer);
  }, [requestedKind, anchorId]);

  useEffect(() => {
    if (!kindList.length) return;
    let cancelled = false;
    setLoading(true);

    const loader = multiKind
      ? getAllProducts().then((rows) => rows.filter((p) => kindKeys.includes(p.kind)))
      : getProductsByKind(kindKeys[0]);

    loader
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kindKeysSerialized, multiKind]);

  const availableSubtypes = useMemo(() => {
    if (!kindKeys.includes('digital')) return [];
    const present = new Set();
    for (const p of products) {
      if (p.digitalSubtype) present.add(p.digitalSubtype);
    }
    return Object.entries(DIGITAL_SUBTYPES).filter(([id]) => present.has(id));
  }, [products, kindKeys]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (kindList.length) {
      list = list.filter((p) => kindFilters.includes(p.kind));
    }

    if (featuredOnly) list = list.filter((p) => p.featured);

    if (subtypeFilters.length) {
      list = list.filter((p) => p.digitalSubtype && subtypeFilters.includes(p.digitalSubtype));
    }

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
  }, [products, sort, priceFilters, featuredOnly, subtypeFilters, kindFilters, kindList.length]);

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

  const toggleSubtypeFilter = (id) => {
    setSubtypeFilters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleKindFilter = (id) => {
    setKindFilters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const [filtersOpen, setFiltersOpen] = useState(false);
  const kindFilterActive = multiKind && kindFilters.length < kindKeys.length;
  const activeFilterCount =
    priceFilters.length +
    subtypeFilters.length +
    (kindFilterActive ? 1 : 0) +
    (featuredOnly ? 1 : 0);

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
      <FilterGroup title="Categoría" t={t}>
        {multiKind ? (
          kindList.map((k) => (
            <CheckboxLabel
              key={k.kind}
              checked={kindFilters.includes(k.kind)}
              onChange={() => toggleKindFilter(k.kind)}
              t={t}
            >
              {k.label}
            </CheckboxLabel>
          ))
        ) : (
          <CheckboxLabel checked={true} onChange={() => {}} t={t}>
            {kindList[0]?.label}
          </CheckboxLabel>
        )}
      </FilterGroup>

      <FilterGroup title="Beneficio" t={t}>
        <CheckboxLabel
          checked={featuredOnly}
          onChange={() => setFeaturedOnly((v) => !v)}
          t={t}
        >
          Solo destacados
        </CheckboxLabel>
      </FilterGroup>

      {availableSubtypes.length > 0 && (
        <FilterGroup title="Tipo de recurso" t={t}>
          {availableSubtypes.map(([id, label]) => (
            <CheckboxLabel
              key={id}
              checked={subtypeFilters.includes(id)}
              onChange={() => toggleSubtypeFilter(id)}
              t={t}
            >
              {label}
            </CheckboxLabel>
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Precio" t={t}>
        {PRICE_BUCKETS.map((b) => (
          <CheckboxLabel
            key={b.id}
            checked={priceFilters.includes(b.id)}
            onChange={() => togglePriceFilter(b.id)}
            t={t}
          >
            {b.label}
          </CheckboxLabel>
        ))}
      </FilterGroup>

      {(featuredOnly ||
        priceFilters.length > 0 ||
        subtypeFilters.length > 0 ||
        kindFilterActive ||
        sort !== 'recommended') && (
        <button
          onClick={() => {
            setPriceFilters([]);
            setSubtypeFilters([]);
            setKindFilters(kindKeys);
            setFeaturedOnly(false);
            setSort('recommended');
          }}
          className={`self-start text-[12px] underline underline-offset-4 transition-colors ${t.clearLink}`}
        >
          Limpiar filtros
        </button>
      )}
    </>
  );

  return (
    <div id={anchorId} className={t.surface}>
      {/* Toolbar */}
      <div className={`border-b ${t.line} ${t.surface}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className={`lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-full border bg-white ${t.text} text-[13px] font-medium transition-colors ${t.line} hover:${t.sortHoverBorder}`}
            aria-haspopup="dialog"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={14} strokeWidth={2} />
            Filtros
            {activeFilterCount > 0 && (
              <span className={`grid place-items-center min-w-5 h-5 px-1.5 rounded-full ${t.badgeBg} text-white text-[10px] font-semibold`}>
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className={`font-body text-[13px] ${t.textMute} hidden sm:block`}>
            Mostrando {loading ? '…' : filteredProducts.length}{' '}
            {filteredProducts.length === 1 ? 'producto' : 'productos'}
          </span>
          <div className="ml-auto">
            <SortDropdown value={sort} onChange={setSort} t={t} />
          </div>
        </div>
      </div>

      {/* Body */}
      <section className={`px-6 sm:px-10 lg:px-14 py-10 lg:py-16 pb-24 ${t.surface}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-12">
          <aside className="hidden lg:flex flex-col gap-8 text-[13px]">
            {filtersContent}
          </aside>

          <main>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className={`w-8 h-8 border-2 ${t.spinnerBorder} rounded-full animate-spin`} />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 gap-y-12 items-stretch">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="pleno-plp-card h-full">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className={`font-body text-base ${t.textMute}`}>{emptyMessage}</p>
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Mobile filters drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${filtersOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!filtersOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${filtersOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setFiltersOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filtros"
          className={`absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col bg-white rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${
            filtersOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className={`px-6 pt-3 pb-3 border-b ${t.lineSoft}`}>
            <div className={`mx-auto h-1 w-10 rounded-full ${t.grabber} mb-3`} aria-hidden />
            <div className="flex items-center justify-between">
              <h3 className={`font-drama text-xl ${t.text} m-0`}>Filtros</h3>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className={`grid place-items-center w-9 h-9 rounded-full transition-colors ${t.drawerCloseHover}`}
                aria-label="Cerrar filtros"
              >
                <X size={18} strokeWidth={2} className={t.textSoft} />
              </button>
            </div>
          </div>

          <div className="px-6 py-5 flex flex-col gap-7 overflow-y-auto text-[13px]">
            {filtersContent}
          </div>

          <div className={`px-6 py-4 border-t ${t.lineSoft}`}>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className={`w-full py-3.5 rounded-full ${t.applyBtnBg} text-white font-semibold text-sm transition-colors ${t.applyBtnHover}`}
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
