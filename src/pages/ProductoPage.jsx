import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowLeft } from 'lucide-react';
import { getProductBySlug, getCategoryById } from '../services/productService';
import { ColorSelector, SizeSelector } from '../components/VariantSelector';
import { useCart } from '../context/CartContext';
import MarkdownRenderer from '../components/MarkdownRenderer';

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
  const [quantity, setQuantity] = useState(1);

  // Fetch product + category
  useEffect(() => {
    setLoading(true);
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedImage(0);
    setQuantity(1);
    getProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        if (p?.variants?.colors?.[0]) {
          setSelectedColor(p.variants.colors[0].name);
        }
        if (p?.variants?.sizes?.[0]) {
          setSelectedSize(p.variants.sizes[0]);
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

  // Determine if product has variants
  // Filter out internal/default variant values
  const realColors = (product.variants?.colors ?? []).filter(c => c.name !== 'Estándar');
  const realSizes = (product.variants?.sizes ?? []).filter(s => s !== 'Único');
  const hasColors = realColors.length > 0;
  const hasSizes = realSizes.length > 0;
  const hasVariants = hasColors || hasSizes;

  const selectedColorObj = hasColors
    ? product.variants.colors.find((c) => c.name === selectedColor)
    : null;
  const mainBg = selectedColorObj?.hex ?? '#F3F2F0';
  const hasImages = product.images && product.images.length > 0;

  // Per-variant stock (only if variants exist)
  let currentStock;
  let canAdd;

  if (hasVariants) {
    const variantKey = selectedSize && selectedColor ? `${selectedSize}__${selectedColor}` : null;
    currentStock = variantKey ? (product.variantStock?.[variantKey] ?? 0) : product.stock;
    canAdd = (!hasColors || selectedColor) && (!hasSizes || selectedSize) && currentStock > 0;
  } else {
    // No variants — use total product stock
    currentStock = product.stock ?? 999; // default to available if no stock tracking
    canAdd = currentStock > 0;
  }

  function handleAddToCart() {
    if (!canAdd) return;
    const size = selectedSize || 'Único';
    const color = selectedColor || 'Estándar';
    addItem(product, size, color, quantity);
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
                <div className="aspect-square w-full bg-[#F3F2F0] overflow-hidden flex items-center justify-center">
                  <img
                    src={product.images[selectedImage]}
                    alt={`${product.name} - imagen ${selectedImage + 1}`}
                    className="w-[85%] h-[85%] object-contain mix-blend-multiply"
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
                          'aspect-square w-20 overflow-hidden transition-all duration-200 bg-[#F3F2F0] flex items-center justify-center',
                          i === selectedImage
                            ? 'border-2 border-accent'
                            : 'border border-primary/10 opacity-60 hover:opacity-80',
                        ].join(' ')}
                      >
                        <img
                          src={img}
                          alt={`${product.name} - miniatura ${i + 1}`}
                          className="w-[85%] h-[85%] object-contain mix-blend-multiply"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                className="aspect-square w-full transition-colors duration-300 bg-[#F3F2F0]"
                style={selectedColorObj ? { backgroundColor: mainBg } : undefined}
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

            <div className="producto-el font-body text-primary/60">
              <MarkdownRenderer content={product.description} />
            </div>

            {/* Color selector — only if colors exist */}
            {hasColors && (
              <div className="producto-el">
                <ColorSelector
                  colors={realColors}
                  selected={selectedColor}
                  onSelect={setSelectedColor}
                />
              </div>
            )}

            {/* Size selector — only if sizes exist */}
            {hasSizes && (
              <div className="producto-el">
                <SizeSelector
                  sizes={realSizes}
                  selected={selectedSize}
                  onSelect={setSelectedSize}
                />
              </div>
            )}

            {/* Quantity selector */}
            <div className="producto-el flex flex-col gap-2">
              <span className="font-body text-xs font-semibold tracking-widest uppercase text-primary/50">
                Cantidad
              </span>
              <div className="flex items-center border border-primary/10 rounded-xl overflow-hidden w-fit">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-primary/50 hover:text-primary transition-colors"
                >
                  −
                </button>
                <span className="px-4 py-3 font-body text-sm font-semibold text-primary min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-primary/50 hover:text-primary transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock indicator */}
            {hasVariants && (
              <div className="producto-el font-body text-sm">
                {currentStock > 0 ? (
                  <span className="flex items-center gap-2 text-green-600">
                    <span className="text-green-500">●</span>
                    {currentStock} disponibles
                  </span>
                ) : (
                  <span className="text-red-500 font-semibold">
                    {(!hasColors || selectedColor) && (!hasSizes || selectedSize)
                      ? 'Agotado en esta combinación'
                      : 'Selecciona las opciones'}
                  </span>
                )}
              </div>
            )}

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
              {hasVariants && ((!hasColors || selectedColor) && (!hasSizes || selectedSize))
                ? currentStock === 0
                  ? 'Agotado'
                  : 'Agregar al carrito'
                : hasVariants
                  ? 'Selecciona las opciones'
                  : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

