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

      // Stats block reveal
      gsap.from('.stats-container', {
        scrollTrigger: {
          trigger: '.stats-container',
          start: 'top 85%',
        },
        scale: 0.95,
        opacity: 0,
        y: 30,
        duration: 1,
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

  const stats = d.stats || [];
  const imgs = d.decorativeImages || {};

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-white relative z-10 w-full overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl relative">
        {/* Left Side (slide in from left) */}
        <div className="blobs-left absolute w-fit h-fit z-0 md:z-10 pointer-events-none md:pointer-events-auto top-[2%] -left-[10%] md:top-[5%] md:left-[2%] xl:left-[5%] opacity-30 md:opacity-100">
            <div className="floating-blob">
                <img src={imgs.topLeft || '/media/ora.png'} alt="Decorativo" className="w-20 h-20 md:w-40 md:h-40 object-contain mix-blend-multiply contrast-[1.05] brightness-105 md:hover:scale-110 md:hover:-rotate-12 transition-all duration-1000 ease-out cursor-pointer" />
            </div>
        </div>
        <div className="blobs-left absolute w-fit h-fit z-0 md:z-10 pointer-events-none md:pointer-events-auto top-[35%] -left-[20%] md:top-[35%] md:-left-[15%] xl:-left-[20%] opacity-20 md:opacity-100">
            <div className="floating-blob">
                <img src={imgs.midLeft || '/media/pom.png'} alt="Decorativo" className="w-32 h-32 md:w-64 md:h-64 object-contain mix-blend-multiply contrast-[1.05] brightness-105 md:hover:scale-110 md:hover:-rotate-12 transition-all duration-1000 ease-out cursor-pointer" />
            </div>
        </div>

        {/* Right Side (slide in from right) */}
        <div className="blobs-right absolute w-fit h-fit z-0 md:z-10 pointer-events-none md:pointer-events-auto top-[15%] -right-[5%] md:top-[15%] md:right-[8%] xl:right-[12%] opacity-40 md:opacity-100">
            <div className="floating-blob">
                <img src={imgs.topRight || '/media/tom.png'} alt="Decorativo" className="w-16 h-16 md:w-28 md:h-28 object-contain mix-blend-multiply contrast-[1.05] brightness-105 md:hover:scale-110 md:hover:rotate-12 transition-all duration-1000 ease-out cursor-pointer" />
            </div>
        </div>
        <div className="blobs-right absolute w-fit h-fit z-0 md:z-10 pointer-events-none md:pointer-events-auto top-[45%] -right-[25%] md:top-[45%] md:-right-[15%] xl:-right-[20%] opacity-20 md:opacity-100">
            <div className="floating-blob">
                <img src={imgs.midRight || '/media/broc.png'} alt="Decorativo" className="w-40 h-40 md:w-80 md:h-80 object-contain mix-blend-multiply contrast-[1.05] brightness-105 md:hover:scale-110 md:hover:rotate-12 transition-all duration-1000 ease-out cursor-pointer" />
            </div>
        </div>

        <div className="flex flex-col items-center text-center relative z-20 mb-20">
          {/* Badge */}
          <div className="philo-element inline-flex items-center gap-2 px-4 py-1.5 bg-health/10 text-health border border-health/20 rounded-full mb-6 relative">
            <Heart className="w-4 h-4 fill-current opacity-80" />
            <span className="text-xs font-bold font-body uppercase tracking-wider text-primary">{d.badge}</span>
          </div>

          <h2 className="philo-element font-drama italic text-4xl md:text-5xl lg:text-[4rem] text-primary tracking-tight leading-[1.1] mb-12 max-w-3xl mx-auto">
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

        {/* Stats Section */}
        <div className="stats-container w-full max-w-4xl mx-auto border-2 border-dashed border-primary/20 rounded-[2rem] bg-background md:bg-health/5 p-8 md:p-12 relative z-20 hover:border-primary/40 transition-colors duration-500">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="font-drama text-4xl md:text-5xl italic font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="font-body text-sm font-semibold text-primary/60 tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
