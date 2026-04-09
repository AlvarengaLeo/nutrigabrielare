import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getCategories, getProductsByCategory, getAllProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';

gsap.registerPlugin(ScrollTrigger);

export default function TiendaPage() {
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const closingRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    getCategories()
      .then((cats) => {
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  // ── Fetch products when category changes ──
  useEffect(() => {
    setLoadingProducts(true);
    if (activeCategory === 'all') {
      getAllProducts()
        .then(setProducts)
        .catch(console.error)
        .finally(() => setLoadingProducts(false));
    } else if (categories.length > 0) {
      getProductsByCategory(categories[activeCategory].id)
        .then(setProducts)
        .catch(console.error)
        .finally(() => setLoadingProducts(false));
    }
  }, [activeCategory, categories]);

  // ── Animations ──
  useEffect(() => {
    let ctx = gsap.context(() => {
      // Hero
      gsap.from('.tienda-hero-el', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.1,
      });

      // Closing CTA
      gsap.from('.closing-el', {
        scrollTrigger: { trigger: closingRef.current, start: 'top 85%' },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!loadingProducts && products.length > 0) {
      gsap.fromTo('.product-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [loadingProducts, products]);

  return (
    <>
      {/* ── Hero ── */}
      <section ref={heroRef} className="pb-8 pt-40 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl text-center flex flex-col items-center">
          <h1 className="tienda-hero-el font-drama italic text-5xl md:text-6xl lg:text-7xl tracking-tighter text-primary mb-6 max-w-3xl">
            Un Regalo de la Naturaleza a tu Salud.
          </h1>
          <p className="tienda-hero-el font-body text-lg md:text-xl text-primary/60 max-w-xl leading-relaxed mb-6">
            Recursos, guías y suplementos seleccionados para potenciar tu bienestar de forma pura y holística.
          </p>
        </div>
      </section>

      {/* ── Shop Grid ── */}
      <section ref={gridRef} className="pb-24 bg-background relative z-10 w-full min-h-[50vh]">
        <div className="container mx-auto px-6 max-w-7xl">
          
          {/* Centered Top Bar Navigation */}
          <div className="flex flex-wrap items-center justify-center border-b border-primary/10 pb-8 mb-12 gap-8 md:gap-16 tienda-hero-el mt-8">
              <button
                onClick={() => setActiveCategory('all')}
                className={`text-lg md:text-xl tracking-tight font-body transition-colors duration-300 ${activeCategory === 'all' ? 'text-primary font-bold' : 'text-primary/40 hover:text-primary/80'}`}
              >
                New Products
              </button>
              {categories.map((cat, index) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(index)}
                  className={`text-lg md:text-xl tracking-tight font-body transition-colors duration-300 ${activeCategory === index ? 'text-primary font-bold' : 'text-primary/40 hover:text-primary/80'}`}
                >
                  {cat.title}
                </button>
              ))}
          </div>

          {/* Product Grid with Vertical Separators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-primary/10">
            {loadingProducts ? (
              <div className="col-span-full flex justify-center py-24">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
              </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="product-card p-6 md:p-10 border-r border-b border-primary/10">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center">
                <p className="font-body text-primary/40 text-lg mb-6">No hay productos aún.</p>
                <p className="font-body text-primary/30 text-sm max-w-md mx-auto">
                  Agrega productos desde el <a href="/admin/productos" className="text-accent underline">panel administrativo</a> para verlos aquí.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Closing ── */}
      <section ref={closingRef} className="py-24 md:py-32 bg-[#F3F2F0] relative overflow-hidden flex items-center justify-start mt-12 bg-background border-t border-primary/10">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <h2 className="closing-el font-heading font-black uppercase text-5xl md:text-6xl lg:text-[5rem] text-primary tracking-tighter leading-[1.05] max-w-4xl">
            CONTÁCTANOS,<br/>ESTAMOS PARA AYUDAR!
          </h2>
        </div>
      </section>
    </>
  );
}
