import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar } from 'lucide-react';
import { useHomeContent } from '../context/HomeContentContext';

gsap.registerPlugin(ScrollTrigger);

export default function Protocol() {
  const containerRef = useRef(null);
  const { content } = useHomeContent();
  const d = content.protocol;

  const steps = d.steps || [];
  
  useEffect(() => {
    let ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.protocol-card');
      
      cards.forEach((card, i) => {
        const content = card.querySelector('.protocol-card-content');
        const nextCard = cards[i + 1];

        // Pin each card
        ScrollTrigger.create({
          trigger: card,
          start: 'top 20%',
          endTrigger: containerRef.current,
          end: 'bottom bottom',
          pin: true,
          pinSpacing: false,
        });

        // When the NEXT card approaches, fade out this card's content first, then shrink the card
        if (nextCard) {
          // Fade content text out quickly
          gsap.to(content, {
            opacity: 0,
            scrollTrigger: {
              trigger: nextCard,
              start: 'top 60%',
              end: 'top 35%',
              scrub: true,
            },
          });

          // Scale and fade the card shell
          gsap.to(card, {
            scale: 0.93,
            opacity: 0,
            scrollTrigger: {
              trigger: nextCard,
              start: 'top 40%',
              end: 'top 20%',
              scrub: true,
            },
          });
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="reservas" className="bg-white py-24 w-full relative">
      <div className="container mx-auto px-6 max-w-4xl pt-10 pb-[50vh]" ref={containerRef}>
        
        <div className="flex flex-col items-start w-full relative z-20 mb-20 lg:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-health/10 text-primary border border-health/20 rounded-full mb-6 max-w-fit">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold font-body uppercase tracking-wider text-primary">{d.badge}</span>
          </div>

          <h2 className="font-heading not-italic text-4xl md:text-5xl lg:text-[4rem] text-primary tracking-tight leading-[1.1] max-w-3xl">
            {d.titleLine1}<br/>
            <span className="font-drama italic text-accent">{d.titleLine2}</span>
          </h2>
        </div>

        <div className="relative space-y-24">
          {steps.map((step, idx) => (
            <div key={idx} className="protocol-card min-h-[40vh] bg-background border border-primary/5 p-10 md:p-16 rounded-[3rem] shadow-xl hover:shadow-2xl transition-shadow duration-700 relative overflow-hidden flex flex-col justify-center">
              
              {/* Background Abstract Shape */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="protocol-card-content relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="font-drama italic text-7xl md:text-[8rem] text-accent/20 leading-none">
                  {step.num}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl md:text-4xl font-heading font-bold mb-6 tracking-tight text-primary">{step.title}</h3>
                  <p className="text-lg md:text-xl font-body text-primary/70 leading-relaxed max-w-xl">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
