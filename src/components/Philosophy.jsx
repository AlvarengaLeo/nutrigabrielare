import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
  const sectionRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // SplitText substitute with character animation
      const chars = gsap.utils.toArray('.char');
      
      gsap.from(chars, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
        },
        opacity: 0,
        y: 20,
        rotateX: -90,
        stagger: 0.02,
        duration: 1,
        ease: 'back.out(1.7)',
        transformOrigin: "0% 50% -50"
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const text1 = "No contamos una marca.";
  const text2 = "Contamos una hermandad.";

  return (
    <section ref={sectionRef} className="relative py-32 md:py-48 bg-[#0a0a0a] w-full overflow-hidden flex items-center justify-center">
      {/* CSS Chevron Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #9fc2ff 10px, #9fc2ff 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, #9fc2ff 10px, #9fc2ff 11px)`
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
        <p className="text-xl md:text-2xl lg:text-3xl text-[#F5F0EB]/60 font-body mb-2 tracking-wide flex flex-wrap justify-center gap-[0.2em]">
          {text1.split('').map((char, i) => (
            <span key={i} className="char inline-block" style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
              {char}
            </span>
          ))}
        </p>
        <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-drama italic text-accent tracking-tight flex flex-wrap justify-center gap-[0.05em] leading-none">
          {text2.split('').map((char, i) => (
            <span key={i} className="char inline-block" style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
              {char}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
