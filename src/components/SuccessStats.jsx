import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useHomeContent } from '../context/HomeContentContext';

gsap.registerPlugin(ScrollTrigger);

/**
 * Barra de "Casos de éxito" (estadísticas) como sección propia del inicio,
 * para que se pueda reordenar de forma independiente desde el panel.
 * Los valores se editan en el tab "Filosofía" (content.philosophy.stats).
 */
export default function SuccessStats() {
  const sectionRef = useRef(null);
  const { content } = useHomeContent();
  const d = content.philosophy || {};
  const stats = d.stats || [];
  const imgs = d.decorativeImages || {};

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.stats-el', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 88%' },
        scale: 0.95,
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
      });
      gsap.utils.toArray('.stats-blob').forEach((blob, i) => {
        gsap.to(blob, {
          y: i % 2 === 0 ? -16 : 16,
          x: i % 2 !== 0 ? 12 : -12,
          rotation: i % 2 === 0 ? 6 : -6,
          duration: 4 + i * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!stats.length) return null;

  return (
    <section ref={sectionRef} className="py-10 md:py-14 bg-white relative z-10 w-full overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl relative">
        {/* Frutas decorativas flanqueando la barra */}
        <img
          src={imgs.topLeft || '/media/ora.png'}
          alt=""
          aria-hidden="true"
          className="stats-blob pointer-events-none absolute -left-2 -top-8 w-16 h-16 md:w-28 md:h-28 object-contain opacity-90 select-none hidden sm:block"
        />
        <img
          src={imgs.topRight || '/media/tom.png'}
          alt=""
          aria-hidden="true"
          className="stats-blob pointer-events-none absolute -right-2 -bottom-8 w-16 h-16 md:w-28 md:h-28 object-contain opacity-90 select-none hidden sm:block"
        />

        <div className="stats-el w-full max-w-4xl mx-auto border-2 border-dashed border-primary/20 rounded-[2rem] bg-background md:bg-health/5 p-8 md:p-12 relative z-20 hover:border-primary/40 transition-colors duration-500">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="font-drama text-4xl md:text-5xl italic font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="font-body text-sm font-semibold text-primary/60 tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
