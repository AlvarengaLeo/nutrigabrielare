import React, { useEffect, useState } from 'react';
import { getFeaturedProducts } from '../services/productService';
import ProductCarousel from './ProductCarousel';

export default function Featured() {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getFeaturedProducts(5)
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
  }, []);

  // Hide section entirely if nothing to show after load
  if (loaded && products.length === 0) return null;

  return (
    <ProductCarousel
      id="destacados"
      eyebrow="Destacados"
      titleLine1="Lo que querés"
      titleLine2="ver primero."
      products={products}
      ctaLabel="Ver todo"
      ctaTo="/pleno"
    />
  );
}
