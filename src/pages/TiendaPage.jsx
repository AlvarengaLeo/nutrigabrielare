import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { getCategories, getProductsByCategory } from '../services/productService';
import ProductCard from '../components/ProductCard';

gsap.registerPlugin(ScrollTrigger);

export default function TiendaPage() {
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const closingRef = useRef(null);
  const panelRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // ── Initial entrance animations ──
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

  // ── Fetch products when category changes ──
  useEffect(() => {
    if (activeCategory === null || categories.length === 0) return;
    setLoadingProducts(true);
    getProductsByCategory(categories[activeCategory].id)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoadingProducts(false));
  }, [activeCategory, categories]);

  // ── Category selection animations ──
  useEffect(() => {
    if (activeCategory === null) {
      gsap.to('.category-block', {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      });
    } else {
      categories.forEach((_, i) => {
        const el = document.querySelector(`.category-block-${i}`);
        if (!el) return;
        if (i === activeCategory) {
          gsap.to(el, { scale: 1.02, opacity: 1, duration: 0.5, ease: 'power2.out' });
        } else {
          gsap.to(el, { scale: 0.97, opacity: 0.6, duration: 0.5, ease: 'power2.out' });
        }
      });

      // Panel entrance
      if (panelRef.current) {
        gsap.fromTo(panelRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.15 }
        );
        gsap.from('.product-card', {
          y: 20,
          opacity: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: 'power3.out',
          delay: 0.3,
        });
      }

      // Scroll panel into view
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [activeCategory, products]);

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
            {categories.map((cat, index) => (
              <div
                key={cat.num}
                onClick={() => setActiveCategory(activeCategory === index ? null : index)}
                className={`category-block category-block-${index} group flex flex-col justify-between p-10 md:p-12 rounded-[2.5rem] bg-white border transition-all duration-500 min-h-[420px] cursor-pointer ${
                  activeCategory === null
                    ? 'border-primary/5 hover:border-primary/10'
                    : activeCategory === index
                      ? 'border-accent/30 shadow-lg'
                      : 'opacity-60 border-primary/5'
                }`}
              >
                <div>
                  <div className="font-drama italic text-2xl text-accent mb-6">{cat.num}</div>
                  <h3 className="font-heading font-bold text-3xl text-primary mb-4 tracking-tight">{cat.title}</h3>
                  <p className="font-body text-primary/70 text-base md:text-lg leading-relaxed mb-10">
                    {cat.desc}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCategory(activeCategory === index ? null : index);
                  }}
                  className="inline-flex items-center text-primary font-bold font-body group-hover:text-accent transition-colors w-fit cursor-pointer"
                >
                  {cat.cta} <ArrowUpRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </button>
              </div>
            ))}
          </div>

          {/* ── Collection Panel ── */}
          {activeCategory !== null && (
            <div
              key={activeCategory}
              ref={panelRef}
              className="rounded-[2.5rem] bg-white border border-primary/5 p-6 md:p-12 mt-12"
            >
              {/* Header */}
              <div>
                <div className="font-drama italic text-2xl text-accent">{categories[activeCategory].num}</div>
                <h3 className="font-heading font-bold text-3xl text-primary mt-2">{categories[activeCategory].title}</h3>
                <p className="font-body text-primary/60 mt-2">{categories[activeCategory].tagline}</p>
              </div>

              {/* Accent divider */}
              <div className="w-16 h-[2px] bg-accent rounded-full my-8" />

              {/* Product grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {loadingProducts ? (
                  <div className="col-span-full flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="product-card">
                      <ProductCard product={product} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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
