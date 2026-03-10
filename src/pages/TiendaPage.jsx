import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  {
    num: '01',
    title: 'Ropa',
    desc: 'Playeras, hoodies y piezas esenciales que representan quién sos.',
    cta: 'Ver colección',
    href: '#',
  },
  {
    num: '02',
    title: 'Accesorios',
    desc: 'Gorras, tazas y detalles que cargan la identidad Majes.',
    cta: 'Ver accesorios',
    href: '#',
  },
  {
    num: '03',
    title: 'Edición Limitada',
    desc: 'Piezas únicas con historia. Una vez se acaban, se acaban.',
    cta: 'Ver edición',
    href: '#',
  },
];

export default function TiendaPage() {
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const closingRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.tienda-hero-el', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.1,
      });

      gsap.from('.category-block', {
        scrollTrigger: { trigger: gridRef.current, start: 'top 80%' },
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
      });

      gsap.from('.closing-el', {
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
          <div className="tienda-hero-el inline-block px-3 py-1 mb-6 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary/70">
            Tienda
          </div>
          <h1 className="tienda-hero-el font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-tighter text-primary mb-6 max-w-2xl">
            Llevá lo nuestro puesto.
          </h1>
          <p className="tienda-hero-el font-body text-lg md:text-xl text-primary/60 max-w-xl leading-relaxed">
            No es solo ropa. Es calle, identidad y hermandad hecha pieza.
          </p>
        </div>
      </section>

      {/* ── Categories ── */}
      <section ref={gridRef} className="py-24 bg-[#F7F4EE] relative z-10 w-full overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {categories.map((cat) => (
              <div key={cat.num} className="category-block group flex flex-col justify-between p-10 md:p-12 rounded-[2.5rem] bg-white border border-primary/5 hover:border-primary/10 transition-colors duration-500 min-h-[420px]">
                <div>
                  <div className="font-drama italic text-2xl text-accent mb-6">{cat.num}</div>
                  <h3 className="font-heading font-bold text-3xl text-primary mb-4 tracking-tight">{cat.title}</h3>
                  <p className="font-body text-primary/70 text-base md:text-lg leading-relaxed mb-10">
                    {cat.desc}
                  </p>
                </div>
                <a
                  href={cat.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary font-bold font-body group-hover:text-accent transition-colors w-fit"
                >
                  {cat.cta} <ArrowUpRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              </div>
            ))}
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
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="closing-el font-drama italic text-4xl md:text-6xl lg:text-7xl text-accent tracking-tight leading-tight">
            No es merch. Es identidad.
          </h2>
        </div>
      </section>
    </>
  );
}
