import React from 'react';
import { Link } from 'react-router-dom';

const KIND_LABEL = {
  physical: 'Suplemento',
  digital: 'Producto digital',
  service: 'Servicio',
};

const CTA_LABEL = {
  physical: 'Comprar',
  digital: 'Comprar',
  service: 'Reservar',
};

/**
 * Reusable product card for grids.
 * @param {{ product: import('../data/products').PRODUCTS[number] }} props
 */
export default function ProductCard({ product }) {
  const {
    slug,
    name,
    price = 0,
    kind = 'physical',
    featured = false,
    variants,
    images,
  } = product;

  const swatchColor = variants?.colors?.[0]?.hex ?? '#1A1A1A';
  const hasImage = images && images.length > 0;
  const kindLabel = KIND_LABEL[kind];
  const ctaLabel = CTA_LABEL[kind] ?? 'Comprar';
  const showQuote = kind === 'service' && price === 0;
  const dotCount = Math.min(images?.length ?? 0, 3);

  return (
    <Link
      to={`/producto/${slug}`}
      className="group/product flex flex-col w-full font-body"
      aria-label={`Ver ${name}`}
    >
      {/* Image panel */}
      <div className="relative bg-[#F3F2F0] rounded-[1.75rem] aspect-square mb-5 overflow-hidden flex items-center justify-center">
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-white rounded-full text-[10px] font-heading font-extrabold tracking-widest uppercase text-primary shadow-sm">
            Destacado
          </div>
        )}

        {/* Image */}
        {hasImage ? (
          <img
            src={images[0]}
            alt={name}
            loading="lazy"
            className="w-[78%] h-[78%] object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover/product:scale-[1.06]"
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full opacity-25"
            style={{ backgroundColor: swatchColor !== '#1A1A1A' ? swatchColor : '#fb7185' }}
          />
        )}

        {/* Image dots indicator */}
        {dotCount > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {Array.from({ length: dotCount }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-rose-400' : 'bg-rose-200'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col px-1 mb-5">
        {kindLabel && (
          <span className="font-body text-xs font-semibold text-rose-500 mb-1.5">
            {kindLabel}
          </span>
        )}
        <h3 className="font-heading font-bold text-base md:text-lg text-primary mb-1.5 leading-tight">
          {name}
        </h3>
        <span className="font-body text-base text-primary/80">
          {showQuote ? 'Cotizar' : `$${Number(price).toFixed(2)}`}
        </span>
      </div>

      {/* CTA */}
      <div className="bg-primary text-background py-3 rounded-full text-center font-heading font-bold text-sm tracking-wide group-hover/product:opacity-90 transition-opacity">
        {ctaLabel}
      </div>
    </Link>
  );
}
