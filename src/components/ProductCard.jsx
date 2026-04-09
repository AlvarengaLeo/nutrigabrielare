import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

/**
 * Reusable product card for grids.
 * @param {{ product: import('../data/products').PRODUCTS[number] }} props
 */
export default function ProductCard({ product }) {
  const { slug, name, price = 0, variants, images, featured } = product;
  const swatchColor = variants?.colors?.[0]?.hex ?? '#1A1A1A';
  const hasImage = images && images.length > 0;

  return (
    <Link
      to={`/producto/${slug}`}
      className="group/product flex flex-col font-body w-full relative"
      aria-label={`Ver producto: ${name}`}
    >
      {/* Floating Discount Badge */}
      {price < 20 && (
        <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-health font-heading font-black text-[10px] text-background flex items-center justify-center -rotate-12 shadow-lg z-20">
          -20%
        </div>
      )}

      {/* Product image with mix-blend-multiply to kill white backgrounds */}
      {hasImage ? (
        <div className="aspect-square w-full bg-transparent overflow-hidden mb-2 transition-transform duration-700 ease-out relative z-10 flex items-center justify-center">
          <img
            src={images[0]}
            alt={name}
            className="w-[85%] h-[85%] object-contain transition-transform duration-1000 ease-out group-hover/product:scale-110 mix-blend-multiply"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className="aspect-square w-full bg-transparent mb-2 transition-transform duration-1000 ease-out group-hover/product:scale-105 flex items-center justify-center"
        >
           <div className="w-16 h-16 rounded-full opacity-20" style={{ backgroundColor: swatchColor !== '#1A1A1A' ? swatchColor : '#D51663' }}></div>
        </div>
      )}

      {/* Info Content Centered */}
      <div className="flex flex-col items-center px-2 text-center">
        {/* NEW tag */}
        <div className="mb-3 px-3 py-1 bg-primary/5 text-primary/60 text-[10px] font-heading font-extrabold tracking-widest uppercase rounded-full">
          New
        </div>
        
        {/* Title */}
        <h3 className="font-body text-base md:text-lg text-primary/90 mb-1 leading-tight max-w-[90%]">
          {name}
        </h3>
        
        {/* Price Row */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-heading font-bold text-sm md:text-base text-primary">
            ${price.toFixed(2)}
          </span>
          {price < 20 && (
            <span className="font-body text-xs md:text-sm text-primary/30 line-through">
              ${(price * 1.25).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
