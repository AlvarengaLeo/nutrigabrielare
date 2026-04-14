import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, BookOpen } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Membership() {
  const sectionRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.entry-block', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="recursos" ref={sectionRef} className="py-24 md:py-32 bg-background relative z-10 w-full overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col items-start w-full relative z-20 mb-20 lg:mb-24">
          <div className="entry-block inline-flex items-center gap-2 px-4 py-1.5 bg-health/10 text-primary border border-health/20 rounded-full mb-6 max-w-fit">
            <BookOpen className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold font-body uppercase tracking-wider text-primary">Recursos</span>
          </div>

          <h2 className="entry-block font-heading not-italic text-4xl md:text-5xl lg:text-[4rem] text-primary tracking-tight leading-[1.1] max-w-3xl">
            Ebooks, Guías & Programas—<br/>
            <span className="font-drama italic text-accent">Tu Bienestar Automatizado</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-stretch">
          
          {/* Block 1: Planes & Comunidad */}
          <Link to="/comunidad" className="entry-block md:col-span-6 flex flex-col justify-between p-10 md:p-12 rounded-[2.5rem] bg-white border border-primary/5 hover:border-primary/10 hover:-translate-y-3 hover:shadow-2xl transition-transform duration-700 ease-out group">
            <div>
              <div className="font-drama italic text-xl text-accent mb-6">01</div>
              <h3 className="font-heading font-bold text-3xl text-primary mb-4 tracking-tight">Guías y Recetarios</h3>
              <p className="font-body text-primary/70 text-lg leading-relaxed mb-6">
                Descarga ebooks con enfoques específicos: salud hormonal, pérdida de peso, recetas prácticas y guías de hábitos para una vida con balance real.
              </p>
              <div className="w-full h-32 rounded-xl bg-gradient-to-br from-primary/5 to-accent/10 mb-8 flex items-center justify-center overflow-hidden relative">
                <span className="font-heading font-bold text-primary/30 text-2xl absolute z-0 tracking-widest hidden md:block uppercase">Ejemplos Reales</span>
                <div className="flex gap-2 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-health/20 border-2 border-white shadow-sm flex items-center justify-center text-health font-bold text-xs">-10%</div>
                    <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-white shadow-sm flex items-center justify-center text-accent font-bold text-xs">Proteína</div>
                </div>
              </div>
            </div>
            <span className="inline-flex items-center text-primary font-bold font-body group-hover:text-accent transition-colors w-fit">
              Unirse a la comunidad <ArrowUpRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </span>
          </Link>

          {/* Block 2: Consulta Social */}
          <Link to="/nutricion-con-alma" className="entry-block md:col-span-6 flex flex-col justify-center p-10 md:p-16 rounded-[2.5rem] bg-primary text-background hover:-translate-y-3 hover:shadow-2xl transition-transform duration-700 ease-out group relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10">
              <div className="font-drama italic text-xl text-accent/50 mb-6">02</div>
              <h3 className="font-heading font-bold text-3xl md:text-4xl mb-4 tracking-tight">Consulta Social</h3>
              <p className="font-body text-background/70 text-lg md:text-xl leading-relaxed mb-10 max-w-sm">
                Creo que el bienestar integral debe ser accesible. Por eso ofrezco nutrición profesional a quienes más lo necesitan.
              </p>
              <span className="magnetic-btn inline-flex items-center justify-center px-8 py-4 rounded-full bg-background text-primary font-bold font-body transition-colors">
                <span className="relative z-10">Más información</span>
              </span>
            </div>
          </Link>

          {/* Block 3: Tienda / Ecommerce */}
          <Link to="/tienda" className="entry-block md:col-span-12 flex flex-col md:flex-row items-start md:items-center justify-between p-10 md:p-12 rounded-[2.5rem] bg-accent/5 border border-accent/10 hover:-translate-y-3 hover:shadow-2xl transition-transform duration-700 ease-out group">
            <div className="md:w-3/5 mb-8 md:mb-0">
              <div className="font-drama italic text-xl text-primary/40 mb-4">03</div>
              <h3 className="font-heading font-bold text-3xl text-primary mb-3 tracking-tight">Tienda de Productos Digitales</h3>
              <p className="font-body text-primary/70 text-lg leading-relaxed max-w-2xl">
                Ebooks, programas y recetarios diseñados para diferentes objetivos. Compra, descarga y empieza tu transformación de forma inmediata y automatizada.
              </p>
            </div>
            <div className="md:w-auto">
              <span className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-primary text-background font-bold font-body group-hover:scale-105 transition-transform duration-300 shadow-xl shadow-primary/20">
                Explorar tienda virtual
              </span>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
