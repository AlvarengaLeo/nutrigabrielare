import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight, Download, Leaf, HeartHandshake } from 'lucide-react';
import { getFeaturedProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';

gsap.registerPlugin(ScrollTrigger);

const ENTRIES = [
  {
    slug: 'digitales',
    eyebrow: '· Aprende a tu ritmo ·',
    title: 'Productos\ndigitales',
    description: 'Ebooks, guías y recetarios con descarga inmediata.',
    Icon: Download,
    bg: '#2A4A36',
    referenceLabel: 'Aprende',
  },
  {
    slug: 'suplementos',
    eyebrow: '· Apoyo a tu bienestar ·',
    title: 'Suplementos\nseleccionados',
    description: 'Suplementación clínica con envíos a todo El Salvador.',
    Icon: Leaf,
    bg: '#0E7A3F',
    referenceLabel: 'Bienestar',
  },
  {
    slug: 'servicios',
    eyebrow: '· Acompañamiento 1:1 ·',
    title: 'Consultas y\nservicios',
    description: 'Consultas presenciales y online con enfoque holístico.',
    Icon: HeartHandshake,
    bg: '#0A4D2E',
    referenceLabel: 'Acompañamos',
  },
];

export default function PlenoLandingPage() {
  const heroRef = useRef(null);
  const categoriesRef = useRef(null);
  const bestRef = useRef(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [loadingBest, setLoadingBest] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getFeaturedProducts(4)
      .then((rows) => {
        if (!cancelled) setBestSellers(rows);
      })
      .catch(() => {
        if (!cancelled) setBestSellers([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBest(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pleno-hero-el', {
        y: 40,
        opacity: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.15,
      });

      gsap.fromTo(
        '.pleno-cat-card',
        { y: 50, opacity: 0 },
        {
          scrollTrigger: { trigger: categoriesRef.current, start: 'top 85%' },
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
        }
      );

      gsap.fromTo(
        '.pleno-best-card',
        { y: 40, opacity: 0 },
        {
          scrollTrigger: { trigger: bestRef.current, start: 'top 85%' },
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
        }
      );
    });
    return () => ctx.revert();
  }, [bestSellers.length]);

  return (
    <div className="bg-pleno-paper text-pleno-ink">
      {/* ── Topbar ribbon (sits behind floating Navbar) ── */}
      <div className="pt-28 pb-2 bg-pleno-paper" />

      {/* ── Hero · Full-bleed editorial ── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden text-white"
        style={{ background: '#0A4D2E' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, #0E7A3F 0%, #0A4D2E 100%)',
            opacity: 0.55,
          }}
        />
        <div className="relative grid lg:grid-cols-2 min-h-[560px] lg:min-h-[640px]">
          {/* Left · text */}
          <div className="px-6 sm:px-10 lg:px-20 py-20 lg:py-28 flex flex-col justify-center gap-6 lg:gap-8">
            <span className="pleno-hero-el font-body text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">
              · Edición Pleno · El Salvador ·
            </span>
            <h1 className="pleno-hero-el font-drama font-normal leading-[1.02] tracking-tight text-[3.25rem] sm:text-6xl lg:text-7xl xl:text-[5rem] m-0">
              Bienestar<br />
              en su forma<br />
              <em className="italic font-normal">más plena.</em>
            </h1>
            <p className="pleno-hero-el font-body text-base lg:text-lg leading-relaxed text-white/85 max-w-md m-0">
              Productos digitales, suplementos seleccionados y consultas con
              acompañamiento real. Una sola tienda para tu bienestar integral.
            </p>
            <div className="pleno-hero-el flex flex-wrap items-center gap-3 mt-2">
              <Link
                to="/pleno/suplementos"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-pleno-ink text-sm font-semibold tracking-[0.02em] hover:bg-pleno-cream transition-colors"
              >
                Descubrir la línea
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
              <Link
                to="/contactanos"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/40 text-white text-sm font-semibold tracking-[0.02em] hover:bg-white/10 transition-colors"
              >
                Reservar consulta
              </Link>
            </div>
          </div>

          {/* Right · product mockup */}
          <div
            className="relative hidden lg:grid place-items-center min-h-[560px] overflow-hidden"
            style={{
              background:
                'linear-gradient(180deg, rgba(14,122,63,0.65) 0%, rgba(10,77,46,1) 100%)',
            }}
          >
            <div
              className="relative grid place-items-center"
              style={{
                width: 280,
                height: 440,
                background:
                  'linear-gradient(180deg, #1a3325 0%, #0a1c11 100%)',
                borderRadius: '8px 8px 18px 18px',
                boxShadow: '0 60px 120px -30px rgba(0,0,0,0.5)',
              }}
            >
              <div
                className="absolute -top-5 left-1/2 -translate-x-1/2"
                style={{
                  width: 120,
                  height: 24,
                  background: '#d8d2c4',
                  borderRadius: '4px 4px 2px 2px',
                }}
              />
              <div className="text-center text-white/95">
                <div className="font-drama" style={{ fontSize: 42, letterSpacing: '0.04em' }}>
                  pleno
                </div>
                <div className="text-[11px] tracking-[0.3em] mt-1.5 opacity-70">
                  · BIENESTAR ·
                </div>
                <div className="text-[11px] tracking-[0.2em] mt-20 opacity-50">
                  EL SALVADOR · 2026
                </div>
              </div>
            </div>
            <span className="font-drama italic absolute bottom-8 right-8 text-sm text-white/60">
              Una rutina pensada para tu día.
            </span>
          </div>
        </div>
      </section>

      {/* ── Categorías ── */}
      <section ref={categoriesRef} className="px-6 sm:px-10 lg:px-20 pt-20 lg:pt-28 pb-10 lg:pb-16 bg-pleno-paper">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 lg:mb-14">
            <div>
              <span className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-pleno-ink-soft">
                — Categorías —
              </span>
              <h2 className="font-drama text-4xl lg:text-5xl mt-3 m-0 font-normal text-pleno-ink leading-tight">
                Por necesidad.
              </h2>
            </div>
            <Link
              to="/pleno/suplementos"
              className="self-start sm:self-end font-body text-sm text-pleno-ink underline underline-offset-4 hover:text-pleno-green transition-colors"
            >
              Ver todas →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {ENTRIES.map(({ slug, eyebrow, title, description, Icon, bg, referenceLabel }) => (
              <Link
                key={slug}
                to={`/pleno/${slug}`}
                className="pleno-cat-card group relative flex flex-col justify-between aspect-[3/4] rounded-md p-7 lg:p-8 overflow-hidden text-white hover:-translate-y-1 transition-transform duration-500 ease-out"
                style={{ background: bg }}
                aria-label={`Ver ${title.replace('\n', ' ')}`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-body text-[11px] tracking-[0.18em] opacity-70">
                    {eyebrow}
                  </span>
                  <div className="w-10 h-10 rounded-full border border-white/30 grid place-items-center backdrop-blur-sm group-hover:bg-white group-hover:text-pleno-ink transition-colors duration-300">
                    <Icon size={16} strokeWidth={1.5} />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="font-body text-[11px] tracking-[0.18em] opacity-70">
                    {referenceLabel}
                  </span>
                  <h3 className="font-drama text-3xl lg:text-[2rem] leading-[1.05] m-0 font-normal whitespace-pre-line">
                    {title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed opacity-85 max-w-[26ch] m-0">
                    {description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 font-body text-sm font-medium opacity-90 group-hover:opacity-100">
                    Explorar
                    <ArrowUpRight size={14} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Más vendidos / Lo esencial ── */}
      <section ref={bestRef} className="px-6 sm:px-10 lg:px-20 pt-10 lg:pt-16 pb-24 lg:pb-32 bg-pleno-paper">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 lg:mb-14">
            <div>
              <span className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-pleno-ink-soft">
                — Lo esencial —
              </span>
              <h2 className="font-drama text-4xl lg:text-5xl mt-3 m-0 font-normal text-pleno-ink leading-tight">
                Más vendidos.
              </h2>
            </div>
          </div>

          {loadingBest ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-pleno-line border-t-pleno-green rounded-full animate-spin" />
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {bestSellers.map((product) => (
                <div key={product.id} className="pleno-best-card">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {ENTRIES.map(({ slug, title, description, bg }) => (
                <Link
                  key={slug}
                  to={`/pleno/${slug}`}
                  className="pleno-best-card flex flex-col gap-4 group/best"
                >
                  <div
                    className="aspect-[4/5] rounded-md grid place-items-center"
                    style={{ background: '#F4F8F3' }}
                  >
                    <div
                      className="w-[38%] h-[70%] grid place-items-center relative"
                      style={{
                        background: bg,
                        borderRadius: '6px 6px 14px 14px',
                        boxShadow: '0 20px 40px -12px rgba(0,0,0,0.18)',
                      }}
                    >
                      <div
                        className="absolute -top-2 left-1/2 -translate-x-1/2"
                        style={{ width: '36%', height: 12, background: '#d8d2c4', borderRadius: 2 }}
                      />
                      <span className="font-drama text-white text-base tracking-[0.18em]">
                        pleno
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-body text-[11px] tracking-[0.14em] uppercase text-pleno-ink-mute">
                      {title.replace('\n', ' ')}
                    </span>
                    <span className="font-drama text-xl lg:text-[22px] leading-tight text-pleno-ink">
                      {description}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
