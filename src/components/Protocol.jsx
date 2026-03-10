import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Protocol() {
  const containerRef = useRef(null);
  
  const steps = [
    { num: '01', title: 'Memoria', desc: 'Lo que vivimos merece quedar contado.' },
    { num: '02', title: 'Voz', desc: 'Queremos mostrar El Salvador desde la mirada de la gente real.' },
    { num: '03', title: 'Huella', desc: 'Si la amistad nos formó, también puede servir para aportar algo bueno.' }
  ];

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
    <section id="nosotros" className="bg-dark text-[#F5F0EB] py-24 w-full relative">
      <div className="container mx-auto px-6 max-w-4xl pt-10 pb-[50vh]" ref={containerRef}>
        
        <div className="mb-20">
          <h2 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tighter mb-4">Qué queremos dejar</h2>
          <div className="w-20 h-1 bg-accent rounded-full"></div>
        </div>

        <div className="relative space-y-24">
          {steps.map((step, idx) => (
            <div key={idx} className="protocol-card min-h-[40vh] bg-[#222] border border-white/5 p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-center">
              
              {/* Background Abstract Shape */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
              
              <div className="protocol-card-content relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="font-drama italic text-7xl md:text-[8rem] text-accent/20 leading-none">
                  {step.num}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl md:text-5xl font-heading font-bold mb-6 tracking-tight text-[#F5F0EB]">{step.title}</h3>
                  <p className="text-lg md:text-xl font-body text-white/50 leading-relaxed">
                    {step.desc}
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
