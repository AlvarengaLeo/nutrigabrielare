import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity } from 'lucide-react';
import { useHomeContent } from '../context/HomeContentContext';

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  const sectionRef = useRef(null);
  const { content } = useHomeContent();
  const d = content.features;

  const features = d.services || [];

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="servicios" ref={sectionRef} className="py-24 bg-background relative z-10 w-full overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col items-start w-full relative z-20 mb-20 lg:mb-24">
          <div className="feature-card inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 text-primary border border-secondary/20 rounded-full mb-6 max-w-fit">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold font-body uppercase tracking-wider text-primary">{d.badge}</span>
          </div>

          <h2 className="feature-card font-heading not-italic text-4xl md:text-5xl lg:text-[4rem] text-primary tracking-tight leading-[1.1] max-w-3xl">
            {d.titleLine1}<br/>
            <span className="font-drama italic text-accent">{d.titleLine2}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20">
          {features.map((feature, idx) => (
            <div key={idx} className={`feature-card group flex flex-col p-8 md:p-10 rounded-[2.5rem] border ${feature.isVip ? 'bg-primary text-background border-primary/20 shadow-2xl scale-[1.02] transform-gpu' : 'bg-white border-primary/5 shadow-xl hover:shadow-2xl'} hover:-translate-y-4 hover:scale-[1.02] transition-transform duration-700 ease-out h-full`}>
              <div className={`font-drama italic text-3xl md:text-4xl mb-6 ${feature.isVip ? 'text-accent/90' : 'text-accent'}`}>
                {feature.num}
              </div>
              <h3 className={`font-heading font-bold text-2xl mb-4 tracking-tight ${feature.isVip ? 'text-background' : 'text-primary'}`}>
                {feature.title}
              </h3>
              <div className={`w-8 h-[2px] mb-6 rounded-full transition-all duration-300 group-hover:w-16 ${feature.isVip ? 'bg-accent/80' : 'bg-accent'}`} />
              <p className={`font-body leading-relaxed text-base md:text-lg mb-6 flex-grow ${feature.isVip ? 'text-background/80' : 'text-primary/70'}`}>
                {feature.description}
              </p>
              <div className={`font-heading font-extrabold text-2xl pt-6 border-t ${feature.isVip ? 'border-background/20 text-accent' : 'border-primary/10 text-primary'}`}>
                {feature.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
