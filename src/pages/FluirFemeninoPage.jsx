import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const contentBlocks = [
  {
    title: 'Recetas y nutrición real',
    desc: 'Opciones prácticas y deliciosas pensadas para sostener tu balance hormonal y un bienestar genuino día a día.',
  },
  {
    title: 'Salud hormonal al día',
    desc: 'Información respaldada por la ciencia sobre cómo tu alimentación y tus hábitos influyen en tu metabolismo y tus ciclos.',
  },
  {
    title: 'Mente, cuerpo y alma',
    desc: 'Contenido alrededor de los tres pilares del enfoque holístico: salud mental, movimiento consciente y conexión interior.',
  },
  {
    title: 'Acompañamiento que fluye',
    desc: 'Espacios para conectar, mantenerte inspirada y compartir tu progreso con un círculo de mujeres que entiende tu proceso.',
  },
];

export default function FluirFemeninoPage() {
  const heroRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.com-hero-el', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.1,
      });

      gsap.from('.content-block', {
        scrollTrigger: { trigger: contentRef.current, start: 'top 80%' },
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="min-h-[70vh] flex items-end pb-20 pt-32 bg-background relative overflow-hidden"
      >
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="com-hero-el inline-block px-3 py-1 mb-6 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary/70">
            Fluir Femenino
          </div>
          <h1 className="com-hero-el font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-tighter text-primary mb-6 max-w-2xl">
            Tu espacio para fluir.
          </h1>
          <p className="com-hero-el font-body text-lg md:text-xl text-primary/60 max-w-xl leading-relaxed mb-4">
            Calma, cercanía y motivación. Un círculo donde cuidamos cuerpo, mente y alma juntas.
          </p>
          <p className="com-hero-el font-body text-base md:text-lg text-primary/50 max-w-xl leading-relaxed mb-8">
            Recetas prácticas, educación en salud hormonal y conversaciones en vivo sobre hábitos y bienestar integral.
            Te acompaño más allá de la consulta para que tu energía, tus ciclos y tus emociones fluyan en armonía.
          </p>
        </div>
      </section>

      {/* ── Qué vas a encontrar ── */}
      <section
        ref={contentRef}
        className="py-24 bg-background relative z-10 w-full overflow-hidden"
      >
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-16 flex flex-col items-start max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-primary tracking-tighter mb-4">
              Qué vas a encontrar
            </h2>
            <div className="w-16 h-1 bg-accent rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {contentBlocks.map((block, idx) => (
              <div
                key={idx}
                className="content-block p-8 md:p-10 rounded-[2rem] bg-white border border-primary/5 hover:border-primary/10 transition-colors duration-500"
              >
                <div className="font-drama italic text-2xl text-accent mb-4">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h3 className="font-heading font-bold text-2xl text-primary mb-3 tracking-tight">
                  {block.title}
                </h3>
                <p className="font-body text-primary/70 text-base md:text-lg leading-relaxed">
                  {block.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
