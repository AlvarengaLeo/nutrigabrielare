import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft } from 'lucide-react';
import { getProductsByKind, SLUG_TO_KIND } from '../services/productService';
import ProductCard from '../components/ProductCard';

gsap.registerPlugin(ScrollTrigger);

const COPY = {
  digitales: {
    eyebrow: 'Productos digitales',
    titleLine1: 'Aprende',
    titleLine2: 'a tu ritmo.',
    subtitle: 'Ebooks, guías y recetarios listos para descargar. Compralos una vez, consultalos cuando quieras.',
    emptyMessage: 'Pronto vas a encontrar nuevos productos digitales aquí.',
  },
  suplementos: {
    eyebrow: 'Suplementos',
    titleLine1: 'Apoyo a',
    titleLine2: 'tu bienestar.',
    subtitle: 'Suplementación seleccionada para acompañar tu plan nutricional. Envíos a todo El Salvador.',
    emptyMessage: 'Pronto vas a encontrar suplementos disponibles aquí.',
  },
  servicios: {
    eyebrow: 'Servicios',
    titleLine1: 'Acompañamiento',
    titleLine2: '1:1.',
    subtitle: 'Consultas presenciales y online con enfoque holístico en salud hormonal y bienestar integral.',
    emptyMessage: 'Pronto vas a encontrar servicios disponibles aquí.',
  },
};

export default function PlenoCategoryPage() {
  const { kindSlug } = useParams();
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const kind = SLUG_TO_KIND[kindSlug];
  const copy = COPY[kindSlug];

  useEffect(() => {
    if (!kind) return;
    let cancelled = false;
    setLoading(true);
    getProductsByKind(kind)
      .then((rows) => {
        if (!cancelled) setProducts(rows);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pleno-cat-hero-el', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.05,
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (loading || products.length === 0) return;
    gsap.fromTo(
      '.product-card',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
    );
  }, [loading, products]);

  if (!kind || !copy) {
    return <Navigate to="/pleno" replace />;
  }

  return (
    <>
      {/* ── Hero ── */}
      <section ref={heroRef} className="pt-40 pb-12 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <Link
            to="/pleno"
            className="pleno-cat-hero-el inline-flex items-center gap-2 text-sm font-body text-primary/50 hover:text-accent transition-colors mb-6 w-fit"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Pleno
          </Link>

          <div className="pleno-cat-hero-el inline-block px-3 py-1 mb-5 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary/70">
            {copy.eyebrow}
          </div>

          <h1 className="pleno-cat-hero-el font-heading not-italic text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-primary mb-6 max-w-3xl">
            {copy.titleLine1}<br />
            <span className="font-drama italic text-accent">{copy.titleLine2}</span>
          </h1>

          <p className="pleno-cat-hero-el font-body text-base md:text-lg text-primary/60 max-w-xl leading-relaxed">
            {copy.subtitle}
          </p>
        </div>
      </section>

      {/* ── Grid ── */}
      <section ref={gridRef} className="pb-32 bg-background relative z-10 w-full min-h-[40vh]">
        <div className="container mx-auto px-6 max-w-7xl">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="font-body text-primary/40 text-lg">{copy.emptyMessage}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
