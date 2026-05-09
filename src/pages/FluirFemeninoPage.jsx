import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ASSETS = '/media/fluir-femenino';

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
  {
    n: '01',
    title: 'Recetas reales',
    desc: 'Recetarios prácticos para la mujer de El Salvador. Ingredientes accesibles, sabor primero.',
    icon: 'yoga',
  },
  {
    n: '02',
    title: 'Educación viva',
    desc: 'Lives, audios y guías sobre salud hormonal, ciclos, metabolismo y bienestar femenino.',
    icon: 'cabeza',
  },
  {
    n: '03',
    title: 'Círculo cercano',
    desc: 'Una comunidad que se acompaña. Preguntas reales, respuestas reales, sin filtros perfectos.',
    icon: 'espiral',
  },
];

const ICON_BG = {
  magenta: 'bg-fluir-magenta/10',
  teal: 'bg-fluir-teal/15',
  lime: 'bg-fluir-lime/20',
};

export default function FluirFemeninoPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroEls = rootRef.current?.querySelectorAll('.hero-el');
      if (heroEls) gsap.set(heroEls, { opacity: 1, y: 0 });
      gsap.fromTo(
        heroEls || '.hero-el',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: 0.12, delay: 0.05 }
      );

      const pillarEls = rootRef.current?.querySelectorAll('.pillar-el');
      if (pillarEls) {
        gsap.set(pillarEls, { opacity: 1, y: 0 });
        gsap.fromTo(
          pillarEls,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: { trigger: pillarEls[0], start: 'top 85%' },
          }
        );
      }

      const flowEls = rootRef.current?.querySelectorAll('.flow-el');
      if (flowEls) {
        gsap.set(flowEls, { opacity: 1, y: 0 });
        gsap.fromTo(
          flowEls,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: { trigger: flowEls[0], start: 'top 85%' },
          }
        );
      }

      const ctaEl = rootRef.current?.querySelector('.cta-el');
      if (ctaEl) {
        gsap.set(ctaEl, { opacity: 1, y: 0 });
        gsap.fromTo(
          ctaEl,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: ctaEl, start: 'top 85%' },
          }
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="bg-fluir-mist text-fluir-ink overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Soft gradient & blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-fluir-rose/40 blur-3xl animate-breathe" />
          <div className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-fluir-teal/20 blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-fluir-lime/20 blur-3xl animate-breathe" style={{ animationDelay: '4s' }} />
        </div>

        {/* Mandala anchor — slow rotation */}
        <img
          src={`${ASSETS}/mandala.png`}
          alt=""
          aria-hidden="true"
          className="hero-el pointer-events-none absolute -right-32 top-32 w-[640px] h-[640px] opacity-20 animate-spin-slow md:-right-20 md:top-24 md:w-[720px] md:h-[720px]"
        />

        {/* Crescent moon — top left */}
        <img
          src={`${ASSETS}/luna.png`}
          alt=""
          aria-hidden="true"
          className="hero-el pointer-events-none absolute left-8 top-28 hidden w-20 opacity-60 animate-float-soft md:block lg:left-20 lg:w-28"
        />

        <div className="container mx-auto px-6 pt-36 pb-20 max-w-7xl relative">
          {/* Logo */}
          <div className="hero-el inline-block mb-12 md:mb-16">
            <img
              src={`${ASSETS}/logo-magenta.png`}
              alt="Fluir Femenino"
              className="w-44 md:w-56 h-auto"
            />
          </div>

          {/* Headline */}
          <div className="grid grid-cols-12 gap-6">
            <h1 className="hero-el col-span-12 lg:col-span-9 font-display font-light leading-[0.95] tracking-tight text-[3.4rem] sm:text-7xl md:text-8xl lg:text-[8rem]">
              Un espacio<br />
              <span className="text-fluir-magenta italic font-medium" style={{ fontVariationSettings: '"opsz" 144' }}>
                para fluir
              </span>
              <br />
              <span className="text-fluir-ink/40">en tu propio</span>
              <br />
              <span className="text-fluir-ink">tiempo.</span>
            </h1>
          </div>

          <div className="grid grid-cols-12 gap-6 mt-14 md:mt-20">
            <div className="hero-el col-span-12 md:col-span-7 lg:col-span-6">
              <p className="font-body text-lg md:text-xl text-fluir-ink/70 leading-relaxed">
                Calma, cercanía y conocimiento. Un círculo donde la salud hormonal,
                el ciclo y la conexión contigo misma dejan de ser un misterio.
              </p>
              <p className="font-body text-base md:text-lg text-fluir-ink/55 leading-relaxed mt-5">
                Te acompaño más allá de la consulta — con recetas, educación en vivo
                y conversaciones que respetan tus ritmos y tus pausas.
              </p>
            </div>

            {/* Decorative side card */}
            <aside className="hero-el col-span-12 md:col-span-5 lg:col-start-9 lg:col-span-4">
              <div className="relative bg-white/70 backdrop-blur-md border border-fluir-magenta/10 rounded-[2rem] p-7 shadow-[0_30px_60px_-30px_rgba(233,30,99,0.25)]">
                <img
                  src={`${ASSETS}/manos-abiertas.png`}
                  alt=""
                  aria-hidden="true"
                  className="absolute -top-8 -right-6 w-24 h-24 animate-float-soft-rev"
                />
                <p className="font-display italic text-3xl md:text-4xl text-fluir-magenta leading-tight">
                  "Tu cuerpo<br />no es un proyecto<br />a corregir."
                </p>
                <p className="font-body text-xs uppercase tracking-[0.25em] text-fluir-ink/50 mt-6">
                  — Filosofía Fluir
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ─── PILLARS ─── */}
      <section className="relative py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-12 gap-6 mb-16 md:mb-24">
            <div className="col-span-12 md:col-span-7">
              <span className="font-body text-xs uppercase tracking-[0.3em] text-fluir-magenta">
                ◐ Lo que sostenemos
              </span>
              <h2 className="font-display font-light leading-tight text-5xl md:text-6xl lg:text-7xl mt-6">
                Cuatro <span className="italic text-fluir-magenta">latidos</span><br />
                que guían el círculo.
              </h2>
            </div>
            <div className="col-span-12 md:col-span-5 md:pt-12">
              <p className="font-body text-base md:text-lg text-fluir-ink/65 leading-relaxed">
                No promesas mágicas, ni dietas que duran tres semanas. Una manera
                de relacionarte con tu cuerpo que respeta su sabiduría y su ritmo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-16 md:gap-y-24">
            {pillars.map((p, idx) => (
              <article key={p.title} className={`pillar-el ${idx % 2 === 1 ? 'md:translate-y-16' : ''}`}>
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${ICON_BG[p.accent]} mb-6`}>
                  <img src={`${ASSETS}/${p.icon}.png`} alt="" aria-hidden="true" className="w-12 h-12 object-contain" />
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display italic text-fluir-magenta/70 text-xl">0{idx + 1}</span>
                  <div className="flex-1 h-px bg-fluir-magenta/15" />
                </div>
                <h3 className="font-display font-light text-3xl md:text-4xl mt-3 leading-tight">
                  {p.title}
                </h3>
                <p className="font-body text-base md:text-lg text-fluir-ink/65 leading-relaxed mt-4 max-w-md">
                  {p.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FLOW (qué encontrarás) ─── */}
      <section className="relative py-24 md:py-32 bg-fluir-mist">
        {/* Decorative floating icons */}
        <img
          src={`${ASSETS}/espiral.png`}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-10 top-10 w-32 opacity-50 animate-float-soft hidden lg:block"
        />
        <img
          src={`${ASSETS}/flor-loto.png`}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-12 bottom-20 w-28 opacity-40 animate-float-soft-rev hidden lg:block"
        />

        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="font-body text-xs uppercase tracking-[0.3em] text-fluir-magenta">
              ◐ Qué encontrarás
            </span>
            <h2 className="font-display font-light leading-[1.05] text-5xl md:text-6xl mt-6">
              Tres formas de
              <span className="italic text-fluir-magenta"> habitar</span>
              <br /> el espacio.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {flowItems.map((it) => (
              <article
                key={it.n}
                className="flow-el group relative bg-white rounded-[2rem] p-8 md:p-10 border border-fluir-magenta/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-40px_rgba(233,30,99,0.35)]"
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="font-display italic text-5xl text-fluir-magenta/80">{it.n}</span>
                  <img
                    src={`${ASSETS}/${it.icon}.png`}
                    alt=""
                    aria-hidden="true"
                    className="w-14 h-14 object-contain transition-transform duration-700 group-hover:rotate-12"
                  />
                </div>
                <h3 className="font-display font-light text-3xl md:text-4xl leading-tight">
                  {it.title}
                </h3>
                <p className="font-body text-fluir-ink/65 leading-relaxed mt-4">
                  {it.desc}
                </p>
                <div className="mt-8 h-px w-12 bg-fluir-magenta/40 transition-all duration-500 group-hover:w-24" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-24 md:py-36 bg-white overflow-hidden">
        {/* Big background mandala */}
        <img
          src={`${ASSETS}/mandala.png`}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] opacity-10 animate-spin-slow"
        />

        <div className="container mx-auto px-6 max-w-5xl">
          <div className="cta-el relative rounded-[2.5rem] bg-gradient-to-br from-fluir-magenta via-fluir-magenta to-[#A91550] text-white p-10 md:p-16 lg:p-20 overflow-hidden">
            {/* Inner decorative blobs */}
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-fluir-rose/30 blur-3xl" />

            <img
              src={`${ASSETS}/yoga.png`}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute top-8 right-8 md:top-12 md:right-12 w-24 md:w-32 opacity-25 animate-float-soft"
              style={{ filter: 'brightness(0) invert(1)' }}
            />

            <div className="relative max-w-2xl">
              <span className="font-body text-xs uppercase tracking-[0.3em] text-white/70">
                ◐ Únete al círculo
              </span>
              <h2 className="font-display font-light leading-[1.05] text-5xl md:text-6xl lg:text-7xl mt-6">
                Tu lugar para
                <span className="italic"> respirar profundo.</span>
              </h2>
              <p className="font-body text-lg md:text-xl text-white/80 leading-relaxed mt-8 max-w-xl">
                Pronto abrimos las puertas de Fluir Femenino. Sé de las primeras
                en acompañarnos cuando comencemos.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="https://wa.me/50376284719"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-white text-fluir-magenta px-8 py-4 rounded-full font-heading font-bold text-sm hover:bg-fluir-rose hover:text-fluir-ink transition-colors"
                >
                  Quiero saber más
                </a>
                <a
                  href="https://www.instagram.com/nutrigabrielare/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border border-white/40 text-white px-8 py-4 rounded-full font-heading font-bold text-sm hover:bg-white/10 transition-colors"
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
