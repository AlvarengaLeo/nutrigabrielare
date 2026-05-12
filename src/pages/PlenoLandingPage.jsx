import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getFeaturedProducts } from '../services/productService';
import PlenoProductsPLP from '../components/pleno/PlenoProductsPLP';

gsap.registerPlugin(ScrollTrigger);

export default function PlenoLandingPage() {
  const heroRef = useRef(null);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getFeaturedProducts(1)
      .then((rows) => {
        if (!cancelled) setFeatured(rows[0] ?? null);
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
      gsap.from('.pleno-hero-el', {
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
    <div className="bg-pleno-paper text-pleno-ink">
      {/* ── Hero · Full-bleed editorial (gradient continuo desde el navbar) ── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden text-white"
        style={{
          background: 'linear-gradient(180deg, #16693d 0%, #11623a 45%, #0A4D2E 100%)',
        }}
      >
        {/* spacer for floating Navbar — parte del mismo gradient */}
        <div className="pt-28" aria-hidden />

        {/* hairline + soft shadow at bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10 z-[2]" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-[1]"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 100%)',
          }}
        />

        <div className="relative grid xl:grid-cols-2 min-h-[480px] xl:min-h-[560px]">
          {/* Text — full width <xl, izquierda en xl+ */}
          <div className="px-6 sm:px-10 lg:px-16 xl:px-20 py-16 xl:py-24 flex flex-col justify-center gap-6 xl:gap-8">
            <h1 className="pleno-hero-el font-drama font-normal leading-[1.02] tracking-tight text-[3.25rem] sm:text-6xl lg:text-7xl xl:text-[5rem] m-0">
              Bienestar en su forma<br />
              <em className="italic font-normal">más plena.</em>
            </h1>
            <p className="pleno-hero-el font-body text-base lg:text-lg leading-relaxed text-white/85 max-w-md m-0">
              Productos digitales, suplementos seleccionados y consultas con
              acompañamiento real. Una sola tienda para tu bienestar integral.
            </p>
          </div>

          {/* Producto destacado — solo en xl+ */}
          <div className="relative hidden xl:grid place-items-center min-h-[480px] overflow-hidden">
            {featuredImage ? (
              <Link
                to={featured ? `/producto/${featured.slug}` : '#'}
                className="pleno-hero-el group relative grid place-items-center"
                aria-label={featured?.name ? `Ver ${featured.name}` : 'Producto destacado'}
              >
                <div
                  className="absolute -inset-12 rounded-full blur-3xl opacity-50"
                  style={{
                    background:
                      'radial-gradient(closest-side, rgba(255,255,255,0.18), transparent 70%)',
                  }}
                />
                <img
                  src={featuredImage}
                  alt={featured?.name || 'Producto destacado'}
                  className="relative max-h-[460px] w-auto object-contain drop-shadow-[0_60px_120px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </Link>
            ) : (
              <div
                className="pleno-hero-el rounded-full opacity-30"
                style={{
                  width: 240,
                  height: 240,
                  background:
                    'radial-gradient(closest-side, rgba(255,255,255,0.18), transparent 70%)',
                }}
                aria-hidden
              />
            )}
          </div>
        </div>
      </section>

      <PlenoProductsPLP
        kinds={[
          { kind: 'physical', label: 'Suplementos' },
          { kind: 'digital', label: 'Recursos digitales' },
          { kind: 'service', label: 'Servicios' },
        ]}
        emptyMessage="Pronto vas a encontrar productos disponibles aquí."
        anchorId="pleno-catalogo"
      />
    </div>
  );
}
