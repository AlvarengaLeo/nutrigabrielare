import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, Users, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const tiers = [
  {
    name: 'Evaluación Básica',
    amount: '$15',
    desc: 'Un diagnóstico inicial para conocer tu estado de salud y obtener recomendaciones prácticas.',
    icon: Heart,
  },
  {
    name: 'Plan Hormonal / Gestacional',
    amount: '$30',
    desc: 'Programa diseñado específicamente para el cuidado y equilibrio de la mujer.',
    icon: Users,
  },
  {
    name: 'Programa Integral',
    amount: '$50+',
    desc: 'Evaluación completa, plan personalizado, monitoreo y acompañamiento constante.',
    icon: Award,
  },
];

const transparencyStats = [
  { label: 'Pacientes en control', value: '120+' },
  { label: 'Planes entregados', value: '450+' },
  { label: 'Charlas impartidas', value: '15' },
];

export default function NutricionConAlmaPage() {
  const heroRef = useRef(null);
  const tiersRef = useRef(null);
  const transparencyRef = useRef(null);

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
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section ref={heroRef} className="min-h-[70vh] flex items-end pb-20 pt-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="don-hero-el inline-block px-3 py-1 mb-6 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary/70">
            Nutrición con Alma
          </div>
          <h1 className="don-hero-el font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-tighter text-primary mb-6 max-w-2xl">
            Nutrición con Alma
          </h1>
          <p className="don-hero-el font-body text-lg md:text-xl text-primary/60 max-w-xl leading-relaxed">
            Creo que el bienestar integral es un derecho. Por eso hago la nutrición profesional accesible a quienes más lo necesitan.
          </p>
        </div>
      </section>

      {/* ── Tiers ── */}
      <section ref={tiersRef} className="py-24 bg-background relative z-10 w-full overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-16 flex flex-col items-start max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-primary tracking-tighter mb-4">
              Planes accesibles
            </h2>
            <p className="font-body text-primary/60 text-lg">
              Acompañamiento profesional con enfoque holístico adaptado a distintas necesidades, siempre respetando tu cuerpo y tu proceso.
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
                    <span className="relative z-10">Agendar</span>
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
              Impacto & Educación
            </h2>
            <p className="transparency-el font-body text-primary/60 text-lg max-w-xl">
              La prevención y la educación nutricional son parte de mi misión. Cada charla y cada plan cuenta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {transparencyStats.map((stat) => (
              <div key={stat.label} className="transparency-el p-8 rounded-[2rem] bg-white border border-primary/5 text-center">
                <div className="font-heading font-extrabold text-4xl md:text-5xl text-primary mb-2">{stat.value}</div>
                <div className="font-body text-primary/50 text-sm uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="transparency-el p-8 md:p-12 rounded-[2rem] bg-white border border-primary/5">
            <h3 className="font-heading font-bold text-xl text-primary mb-4">Últimas actividades</h3>
            <ul className="space-y-4 font-body text-primary/70 text-base">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-health mt-2 shrink-0"></span>
                <span>Taller de alimentación balanceada para madres comunitarias — Febrero 2026</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-health mt-2 shrink-0"></span>
                <span>Jornada de tamizaje nutricional en clínica comunitaria — Enero 2026</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-health mt-2 shrink-0"></span>
                <span>Campaña contra la anemia: Diagnóstico y planes preventivos — Diciembre 2025</span>
              </li>
            </ul>
          </div>
        </div>
      </section>


    </>
  );
}
