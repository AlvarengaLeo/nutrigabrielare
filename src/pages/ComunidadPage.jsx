import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const contentBlocks = [
  {
    title: 'Detrás de cámaras',
    desc: 'Lo que no siempre se ve, pero también cuenta la historia.',
  },
  {
    title: 'Historias de El Salvador',
    desc: 'La mirada de Majes sobre la gente, la calle y lo real.',
  },
  {
    title: 'Momentos del grupo',
    desc: 'La jodedera, los recuerdos y lo cotidiano que mantiene viva la hermandad.',
  },
  {
    title: 'Contenido en vivo',
    desc: 'Espacios para conectar en tiempo real desde distintas plataformas.',
  },
];

const platforms = [
  {
    name: 'Instagram',
    desc: 'Historias, reels y momentos del día a día de Majes.',
    url: 'https://www.instagram.com/majesdesivar/',
  },
  {
    name: 'Facebook',
    desc: 'Publicaciones, comunidad y actualizaciones del proyecto.',
    url: 'https://www.facebook.com/profile.php?id=61562686467881',
  },
  {
    name: 'TikTok',
    desc: 'Clips, humor, energía y contenido rápido con la vibra del grupo.',
    url: 'https://www.tiktok.com/@majesdesivarr',
  },
  {
    name: 'YouTube',
    desc: 'Videos, formatos más largos y contenido para ver con más calma.',
    url: 'https://www.youtube.com/@majesdesivar',
  },
  {
    name: 'Kick',
    desc: 'Lives, interacción en tiempo real y momentos sin filtro.',
    url: 'https://kick.com/majesdesivar',
  },
];

export default function ComunidadPage() {
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const channelsRef = useRef(null);
  const closingRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.com-hero-el', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.1,
      });

      gsap.from('.content-block', {
        scrollTrigger: { trigger: contentRef.current, start: 'top 80%' },
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
      });

      gsap.from('.channel-card', {
        scrollTrigger: { trigger: channelsRef.current, start: 'top 85%' },
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      });

      gsap.from('.closing-com-el', {
        scrollTrigger: { trigger: closingRef.current, start: 'top 80%' },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    });
    return () => ctx.revert();
  }, []);

  const scrollToChannels = (e) => {
    e.preventDefault();
    document.getElementById('explorar-canales')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ── Hero ── */}
      <section ref={heroRef} className="min-h-[70vh] flex items-end pb-20 pt-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="com-hero-el inline-block px-3 py-1 mb-6 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary/70">
            Comunidad
          </div>
          <h1 className="com-hero-el font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-tighter text-primary mb-6 max-w-2xl">
            Donde vive la hermandad.
          </h1>
          <p className="com-hero-el font-body text-lg md:text-xl text-primary/60 max-w-xl leading-relaxed mb-4">
            Historias, contenido y momentos reales del universo Majes de Sivar.
          </p>
          <p className="com-hero-el font-body text-base md:text-lg text-primary/50 max-w-xl leading-relaxed mb-8">
            Desde clips espontáneos hasta detrás de cámaras, lives, historias y momentos del grupo: aquí encontrás las puertas para seguir conectando con Majes desde donde más te guste.
          </p>
          <div className="com-hero-el">
            <a
              href="#explorar-canales"
              onClick={scrollToChannels}
              className="magnetic-btn inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-background font-medium text-lg"
            >
              <span className="relative z-10">Explorar canales</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Qué vas a encontrar ── */}
      <section ref={contentRef} className="py-24 bg-[#F7F4EE] relative z-10 w-full overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-16 flex flex-col items-start max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-primary tracking-tighter mb-4">
              Qué vas a encontrar
            </h2>
            <div className="w-16 h-1 bg-accent rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {contentBlocks.map((block, idx) => (
              <div
                key={idx}
                className="content-block p-8 md:p-10 rounded-[2rem] bg-white border border-primary/5 hover:border-primary/10 transition-colors duration-500"
              >
                <div className="font-drama italic text-2xl text-accent mb-4">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h3 className="font-heading font-bold text-2xl text-primary mb-3 tracking-tight">
                  {block.title}
                </h3>
                <p className="font-body text-primary/70 text-base md:text-lg leading-relaxed">
                  {block.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explorar canales ── */}
      <section id="explorar-canales" ref={channelsRef} className="py-24 md:py-32 bg-background relative z-10 w-full overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-16 md:mb-20 border-l-2 border-accent pl-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-primary tracking-tighter mb-4">
              Explorar canales
            </h2>
            <p className="font-body text-primary/60 text-lg max-w-xl">
              Elegí desde dónde querés entrar al universo Majes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
            {platforms.map((platform, idx) => {
              const isFeatured = idx === 0;
              const colSpan = idx < 2 ? (isFeatured ? 'md:col-span-7' : 'md:col-span-5') : 'md:col-span-4';

              return (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`channel-card group flex flex-col justify-between p-10 md:p-12 rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-1 min-h-[280px] ${colSpan} ${
                    isFeatured
                      ? 'bg-primary text-background border-primary/10'
                      : 'bg-white border-primary/5 hover:border-primary/10'
                  }`}
                >
                  <div>
                    <h3 className={`font-heading font-bold text-2xl md:text-3xl mb-4 tracking-tight ${
                      isFeatured ? 'text-background' : 'text-primary'
                    }`}>
                      {platform.name}
                    </h3>
                    <p className={`font-body text-base md:text-lg leading-relaxed mb-8 max-w-sm ${
                      isFeatured ? 'text-background/70' : 'text-primary/70'
                    }`}>
                      {platform.desc}
                    </p>
                  </div>
                  <div className={`inline-flex items-center font-bold font-body w-fit transition-colors ${
                    isFeatured
                      ? 'text-background/80 group-hover:text-accent'
                      : 'text-primary group-hover:text-accent'
                  }`}>
                    Visitar {platform.name}
                    <ArrowUpRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section ref={closingRef} className="py-28 md:py-36 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #9fc2ff 10px, #9fc2ff 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, #9fc2ff 10px, #9fc2ff 11px)`,
          }}
        />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <h2 className="closing-com-el font-drama italic text-3xl md:text-5xl lg:text-6xl text-accent tracking-tight leading-tight mb-6">
            Seguí la historia desde donde más te guste.
          </h2>
          <p className="closing-com-el font-body text-white/50 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto">
            Cada plataforma muestra una parte distinta de Majes de Sivar. Elegí la tuya y seguí conectando con la hermandad.
          </p>
          <div className="closing-com-el">
            <Link
              to="/"
              className="magnetic-btn inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/20 text-white/80 font-bold font-body hover:bg-white hover:text-primary transition-colors duration-300"
            >
              <span className="relative z-10">Volver al inicio</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
