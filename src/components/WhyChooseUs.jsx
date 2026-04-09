import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scale, HeartPulse, Carrot, Leaf } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function WhyChooseUs() {
  const containerRef = useRef(null);

  const reasons = [
    {
      icon: <Scale className="w-5 h-5 text-primary" />,
      title: 'Sin Extremos, Solo Balance',
      desc: 'Creemos en un progreso realista, sin dietas extremas ni soluciones de moda. Construimos rutinas para un bienestar a largo plazo.'
    },
    {
      icon: <HeartPulse className="w-5 h-5 text-primary" />,
      title: 'Pérdida de Peso Saludable',
      desc: 'Descubre estrategias efectivas basadas en evidencia para optimizar tu composición corporal mediante planes agradables y seguros.'
    },
    {
      icon: <Carrot className="w-5 h-5 text-primary" />,
      title: 'Servicio Integral de Nutrición',
      desc: 'Eleva de nivel tu calidad de vida a través de asesoría experta. Toma el control total sobre tu salud con máxima confianza.'
    }
  ];

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Animate Header
      gsap.from('.wcu-header', {
        scrollTrigger: { trigger: containerRef.current, start: 'top 80%' },
        y: 30, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out'
      });
      // Animate entire list block as one unit
      gsap.from('.wcu-list', {
        scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
        y: 50, opacity: 0, duration: 1, ease: 'power3.out'
      });
      // Animate Plate Entrance
      gsap.from('.wcu-plate', {
        scrollTrigger: { trigger: containerRef.current, start: 'top 60%' },
        x: 100, opacity: 0, rotation: 45, duration: 1.5, ease: 'power3.out',
        clearProps: "transform"
      });

      // Continuous 3D Float
      gsap.to('.plate-wrapper', {
        y: -15,
        x: 10,
        rotation: 3,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-white relative w-full overflow-hidden">
      {/* Background soft shadow gradient on the left like the mockup */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-health/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 max-w-6xl relative z-10 flex flex-col items-center lg:items-end">
        
        {/* Header Block */}
        <div className="flex flex-col items-center lg:items-end text-center lg:text-right w-full max-w-4xl mb-16 lg:pr-10">
          <div className="wcu-header inline-flex items-center gap-2 px-4 py-1.5 bg-health/10 text-health border border-health/20 rounded-full mb-6 relative">
            <Leaf className="w-4 h-4 fill-current opacity-80" />
            <span className="text-xs font-bold font-body uppercase tracking-wider text-primary">Por qué elegirnos</span>
          </div>
          <h2 className="wcu-header font-drama italic text-4xl md:text-5xl lg:text-[4rem] text-primary tracking-tight leading-[1.1]">
            No Buscamos <span className="font-heading not-italic whitespace-nowrap">Perfección—</span><br/>
            Te Buscamos a <span className="font-heading not-italic text-accent">Ti</span>
          </h2>
        </div>

        {/* Content Split Layout */}
        <div className="w-full flex flex-col lg:flex-row items-start relative min-h-[500px]">
          
          {/* Left Vertical List */}
          <div className="wcu-list w-full lg:w-[55%] flex flex-col gap-6 relative z-20">
            {reasons.map((item, i) => (
              <div key={i} className="wcu-item group bg-health/10 border border-health/10 hover:border-health/30 rounded-[2rem] p-6 md:p-8 flex gap-5 md:gap-6 items-start transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#c9e1c1] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 shadow-sm border border-primary/5">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg md:text-xl text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-primary/70 leading-relaxed text-sm md:text-base">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Floating Plate */}
          <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-[45%] h-full z-10 pointer-events-auto items-center justify-end translate-x-[20%]">
            <div className="plate-wrapper w-full max-w-[800px]">
              <img 
                src="/media/healthy_plate.png" 
                alt="Platillo Saludable" 
                className="wcu-plate w-full h-auto object-contain mix-blend-multiply contrast-[1.15] brightness-110 hover:scale-105 hover:-rotate-6 transition-all duration-[1s] ease-out cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
