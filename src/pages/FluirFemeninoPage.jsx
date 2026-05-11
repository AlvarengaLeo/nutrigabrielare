import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { getLatestPosts } from '../services/blogService';

gsap.registerPlugin(ScrollTrigger);

function formatPostDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-SV', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const ASSETS = '/media/fluir-femenino';

/* ── Decorative SVG bullet ── */
const Dot = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 8 8"
    className={`inline-block w-2 h-2 ${className}`}
  >
    <circle cx="4" cy="4" r="3" fill="currentColor" />
  </svg>
);

const pillars = [
  {
    icon: 'luna',
    accent: 'magenta',
    title: 'Ciclos en armonía',
    desc: 'Aprende a leer las fases de tu ciclo y sincronizar tu nutrición, tu energía y tu descanso con la sabiduría de tu cuerpo.',
  },
  {
    icon: 'manos-abiertas',
    accent: 'teal',
    title: 'Cuidado que sostiene',
    desc: 'Acompañamiento real, no listas frías. Pautas que se ajustan a tu vida — y a las semanas en que la vida no se ajusta a ningún plan.',
  },
  {
    icon: 'crecimiento',
    accent: 'lime',
    title: 'Hábitos que crecen',
    desc: 'Empezamos pequeño y vamos profundo. La transformación que dura no se impone: se cultiva con paciencia y curiosidad.',
  },
  {
    icon: 'flor-loto',
    accent: 'lime',
    title: 'Mente, cuerpo, alma',
    desc: 'Tres dimensiones que respiran juntas. Salud hormonal, salud mental y conexión interior tratadas como una sola conversación.',
  },
];

const flowItems = [
  { n: '01', title: 'Recetas reales', desc: 'Recetarios prácticos para la mujer de El Salvador. Ingredientes accesibles, sabor primero.', icon: 'yoga' },
  { n: '02', title: 'Educación viva', desc: 'Lives, audios y guías sobre salud hormonal, ciclos, metabolismo y bienestar femenino.', icon: 'cabeza' },
  { n: '03', title: 'Círculo cercano', desc: 'Una comunidad que se acompaña. Preguntas reales, respuestas reales, sin filtros perfectos.', icon: 'espiral' },
];

const ICON_BG = {
  magenta: 'bg-fluir-magenta/10',
  teal: 'bg-fluir-teal/15',
  lime: 'bg-fluir-lime/20',
};

export default function FluirFemeninoPage() {
  const rootRef = useRef(null);
  const [latestPosts, setLatestPosts] = useState([]);
  const [postsLoaded, setPostsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLatestPosts(3)
      .then((rows) => {
        if (!cancelled) setLatestPosts(rows);
      })
      .catch(() => {
        if (!cancelled) setLatestPosts([]);
      })
      .finally(() => {
        if (!cancelled) setPostsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroEls = rootRef.current?.querySelectorAll('.hero-tile');
      if (heroEls?.length) {
        gsap.set(heroEls, { opacity: 1, y: 0 });
        gsap.fromTo(
          heroEls,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.05 }
        );
      }

      const pillarEls = rootRef.current?.querySelectorAll('.pillar-el');
      if (pillarEls?.length) {
        gsap.set(pillarEls, { opacity: 1, y: 0 });
        gsap.fromTo(
          pillarEls,
          { y: 24, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: pillarEls[0], start: 'top 85%' },
          }
        );
      }

      const flowEls = rootRef.current?.querySelectorAll('.flow-el');
      if (flowEls?.length) {
        gsap.set(flowEls, { opacity: 1, y: 0 });
        gsap.fromTo(
          flowEls,
          { y: 24, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1,
            scrollTrigger: { trigger: flowEls[0], start: 'top 85%' },
          }
        );
      }

      const ctaEl = rootRef.current?.querySelector('.cta-el');
      if (ctaEl) {
        gsap.set(ctaEl, { opacity: 1, y: 0 });
        gsap.fromTo(
          ctaEl,
          { y: 24, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: ctaEl, start: 'top 85%' },
          }
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="bg-fluir-mist text-fluir-ink overflow-hidden">
      {/* ─── HERO BENTO ─── */}
      <section className="px-3 sm:px-5 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-10 sm:pb-14">
        <div className="mx-auto max-w-[1400px]">
          {/* Top kicker */}
          <div className="hero-tile flex items-center justify-between mb-4 sm:mb-6 px-1">
            <span className="font-body text-[11px] sm:text-xs uppercase tracking-[0.28em] text-fluir-magenta inline-flex items-center gap-2">
              <Dot className="text-fluir-magenta" />
              Un círculo Nutrigabrielare
            </span>
            <span className="font-body text-[11px] sm:text-xs uppercase tracking-[0.28em] text-fluir-ink/50">
              San Salvador · 2026
            </span>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-6 auto-rows-[minmax(120px,auto)] gap-3 sm:gap-4">
            {/* TILE 1 — Logo (full width on mobile, 3 cols on desktop) */}
            <div className="hero-tile col-span-6 lg:col-span-3 lg:row-span-2 relative bg-white rounded-[1.5rem] sm:rounded-[2rem] p-7 sm:p-9 lg:p-12 flex flex-col justify-between min-h-[260px] lg:min-h-[420px] overflow-hidden">
              <img
                src={`${ASSETS}/mandala.png`}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-12 -right-12 w-56 h-56 sm:w-72 sm:h-72 opacity-15 animate-spin-slow"
              />
              <div className="relative">
                <span className="font-body text-[10px] sm:text-xs uppercase tracking-[0.3em] text-fluir-ink/50">
                  Bienvenida a
                </span>
                <img
                  src={`${ASSETS}/logo-magenta.png`}
                  alt="Fluir Femenino"
                  className="mt-4 sm:mt-5 w-44 sm:w-56 lg:w-64 h-auto"
                />
              </div>
              <p className="relative font-display italic text-2xl sm:text-3xl lg:text-4xl text-fluir-ink/85 leading-[1.15] mt-6 sm:mt-8 max-w-md">
                Donde tu salud hormonal y tu paz mental respiran juntas.
              </p>
            </div>

            {/* TILE 2 — Big headline (3 cols desktop) */}
            <div className="hero-tile col-span-6 lg:col-span-3 lg:row-span-2 bg-fluir-magenta text-white rounded-[1.5rem] sm:rounded-[2rem] p-7 sm:p-9 lg:p-12 flex flex-col justify-between relative overflow-hidden min-h-[260px] lg:min-h-[420px]">
              <img
                src={`${ASSETS}/luna.png`}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute top-6 right-6 w-12 h-12 sm:w-14 sm:h-14 opacity-90 animate-float-soft"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-fluir-rose/40 blur-3xl pointer-events-none" />
              <span className="relative font-body text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/85">
                Manifiesto
              </span>
              <h1 className="relative font-display font-light leading-[0.92] tracking-tight text-[2.4rem] xs:text-5xl sm:text-6xl lg:text-[4.4rem] xl:text-[5.2rem] mt-3">
                Un espacio
                <br />
                <em className="italic font-medium not-italic-fix" style={{ fontStyle: 'italic', fontVariationSettings: '"opsz" 144' }}>
                  para fluir
                </em>
                <br />
                <span className="text-white/75">en tu propio</span>
                <br />
                <span className="relative inline-block">
                  tiempo.
                  <svg aria-hidden="true" className="absolute left-0 -bottom-1 w-full h-[8px]" viewBox="0 0 200 10" preserveAspectRatio="none">
                    <path d="M0,7 Q50,1 100,5 T200,4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <a
                href="#latidos"
                className="relative inline-flex items-center gap-2 self-start font-body text-sm font-semibold mt-6 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-fluir-magenta rounded-full"
              >
                <span>Bajar al manifiesto</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-1">
                  <path d="M12 4v15m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </a>
            </div>

            {/* TILE 3 — Quote */}
            <div className="hero-tile col-span-6 lg:col-span-2 bg-fluir-rose/40 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-7 lg:p-8 relative overflow-hidden">
              <img
                src={`${ASSETS}/manos-abiertas.png`}
                alt=""
                aria-hidden="true"
                className="absolute -top-3 -right-3 w-16 h-16 opacity-80"
              />
              <p className="font-display italic text-xl sm:text-2xl text-fluir-ink leading-[1.2]">
                "Tu cuerpo no es un proyecto a corregir."
              </p>
              <p className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-fluir-ink/60 mt-4">
                — Filosofía Fluir
              </p>
            </div>

            {/* TILE 4 — Stats */}
            <div className="hero-tile col-span-3 lg:col-span-2 bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 lg:p-7 flex flex-col justify-between min-h-[140px]">
              <span className="font-body text-[10px] sm:text-xs uppercase tracking-[0.28em] text-fluir-ink/55">
                Lo que recibís
              </span>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div>
                  <dd className="font-display text-3xl lg:text-4xl text-fluir-magenta leading-none">+50</dd>
                  <dt className="font-body text-[10px] uppercase tracking-[0.18em] text-fluir-ink/55 mt-1">Recetas</dt>
                </div>
                <div>
                  <dd className="font-display text-3xl lg:text-4xl text-fluir-magenta leading-none">2</dd>
                  <dt className="font-body text-[10px] uppercase tracking-[0.18em] text-fluir-ink/55 mt-1">Lives/mes</dt>
                </div>
                <div>
                  <dd className="font-display italic text-3xl lg:text-4xl text-fluir-magenta leading-none">tú</dd>
                  <dt className="font-body text-[10px] uppercase tracking-[0.18em] text-fluir-ink/55 mt-1">Comunidad</dt>
                </div>
              </div>
            </div>

            {/* TILE 5 — Decorative icon (teal) */}
            <div className="hero-tile col-span-3 lg:col-span-2 bg-fluir-teal/15 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 lg:p-7 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <img
                src={`${ASSETS}/espiral.png`}
                alt=""
                aria-hidden="true"
                className="absolute -bottom-3 -right-3 w-28 h-28 opacity-80 animate-float-soft"
              />
              <div className="relative">
                <span className="font-body text-[10px] sm:text-xs uppercase tracking-[0.28em] text-fluir-teal">
                  Tu ritmo
                </span>
                <p className="font-display text-xl sm:text-2xl text-fluir-ink leading-tight mt-2">
                  Sin prisa,<br />sin pausa<br />forzada.
                </p>
              </div>
            </div>

            {/* TILE 6 — Primary CTA */}
            <div className="hero-tile col-span-6 lg:col-span-4 bg-fluir-ink text-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-7 lg:p-8 relative overflow-hidden">
              <img
                src={`${ASSETS}/flor-loto.png`}
                alt=""
                aria-hidden="true"
                className="absolute -top-4 -right-4 w-24 h-24 opacity-60 animate-float-soft-rev"
              />
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                <div className="max-w-md">
                  <span className="font-body text-[10px] sm:text-xs uppercase tracking-[0.28em] text-fluir-rose">
                    Próximamente
                  </span>
                  <p className="font-display text-2xl sm:text-3xl lg:text-4xl leading-tight mt-2">
                    Sé de las primeras en entrar al círculo.
                  </p>
                </div>
                <a
                  href="https://wa.me/50376284719"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-fluir-magenta text-white px-6 py-3.5 rounded-full font-heading font-bold text-sm hover:bg-fluir-rose hover:text-fluir-ink transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-fluir-ink whitespace-nowrap min-h-[44px]"
                >
                  Quiero saber más
                </a>
              </div>
            </div>

            {/* TILE 7 — Lime accent */}
            <div className="hero-tile col-span-6 lg:col-span-2 bg-fluir-lime/20 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 lg:p-7 relative overflow-hidden flex items-center gap-4 min-h-[120px]">
              <img
                src={`${ASSETS}/crecimiento.png`}
                alt=""
                aria-hidden="true"
                className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0"
              />
              <p className="font-display italic text-lg sm:text-xl text-fluir-ink leading-tight">
                "Crecer también es esperar."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PILLARS ─── */}
      <section id="latidos" className="relative py-16 sm:py-24 md:py-32 bg-white">
        <div className="container mx-auto px-5 sm:px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12 sm:mb-16 md:mb-20">
            <div className="md:col-span-7">
              <span className="font-body text-[11px] sm:text-xs uppercase tracking-[0.28em] text-fluir-magenta inline-flex items-center gap-2">
                <Dot className="text-fluir-magenta" />
                Lo que sostenemos
              </span>
              <h2 className="font-display font-light leading-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-5 sm:mt-6">
                Cuatro <span className="italic text-fluir-magenta">latidos</span><br />
                que guían el círculo.
              </h2>
            </div>
            <div className="md:col-span-5 md:pt-12">
              <p className="font-body text-base md:text-lg text-fluir-ink/75 leading-relaxed">
                No promesas mágicas, ni dietas que duran tres semanas. Una manera
                de relacionarte con tu cuerpo que respeta su sabiduría y su ritmo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-12 sm:gap-y-16 md:gap-y-20">
            {pillars.map((p, idx) => (
              <article key={p.title} className={`pillar-el ${idx % 2 === 1 ? 'md:translate-y-12' : ''}`}>
                <div className={`inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full ${ICON_BG[p.accent]} mb-5 sm:mb-6`}>
                  <img src={`${ASSETS}/${p.icon}.png`} alt="" aria-hidden="true" className="w-10 sm:w-12 h-10 sm:h-12 object-contain" />
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display italic text-fluir-magenta/80 text-lg sm:text-xl">0{idx + 1}</span>
                  <div className="flex-1 h-px bg-fluir-magenta/15" />
                </div>
                <h3 className="font-display font-light text-2xl sm:text-3xl md:text-4xl mt-3 leading-tight">
                  {p.title}
                </h3>
                <p className="font-body text-base md:text-lg text-fluir-ink/75 leading-relaxed mt-3 sm:mt-4 max-w-md">
                  {p.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FLOW ─── */}
      <section className="relative py-16 sm:py-24 md:py-32 bg-fluir-mist overflow-hidden">
        <img
          src={`${ASSETS}/espiral.png`}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-10 top-10 w-28 opacity-50 animate-float-soft hidden lg:block"
        />
        <img
          src={`${ASSETS}/flor-loto.png`}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-12 bottom-20 w-24 opacity-40 animate-float-soft-rev hidden lg:block"
        />

        <div className="container mx-auto px-5 sm:px-6 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="font-body text-[11px] sm:text-xs uppercase tracking-[0.28em] text-fluir-magenta inline-flex items-center gap-2">
              <Dot className="text-fluir-magenta" />
              Qué encontrarás
            </span>
            <h2 className="font-display font-light leading-[1.05] text-4xl sm:text-5xl md:text-6xl mt-5 sm:mt-6">
              Tres formas de
              <span className="italic text-fluir-magenta"> habitar</span>
              <br /> el espacio.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {flowItems.map((it) => (
              <article
                key={it.n}
                className="flow-el group relative bg-white rounded-[1.75rem] sm:rounded-[2rem] p-7 sm:p-8 md:p-10 border border-fluir-magenta/5 transition-all duration-300 hover:border-fluir-magenta/30 hover:shadow-[0_30px_60px_-30px_rgba(213,22,99,0.35)]"
              >
                <div className="flex items-start justify-between mb-6 sm:mb-8">
                  <span className="font-display italic text-4xl sm:text-5xl text-fluir-magenta/80">{it.n}</span>
                  <img
                    src={`${ASSETS}/${it.icon}.png`}
                    alt=""
                    aria-hidden="true"
                    className="w-12 sm:w-14 h-12 sm:h-14 object-contain transition-transform duration-500 group-hover:rotate-6"
                  />
                </div>
                <h3 className="font-display font-light text-2xl sm:text-3xl md:text-[2rem] leading-tight">
                  {it.title}
                </h3>
                <p className="font-body text-base text-fluir-ink/75 leading-relaxed mt-3 sm:mt-4">
                  {it.desc}
                </p>
                <div className="mt-6 sm:mt-8 h-px w-12 bg-fluir-magenta/40 transition-all duration-300 group-hover:w-24" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DIARIO (últimos posts del blog) ─── */}
      {postsLoaded && latestPosts.length > 0 && (
        <section className="relative py-16 sm:py-24 md:py-32 bg-white overflow-hidden">
          <div className="container mx-auto px-5 sm:px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
              <div>
                <span className="font-body text-[11px] sm:text-xs uppercase tracking-[0.28em] text-fluir-magenta inline-flex items-center gap-2">
                  <Dot className="text-fluir-magenta" />
                  Diario de Fluir
                </span>
                <h2 className="font-display font-light leading-tight text-4xl sm:text-5xl md:text-6xl mt-5 sm:mt-6">
                  Lecturas <span className="italic text-fluir-magenta">recientes.</span>
                </h2>
              </div>
              <Link
                to="/fluir-femenino/articulos"
                className="self-start md:self-end inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-fluir-ink text-white font-heading font-bold text-sm hover:bg-fluir-magenta transition-colors"
              >
                Ver todos los artículos
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/fluir-femenino/articulos/${post.slug}`}
                  className="group block bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-fluir-ink/5 hover:border-fluir-magenta/30 transition-colors"
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
                      {post.published_at && <span className="text-fluir-ink/40">{formatPostDate(post.published_at)}</span>}
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
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FINAL CTA ─── */}
      <section className="relative py-16 sm:py-24 md:py-32 bg-white overflow-hidden">
        <img
          src={`${ASSETS}/mandala.png`}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] opacity-10 animate-spin-slow"
        />

        <div className="container mx-auto px-5 sm:px-6 max-w-5xl">
          <div className="cta-el relative rounded-[1.75rem] sm:rounded-[2.5rem] bg-fluir-ink text-white p-8 sm:p-10 md:p-16 lg:p-20 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-fluir-magenta/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-fluir-rose/20 blur-3xl pointer-events-none" />

            <img
              src={`${ASSETS}/flor-loto.png`}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute top-6 sm:top-8 md:top-12 right-6 sm:right-8 md:right-12 w-20 sm:w-24 md:w-32 opacity-60 animate-float-soft"
            />

            <div className="relative max-w-2xl">
              <span className="font-body text-[11px] sm:text-xs uppercase tracking-[0.28em] text-fluir-rose inline-flex items-center gap-2">
                <Dot className="text-fluir-rose" />
                Únete al círculo
              </span>
              <h2 className="font-display font-light leading-[1.05] text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-5 sm:mt-6">
                Tu lugar para
                <span className="italic text-fluir-rose"> respirar profundo.</span>
              </h2>
              <p className="font-body text-base sm:text-lg md:text-xl text-white/85 leading-relaxed mt-6 sm:mt-8 max-w-xl">
                Pronto abrimos las puertas de Fluir Femenino. Sé de las primeras
                en acompañarnos cuando comencemos.
              </p>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a
                  href="https://wa.me/50376284719"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-fluir-magenta text-white px-7 sm:px-8 py-3.5 sm:py-4 rounded-full font-heading font-bold text-sm hover:bg-fluir-rose hover:text-fluir-ink transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-fluir-ink min-h-[44px]"
                >
                  Quiero saber más
                </a>
                <a
                  href="https://www.instagram.com/nutrigabrielare/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center border border-white/40 text-white px-7 sm:px-8 py-3.5 sm:py-4 rounded-full font-heading font-bold text-sm hover:bg-white/10 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-fluir-ink min-h-[44px]"
                >
                  Seguir en Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
