import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import ProductCard from './ProductCard';

gsap.registerPlugin(ScrollTrigger);

/**
 * Reusable product carousel section.
 *
 * @param {object} props
 * @param {string=} props.eyebrow - Small uppercase label above the title.
 * @param {string=} props.titleLine1 - Plain title line.
 * @param {string=} props.titleLine2 - Italic accent line shown after a line break.
 * @param {Array=}  props.products - Products to render.
 * @param {string=} props.ctaLabel - Label for the trailing link.
 * @param {string=} props.ctaTo - Destination of the trailing link.
 * @param {string=} props.bg - Tailwind bg class for the section.
 * @param {string=} props.id - Optional anchor id.
 */
export default function ProductCarousel({
  eyebrow,
  titleLine1,
  titleLine2,
  products = [],
  ctaLabel,
  ctaTo,
  bg = 'bg-background',
  id,
}) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [products]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.carousel-el',
        { y: 30, opacity: 0 },
        {
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  function scrollByCard(direction) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('[data-carousel-card]');
    const delta = card ? card.clientWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * delta, behavior: 'smooth' });
  }

  if (!products.length) return null;

  return (
    <section id={id} ref={sectionRef} className={`py-20 md:py-24 ${bg} relative w-full overflow-hidden`}>
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div className="flex flex-col items-start">
            {eyebrow && (
              <div className="carousel-el inline-block px-3 py-1 mb-5 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary/70">
                {eyebrow}
              </div>
            )}
            {(titleLine1 || titleLine2) && (
              <h2 className="carousel-el font-heading not-italic text-4xl md:text-5xl lg:text-[3.5rem] text-primary tracking-tight leading-[1.05] max-w-2xl">
                {titleLine1}{titleLine2 && <br />}
                {titleLine2 && <span className="font-drama italic text-accent">{titleLine2}</span>}
              </h2>
            )}
          </div>

          {/* Right-aligned controls */}
          <div className="carousel-el flex items-center gap-3 md:self-end">
            {ctaTo && (
              <Link
                to={ctaTo}
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-background font-heading font-bold text-sm hover:opacity-90 transition-opacity"
              >
                {ctaLabel ?? 'Ver todo'}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                disabled={!canScrollLeft}
                aria-label="Anterior"
                className={`w-10 h-10 rounded-full border border-primary/15 flex items-center justify-center transition-all ${
                  canScrollLeft ? 'text-primary hover:bg-primary hover:text-background' : 'text-primary/20 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                disabled={!canScrollRight}
                aria-label="Siguiente"
                className={`w-10 h-10 rounded-full border border-primary/15 flex items-center justify-center transition-all ${
                  canScrollRight ? 'text-primary hover:bg-primary hover:text-background' : 'text-primary/20 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          className="carousel-el flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-6 px-6 md:mx-0 md:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div
              key={product.id}
              data-carousel-card
              className="snap-start shrink-0 w-[78%] sm:w-[48%] lg:w-[31%] xl:w-[23%]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile CTA below track */}
        {ctaTo && (
          <div className="carousel-el md:hidden mt-8 flex justify-center">
            <Link
              to={ctaTo}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-background font-heading font-bold text-sm hover:opacity-90 transition-opacity"
            >
              {ctaLabel ?? 'Ver todo'}
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
