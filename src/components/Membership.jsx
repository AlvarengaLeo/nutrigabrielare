import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

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
    <section id="comunidad" ref={sectionRef} className="py-24 md:py-32 bg-background relative z-10 w-full overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-20 md:mb-28 flex flex-col items-start border-l-2 border-accent pl-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-primary tracking-tighter mb-4">
            Tres formas de sumarte
          </h2>
          <p className="font-drama italic text-2xl md:text-3xl text-primary/60">
            Comunidad, impacto y colección.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-stretch">
          
          {/* Block 1: Comunidad → /comunidad */}
          <Link to="/comunidad" className="entry-block md:col-span-5 flex flex-col justify-between p-10 md:p-12 rounded-[2.5rem] bg-white border border-primary/5 hover:border-primary/10 transition-colors duration-500 group">
            <div>
              <div className="font-drama italic text-xl text-accent mb-6">01</div>
              <h3 className="font-heading font-bold text-3xl text-primary mb-4 tracking-tight">Comunidad</h3>
              <p className="font-body text-primary/70 text-lg leading-relaxed mb-12">
                Historias, contenido y momentos reales del universo Majes.
              </p>
            </div>
            <span className="inline-flex items-center text-primary font-bold font-body group-hover:text-accent transition-colors w-fit">
              Explorar comunidad <ArrowUpRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </span>
          </Link>

          {/* Block 2: Proyecto Banquita → /donacion */}
          <Link to="/donacion" className="entry-block md:col-span-7 flex flex-col justify-center p-10 md:p-16 rounded-[2.5rem] bg-primary text-background group relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10">
              <div className="font-drama italic text-xl text-accent/50 mb-6">02</div>
              <h3 className="font-heading font-bold text-3xl md:text-4xl mb-4 tracking-tight">Proyecto Banquita</h3>
              <p className="font-body text-background/70 text-lg md:text-xl leading-relaxed mb-10 max-w-md">
                Una forma de convertir la hermandad en ayuda real.
              </p>
              <span className="magnetic-btn inline-flex items-center justify-center px-8 py-4 rounded-full bg-background text-primary font-bold font-body transition-colors">
                <span className="relative z-10">Hacer un aporte</span>
              </span>
            </div>
          </Link>

          {/* Block 3: Colección → /tienda */}
          <Link to="/tienda" className="entry-block md:col-span-12 flex flex-col md:flex-row items-start md:items-center justify-between p-10 md:p-12 rounded-[2.5rem] bg-accent/5 border border-accent/10 group">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="font-drama italic text-xl text-primary/40 mb-4">03</div>
              <h3 className="font-heading font-bold text-3xl text-primary mb-3 tracking-tight">Colección</h3>
              <p className="font-body text-primary/70 text-lg leading-relaxed">
                Piezas creadas desde la identidad de Majes de Sivar.
              </p>
            </div>
            <div className="md:w-auto">
              <span className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-primary text-primary font-bold font-body group-hover:bg-primary group-hover:text-background transition-colors duration-300">
                Ver colección
              </span>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
