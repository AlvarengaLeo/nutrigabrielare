import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function Hero() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.hero-element', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2
      });
      
      gsap.from('.hero-logo', {
        x: 40,
        opacity: 0,
        duration: 1.5,
        ease: 'power2.out',
        delay: 0.8
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen w-full flex items-center overflow-hidden bg-background">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent z-10 w-full md:w-2/3 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-20 h-full flex items-center">
        {/* Increased top margin further to shift content deeply downward to align with dog's feet */}
        <div className="w-full md:w-3/5 space-y-6 mt-48 md:mt-40">
          <h1 className="hero-element flex flex-col leading-none">
            {/* Reduced text sizes by one responsive step */}
            <span className="font-heading font-extrabold text-4xl md:text-5xl lg:text-[5rem] tracking-tighter text-primary">
              Hermandad.
            </span>
            <span className="font-drama italic text-5xl md:text-6xl lg:text-[5.5rem] tracking-tight text-accent mt-[-0.2em] md:mt-[-0.2em]">
              Con propósito.
            </span>
          </h1>
          
          <div className="hero-element pt-6">
            <a href="#conocenos" className="magnetic-btn inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-background font-medium text-lg">
              <span className="relative z-10">Conócenos</span>
            </a>
          </div>
        </div>
      </div>

      {/* Hero Image / Logo right side */}
      <div className="hero-logo absolute right-0 top-1/2 -translate-y-1/2 w-[80%] md:w-[60%] lg:w-[50%] z-0 opacity-80 mix-blend-multiply pr-4 md:pr-12 pointer-events-none">
        <img src="/logo.png" alt="Majes de Sivar Logo" className="w-full h-auto object-contain object-right" />
      </div>
    </section>
  );
}
