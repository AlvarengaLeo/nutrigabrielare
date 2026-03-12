import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus } from 'lucide-react';
import gsap from 'gsap';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { items, itemCount, subtotal, drawerOpen, setDrawerOpen, updateQuantity, removeItem } =
    useCart();

  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const isAnimating = useRef(false);

  // ── Animate open / close ────────────────────────────────────────────────────
  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    if (isAnimating.current) return;
    isAnimating.current = true;

    if (drawerOpen) {
      // Make sure elements are visible before animating in
      overlay.style.display = 'block';
      panel.style.display = 'flex';

      gsap.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out', onComplete: () => { isAnimating.current = false; } },
      );
      gsap.fromTo(
        panel,
        { x: '100%' },
        { x: '0%', duration: 0.35, ease: 'power3.out' },
      );

      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(overlay, { opacity: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to(panel, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
          overlay.style.display = 'none';
          panel.style.display = 'none';
          isAnimating.current = false;
        },
      });

      // Restore body scroll
      document.body.style.overflow = '';
    }
  }, [drawerOpen]);

  // Restore scroll on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const close = () => setDrawerOpen(false);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={close}
        style={{ display: 'none' }}
        className="fixed inset-0 bg-dark/40 backdrop-blur-[2px] z-[100]"
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{ display: 'none' }}
        className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-background z-[101] flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Tu carrito"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-primary/10">
          <h2 className="font-heading font-semibold text-primary text-lg">
            Tu carrito{' '}
            <span className="text-primary/40 font-normal text-base">({itemCount})</span>
          </h2>
          <button
            type="button"
            onClick={close}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-primary/50 hover:text-primary hover:bg-primary/5 transition-colors duration-150 focus:outline-none"
            aria-label="Cerrar carrito"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center h-full">
              <p className="font-body text-primary/40 text-center py-16">
                Tu carrito está vacío
              </p>
            </div>
          ) : (
            items.map((item) => {
              const lineTotal = (item.price * item.quantity).toFixed(2);
              return (
                <div
                  key={`${item.productId}__${item.size}__${item.color}`}
                  className="flex gap-4"
                >
                  {/* Color placeholder */}
                  <div className="w-20 h-24 rounded-xl bg-dark/10 shrink-0 overflow-hidden">
                    {item.image && !item.image.includes('placeholder') ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="font-heading font-semibold text-primary text-sm leading-tight line-clamp-2">
                      {item.name}
                    </span>
                    <span className="font-body text-xs text-primary/50">
                      {item.color} · {item.size}
                    </span>
                    <span className="font-body text-sm text-primary font-medium mt-auto">
                      ${lineTotal}
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                        }
                        className="flex items-center justify-center w-7 h-7 rounded-lg border border-primary/20 text-primary hover:border-primary/50 transition-colors duration-150 focus:outline-none"
                        aria-label="Reducir cantidad"
                      >
                        <Minus size={13} strokeWidth={2} />
                      </button>

                      <span className="font-body text-sm text-primary w-5 text-center">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                        }
                        className="flex items-center justify-center w-7 h-7 rounded-lg border border-primary/20 text-primary hover:border-primary/50 transition-colors duration-150 focus:outline-none"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={13} strokeWidth={2} />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        className="ml-auto font-body text-xs text-primary/30 hover:text-primary/60 transition-colors duration-150 focus:outline-none"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-primary/10 flex flex-col gap-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between font-body">
              <span className="text-primary/60 text-sm">Subtotal</span>
              <span className="font-heading font-semibold text-primary">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* CTAs */}
            <Link
              to="/checkout"
              onClick={close}
              className="magnetic-btn w-full flex items-center justify-center py-3.5 px-6 rounded-2xl bg-primary text-background font-heading font-semibold text-sm hover:bg-dark transition-colors duration-200 focus:outline-none"
            >
              Ir al checkout
            </Link>

            <Link
              to="/carrito"
              onClick={close}
              className="w-full flex items-center justify-center py-3 px-6 rounded-2xl border border-primary/20 text-primary font-body text-sm hover:bg-primary/5 transition-colors duration-150 focus:outline-none"
            >
              Ver carrito completo
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
