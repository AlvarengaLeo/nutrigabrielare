import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

/**
 * Reusable product card for grids.
 * @param {{ product: import('../data/products').PRODUCTS[number] }} props
 */
export default function ProductCard({ product }) {
  const { slug, name, price, variants } = product;
  const swatchColor = variants?.colors?.[0]?.hex ?? '#1A1A1A';

  return (
    <Link
      to={`/producto/${slug}`}
      className="group/product flex flex-col gap-3 font-body"
      aria-label={`Ver producto: ${name}`}
    >
      {/* Color swatch / image placeholder */}
      <div
        className="aspect-[3/4] w-full rounded-2xl transition-transform duration-300 ease-out group-hover/product:scale-[1.03]"
        style={{ backgroundColor: swatchColor }}
      />

      {/* Info row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-heading font-semibold text-primary leading-tight">
            {name}
          </span>
          <span className="text-primary/60 text-sm">
            ${price.toFixed(2)}
          </span>
        </div>

        <span className="flex items-center gap-1 text-accent text-sm font-medium shrink-0 mt-0.5 transition-transform duration-200 group-hover/product:translate-x-0.5 group-hover/product:-translate-y-0.5">
          Ver producto
          <ArrowUpRight size={15} strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
