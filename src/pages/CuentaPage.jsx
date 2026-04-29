import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/AuthContext';
import { getOrdersByUser } from '../services/orderService';

gsap.registerPlugin(ScrollTrigger);

const STATUS_CONFIG = {
  confirmed: { label: '● Pendiente', className: 'text-amber-500' },
  preparing: { label: '● Preparando', className: 'text-accent' },
  shipped: { label: '● En camino', className: 'text-accent' },
  delivered: { label: '● Entregado', className: 'text-green-500' },
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-SV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function CuentaPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingOrders(true);
    getOrdersByUser(user.id)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, [user]);

  useEffect(() => {
    if (loadingOrders) return;
    const ctx = gsap.context(() => {
      const headerEls = containerRef.current?.querySelectorAll('.cuenta-header');
      if (headerEls) gsap.set(headerEls, { opacity: 1, y: 0 });
      gsap.fromTo(headerEls || '.cuenta-header',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
      );

      const sectionEls = containerRef.current?.querySelectorAll('.orders-section');
      if (sectionEls) gsap.set(sectionEls, { opacity: 1, y: 0 });
      gsap.fromTo(sectionEls || '.orders-section',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.15 }
      );

      const cardEls = containerRef.current?.querySelectorAll('.order-card');
      if (cardEls) gsap.set(cardEls, { opacity: 1, y: 0 });
      gsap.fromTo(cardEls || '.order-card',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.12, delay: 0.25 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loadingOrders]);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-background pb-20" ref={containerRef}>
      <div className="container mx-auto px-6 max-w-3xl">
        {/* Header */}
        <div className="cuenta-header pt-32 pb-8 flex items-start justify-between">
          <div>
            <h1 className="font-heading font-extrabold text-4xl text-primary">
              Mi cuenta
            </h1>
            <p className="text-primary/50 text-sm mt-1 font-body">
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="border border-primary/10 px-4 py-2 rounded-xl text-sm text-primary/60 hover:text-primary transition-colors font-body mt-2"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Orders section */}
        <div className="orders-section">
          {orders.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="font-heading font-bold text-xl text-primary mb-2">
                Aún no tenés pedidos
              </h2>
              <p className="font-body text-primary/50 mb-6">
                Cuando hagas tu primera compra, aparecerá acá.
              </p>
              <Link
                to="/pleno"
                className="inline-block bg-primary text-background px-6 py-3 rounded-xl font-heading font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Ir a la tienda
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-heading font-bold text-lg text-primary mb-4">
                Mis pedidos
              </h2>

              <div className="space-y-4">
                {orders.map((order) => {
                  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.confirmed;
                  const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity ?? 1), 0) ?? 0;

                  return (
                    <Link
                      key={order.id}
                      to={`/tracking/${order.trackingCode}`}
                      className="order-card block bg-white rounded-2xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        {/* Left side */}
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary flex-shrink-0" />
                          <div>
                            <p className="font-heading font-bold text-sm text-primary">
                              {order.id}
                            </p>
                            <p className="text-xs text-primary/40 font-body mt-0.5">
                              {formatDate(order.createdAt)}
                            </p>
                            <p className="text-xs text-primary/40 font-body">
                              {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
                            </p>
                          </div>
                        </div>

                        {/* Right side */}
                        <div className="text-right">
                          <p className={`text-sm font-body font-medium ${statusCfg.className}`}>
                            {statusCfg.label}
                          </p>
                          <p className="font-mono text-xs text-primary/40 mt-1">
                            {order.trackingCode}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
