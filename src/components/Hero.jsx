import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useHomeContent } from '../context/HomeContentContext';

export default function Hero() {
  const containerRef = useRef(null);
  const { content, loading } = useHomeContent();
  const d = content.hero;

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.hero-element', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2
      });

      // Floating animation for decorative leaves
      gsap.to('.floating-leaf', {
        y: -20,
        rotate: 5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to('.floating-leaf-alt', {
        y: 15,
        rotate: -10,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Premium cinematic entrance for the model — runs once the image element is mounted
  useEffect(() => {
    if (loading) return;
    let ctx = gsap.context(() => {
      gsap.from('.hero-image', {
        x: 100,
        scale: 1.05,
        opacity: 0,
        duration: 2,
        ease: 'expo.out',
        delay: 0.2,
        clearProps: 'transform,scale'
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const handleCtaClick = (e, href) => {
    if (href?.startsWith('#')) {
      e.preventDefault();
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={containerRef} className="relative min-h-[95vh] w-full flex flex-col lg:flex-row overflow-hidden bg-[#F2FCFA]">

      {/* Decorative Fluir Femenino icons */}
      {d.showDecorativeLeaves !== false && (
        <>
          <img src="/media/fluir-icons/loto.png" alt="" aria-hidden="true" className="floating-leaf absolute top-20 left-10 w-24 h-24 opacity-30 pointer-events-none hidden md:block select-none" />
          <img src="/media/fluir-icons/espiral.png" alt="" aria-hidden="true" className="floating-leaf-alt absolute bottom-20 left-[28%] w-20 h-20 opacity-30 pointer-events-none hidden lg:block select-none" />
          <img src="/media/fluir-icons/mandala.png" alt="" aria-hidden="true" className="floating-leaf absolute top-32 right-20 w-32 h-32 opacity-25 pointer-events-none hidden lg:block select-none" />
          <img src="/media/fluir-icons/luna.png" alt="" aria-hidden="true" className="floating-leaf-alt absolute bottom-32 left-[55%] w-24 h-24 opacity-30 pointer-events-none hidden lg:block select-none" />
        </>
      )}

      {/* Content (Left) */}
      <div className="w-full lg:w-[60%] pt-40 lg:pt-48 pb-20 lg:pb-24 px-6 md:px-12 lg:pl-[10%] flex items-center relative z-10">
        
        <div className="max-w-2xl xl:max-w-3xl relative z-20">

          {/* Headline */}
          <h1 className="hero-element font-drama italic text-5xl md:text-6xl lg:text-[5rem] xl:text-[5.5rem] tracking-tight text-primary leading-[1.05] mb-6">
            {d.titleLine1} <span className="font-heading not-italic">{d.titleHighlight1}</span>{' '}
            {d.titleLine2} <span className="font-heading not-italic text-accent">{d.titleHighlight2}</span>
          </h1>
          
          {/* Subheadline */}
          <p className="hero-element font-body text-lg md:text-xl text-primary/70 mb-10 max-w-lg leading-relaxed">
            {d.subtitle}
          </p>
          
          {/* Buttons */}
          <div className="hero-element flex flex-wrap gap-4">
            <a
              href={d.primaryCta?.href || '#servicios'}
              onClick={(e) => handleCtaClick(e, d.primaryCta?.href)}
              className="magnetic-btn inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-primary text-background font-bold text-sm tracking-wide"
            >
              <span className="relative z-10">{d.primaryCta?.text || 'Explorar Servicios'}</span>
            </a>
            <a
              href={d.secondaryCta?.href || '#recursos'}
              onClick={(e) => handleCtaClick(e, d.secondaryCta?.href)}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-primary/10 text-primary font-bold text-sm tracking-wide hover:border-primary hover:bg-primary hover:text-background transition-all duration-300"
            >
              {d.secondaryCta?.text || 'Recursos y Ebooks'}
            </a>
          </div>
        </div>
      </div>
      
      {/* Main Image Layering */}
      {!loading && (
        <div className="hidden lg:flex absolute bottom-0 right-0 lg:w-[45%] lg:h-[85%] pointer-events-none z-20 justify-end items-end lg:pr-24 xl:pr-48">
          <div className="model-wrapper relative w-full h-full flex justify-end items-end origin-bottom">
            <img
              src={d.heroImage || '/media/hero_model.png'}
              alt="Gabriela Retana"
              fetchpriority="high"
              decoding="async"
              onError={(e) => {
                e.target.src = '/media/model_placeholder.png';
              }}
              style={{
                filter:
                  'drop-shadow(0 6px 8px rgba(20, 40, 30, 0.18)) drop-shadow(0 22px 28px rgba(20, 40, 30, 0.18)) drop-shadow(0 60px 80px rgba(20, 40, 30, 0.22))',
              }}
              className="hero-image h-full w-auto object-contain object-bottom origin-bottom"
            />
          </div>
        </div>
      )}
    </section>
  );
}
