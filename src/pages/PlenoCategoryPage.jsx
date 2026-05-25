import React, { useEffect, useRef } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SLUG_TO_KIND } from '../services/productService';
import PlenoProductsPLP from '../components/pleno/PlenoProductsPLP';

gsap.registerPlugin(ScrollTrigger);

const COPY = {
  digitales: {
    eyebrow: 'Productos digitales',
    titleLine1: 'Aprende',
    titleLine2: 'a tu ritmo.',
    subtitle: 'Ebooks, guías y recetarios listos para descargar. Compralos una vez, consultalos cuando quieras.',
    emptyMessage: 'Pronto vas a encontrar nuevos productos digitales aquí.',
  },
  servicios: {
    eyebrow: 'Servicios',
    titleLine1: 'Acompañamiento',
    titleLine2: '1:1.',
    subtitle: 'Consultas presenciales y online con enfoque holístico en salud hormonal y bienestar integral.',
    emptyMessage: 'Pronto vas a encontrar servicios disponibles aquí.',
  },
};

export default function PlenoCategoryPage() {
  const { kindSlug } = useParams();
  const heroRef = useRef(null);

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

  // Suplementos viven en la landing (/pleno) — no más página propia.
  if (kindSlug === 'suplementos') {
    return <Navigate to="/pleno" replace />;
  }

  // Digitales y servicios ahora viven en /nutrigabrielare.
  if (kindSlug === 'digitales') {
    return <Navigate to="/nutrigabrielare?categoria=digital#nutri-catalogo" replace />;
  }
  if (kindSlug === 'servicios') {
    return <Navigate to="/nutrigabrielare?categoria=service#nutri-catalogo" replace />;
  }

  const kind = SLUG_TO_KIND[kindSlug];
  const copy = COPY[kindSlug];

  if (!kind || !copy) {
    return <Navigate to="/pleno" replace />;
  }

  return (
    <div className="bg-white text-pleno-ink min-h-screen">
      {/* ── Hero · Editorial green (gradient continuo, paridad con /pleno) ── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden text-white"
        style={{
          background: 'linear-gradient(180deg, #16693d 0%, #11623a 45%, #0A4D2E 100%)',
        }}
      >
        <div className="pt-28" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10 z-[2]" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-[1]"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 100%)',
          }}
        />

        <div className="relative grid xl:grid-cols-[1.4fr_1fr] min-h-[420px] xl:min-h-[480px]">
          <div className="px-6 sm:px-10 lg:px-16 xl:px-20 py-16 xl:py-24 flex flex-col justify-center gap-5 lg:gap-7">
            <div className="pleno-cat-hero-el font-body text-[12px] tracking-[0.06em] text-white/70">
              <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
              <span className="px-2 opacity-60">·</span>
              <Link to="/pleno" className="hover:text-white transition-colors">Pleno</Link>
              <span className="px-2 opacity-60">·</span>
              <span className="text-white">{copy.eyebrow}</span>
            </div>

            <span className="pleno-cat-hero-el font-body text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">
              · {copy.eyebrow} ·
            </span>

            <h1 className="pleno-cat-hero-el font-drama font-normal leading-[1.02] tracking-tight text-[3rem] sm:text-6xl lg:text-7xl m-0">
              {copy.titleLine1}<br />
              <em className="italic font-normal">{copy.titleLine2}</em>
            </h1>

            <p className="pleno-cat-hero-el font-body text-base lg:text-lg leading-relaxed text-white/85 max-w-xl m-0">
              {copy.subtitle}
            </p>
          </div>

          {/* Right · product mockup */}
          <div className="relative hidden xl:grid place-items-center min-h-[420px] overflow-hidden">
            <div
              className="relative grid place-items-center"
              style={{
                width: 220,
                height: 340,
                background:
                  'linear-gradient(180deg, #1a3325 0%, #0a1c11 100%)',
                borderRadius: '8px 8px 18px 18px',
                boxShadow: '0 50px 100px -30px rgba(0,0,0,0.5)',
              }}
            >
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2"
                style={{
                  width: 96,
                  height: 20,
                  background: '#d8d2c4',
                  borderRadius: '4px 4px 2px 2px',
                }}
              />
              <div className="text-center text-white/95">
                <div className="font-drama" style={{ fontSize: 36, letterSpacing: '0.04em' }}>
                  pleno
                </div>
                <div className="text-[10px] tracking-[0.3em] mt-1.5 opacity-70">
                  · {copy.eyebrow.toUpperCase()} ·
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PlenoProductsPLP
        kind={kind}
        categoryLabel={copy.eyebrow}
        emptyMessage={copy.emptyMessage}
      />
    </div>
  );
}
