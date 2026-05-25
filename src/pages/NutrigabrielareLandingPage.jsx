import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getFeaturedProducts } from '../services/productService';
import PlenoProductsPLP from '../components/pleno/PlenoProductsPLP';

gsap.registerPlugin(ScrollTrigger);

export default function NutrigabrielareLandingPage() {
  const heroRef = useRef(null);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // Featured digital or service product
    getFeaturedProducts(5)
      .then((rows) => {
        const pick = rows.find((p) => p.kind === 'digital' || p.kind === 'service') ?? null;
        if (!cancelled) setFeatured(pick);
      })
      .catch(() => {
        if (!cancelled) setFeatured(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.nutri-hero-el', {
        y: 40,
        opacity: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.15,
      });
    });
    return () => ctx.revert();
  }, []);

  const featuredImage = featured?.images?.[0] ?? null;

  return (
    <div className="bg-background text-primary">
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-background"
      >
        {/* spacer for the floating navbar */}
        <div className="pt-28" aria-hidden />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-primary/8 z-[2]" />

        <div className="relative grid xl:grid-cols-2 min-h-[480px] xl:min-h-[560px]">
          <div className="px-6 sm:px-10 lg:px-16 xl:px-20 py-16 xl:py-24 flex flex-col justify-center gap-6 xl:gap-8">
            <span className="nutri-hero-el font-body text-[11px] font-medium uppercase tracking-[0.22em] text-primary/55">
              · Nutrigabrielare · Market ·
            </span>
            <h1 className="nutri-hero-el font-heading not-italic leading-[1.02] tracking-tight text-[3.25rem] sm:text-6xl lg:text-7xl xl:text-[5rem] m-0 text-primary">
              Recursos y consultas{' '}
              <span className="font-drama italic">para tu camino.</span>
            </h1>
            <p className="nutri-hero-el font-body text-base lg:text-lg leading-relaxed text-primary/70 max-w-md m-0">
              Ebooks, guías y consultas 1:1 con enfoque holístico.
              Descargables al instante y acompañamiento real cuando lo necesitás.
            </p>
          </div>

          <div className="relative hidden xl:grid place-items-center min-h-[480px] overflow-hidden">
            {featuredImage ? (
              <Link
                to={featured ? `/producto/${featured.slug}` : '#'}
                className="nutri-hero-el group relative grid place-items-center"
                aria-label={featured?.name ? `Ver ${featured.name}` : 'Producto destacado'}
              >
                <div
                  className="absolute -inset-12 rounded-full blur-3xl opacity-60"
                  style={{
                    background:
                      'radial-gradient(closest-side, rgba(159,194,255,0.35), transparent 70%)',
                  }}
                />
                <img
                  src={featuredImage}
                  alt={featured?.name || 'Producto destacado'}
                  className="relative max-h-[460px] w-auto object-contain drop-shadow-[0_60px_120px_rgba(0,0,0,0.18)] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </Link>
            ) : (
              <div
                className="nutri-hero-el rounded-full opacity-40"
                style={{
                  width: 240,
                  height: 240,
                  background:
                    'radial-gradient(closest-side, rgba(159,194,255,0.35), transparent 70%)',
                }}
                aria-hidden
              />
            )}
          </div>
        </div>
      </section>

      <PlenoProductsPLP
        theme="nutri"
        kinds={[
          { kind: 'digital', label: 'Recursos digitales' },
          { kind: 'service', label: 'Servicios' },
        ]}
        emptyMessage="Pronto vas a encontrar recursos y servicios disponibles aquí."
        anchorId="nutri-catalogo"
      />
    </div>
  );
}
