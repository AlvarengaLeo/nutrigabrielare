import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { getOrderById } from '../services/orderService';
import { getPaymentByOrderId } from '../services/paymentService';
import { useCart } from '../context/CartContext';

export default function GraciasPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const containerRef = useRef(null);
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null); // pending | approved | declined | timeout
  const pollRef = useRef(null);
  const pollCountRef = useRef(0);
  const cartClearedRef = useRef(false);

  // Fetch order + payment status
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [orderData, payment] = await Promise.all([
          getOrderById(orderId),
          getPaymentByOrderId(orderId),
        ]);
        setOrder(orderData);

        if (!payment) {
          setPaymentStatus('pending');
        } else if (payment.status === 'approved') {
          setPaymentStatus('approved');
        } else if (payment.status === 'declined') {
          setPaymentStatus('declined');
        } else {
          setPaymentStatus('pending');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [orderId]);

  // Poll for payment confirmation when pending
  useEffect(() => {
    if (paymentStatus !== 'pending' || !orderId) return;

    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      try {
        const payment = await getPaymentByOrderId(orderId);
        if (payment?.status === 'approved') {
          setPaymentStatus('approved');
          const updatedOrder = await getOrderById(orderId);
          if (updatedOrder) setOrder(updatedOrder);
          clearInterval(pollRef.current);
        } else if (payment?.status === 'declined') {
          setPaymentStatus('declined');
          clearInterval(pollRef.current);
        }
      } catch {
        // ignore polling errors
      }

      // Timeout after 12 polls (60 seconds)
      if (pollCountRef.current >= 12) {
        clearInterval(pollRef.current);
        setPaymentStatus('timeout');
      }
    }, 5000);

    return () => clearInterval(pollRef.current);
  }, [paymentStatus, orderId]);

  // Clear cart when payment approved
  useEffect(() => {
    if (paymentStatus === 'approved' && !cartClearedRef.current) {
      cartClearedRef.current = true;
      clearCart();
      localStorage.removeItem('nutri-pending-order');
    }
  }, [paymentStatus, clearCart]);

  // GSAP entrance animation
  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      const els = containerRef.current?.querySelectorAll('.gracias-el');
      if (els) gsap.set(els, { opacity: 1, y: 0 });
      gsap.fromTo(
        els || '.gracias-el',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading, paymentStatus]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div ref={containerRef} className="min-h-screen pt-32 pb-20 bg-background">
        <div className="container mx-auto px-6 max-w-lg text-center">
          <p className="gracias-el font-heading font-bold text-xl text-primary mb-4">
            Orden no encontrada
          </p>
          <Link
            to="/tienda"
            className="gracias-el inline-block bg-primary text-background px-6 py-3 rounded-xl font-heading font-bold text-sm"
          >
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  // ── Pending payment (polling) ─────────────────────────────
  if (paymentStatus === 'pending') {
    return (
      <div ref={containerRef} className="min-h-screen pt-32 pb-20 bg-background">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="gracias-el w-12 h-12 border-2 border-primary/20 border-t-accent rounded-full animate-spin mx-auto mb-6" />
          <h1 className="gracias-el font-drama italic text-3xl text-primary mb-2">
            Procesando tu pago...
          </h1>
          <p className="gracias-el font-body text-primary/60">
            Estamos confirmando tu pago con Wompi. Esto puede tardar unos segundos.
          </p>
          <p className="gracias-el font-body text-primary/40 text-sm mt-4">
            Orden: {order.id}
          </p>
        </div>
      </div>
    );
  }

  // ── Timeout (still pending after 60s) ─────────────────────
  if (paymentStatus === 'timeout') {
    return (
      <div ref={containerRef} className="min-h-screen pt-32 pb-20 bg-background">
        <div className="max-w-lg mx-auto px-6 text-center">
          <p className="gracias-el text-5xl mb-4">&#x23F3;</p>
          <h1 className="gracias-el font-drama italic text-3xl text-primary mb-2">
            Tu pago está siendo procesado
          </h1>
          <p className="gracias-el font-body text-primary/60 mt-2">
            La confirmación está tomando más tiempo de lo esperado. Te enviaremos un
            correo a <strong>{order.contact.email}</strong> cuando se confirme.
          </p>
          <div className="gracias-el flex gap-3 mt-8 justify-center">
            <Link
              to="/cuenta"
              className="bg-primary text-background px-6 py-3 rounded-xl font-heading font-bold text-sm"
            >
              Ir a mi cuenta
            </Link>
            <Link
              to="/tienda"
              className="bg-white border border-primary/10 text-primary px-6 py-3 rounded-xl font-heading font-bold text-sm"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Declined ──────────────────────────────────────────────
  if (paymentStatus === 'declined') {
    return (
      <div ref={containerRef} className="min-h-screen pt-32 pb-20 bg-background">
        <div className="max-w-lg mx-auto px-6 text-center">
          <p className="gracias-el text-5xl mb-4">&#x2717;</p>
          <h1 className="gracias-el font-drama italic text-3xl text-primary mb-2">
            Pago no aprobado
          </h1>
          <p className="gracias-el font-body text-primary/60 mt-2">
            Tu pago no fue aprobado. Podés intentar de nuevo o contactarnos para ayuda.
          </p>
          <div className="gracias-el flex gap-3 mt-8 justify-center">
            <Link
              to="/carrito"
              className="bg-primary text-background px-6 py-3 rounded-xl font-heading font-bold text-sm"
            >
              Intentar de nuevo
            </Link>
            <Link
              to="/contactanos"
              className="bg-white border border-primary/10 text-primary px-6 py-3 rounded-xl font-heading font-bold text-sm"
            >
              Contactanos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Approved (success) ────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen pt-32 pb-20 bg-background">
      <div className="max-w-lg mx-auto px-6">
        {/* Top section */}
        <div className="text-center">
          <p className="gracias-el text-5xl mb-4">&#x2726;</p>
          <h1 className="gracias-el font-drama italic text-3xl text-primary">
            ¡Gracias, Maje!
          </h1>
          <p className="gracias-el font-body text-primary/60 mt-2">
            Tu pago ha sido confirmado exitosamente.
          </p>
          <p className="gracias-el text-sm text-green-500 mt-2 font-body">
            Enviamos confirmación a {order.contact.email}
          </p>
        </div>

        {/* Order card */}
        <div className="gracias-el bg-white rounded-2xl p-6 mt-8">
          <div className="space-y-3 text-sm font-body">
            <div className="flex justify-between items-center">
              <span className="text-xs tracking-widest text-primary/40 uppercase">
                Orden
              </span>
              <span className="font-heading font-bold text-primary">{order.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs tracking-widest text-primary/40 uppercase">
                Estado
              </span>
              <span className="text-green-500 font-bold text-sm">
                &#x25CF; Pago confirmado
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs tracking-widest text-primary/40 uppercase">
                Total
              </span>
              <span className="font-bold text-primary">
                ${order.total.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-primary/10 pt-3 mt-3">
              <span className="text-xs tracking-widest text-primary/40 uppercase block mb-2">
                Artículos
              </span>
              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-primary/70">
                    {item.name} &times;{item.quantity} — $
                    {(item.price * item.quantity).toFixed(2)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tracking card */}
        <div className="gracias-el bg-[#1A1A1A] rounded-2xl p-8 mt-4 text-center">
          <p className="text-xs tracking-widest text-white/40 uppercase mb-2">
            Tu número de tracking
          </p>
          <p className="font-mono text-2xl text-accent font-bold tracking-wider">
            {order.trackingCode}
          </p>
          <Link
            to={`/tracking/${order.trackingCode}`}
            className="bg-accent text-primary px-6 py-3 rounded-xl font-heading font-bold text-sm inline-block mt-4"
          >
            Rastrear mi pedido →
          </Link>
          <p className="text-xs text-white/40 mt-3">
            También lo recibiste por correo electrónico
          </p>
        </div>

        {/* Action buttons */}
        <div className="gracias-el flex gap-3 mt-6">
          <Link
            to="/tienda"
            className="flex-1 text-center bg-primary text-background px-6 py-3 rounded-xl font-heading font-bold text-sm"
          >
            Volver a la tienda
          </Link>
          <Link
            to="/cuenta"
            className="flex-1 text-center bg-white border border-primary/10 text-primary px-6 py-3 rounded-xl font-heading font-bold text-sm"
          >
            Mi cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
