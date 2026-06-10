import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useCart } from '../context/CartContext';
import { createPaymentLink } from '../services/paymentService';
import { getActiveZones, calculateShippingCost } from '../services/shippingService';
import { supabase } from '../lib/supabase';

const CHECKOUT_DRAFT_KEY = 'nutri-checkout-draft';
const PENDING_ORDER_KEY = 'nutri-pending-order';

const EMPTY_DRAFT = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  department: '',
  notes: '',
  shippingZoneId: '',
};

function loadDraft() {
  try {
    const raw = localStorage.getItem(CHECKOUT_DRAFT_KEY);
    return raw ? { ...EMPTY_DRAFT, ...JSON.parse(raw) } : EMPTY_DRAFT;
  } catch {
    return EMPTY_DRAFT;
  }
}

function CheckoutItemThumbnail({ item }) {
  const [hasImageError, setHasImageError] = useState(false);
  const hasImage = Boolean(item.image) && !hasImageError;

  return (
    <div className="flex h-14 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/5">
      {hasImage ? (
        <img
          src={item.image}
          alt={item.name}
          className="h-[85%] w-[85%] object-contain mix-blend-multiply"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-primary/10" />
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [draft, setDraft] = useState(loadDraft);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/carrito');
    }
  }, [items.length, navigate]);

  useEffect(() => {
    let cancelled = false;
    getActiveZones()
      .then((data) => {
        if (cancelled) return;
        setZones(data);
        setDraft((prev) => {
          if (prev.shippingZoneId && data.some((z) => z.id === prev.shippingZoneId)) {
            return prev;
          }
          return { ...prev, shippingZoneId: data[0]?.id ?? '' };
        });
      })
      .catch(() => {
        if (!cancelled) setZones([]);
      })
      .finally(() => {
        if (!cancelled) setZonesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = containerRef.current?.querySelectorAll('.checkout-el');
      if (els) {
        gsap.set(els, { opacity: 1, y: 0 });
      }
      gsap.fromTo(
        els || '.checkout-el',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore localStorage errors
    }
  }, [draft]);

  // Carritos 100% digitales no necesitan envío (los items sin kind —
  // carritos viejos — se tratan como físicos por seguridad)
  const digitalOnly =
    items.length > 0 && items.every((item) => item.kind === 'digital');

  const selectedZone =
    zones.find((z) => z.id === draft.shippingZoneId) ?? null;
  const isPickup = Boolean(selectedZone?.isPickup);
  const shippingCost = digitalOnly ? 0 : calculateShippingCost(selectedZone, subtotal);
  const total = subtotal + shippingCost;

  function updateDraftField(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  }

  function validateCheckout() {
    const nextErrors = {};
    const zone = zones.find((z) => z.id === draft.shippingZoneId) ?? null;
    const zoneIsPickup = Boolean(zone?.isPickup);

    if (!draft.name.trim()) nextErrors.name = true;
    if (!draft.email.trim()) nextErrors.email = true;
    if (!draft.phone.trim()) nextErrors.phone = true;
    if (!digitalOnly) {
      if (!zoneIsPickup) {
        if (!draft.address.trim()) nextErrors.address = true;
        if (!draft.city.trim()) nextErrors.city = true;
        if (!draft.department.trim()) nextErrors.department = true;
      }
      if (!draft.shippingZoneId) nextErrors.shippingZoneId = true;
    }

    const emailPattern = /\S+@\S+\.\S+/;
    if (draft.email.trim() && !emailPattern.test(draft.email.trim())) {
      nextErrors.email = true;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateCheckout()) {
      setSubmitError('Revisá los campos marcados en rojo.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const checkoutPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          image: item.image ?? null,
        })),
        contact: {
          name: draft.name.trim(),
          email: draft.email.trim(),
          phone: draft.phone.trim(),
        },
        shipping: {
          address: isPickup || digitalOnly ? '' : draft.address.trim(),
          city: isPickup || digitalOnly ? '' : draft.city.trim(),
          department: isPickup || digitalOnly ? '' : draft.department.trim(),
          notes: isPickup || digitalOnly ? '' : draft.notes.trim(),
          zoneId: digitalOnly ? '' : draft.shippingZoneId,
        },
      };

      const payment = await createPaymentLink(
        checkoutPayload,
        session?.access_token ?? null,
      );

      localStorage.setItem(
        PENDING_ORDER_KEY,
        JSON.stringify({
          id: payment.orderId,
          key: payment.orderKey,
        }),
      );

      window.location.assign(payment.urlEnlace);
    } catch (error) {
      setSubmitError(
        error.message || 'No pudimos preparar tu pago. Intenta de nuevo.',
      );
      console.error(error);
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return null;
  }

  const inputBase =
    'w-full rounded-xl bg-[#f8f6f3] px-4 py-3 text-sm font-body outline-none transition-colors focus:ring-1 focus:ring-primary/20';

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-20 pt-32">
      <div className="container mx-auto max-w-6xl px-6">
        <h1 className="checkout-el mb-8 font-heading text-3xl font-extrabold text-primary">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-[2] space-y-3">
            <section className="checkout-el rounded-2xl bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-sm font-bold text-primary">
                  Datos de contacto
                </h2>
                <span className="text-xs font-body text-primary/45">
                  Compra como invitada
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={draft.name}
                  onChange={(e) => updateDraftField('name', e.target.value)}
                  className={`${inputBase} ${errors.name ? 'border border-red-400' : ''}`}
                />
                <input
                  type="email"
                  placeholder="Correo electronico"
                  value={draft.email}
                  onChange={(e) => updateDraftField('email', e.target.value)}
                  className={`${inputBase} ${errors.email ? 'border border-red-400' : ''}`}
                />
                <input
                  type="tel"
                  placeholder="Telefono"
                  value={draft.phone}
                  onChange={(e) => updateDraftField('phone', e.target.value)}
                  className={`${inputBase} sm:col-span-2 ${errors.phone ? 'border border-red-400' : ''}`}
                />
              </div>
            </section>

            {digitalOnly ? (
              <section className="checkout-el rounded-2xl bg-white p-6">
                <h2 className="mb-1 font-heading text-sm font-bold text-primary">
                  Entrega
                </h2>
                <span className="mb-4 inline-block font-body text-xs text-primary/50">
                  Productos digitales
                </span>
                <p className="rounded-xl bg-[#f8f6f3] px-4 py-3 font-body text-xs text-primary/60">
                  Tu compra es 100% digital: los enlaces de descarga te llegan al
                  correo apenas se confirme el pago. No se necesita dirección de envío.
                </p>
              </section>
            ) : (
            <section className="checkout-el rounded-2xl bg-white p-6">
              <h2 className="mb-1 font-heading text-sm font-bold text-primary">
                {isPickup ? 'Entrega' : 'Dirección de envío'}
              </h2>
              <span className="mb-4 inline-block font-body text-xs text-primary/50">
                {isPickup ? 'Recoger en tienda' : 'Envío a domicilio'}
              </span>

              {zonesLoading ? (
                <div className="mb-4 h-12 rounded-xl bg-[#f8f6f3] animate-pulse" />
              ) : zones.length === 0 ? (
                <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 font-body text-xs text-amber-700">
                  No hay zonas de envío disponibles. Contactanos para coordinar la entrega.
                </p>
              ) : (
                <div className="mb-4">
                  <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-2 block">
                    Zona de envío
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {zones.map((zone) => {
                      const cost = calculateShippingCost(zone, subtotal);
                      const isFree = cost === 0 && zone.freeThreshold != null;
                      const isSelected = draft.shippingZoneId === zone.id;
                      return (
                        <button
                          type="button"
                          key={zone.id}
                          onClick={() => updateDraftField('shippingZoneId', zone.id)}
                          style={isSelected ? { backgroundColor: '#196b41' } : undefined}
                          className={`rounded-xl px-4 py-3 text-left transition-colors ${
                            isSelected
                              ? 'text-white'
                              : 'bg-[#f8f6f3] text-primary hover:bg-primary/5'
                          } ${errors.shippingZoneId && !isSelected ? 'ring-1 ring-red-400' : ''}`}
                        >
                          <p className="font-heading text-sm font-bold">{zone.name}</p>
                          <p className={`mt-1 font-body text-xs ${isSelected ? 'text-white/80' : 'text-primary/50'}`}>
                            {isFree ? 'Envío gratis' : `$${cost.toFixed(2)}`}
                            {zone.freeThreshold != null && !isFree
                              ? ` · gratis sobre $${Number(zone.freeThreshold).toFixed(2)}`
                              : ''}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isPickup ? (
                <p className="rounded-xl bg-[#f8f6f3] px-4 py-3 font-body text-xs text-primary/60">
                  Retirás tu pedido en la tienda. Te contactamos por teléfono o
                  correo para coordinar la entrega.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Direccion"
                    value={draft.address}
                    onChange={(e) => updateDraftField('address', e.target.value)}
                    className={`${inputBase} sm:col-span-2 ${errors.address ? 'border border-red-400' : ''}`}
                  />
                  <input
                    type="text"
                    placeholder="Ciudad"
                    value={draft.city}
                    onChange={(e) => updateDraftField('city', e.target.value)}
                    className={`${inputBase} ${errors.city ? 'border border-red-400' : ''}`}
                  />
                  <input
                    type="text"
                    placeholder="Departamento"
                    value={draft.department}
                    onChange={(e) => updateDraftField('department', e.target.value)}
                    className={`${inputBase} ${errors.department ? 'border border-red-400' : ''}`}
                  />
                  <input
                    type="text"
                    placeholder="Indicaciones de entrega (opcional)"
                    value={draft.notes}
                    onChange={(e) => updateDraftField('notes', e.target.value)}
                    className={`${inputBase} sm:col-span-2`}
                  />
                </div>
              )}
            </section>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="checkout-el sticky top-28 rounded-2xl bg-white p-6">
              <h2 className="mb-4 font-heading text-sm font-bold text-primary">
                Tu pedido
              </h2>

              <div className="space-y-0">
                {items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className={`flex items-center gap-3 py-3 ${
                      idx < items.length - 1 ? 'border-b border-primary/5' : ''
                    }`}
                  >
                    <CheckoutItemThumbnail item={item} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-bold text-primary">
                        {item.name}{' '}
                        <span className="font-normal text-primary/50">
                          x{item.quantity}
                        </span>
                      </p>
                      <p className="font-body text-xs text-primary/40">
                        {item.size} / {item.color}
                      </p>
                    </div>
                    <p className="font-heading text-sm font-bold text-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 font-body text-sm">
                <div className="flex justify-between text-primary/60">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {!digitalOnly && (
                  <div className="flex justify-between text-primary/60">
                    <span>
                      Envio{selectedZone ? ` · ${selectedZone.name}` : ''}
                    </span>
                    <span>
                      {shippingCost === 0 && selectedZone?.freeThreshold != null
                        ? 'Gratis'
                        : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-primary/10 pt-2 text-lg font-bold text-primary">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {submitError ? (
                <p className="mt-4 text-center font-body text-sm text-red-500">
                  {submitError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: '#196b41' }}
                className={`mt-6 w-full rounded-xl py-3.5 font-heading text-sm font-bold text-white transition-opacity ${
                  submitting ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90'
                }`}
              >
                {submitting ? 'Redirigiendo a Wompi...' : 'Pagar con Wompi ->'}
              </button>

              <p className="mt-3 text-center font-body text-xs text-primary/35">
                Seras redirigido a Wompi para completar el pago sin perder tu
                carrito ni el progreso del checkout.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
