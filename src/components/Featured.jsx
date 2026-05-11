import React, { useEffect, useState } from 'react';
import { getFeaturedProducts } from '../services/productService';
import ProductCarousel from './ProductCarousel';
import { useHomeContent } from '../context/HomeContentContext';

export default function Featured() {
  const { content } = useHomeContent();
  const cfg = content.featured;
  const limit = Number.isFinite(cfg?.productLimit) ? cfg.productLimit : 5;

  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getFeaturedProducts(limit)
      .then((rows) => {
        if (!cancelled) setProducts(rows);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (loaded && products.length === 0) return null;

  return (
    <ProductCarousel
      id="destacados"
      titleLine1={cfg.titleLine1}
      titleLine2={cfg.titleLine2}
      products={products}
      ctaLabel={cfg.ctaLabel}
      ctaTo={cfg.ctaTo}
    />
  );
}
