import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Leaf,
  Heart,
  Sprout,
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  MessageCircle,
  Activity,
  UtensilsCrossed,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Fluir Femenino · diseño v2 (no reemplaza /fluir-femenino).
 * Editorial sage + cream + rose. Logos FFLOGO1-4 viven en
 * /public/media/fluir-femenino-v2/.
 */

const COLORS = {
  pageBg: '#c5d3b6',         // sage soft band
  cardBg: '#faf5ec',         // warm cream card
  cardSoft: '#f3ede1',       // creamy card alt
  rose: '#e9c5be',           // blush
  roseDeep: '#c98a83',       // accent italic + heart line
  sage: '#7a9476',           // primary sage (button)
  sageDeep: '#5c7a59',       // hover / accent
  ink: '#1f2d20',            // headings
  body: '#5e6a55',           // body text
  mute: '#8a8f7e',           // small text
  line: '#e3dccd',           // hairlines
};

const PILLARS = [
  {
    icon: Leaf,
    title: 'Conexión real',
    desc: 'Comparte, escucha y aprende juntas.',
  },
  {
    icon: Heart,
    title: 'Bienestar integral',
    desc: 'Nutrición, mente y hábitos que fluyen.',
  },
  {
    icon: Sprout,
    title: 'Apoyo constante',
    desc: 'No estás sola, aquí estamos para ti.',
  },
  {
    icon: BookOpen,
    title: 'Recursos exclusivos',
    desc: 'Contenido práctico para tu día a día.',
  },
  {
    icon: Sparkles,
    title: 'Crecimiento personal',
    desc: 'Pequeños cambios, grandes transformaciones.',
  },
];

const COMMUNITY_CARDS = [
  {
    icon: MessageCircle,
    title: 'Charlas y debates',
    desc: 'Temas reales que importan.',
    meta: '243 publicaciones',
    accent: COLORS.rose,
  },
  {
    icon: BookOpen,
    title: 'Recursos y guías',
    desc: 'Herramientas prácticas para ti.',
    meta: '18 recursos',
    accent: COLORS.cardSoft,
  },
  {
    icon: Activity,
    title: 'Retos y hábitos',
    desc: 'Pequeños pasos, grandes cambios.',
    meta: 'Retos activos',
    accent: COLORS.pageBg,
  },
  {
    icon: UtensilsCrossed,
    title: 'Recetas e inspiración',
    desc: 'Ideas deliciosas y nutritivas.',
    meta: '76 recetas',
    accent: COLORS.cardSoft,
  },
];

export default function FluirFemeninoV2Page() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ffv2-hero-el', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.15,
      });
      gsap.from('.ffv2-pillar', {
        scrollTrigger: { trigger: '.ffv2-pillars', start: 'top 85%' },
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.07,
        ease: 'power3.out',
        clearProps: 'all',
      });
      gsap.from('.ffv2-community-card', {
        scrollTrigger: { trigger: '.ffv2-community', start: 'top 80%' },
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'all',
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden font-body"
      style={{
        background: `linear-gradient(180deg, ${COLORS.pageBg} 0%, ${COLORS.pageBg} 60%, #d8dfc7 100%)`,
        color: COLORS.body,
      }}
    >
      {/* spacer for floating Navbar */}
      <div className="pt-28" aria-hidden />

      {/* decorative botanical leaves (very subtle) */}
      <img
        src="/media/fluir-femenino-v2/crecimiento.png"
        alt=""
        aria-hidden
        className="hidden lg:block pointer-events-none absolute -left-16 top-32 w-44 opacity-25"
      />
      <img
        src="/media/fluir-femenino-v2/loto.png"
        alt=""
        aria-hidden
        className="hidden lg:block pointer-events-none absolute right-2 top-[24rem] w-32 opacity-30 rotate-12"
      />

      {/* ───── Hero ───── */}
      <section className="px-6 sm:px-10 lg:px-16 pb-12 lg:pb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
          {/* Text */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <span
              className="ffv2-hero-el font-body text-[12px] tracking-[0.08em] flex items-center gap-2"
              style={{ color: COLORS.mute }}
            >
              <img
                src="/media/fluir-femenino-v2/logo-1.png"
                alt="Fluir Femenino"
                className="h-8 w-8 object-contain rounded-full"
                style={{ background: COLORS.cardBg }}
              />
              Bienvenida a la comunidad
            </span>

            <h1
              className="ffv2-hero-el font-drama font-normal leading-[1.05] tracking-tight text-[2.5rem] sm:text-[3rem] lg:text-[3.6rem] m-0"
              style={{ color: COLORS.ink }}
            >
              Un espacio para nutrirte,{' '}
              <Heart
                className="inline align-middle"
                size={28}
                strokeWidth={1.5}
                style={{ color: COLORS.roseDeep }}
              />
              <br />
              <em className="italic font-normal" style={{ color: COLORS.sageDeep }}>
                conectar y crecer juntas
              </em>
            </h1>

            <p
              className="ffv2-hero-el font-body text-[15px] lg:text-base leading-relaxed max-w-md m-0"
              style={{ color: COLORS.body }}
            >
              Aquí encontrarás apoyo, inspiración y herramientas prácticas para
              sentirte bien en tu cuerpo, tu mente y tu ciclo.
            </p>

            <div className="ffv2-hero-el flex flex-wrap items-center gap-3">
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm tracking-[0.02em] transition-colors"
                style={{ backgroundColor: COLORS.sage }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.sageDeep)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.sage)}
              >
                Únete a la comunidad
                <Leaf size={14} strokeWidth={1.75} />
              </Link>
            </div>
          </div>

          {/* Photo with organic blob frame */}
          <div className="ffv2-hero-el relative">
            <div
              className="absolute inset-0 -m-4 lg:-m-8"
              style={{
                background: `radial-gradient(closest-side, ${COLORS.cardBg}, transparent 75%)`,
                borderRadius: '52% 48% 56% 44% / 50% 56% 44% 50%',
                opacity: 0.85,
              }}
              aria-hidden
            />
            <div
              className="relative overflow-hidden shadow-[0_30px_60px_-30px_rgba(45,58,45,0.35)]"
              style={{ borderRadius: '52% 48% 56% 44% / 50% 56% 44% 50%' }}
            >
              <img
                src="/media/fluir-femenino-v2/hero-photo.jpg"
                alt="Mujer en momento de bienestar y conexión consigo misma"
                className="block w-full h-[380px] sm:h-[440px] lg:h-[520px] object-cover"
                loading="eager"
              />
              {/* subtle warm overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(250,245,236,0) 0%, rgba(250,245,236,0.15) 100%)',
                }}
              />
            </div>

            {/* botanical accent */}
            <img
              src="/media/fluir-femenino-v2/yoga.png"
              alt=""
              aria-hidden
              className="absolute -right-4 -bottom-6 w-20 lg:w-24 opacity-90 rotate-6"
            />

            {/* curved label */}
            <span
              className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 text-[11px] tracking-[0.32em] uppercase"
              style={{
                color: COLORS.mute,
                writingMode: 'vertical-rl',
              }}
            >
              nutrición · bienestar · conexión
            </span>
          </div>
        </div>
      </section>

      {/* ───── Pillars row ───── */}
      <section className="ffv2-pillars px-6 sm:px-10 lg:px-16 pb-12 lg:pb-16">
        <div
          className="max-w-7xl mx-auto rounded-[28px] p-5 sm:p-7 lg:p-8 shadow-[0_18px_40px_-26px_rgba(45,58,45,0.25)]"
          style={{ backgroundColor: COLORS.cardBg }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-6">
            {PILLARS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="ffv2-pillar flex items-start gap-3.5">
                <div
                  className="shrink-0 grid place-items-center w-11 h-11 rounded-full"
                  style={{
                    backgroundColor: i % 2 === 0 ? COLORS.pageBg : COLORS.rose,
                  }}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    style={{ color: i % 2 === 0 ? COLORS.sageDeep : COLORS.roseDeep }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span
                    className="font-heading text-[13.5px] font-semibold leading-tight"
                    style={{ color: COLORS.ink }}
                  >
                    {title}
                  </span>
                  <p
                    className="font-body text-[12.5px] leading-snug m-0"
                    style={{ color: COLORS.body }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Community grid ───── */}
      <section className="ffv2-community px-6 sm:px-10 lg:px-16 pb-12 lg:pb-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.6fr_1fr] gap-6 lg:gap-7">
          {/* Left · Dentro de la comunidad */}
          <div
            className="rounded-[28px] p-6 lg:p-9"
            style={{ backgroundColor: COLORS.rose + '50' /* very soft blush */ }}
          >
            <div className="flex items-end justify-between mb-7">
              <div>
                <h2
                  className="font-drama text-2xl lg:text-[1.85rem] font-normal m-0"
                  style={{ color: COLORS.ink }}
                >
                  Dentro de la comunidad
                </h2>
                <p
                  className="font-body text-[13px] mt-1 m-0"
                  style={{ color: COLORS.body }}
                >
                  Esto es lo que encontrarás cada día.
                </p>
              </div>
              <Link
                to="/fluir-femenino-v2#comunidad"
                className="font-body text-[13px] underline underline-offset-4 hover:opacity-70 transition-opacity"
                style={{ color: COLORS.sageDeep }}
              >
                Ver todo
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {COMMUNITY_CARDS.map(({ icon: Icon, title, desc, meta, accent }) => (
                <article
                  key={title}
                  className="ffv2-community-card flex flex-col gap-3 rounded-2xl p-4 lg:p-5"
                  style={{ backgroundColor: COLORS.cardBg }}
                >
                  <div
                    className="aspect-[5/4] rounded-xl grid place-items-center overflow-hidden relative"
                    style={{ backgroundColor: accent }}
                  >
                    <Icon
                      size={32}
                      strokeWidth={1.25}
                      style={{ color: COLORS.sageDeep, opacity: 0.55 }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span
                      className="font-heading text-[14px] font-semibold leading-tight"
                      style={{ color: COLORS.ink }}
                    >
                      {title}
                    </span>
                    <p
                      className="font-body text-[12.5px] leading-snug m-0"
                      style={{ color: COLORS.body }}
                    >
                      {desc}
                    </p>
                    <span
                      className="font-body text-[11.5px] mt-2 inline-flex items-center gap-1.5"
                      style={{ color: COLORS.mute }}
                    >
                      <Leaf size={11} strokeWidth={1.6} />
                      {meta}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Right · Este es tu lugar */}
          <aside
            className="relative rounded-[28px] p-6 lg:p-8 flex flex-col gap-5 overflow-hidden"
            style={{ backgroundColor: COLORS.cardBg }}
          >
            <img
              src="/media/fluir-femenino-v2/mandala.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -right-8 -bottom-10 w-44 opacity-25"
            />

            <h3
              className="font-drama text-2xl lg:text-[1.7rem] font-normal m-0 relative"
              style={{ color: COLORS.ink }}
            >
              Este es tu lugar
            </h3>
            <p
              className="font-body text-[13.5px] leading-relaxed m-0 max-w-xs relative"
              style={{ color: COLORS.body }}
            >
              Un espacio seguro para ser tú, compartir tu historia y florecer a
              tu ritmo.
            </p>

            <Heart
              size={28}
              strokeWidth={1.4}
              style={{ color: COLORS.roseDeep }}
              className="relative"
            />

            <Link
              to="/registro"
              className="self-start inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm relative transition-colors"
              style={{ backgroundColor: COLORS.sage }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.sageDeep)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.sage)}
            >
              Únete ahora
              <ArrowUpRight size={14} strokeWidth={2} />
            </Link>

            <div className="flex items-center gap-3 mt-2 relative">
              {/* member dots */}
              <div className="flex -space-x-2">
                {[COLORS.sage, COLORS.roseDeep, COLORS.sageDeep].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2"
                    style={{ backgroundColor: c, borderColor: COLORS.cardBg }}
                    aria-hidden
                  />
                ))}
              </div>
              <span className="font-body text-[12.5px] leading-tight" style={{ color: COLORS.body }}>
                <strong style={{ color: COLORS.ink }}>+1,200 mujeres</strong>
                <br />
                ya forman parte
              </span>
            </div>
          </aside>
        </div>
      </section>

      {/* ───── Newsletter bar ───── */}
      <section className="px-6 sm:px-10 lg:px-16 pb-20 lg:pb-28">
        <div
          className="max-w-7xl mx-auto rounded-[28px] px-5 sm:px-8 lg:px-10 py-6 lg:py-7 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8 relative overflow-hidden"
          style={{
            background: `linear-gradient(110deg, ${COLORS.pageBg} 0%, ${COLORS.cardSoft} 70%, ${COLORS.rose}60 100%)`,
          }}
        >
          <img
            src="/media/fluir-femenino-v2/manos.png"
            alt=""
            aria-hidden
            className="hidden lg:block pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 w-20 opacity-70"
          />
          <Heart
            className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2"
            size={36}
            strokeWidth={1.3}
            style={{ color: COLORS.roseDeep, opacity: 0.7 }}
          />

          <div className="lg:pl-28 flex-1">
            <h3
              className="font-drama text-xl lg:text-[1.5rem] font-normal m-0"
              style={{ color: COLORS.ink }}
            >
              ¿Lista para formar parte?
            </h3>
            <p className="font-body text-[13px] m-0 mt-1" style={{ color: COLORS.body }}>
              Únete y comienza a vivir tu bienestar en comunidad.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row items-stretch gap-2 lg:max-w-md lg:pr-16"
          >
            <input
              type="email"
              placeholder="Escribe tu correo"
              className="flex-1 px-5 py-3 rounded-full bg-white text-[13.5px] outline-none border transition-colors"
              style={{ borderColor: COLORS.line, color: COLORS.ink }}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
              style={{ backgroundColor: COLORS.sage }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.sageDeep)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.sage)}
            >
              Quiero unirme
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
