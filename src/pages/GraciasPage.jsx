import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getCheckoutStatus } from '../services/paymentService';
import { supabase } from '../lib/supabase';

const CHECKOUT_DRAFT_KEY = 'nutri-checkout-draft';
const PENDING_ORDER_KEY = 'nutri-pending-order';
const MAX_PENDING_POLLS = 12;

function loadPendingOrder() {
  try {
    const raw = localStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return typeof parsed === 'string' ? { id: parsed, key: null } : parsed;
  } catch {
    const raw = localStorage.getItem(PENDING_ORDER_KEY);
    return raw ? { id: raw, key: null } : null;
  }
}

function resolvePaymentStatus(payment, order) {
  if (payment?.status === 'approved' || order?.status === 'confirmed') {
    return 'approved';
  }

  if (payment?.status === 'declined' || order?.status === 'cancelled') {
    return 'declined';
  }

  return 'pending';
}

export default function GraciasPage() {
  const [searchParams] = useSearchParams();
  const pendingOrder = loadPendingOrder();
  const orderId = searchParams.get('order') || pendingOrder?.id || '';
  const orderKey = searchParams.get('key') || pendingOrder?.key || '';

  const containerRef = useRef(null);
  const pollRef = useRef(null);
  const pollCountRef = useRef(0);
  const cartClearedRef = useRef(false);
  const { clearCart } = useCart();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchStatus() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const result = await getCheckoutStatus(orderId, {
      orderKey: orderKey || null,
      accessToken: session?.access_token ?? null,
    });

    setOrder(result.order);
    setPaymentStatus(resolvePaymentStatus(result.payment, result.order));
    return result;
  }

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetchStatus()
      .catch((error) => {
        if (!cancelled) {
          console.error(error);
          setOrder(null);
          setPaymentStatus(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, orderKey]);

  useEffect(() => {
    if (paymentStatus !== 'pending' || !orderId) {
      return undefined;
    }

    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      try {
        await fetchStatus();
      } catch {
        // ignore polling errors
      }

      if (pollCountRef.current >= MAX_PENDING_POLLS) {
        clearInterval(pollRef.current);
        setPaymentStatus('timeout');
      }
    }, 5000);

    return () => clearInterval(pollRef.current);
  }, [paymentStatus, orderId, orderKey]);

  useEffect(() => {
    if (paymentStatus === 'approved' && !cartClearedRef.current) {
      cartClearedRef.current = true;
      clearCart();
      localStorage.removeItem(PENDING_ORDER_KEY);
      localStorage.removeItem(CHECKOUT_DRAFT_KEY);
    }
  }, [paymentStatus, clearCart]);

  useEffect(() => {
    if (loading) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const els = containerRef.current?.querySelectorAll('.gracias-el');
      if (els) {
        gsap.set(els, { opacity: 1, y: 0 });
      }
      gsap.fromTo(
        els || '.gracias-el',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' },
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading, paymentStatus]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pb-20 pt-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-accent" />
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div ref={containerRef} className="min-h-screen bg-background pb-20 pt-32">
        <div className="container mx-auto max-w-lg px-6 text-center">
          <p className="gracias-el mb-4 font-heading text-xl font-bold text-primary">
            No pudimos encontrar tu pedido
          </p>
          <Link
            to="/pleno"
            className="gracias-el inline-block rounded-xl bg-primary px-6 py-3 text-sm font-bold text-background"
          >
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <div ref={containerRef} className="min-h-screen bg-background pb-20 pt-32">
        <div className="mx-auto max-w-lg px-6 text-center">
          <div className="gracias-el mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-primary/20 border-t-accent" />
          <h1 className="gracias-el mb-2 font-drama text-3xl italic text-primary">
            Procesando tu pago...
          </h1>
          <p className="gracias-el font-body text-primary/60">
            Estamos confirmando tu pago con Wompi. Esto puede tardar unos segundos.
          </p>
          <p className="gracias-el mt-4 font-body text-sm text-primary/40">
            Orden: {order.id}
          </p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'timeout') {
    return (
      <div ref={containerRef} className="min-h-screen bg-background pb-20 pt-32">
        <div className="mx-auto max-w-lg px-6 text-center">
          <p className="gracias-el mb-4 text-5xl">...</p>
          <h1 className="gracias-el mb-2 font-drama text-3xl italic text-primary">
            Tu pago sigue en revision
          </h1>
          <p className="gracias-el mt-2 font-body text-primary/60">
            La confirmacion esta tomando mas tiempo de lo esperado. Te avisaremos a{' '}
            <strong>{order.contact.email}</strong> cuando se confirme.
          </p>
          <div className="gracias-el mt-8 flex justify-center gap-3">
            <Link
              to={`/tracking/${order.trackingCode}`}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-background"
            >
              Ver seguimiento
            </Link>
            <Link
              to="/pleno"
              className="rounded-xl border border-primary/10 bg-white px-6 py-3 text-sm font-bold text-primary"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'declined') {
    return (
      <div ref={containerRef} className="min-h-screen bg-background pb-20 pt-32">
        <div className="mx-auto max-w-lg px-6 text-center">
          <p className="gracias-el mb-4 text-5xl">x</p>
          <h1 className="gracias-el mb-2 font-drama text-3xl italic text-primary">
            Pago no aprobado
          </h1>
          <p className="gracias-el mt-2 font-body text-primary/60">
            Tu pago no fue aprobado. Puedes intentarlo de nuevo sin perder el
            carrito ni los datos de tu checkout.
          </p>
          <div className="gracias-el mt-8 flex justify-center gap-3">
            <Link
              to="/checkout"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-background"
            >
              Volver al checkout
            </Link>
            <Link
              to="/contactanos"
              className="rounded-xl border border-primary/10 bg-white px-6 py-3 text-sm font-bold text-primary"
            >
              Contactanos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-20 pt-32">
      <div className="mx-auto max-w-lg px-6">
        <div className="text-center">
          <p className="gracias-el mb-4 text-5xl">*</p>
          <h1 className="gracias-el font-drama text-3xl italic text-primary">
            Gracias por tu compra
          </h1>
          <p className="gracias-el mt-2 font-body text-primary/60">
            Tu pago ha sido confirmado exitosamente.
          </p>
          <p className="gracias-el mt-2 font-body text-sm text-green-600">
            Enviamos confirmacion a {order.contact.email}
          </p>
        </div>

        <div className="gracias-el mt-8 rounded-2xl bg-white p-6">
          <div className="space-y-3 font-body text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-primary/40">
                Orden
              </span>
              <span className="font-heading font-bold text-primary">{order.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-primary/40">
                Estado
              </span>
              <span className="text-sm font-bold text-green-600">
                Pago confirmado
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-primary/40">
                Total
              </span>
              <span className="font-bold text-primary">
                ${order.total.toFixed(2)}
              </span>
            </div>

            <div className="mt-3 border-t border-primary/10 pt-3">
              <span className="mb-2 block text-xs uppercase tracking-widest text-primary/40">
                Articulos
              </span>
              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-primary/70">
                    {item.name} x{item.quantity} - $
                    {(item.price * item.quantity).toFixed(2)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="gracias-el mt-4 rounded-2xl bg-[#1A1A1A] p-8 text-center">
          <p className="mb-2 text-xs uppercase tracking-widest text-white/40">
            Tu numero de tracking
          </p>
          <p className="font-mono text-2xl font-bold tracking-wider text-accent">
            {order.trackingCode}
          </p>
          <Link
            to={`/tracking/${order.trackingCode}`}
            className="mt-4 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-bold text-primary"
          >
            Rastrear mi pedido
          </Link>
          <p className="mt-3 text-xs text-white/40">
            Tambien lo recibiste por correo electronico
          </p>
        </div>

        <div className="gracias-el mt-6 flex gap-3">
          <Link
            to="/pleno"
            className="flex-1 rounded-xl bg-primary px-6 py-3 text-center text-sm font-bold text-background"
          >
            Volver a la tienda
          </Link>
          <Link
            to={user ? '/cuenta' : `/tracking/${order.trackingCode}`}
            className="flex-1 rounded-xl border border-primary/10 bg-white px-6 py-3 text-center text-sm font-bold text-primary"
          >
            {user ? 'Mi cuenta' : 'Ver seguimiento'}
          </Link>
        </div>
      </div>
    </div>
  );
}
