import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Leaf } from 'lucide-react';

export default function Hero() {
  const containerRef = useRef(null);
  
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
      
      // Premium cinematic entrance for the model
      gsap.from('.hero-image', {
        x: 100,
        scale: 1.05,
        opacity: 0,
        duration: 2,
        ease: 'expo.out',
        delay: 0.6,
        clearProps: 'transform,scale'
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

  return (
    <section ref={containerRef} className="relative min-h-[95vh] w-full flex flex-col lg:flex-row overflow-hidden">
      
      {/* Light Section (Left) */}
      <div className="w-full lg:w-[60%] bg-[#F2FCFA] pt-40 lg:pt-48 pb-20 lg:pb-24 px-6 md:px-12 lg:pl-[10%] flex items-center relative z-10">
        
        {/* Subtle Leaf Decor */}
        <Leaf className="floating-leaf absolute top-20 left-10 w-24 h-24 text-primary/5 pointer-events-none hidden md:block" />
        <Leaf className="floating-leaf-alt absolute bottom-20 left-1/3 w-16 h-16 text-primary/5 pointer-events-none hidden lg:block" />
        
        <div className="max-w-2xl xl:max-w-3xl relative z-20">
          
          {/* Badge */}
          <div className="hero-element inline-flex items-center gap-2 px-4 py-1.5 bg-health/10 text-health border border-health/20 rounded-full mb-8 relative">
            <Leaf className="w-4 h-4 fill-current opacity-80" />
            <span className="text-xs font-bold font-body uppercase tracking-wider text-primary">Nutrición con sentido</span>
          </div>
          
          {/* Headline */}
          <h1 className="hero-element font-drama italic text-5xl md:text-6xl lg:text-[5.5rem] tracking-tight text-primary leading-[1.05] mb-6">
            Tener un <span className="font-heading not-italic">Equilibrio—</span><br/>
            Nutricional <span className="font-heading not-italic text-accent">Esencial</span>
          </h1>
          
          {/* Subheadline */}
          <p className="hero-element font-body text-lg md:text-xl text-primary/70 mb-10 max-w-lg leading-relaxed">
            Hacemos más fácil tomar decisiones saludables mediante orientación nutricional personalizada, conciencia de ingredientes y herramientas curadas para tu vida real.
          </p>
          
          {/* Buttons */}
          <div className="hero-element flex flex-wrap gap-4">
            <a
              href="#servicios"
              onClick={(e) => { e.preventDefault(); document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="magnetic-btn inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-primary text-background font-bold text-sm tracking-wide"
            >
              <span className="relative z-10">Explorar Herramientas</span>
            </a>
            <a
              href="#recursos"
              onClick={(e) => { e.preventDefault(); document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-primary/10 text-primary font-bold text-sm tracking-wide hover:border-primary hover:bg-primary hover:text-background transition-all duration-300"
            >
              Consultar Guías
            </a>
          </div>
        </div>
      </div>
      
      {/* Dark Section (Right) */}
      <div className="hidden lg:block lg:w-[40%] bg-primary relative z-0">
        <Leaf className="floating-leaf absolute top-32 right-20 w-32 h-32 text-white/5 pointer-events-none" />
        <Leaf className="floating-leaf-alt absolute bottom-32 -left-10 w-24 h-24 text-white/5 pointer-events-none" />
      </div>

      {/* Main Image Layering */}
      {/* Positioned absolute so it can overlap the two split sections */}
      <div className="absolute bottom-0 right-0 w-full lg:w-[45%] h-[75%] lg:h-[85%] pointer-events-auto z-20 flex justify-center lg:justify-end items-end overflow-hidden lg:overflow-visible lg:pr-24 xl:pr-48">
        <div className="model-wrapper relative w-full h-full flex justify-center lg:justify-end items-end origin-bottom">
          <img 
            src="/media/hero_model.png" 
            alt="Gabriela Retana" 
            onError={(e) => {
              e.target.src = '/media/model_placeholder.png';
            }}
            className="hero-image h-full w-auto object-contain object-bottom drop-shadow-2xl hover:scale-[1.03] hover:-rotate-1 transition-transform duration-1000 ease-out cursor-pointer origin-bottom" 
          />
        </div>
      </div>
    </section>
  );
}
