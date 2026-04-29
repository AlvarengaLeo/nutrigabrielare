import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowUpRight, Download, Leaf, HeartHandshake } from 'lucide-react';

const ENTRIES = [
  {
    slug: 'digitales',
    title: 'Productos digitales',
    tagline: 'Aprende a tu ritmo',
    description: 'Ebooks, guías y recetarios para llevar el bienestar a tu día a día. Descarga inmediata después de la compra.',
    Icon: Download,
    accent: 'from-accent/20 to-accent/5',
  },
  {
    slug: 'suplementos',
    title: 'Suplementos',
    tagline: 'Apoyo a tu bienestar',
    description: 'Suplementación seleccionada para acompañar tu plan nutricional. Envíos a todo El Salvador.',
    Icon: Leaf,
    accent: 'from-emerald-300/20 to-emerald-100/5',
  },
  {
    slug: 'servicios',
    title: 'Servicios',
    tagline: 'Acompañamiento 1:1',
    description: 'Consultas presenciales y online con enfoque holístico en salud hormonal y bienestar integral.',
    Icon: HeartHandshake,
    accent: 'from-rose-300/20 to-rose-100/5',
  },
];

export default function PlenoLandingPage() {
  const heroRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pleno-hero-el', {
        y: 40,
        opacity: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.1,
      });
      gsap.fromTo('.pleno-card',
        { y: 50, opacity: 0 },
        {
          scrollTrigger: { trigger: gridRef.current, start: 'top 85%' },
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section ref={heroRef} className="pt-40 pb-16 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="pleno-hero-el inline-block px-3 py-1 mb-6 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary/70">
            Pleno · La tienda
          </div>
          <h1 className="pleno-hero-el font-heading not-italic text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05] text-primary mb-6 max-w-3xl">
            Tu bienestar,<br />
            <span className="font-drama italic text-accent">a tu manera.</span>
          </h1>
          <p className="pleno-hero-el font-body text-lg md:text-xl text-primary/60 max-w-2xl leading-relaxed">
            Descubrí productos digitales para aprender a tu ritmo, suplementos seleccionados y consultas con
            acompañamiento real. Elegí por dónde empezar.
          </p>
        </div>
      </section>

      {/* ── 3 entradas ── */}
      <section ref={gridRef} className="pb-32 bg-background relative z-10 w-full">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {ENTRIES.map(({ slug, title, tagline, description, Icon, accent }, i) => (
              <Link
                key={slug}
                to={`/pleno/${slug}`}
                className={`pleno-card group relative flex flex-col p-8 md:p-10 rounded-[2.5rem] bg-white border border-primary/5 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 ease-out h-full overflow-hidden`}
                aria-label={`Ver ${title}`}
              >
                <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full bg-gradient-to-br ${accent} blur-2xl pointer-events-none`} />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <span className="font-drama italic text-2xl text-accent/40">
                      0{i + 1}
                    </span>
                  </div>

                  <span className="font-body text-xs font-semibold tracking-widest uppercase text-accent mb-2">
                    {tagline}
                  </span>
                  <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary mb-4 tracking-tight">
                    {title}
                  </h2>
                  <p className="font-body text-primary/60 leading-relaxed mb-8 flex-1">
                    {description}
                  </p>

                  <div className="inline-flex items-center gap-2 font-heading font-bold text-sm text-primary group-hover:text-accent transition-colors">
                    Ver {title.toLowerCase()}
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
