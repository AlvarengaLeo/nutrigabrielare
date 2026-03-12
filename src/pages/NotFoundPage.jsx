import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

export default function NotFoundPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.notfound-el', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div ref={containerRef} className="text-center px-6">
        <p className="notfound-el font-drama italic text-8xl md:text-9xl text-accent tracking-tight">
          404
        </p>
        <h1 className="notfound-el font-heading font-extrabold text-2xl md:text-3xl text-primary mt-4">
          Página no encontrada
        </h1>
        <p className="notfound-el font-body text-primary/60 mt-3">
          La página que buscás no existe o fue movida.
        </p>
        <Link
          to="/"
          className="notfound-el bg-primary text-background px-8 py-3.5 rounded-xl font-heading font-bold text-sm mt-8 inline-block hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
