import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  const sectionRef = useRef(null);
  
  const features = [
    {
      num: '01',
      title: 'Mostrar',
      desc: 'Contamos quiénes somos, de dónde venimos y cómo se vive El Salvador desde nuestra mirada.'
    },
    {
      num: '02',
      title: 'Reír',
      desc: 'Compartimos la jodedera, los recuerdos y los momentos reales que mantienen viva la hermandad.'
    },
    {
      num: '03',
      title: 'Ayudar',
      desc: 'Usamos lo que somos para sumar algo bueno y convertir la amistad en impacto real.'
    }
  ];

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="que-hacemos" ref={sectionRef} className="py-24 bg-[#F7F4EE] relative z-10 w-full overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-16 md:mb-24 flex flex-col items-start max-w-2xl">
          <div className="inline-block px-3 py-1 mb-6 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary/70">
            Qué hacemos
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-primary tracking-tighter mb-4">
            Tres pilares de la hermandad
          </h2>
          <p className="text-lg md:text-xl font-body text-primary/60">
            Así se expresa Majes de Sivar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card group flex flex-col p-8 md:p-10 rounded-[2rem] bg-background border border-primary/5 shadow-xl hover:-translate-y-2 transition-transform duration-500 ease-out h-full">
              <div className="text-accent font-drama italic text-3xl md:text-4xl mb-6">
                {feature.num}
              </div>
              <h3 className="font-heading font-bold text-2xl text-primary mb-4 tracking-tight">
                {feature.title}
              </h3>
              <div className="w-8 h-[2px] bg-accent mb-6 rounded-full transition-all duration-300 group-hover:w-16" />
              <p className="font-body text-primary/70 leading-relaxed text-base md:text-lg">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
