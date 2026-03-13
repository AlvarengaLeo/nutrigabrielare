import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowLeft } from 'lucide-react';
import { getProductBySlug, getCategoryById } from '../services/productService';
import { ColorSelector, SizeSelector } from '../components/VariantSelector';
import { useCart } from '../context/CartContext';

export default function ProductoPage() {
  const { slug } = useParams();
  const containerRef = useRef(null);
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product + category
  useEffect(() => {
    setLoading(true);
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedImage(0);
    getProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        if (p?.variants?.colors?.[0]) {
          setSelectedColor(p.variants.colors[0].name);
        }
        if (p?.category) {
          return getCategoryById(p.category).then(setCategory);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  // GSAP entrance animation
  useEffect(() => {
    if (!containerRef.current || loading || !product) return;
    const els = containerRef.current.querySelectorAll('.producto-el');
    // Ensure elements are visible first, then animate
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(els,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading, product]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  // Not found
  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-background flex flex-col items-center justify-center text-center">
        <h1 className="font-heading font-extrabold text-3xl text-primary mb-4">
          Producto no encontrado
        </h1>
        <Link
          to="/tienda"
          className="font-heading font-bold text-accent hover:underline"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const selectedColorObj = product.variants.colors.find(
    (c) => c.name === selectedColor,
  );
  const mainBg = selectedColorObj?.hex ?? product.variants.colors[0]?.hex ?? '#1A1A1A';
  const hasImages = product.images && product.images.length > 0;

  // Per-variant stock
  const variantKey = selectedSize && selectedColor ? `${selectedSize}__${selectedColor}` : null;
  const currentStock = variantKey ? (product.variantStock?.[variantKey] ?? 0) : product.stock;
  const canAdd = selectedColor && selectedSize && currentStock > 0;

  function handleAddToCart() {
    if (!canAdd) return;
    addItem(product, selectedSize, selectedColor, 1);
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen pt-32 pb-20 bg-background"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Back button + Breadcrumb */}
        <div className="producto-el mb-10 flex flex-col gap-3">
          <Link
            to="/tienda"
            className="inline-flex items-center gap-2 text-sm font-body text-primary/50 hover:text-accent transition-colors w-fit"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Volver a la tienda
          </Link>
          <nav className="flex items-center gap-2 text-sm font-body text-primary/50">
            <Link to="/tienda" className="hover:text-accent transition-colors">
              Tienda
            </Link>
            <span>/</span>
            {category && (
              <>
                <Link to="/tienda" className="hover:text-accent transition-colors">
                  {category.title}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-primary/80">{product.name}</span>
          </nav>
        </div>

        {/* Split layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Gallery (left) */}
          <div className="producto-el flex-1 flex flex-col gap-4">
            {hasImages ? (
              <>
                <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden">
                  <img
                    src={product.images[selectedImage]}
                    alt={`${product.name} - imagen ${selectedImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-3">
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedImage(i)}
                        className={[
                          'aspect-square w-20 rounded-xl overflow-hidden transition-all duration-200',
                          i === selectedImage
                            ? 'border-2 border-accent'
                            : 'border border-primary/10 opacity-60 hover:opacity-80',
                        ].join(' ')}
                      >
                        <img
                          src={img}
                          alt={`${product.name} - miniatura ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                className="aspect-[3/4] w-full rounded-2xl transition-colors duration-300"
                style={{ backgroundColor: mainBg }}
              />
            )}
          </div>

          {/* Details (right) */}
          <div className="flex-1 flex flex-col gap-6">
            <span className="producto-el uppercase text-xs tracking-widest text-accent font-body font-semibold">
              {category?.title}
            </span>

            <h1 className="producto-el font-heading font-extrabold text-3xl text-primary">
              {product.name}
            </h1>

            <p className="producto-el font-drama italic text-2xl text-primary">
              ${product.price.toFixed(2)}
            </p>

            <p className="producto-el font-body text-primary/60 leading-relaxed">
              {product.descriptionLong}
            </p>

            <div className="producto-el">
              <ColorSelector
                colors={product.variants.colors}
                selected={selectedColor}
                onSelect={setSelectedColor}
              />
            </div>

            <div className="producto-el">
              <SizeSelector
                sizes={product.variants.sizes}
                selected={selectedSize}
                onSelect={setSelectedSize}
              />
            </div>

            {/* Stock indicator — per-variant */}
            <div className="producto-el font-body text-sm">
              {currentStock > 0 ? (
                <span className="flex items-center gap-2 text-green-600">
                  <span className="text-green-500">●</span>
                  {currentStock} disponibles
                </span>
              ) : (
                <span className="text-red-500 font-semibold">
                  {selectedSize && selectedColor ? 'Agotado en esta combinación' : 'Seleccioná talla y color'}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAdd}
              className={[
                'producto-el w-full py-4 rounded-xl font-heading font-bold text-center transition-all duration-200',
                canAdd
                  ? 'bg-primary text-background hover:opacity-90 cursor-pointer'
                  : 'bg-primary/30 text-background/60 cursor-not-allowed',
              ].join(' ')}
            >
              {!selectedColor || !selectedSize
                ? 'Seleccioná talla y color'
                : currentStock === 0
                  ? 'Agotado'
                  : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
