import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { createPaymentLink } from '../services/paymentService';
import { supabase } from '../lib/supabase';

function CheckoutItemThumbnail({ item }) {
  const [hasImageError, setHasImageError] = useState(false);
  const hasImage = Boolean(item.image) && !hasImageError;

  return (
    <div className="w-12 h-14 rounded-lg bg-primary/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
      {hasImage ? (
        <img
          src={item.image}
          alt={item.name}
          className="w-[85%] h-[85%] object-contain mix-blend-multiply"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary/10" />
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Form state
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [department, setDepartment] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/carrito');
    }
  }, [items.length, navigate]);

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = containerRef.current?.querySelectorAll('.checkout-el');
      if (els) gsap.set(els, { opacity: 1, y: 0 });
      gsap.fromTo(els || '.checkout-el',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const shippingCost = 5.0;
  const total = subtotal + shippingCost;

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};
    if (!phone.trim()) newErrors.phone = true;
    if (!address.trim()) newErrors.address = true;
    if (!city.trim()) newErrors.city = true;
    if (!department.trim()) newErrors.department = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    setSubmitError('');

    try {
      // Create order with pending_payment status
      const order = await createOrder({
        userId: user.id,
        items,
        contact: {
          name: user.firstName + ' ' + user.lastName,
          email: user.email,
          phone,
        },
        shipping: { address, city, department, notes },
        subtotal,
        shippingCost,
        total,
        status: 'pending_payment',
      });

      // Save orderId as backup
      localStorage.setItem('nutri-pending-order', order.id);

      // Get access token for the serverless function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No se pudo obtener la sesión');
      }

      // Create Wompi payment link and redirect
      const { urlEnlace } = await createPaymentLink(order.id, session.access_token);
      window.location.href = urlEnlace;
    } catch (err) {
      setSubmitError(err.message || 'Error al procesar el pago. Intentá de nuevo.');
      console.error(err);
      setSubmitting(false);
    }
  }

  if (items.length === 0) return null;

  const inputBase =
    'bg-[#f8f6f3] rounded-xl px-4 py-3 text-sm font-body w-full outline-none focus:ring-1 focus:ring-primary/20 transition-colors';

  return (
    <div ref={containerRef} className="min-h-screen pt-32 pb-20 bg-background">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="checkout-el font-heading font-extrabold text-3xl text-primary mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
          {/* ── Left Column ──────────────────────────────────────────── */}
          <div className="flex-[2] min-w-0 space-y-3">
            {/* Datos de contacto */}
            <div className="checkout-el bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-sm text-primary">
                  Datos de contacto
                </h2>
                <span className="text-green-500 text-xs font-body">
                  ✓ Desde tu cuenta
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  readOnly
                  value={user.firstName + ' ' + user.lastName}
                  className={`${inputBase} cursor-default`}
                />
                <input
                  type="email"
                  readOnly
                  value={user.email}
                  className={`${inputBase} cursor-default`}
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: false }));
                  }}
                  className={`${inputBase} sm:col-span-2 ${errors.phone ? 'border border-red-400' : ''}`}
                />
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="checkout-el bg-white rounded-2xl p-6">
              <h2 className="font-heading font-bold text-sm text-primary mb-1">
                Dirección de envío
              </h2>
              <span className="text-xs font-body text-primary/50 inline-block mb-4">
                📦 Envío a domicilio
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Dirección"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((p) => ({ ...p, address: false }));
                  }}
                  className={`${inputBase} sm:col-span-2 ${errors.address ? 'border border-red-400' : ''}`}
                />
                <input
                  type="text"
                  placeholder="Ciudad"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (errors.city) setErrors((p) => ({ ...p, city: false }));
                  }}
                  className={`${inputBase} ${errors.city ? 'border border-red-400' : ''}`}
                />
                <input
                  type="text"
                  placeholder="Departamento"
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    if (errors.department) setErrors((p) => ({ ...p, department: false }));
                  }}
                  className={`${inputBase} ${errors.department ? 'border border-red-400' : ''}`}
                />
                <input
                  type="text"
                  placeholder="Indicaciones de entrega (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`${inputBase} sm:col-span-2`}
                />
              </div>
            </div>

          </div>

          {/* ── Right Column — Order Summary ─────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="checkout-el bg-white rounded-2xl p-6 sticky top-28">
              <h2 className="font-heading font-bold text-sm text-primary mb-4">
                Tu pedido
              </h2>

              {/* Item list */}
              <div className="space-y-0">
                {items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className={`flex items-center gap-3 py-3 ${
                      idx < items.length - 1 ? 'border-b border-primary/5' : ''
                    }`}
                  >
                    <CheckoutItemThumbnail item={item} />
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-bold text-primary truncate">
                        {item.name}{' '}
                        <span className="font-normal text-primary/50">
                          &times;{item.quantity}
                        </span>
                      </p>
                      <p className="text-xs text-primary/40 font-body">
                        {item.size} / {item.color}
                      </p>
                    </div>
                    <p className="font-heading font-bold text-sm text-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2 text-sm font-body">
                <div className="flex justify-between text-primary/60">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-primary/60">
                  <span>Envío</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="border-t border-primary/10 pt-2 flex justify-between font-bold text-lg text-primary">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit */}
              {submitError && (
                <p className="mt-4 text-sm text-red-500 font-body text-center">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`mt-6 bg-primary text-background w-full py-3.5 rounded-xl font-heading font-bold text-sm transition-opacity ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
              >
                {submitting ? 'Redirigiendo a Wompi...' : 'Pagar con Wompi →'}
              </button>

              <p className="text-xs text-primary/30 text-center mt-3 font-body">
                Serás redirigido a Wompi para completar el pago
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
