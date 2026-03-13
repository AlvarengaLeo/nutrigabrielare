import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { X, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CarritoPage() {
  const { items, subtotal, removeItem, updateQuantity } = useCart();
  const containerRef = useRef(null);

  // GSAP entrance animation
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const els = containerRef.current?.querySelectorAll('.carrito-el');
      if (els) gsap.set(els, { opacity: 1, y: 0 });
      gsap.fromTo(els || '.carrito-el',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // ── Empty state ──
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-background flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-heading font-extrabold text-3xl text-primary mb-3">
          Tu carrito está vacío
        </h1>
        <p className="font-body text-primary/60 mb-8 max-w-md">
          Explorá la tienda y encontrá algo que te represente.
        </p>
        <Link
          to="/tienda"
          className="bg-primary text-background px-8 py-3.5 rounded-xl font-heading font-bold hover:opacity-90 transition-opacity"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen pt-32 pb-20 bg-background"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="carrito-el font-heading font-extrabold text-3xl text-primary mb-10">
          Tu carrito
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left — Item list */}
          <div className="flex-[2] flex flex-col gap-4">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;
              return (
                <div
                  key={`${item.productId}__${item.size}__${item.color}`}
                  className="carrito-el relative bg-white rounded-2xl p-5 flex gap-5 items-start"
                >
                  {/* Color placeholder */}
                  <div className="w-20 h-24 rounded-xl bg-primary shrink-0" />

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <span className="font-heading font-semibold text-primary leading-tight">
                      {item.name}
                    </span>
                    <span className="text-xs text-primary/50 font-body">
                      {item.color} · Talla {item.size}
                    </span>

                    {/* Quantity controls + line total */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-primary/10 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity - 1,
                            )
                          }
                          className="px-3 py-2 text-primary/50 hover:text-primary transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-2 font-body text-sm font-semibold text-primary min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity + 1,
                            )
                          }
                          className="px-3 py-2 text-primary/50 hover:text-primary transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="font-heading font-bold text-primary">
                        ${lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(item.productId, item.size, item.color)
                    }
                    className="absolute top-4 right-4 text-primary/30 hover:text-primary transition-colors"
                    aria-label="Eliminar producto"
                  >
                    <X size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right — Summary */}
          <div className="flex-1">
            <div className="carrito-el bg-white rounded-2xl p-6 flex flex-col gap-4 lg:sticky lg:top-28">
              <h2 className="font-heading font-bold text-lg text-primary">
                Resumen
              </h2>

              {/* Subtotal */}
              <div className="flex justify-between font-body text-sm text-primary/70">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between font-body text-sm text-primary/70">
                <span>Envío</span>
                <span>Por calcular</span>
              </div>

              {/* Divider */}
              <div className="h-px bg-primary/5" />

              {/* Total */}
              <div className="flex justify-between font-heading font-bold text-lg text-primary">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {/* Checkout button */}
              <Link
                to="/checkout"
                className="block w-full bg-primary text-background text-center rounded-xl py-3.5 font-heading font-bold hover:opacity-90 transition-opacity"
              >
                Proceder al checkout
              </Link>

              {/* Continue shopping */}
              <Link
                to="/tienda"
                className="block text-center text-accent text-sm font-body hover:underline"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
