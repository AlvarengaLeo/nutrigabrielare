import React, { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { getOrderById } from '../data/orders';

export default function GraciasPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const order = orderId ? getOrderById(orderId) : null;
  const containerRef = useRef(null);

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gracias-el', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

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

  return (
    <div ref={containerRef} className="min-h-screen pt-32 pb-20 bg-background">
      <div className="max-w-lg mx-auto px-6">
        {/* Top section */}
        <div className="text-center">
          <p className="gracias-el text-5xl mb-4">✦</p>
          <h1 className="gracias-el font-drama italic text-3xl text-primary">
            ¡Gracias, Maje!
          </h1>
          <p className="gracias-el font-body text-primary/60 mt-2">
            Tu orden ha sido creada y confirmada.
          </p>
          <p className="gracias-el text-sm text-green-500 mt-2 font-body">
            📧 Enviamos confirmación a {order.contact.email}
          </p>
        </div>

        {/* Order card */}
        <div className="gracias-el bg-white rounded-2xl p-6 mt-8">
          <div className="space-y-3 text-sm font-body">
            <div className="flex justify-between items-center">
              <span className="text-xs tracking-widest text-primary/40 uppercase">
                Orden
              </span>
              <span className="font-heading font-bold text-primary">
                {order.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs tracking-widest text-primary/40 uppercase">
                Estado
              </span>
              <span className="text-green-500 font-bold text-sm">
                ● Confirmada
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
