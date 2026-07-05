import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, Activity, Brain, Leaf, Scale, HeartPulse, Carrot, Sparkles, Sun, Moon, Flame, Droplets, Apple, Zap, Eye, Shield, Star, Flower2, TreePine } from 'lucide-react';
import { useHomeContent } from '../context/HomeContentContext';

gsap.registerPlugin(ScrollTrigger);

// Icon map for dynamic icon rendering
const ICON_MAP = {
  Heart, Activity, Brain, Leaf, Scale, HeartPulse, Carrot,
  Sparkles, Sun, Moon, Flame, Droplets, Apple, Zap, Eye, Shield, Star, Flower2, TreePine,
};

function DynamicIcon({ name, className }) {
  const Icon = ICON_MAP[name] || Heart;
  return <Icon className={className} />;
}

export default function Philosophy() {
  const sectionRef = useRef(null);
  const { content } = useHomeContent();
  const d = content.philosophy;

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Reveal items
      gsap.from('.philo-element', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });

      // Reveal items from left
      gsap.from('.blobs-left', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        x: -200, opacity: 0, rotation: -45, duration: 1.5, stagger: 0.2, ease: 'power3.out',
        clearProps: "transform"
      });

      // Reveal items from right
      gsap.from('.blobs-right', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        x: 200, opacity: 0, rotation: 45, duration: 1.5, stagger: 0.2, ease: 'power3.out',
        clearProps: "transform"
      });
      
      // Floating food elements - organic 3D float
      gsap.utils.toArray('.floating-blob').forEach((blob, i) => {
        gsap.to(blob, {
          y: i % 2 === 0 ? -25 : 25,
          x: i % 2 !== 0 ? 15 : -15,
          rotation: i % 2 === 0 ? 8 : -8,
          duration: 4 + (i * 0.2),
          delay: i * 0.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      });

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const values = (d.values || []).map((v) => ({
    icon: <DynamicIcon name={v.icon} className="w-6 h-6 text-accent" />,
    label: v.label,
  }));

  const imgs = d.decorativeImages || {};

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white relative z-10 w-full overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl relative">
        {/* Left Side (slide in from left) */}
        <div className="blobs-left absolute w-fit h-fit z-0 md:z-10 pointer-events-none md:pointer-events-auto top-[20%] -left-[14%] md:top-[30%] md:-left-[15%] xl:-left-[20%] opacity-100">
            <div className="floating-blob">
                <img src={imgs.midLeft || '/media/pom.png'} alt="Decorativo" className="w-32 h-32 md:w-64 md:h-64 object-contain md:hover:scale-110 md:hover:-rotate-12 transition-all duration-1000 ease-out cursor-pointer" />
            </div>
        </div>

        {/* Right Side (slide in from right) */}
        <div className="blobs-right absolute w-fit h-fit z-0 md:z-10 pointer-events-none md:pointer-events-auto top-[30%] -right-[14%] md:top-[35%] md:-right-[15%] xl:-right-[20%] opacity-100">
            <div className="floating-blob">
                <img src={imgs.midRight || '/media/broc.png'} alt="Decorativo" className="w-40 h-40 md:w-80 md:h-80 object-contain md:hover:scale-110 md:hover:rotate-12 transition-all duration-1000 ease-out cursor-pointer" />
            </div>
        </div>

        <div className="flex flex-col items-center text-center relative z-20">
          <h2 className="philo-element font-drama italic text-4xl md:text-5xl lg:text-[4rem] text-primary tracking-tight leading-[1.1] mb-10 max-w-3xl mx-auto">
            {d.titleLine1} <span className="font-heading not-italic">{d.titleHighlight1}</span><br/>
            {d.titleLine2} <span className="font-heading not-italic text-accent">{d.titleHighlight2}</span>
          </h2>

          {/* 3 Icons Row */}
          <div className="philo-element flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
            {values.map((v, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-accent/10 border border-accent/20">
                  {v.icon}
                </div>
                <span className="font-heading font-bold text-lg text-primary">{v.label}</span>
              </div>
            ))}
          </div>

          {/* Subtext */}
          <p className="philo-element font-body text-lg md:text-xl text-primary/70 max-w-2xl leading-relaxed">
            {d.description}
          </p>
        </div>

      </div>
    </section>
  );
}
