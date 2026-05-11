import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { getProductsByKind, DIGITAL_SUBTYPES } from '../services/productService';

gsap.registerPlugin(ScrollTrigger);

/**
 * Editorial-styled section that surfaces digital products (ebooks, cursos,
 * guías, eventos grabados, programas) as *curation*, not vitrine. Reusable
 * on home and on /fluir-femenino. NO commercial CTAs — only an underlined
 * "Ver detalles" that links to the product page.
 *
 * @param {{
 *   eyebrow?: string,
 *   titleLine1?: string,
 *   titleLine2?: string,
 *   subtitle?: string,
 *   limit?: number,
 *   bg?: 'cream' | 'white',
 * }} props
 */
export default function DigitalResources({
  eyebrow = 'Recursos',
  titleLine1 = 'Recursos para',
  titleLine2 = 'profundizar.',
  subtitle = 'Ebooks, cursos y guías para llevarte la conversación a casa. Compralos una vez, consultalos cuando quieras.',
  limit = 4,
  bg = 'cream',
}) {
  const sectionRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProductsByKind('digital')
      .then((rows) => {
        if (cancelled) return;
        // Curate: featured first by featuredOrder, then alphabetical
        const sorted = [...rows].sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          if (a.featured && b.featured) return (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0);
          return (a.name || '').localeCompare(b.name || '');
        });
        setProducts(sorted.slice(0, limit));
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  useEffect(() => {
    if (loading || products.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.resource-el',
        { y: 30, opacity: 0 },
        {
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, products.length]);

  if (loading || products.length === 0) return null;

  const bgClass = bg === 'cream' ? 'bg-[#FAF7F2]' : 'bg-white';

  return (
    <section ref={sectionRef} className={`py-20 md:py-28 ${bgClass} relative w-full`}>
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <span
              className="resource-el font-body inline-block text-[11px] uppercase tracking-[0.28em] mb-5"
              style={{ color: '#7A1838' }}
            >
              {eyebrow}
            </span>
            <h2
              className="resource-el font-drama not-italic text-4xl md:text-5xl lg:text-[3.25rem] tracking-tight leading-[1.05]"
              style={{ color: '#1A1410' }}
            >
              {titleLine1}{titleLine2 && <br />}
              {titleLine2 && (
                <span className="italic" style={{ color: '#7A1838' }}>
                  {titleLine2}
                </span>
              )}
            </h2>
            {subtitle && (
              <p
                className="resource-el font-body text-base md:text-lg mt-5 leading-relaxed"
                style={{ color: '#6B6256' }}
              >
                {subtitle}
              </p>
            )}
          </div>

          <Link
            to="/pleno/digitales"
            className="resource-el self-start md:self-end inline-flex items-center gap-2 font-heading font-bold text-sm hover:opacity-70 transition-opacity"
            style={{ color: '#7A1838' }}
          >
            Conocer todos los recursos
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((p) => (
            <ResourceCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ResourceCard({ product }) {
  const cover = product.images?.[0];
  const subtypeLabel = product.digitalSubtype ? DIGITAL_SUBTYPES[product.digitalSubtype] : 'Recurso';

  return (
    <Link
      to={`/producto/${product.slug}`}
      className="resource-el group block bg-white border border-[#E5DFD6] hover:border-[#7A1838]/40 transition-colors duration-300"
      aria-label={`Ver detalles de ${product.name}`}
    >
      {/* Cover */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F3EFE8]">
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#1A1410]/20 font-drama text-5xl italic">
            {subtypeLabel}
          </div>
        )}
        {/* subtle dark gradient overlay so subtype chip reads */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/15 pointer-events-none" />
        {/* subtype chip on cover */}
        <span
          className="absolute top-4 left-4 inline-block px-2.5 py-1 bg-white text-[10px] font-heading font-bold uppercase tracking-[0.22em]"
          style={{ color: '#7A1838' }}
        >
          {subtypeLabel}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 md:p-6">
        <h3
          className="font-drama not-italic text-xl md:text-2xl leading-tight mb-3 group-hover:text-[#7A1838] transition-colors"
          style={{ color: '#1A1410' }}
        >
          {product.name}
        </h3>
        {product.description && (
          <p
            className="font-body text-sm leading-relaxed line-clamp-2 mb-4"
            style={{ color: '#6B6256' }}
          >
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-[#E5DFD6]">
          <span className="font-body text-sm" style={{ color: '#6B6256' }}>
            ${Number(product.price).toFixed(2)}
          </span>
          <span
            className="font-heading font-bold text-xs underline underline-offset-4 group-hover:no-underline"
            style={{ color: '#7A1838' }}
          >
            Ver detalles →
          </span>
        </div>
      </div>
    </Link>
  );
}
