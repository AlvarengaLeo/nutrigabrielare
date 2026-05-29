import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useHomeContent } from '../context/HomeContentContext';
import TestimonialCard from './TestimonialCard';

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  const sectionRef = useRef(null);
  const { content } = useHomeContent();
  const d = content.testimonials || {};
  const items = d.items || [];

  useEffect(() => {
    // Respect users who prefer reduced motion: render everything visible, no animation.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.testi-header', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
      });

      gsap.from('.testi-card', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="testimonios-heading"
      className="relative w-full overflow-hidden bg-gradient-to-b from-nutri-rose-mist via-white to-white py-24 md:py-32"
    >
      {/* Soft decorative glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-highlight/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-health/10 blur-3xl"
      />

      <div className="container relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mx-auto mb-14 flex max-w-3xl flex-col items-center text-center md:mb-20">
          <h2
            id="testimonios-heading"
            className="testi-header font-drama text-4xl italic leading-[1.1] tracking-tight text-primary md:text-5xl lg:text-[4rem]"
          >
            {d.titleLine1}{' '}
            <span className="font-heading not-italic">{d.titleHighlight1}</span>
            <br />
            {d.titleLine2}{' '}
            <span className="font-heading not-italic text-accent">{d.titleHighlight2}</span>
          </h2>

          {d.subtitle && (
            <p className="testi-header mt-6 max-w-2xl font-body text-lg leading-relaxed text-primary/70">
              {d.subtitle}
            </p>
          )}
        </div>

        {/* Cards grid — mobile-first: 1 / 2 / 3 columns */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8">
          {items.map((t, i) => (
            <TestimonialCard
              key={`${t.name}-${i}`}
              name={t.name}
              role={t.role}
              location={t.location}
              rating={t.rating}
              quote={t.quote}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
