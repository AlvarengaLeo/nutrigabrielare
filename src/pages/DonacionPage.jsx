import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, Users, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const tiers = [
  {
    name: 'Maje Solidario',
    amount: '$5',
    desc: 'Un gesto sencillo que suma. Cada aporte, por pequeño que sea, llega directo.',
    icon: Heart,
  },
  {
    name: 'Maje de Corazón',
    amount: '$25',
    desc: 'Un compromiso más cercano con la comunidad. Tu aporte sostiene jornadas completas.',
    icon: Users,
  },
  {
    name: 'Maje Banquita',
    amount: '$50+',
    desc: 'El nivel más alto de hermandad. Ayudás a construir algo que trasciende.',
    icon: Award,
  },
];

const transparencyStats = [
  { label: 'Recaudado', value: '$2,450' },
  { label: 'Jornadas realizadas', value: '3' },
  { label: 'Familias apoyadas', value: '45+' },
];

export default function DonacionPage() {
  const heroRef = useRef(null);
  const tiersRef = useRef(null);
  const transparencyRef = useRef(null);
  const closingRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.don-hero-el', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.1,
      });

      gsap.from('.tier-card', {
        scrollTrigger: { trigger: tiersRef.current, start: 'top 80%' },
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
      });

      gsap.from('.transparency-el', {
        scrollTrigger: { trigger: transparencyRef.current, start: 'top 80%' },
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
      });

      gsap.from('.closing-don-el', {
        scrollTrigger: { trigger: closingRef.current, start: 'top 80%' },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section ref={heroRef} className="min-h-[70vh] flex items-end pb-20 pt-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="don-hero-el inline-block px-3 py-1 mb-6 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary/70">
            Donación
          </div>
          <h1 className="don-hero-el font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-tighter text-primary mb-6 max-w-2xl">
            Proyecto Banquita
          </h1>
          <p className="don-hero-el font-body text-lg md:text-xl text-primary/60 max-w-xl leading-relaxed">
            Una forma real de convertir la hermandad en ayuda.
          </p>
        </div>
      </section>

      {/* ── Tiers ── */}
      <section ref={tiersRef} className="py-24 bg-[#F7F4EE] relative z-10 w-full overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-16 flex flex-col items-start max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-primary tracking-tighter mb-4">
              Elegí cómo sumar
            </h2>
            <p className="font-body text-primary/60 text-lg">
              Cada opción es una forma de ser parte. No hay montos pequeños cuando la intención es real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div key={tier.name} className="tier-card group flex flex-col justify-between p-10 md:p-12 rounded-[2.5rem] bg-white border border-primary/5 hover:border-accent/20 transition-colors duration-500 min-h-[380px]">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-heading font-bold text-2xl text-primary mb-2 tracking-tight">{tier.name}</h3>
                    <div className="font-drama italic text-4xl text-accent mb-4">{tier.amount}</div>
                    <p className="font-body text-primary/70 text-base leading-relaxed mb-8">
                      {tier.desc}
                    </p>
                  </div>
                  <a
                    href="#"
                    className="magnetic-btn inline-flex items-center justify-center w-full py-4 rounded-full bg-primary text-background font-bold font-body transition-colors"
                  >
                    <span className="relative z-10">Hacer un aporte</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Transparency ── */}
      <section ref={transparencyRef} className="py-24 bg-background relative z-10 w-full overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-16 border-l-2 border-accent pl-6">
            <h2 className="transparency-el text-3xl md:text-4xl font-heading font-extrabold text-primary tracking-tighter mb-4">
              Transparencia
            </h2>
            <p className="transparency-el font-body text-primary/60 text-lg max-w-xl">
              Creemos que la confianza se construye mostrando con claridad cómo se usa cada aporte. Aquí, todo se ve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {transparencyStats.map((stat) => (
              <div key={stat.label} className="transparency-el p-8 rounded-[2rem] bg-[#F7F4EE] border border-primary/5 text-center">
                <div className="font-heading font-extrabold text-4xl md:text-5xl text-primary mb-2">{stat.value}</div>
                <div className="font-body text-primary/50 text-sm uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="transparency-el p-8 md:p-12 rounded-[2rem] bg-[#F7F4EE] border border-primary/5">
            <h3 className="font-heading font-bold text-xl text-primary mb-4">Últimas actualizaciones</h3>
            <ul className="space-y-4 font-body text-primary/70 text-base">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0"></span>
                <span>Jornada de entrega de útiles escolares en San Salvador — Febrero 2026</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0"></span>
                <span>Donación de alimentos a 15 familias en Soyapango — Enero 2026</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0"></span>
                <span>Primera jornada Banquita: limpieza comunitaria + convivio — Diciembre 2025</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Closing ── */}
      <section ref={closingRef} className="py-28 md:py-36 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #9fc2ff 10px, #9fc2ff 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, #9fc2ff 10px, #9fc2ff 11px)`,
          }}
        />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <h2 className="closing-don-el font-drama italic text-3xl md:text-5xl lg:text-6xl text-accent tracking-tight leading-tight">
            No queremos competir con nadie. Solo queremos sumar algo bueno.
          </h2>
        </div>
      </section>
    </>
  );
}
