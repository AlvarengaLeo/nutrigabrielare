import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getOrderByTracking } from '../services/orderService';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    key: 'confirmed',
    label: 'Orden confirmada',
    description: 'Tu orden ha sido recibida y confirmada',
  },
  {
    key: 'preparing',
    label: 'Preparando pedido',
    description: 'Estamos preparando tu paquete',
  },
  {
    key: 'shipped',
    label: 'En camino',
    description: 'Tu paquete está en ruta de entrega',
  },
  {
    key: 'delivered',
    label: 'Entregado',
    description: 'Tu paquete ha sido entregado',
  },
];

const STATUS_INDEX = {
  confirmed: 0,
  preparing: 1,
  shipped: 2,
  delivered: 3,
};

function formatTimestamp(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-SV', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TrackingPage() {
  const { code } = useParams();
  const containerRef = useRef(null);

  const [searchCode, setSearchCode] = useState(code ?? '');
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  // Auto-search on mount when URL param is present
  useEffect(() => {
    if (code) {
      setSearching(true);
      getOrderByTracking(code)
        .then((found) => {
          setOrder(found);
          setSearched(true);
        })
        .catch(console.error)
        .finally(() => setSearching(false));
    }
  }, [code]);

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroEls = containerRef.current?.querySelectorAll('.tracking-hero');
      if (heroEls) gsap.set(heroEls, { opacity: 1, y: 0 });
      gsap.fromTo(heroEls || '.tracking-hero',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
      );

      if (order) {
        const headerEls = containerRef.current?.querySelectorAll('.order-header');
        if (headerEls) gsap.set(headerEls, { opacity: 1, y: 0 });
        gsap.fromTo(headerEls || '.order-header',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 }
        );

        const stepEls = containerRef.current?.querySelectorAll('.timeline-step');
        if (stepEls) gsap.set(stepEls, { opacity: 1, y: 0 });
        gsap.fromTo(stepEls || '.timeline-step',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.12, delay: 0.2 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [order]);

  async function handleSearch() {
    setSearching(true);
    try {
      const found = await getOrderByTracking(searchCode.trim());
      setOrder(found);
      setSearched(true);
    } catch (err) {
      console.error(err);
      setOrder(null);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  const currentStatusIndex = order ? (STATUS_INDEX[order.status] ?? 0) : 0;

  // Build a lookup from status key → timestamp from statusHistory
  const timestampByStatus = {};
  if (order?.statusHistory) {
    for (const entry of order.statusHistory) {
      timestampByStatus[entry.status] = entry.timestamp;
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20" ref={containerRef}>
      {/* Search section */}
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="tracking-hero pt-32 pb-8 text-center">
          <h1 className="font-heading font-extrabold text-4xl text-primary">
            Rastrear pedido
          </h1>
          <p className="font-body text-primary/60 mt-2">
            Ingresá tu número de tracking
          </p>

          <div className="flex gap-3 mt-6">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="MJS-2026-0001-TRK"
              className="flex-1 bg-white rounded-xl px-4 py-3 border border-primary/10 font-mono text-primary placeholder:text-primary/30 focus:outline-none focus:border-accent/40 transition-colors"
            />
            <button
              onClick={handleSearch}
              className="bg-primary text-background px-6 py-3 rounded-xl font-heading font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Not found state */}
        {searched && !order && (
          <p className="text-center text-primary/60 font-body mt-4">
            No encontramos una orden con ese código de tracking.
          </p>
        )}

        {/* Order found — Timeline */}
        {order && (
          <div className="max-w-lg mx-auto bg-white rounded-2xl p-8 mt-4 mb-8">
            {/* Order header */}
            <div className="order-header flex items-center justify-between mb-8">
              <span className="font-heading font-bold text-primary">{order.id}</span>
              <span className="font-mono text-accent text-sm">{order.trackingCode}</span>
            </div>

            {/* Vertical timeline */}
            <div className="relative border-l-2 border-primary/5 pl-8 space-y-8">
              {STEPS.map((step, idx) => {
                const isCompleted = idx < currentStatusIndex;
                const isActive = idx === currentStatusIndex;
                const isPending = idx > currentStatusIndex;

                let dotClass = '';
                let labelClass = '';
                let dotStyle = {};

                if (isCompleted) {
                  dotClass = 'rounded-full w-4 h-4';
                  dotStyle = { backgroundColor: '#4ade80' };
                  labelClass = 'text-primary font-heading font-bold text-sm';
                } else if (isActive) {
                  dotClass = 'rounded-full w-4 h-4 ring-2 ring-accent/30';
                  dotStyle = { backgroundColor: '#9fc2ff' };
                  labelClass = 'text-accent font-heading font-bold text-sm';
                } else {
                  dotClass = 'rounded-full w-4 h-4 bg-primary/10';
                  labelClass = 'text-primary/30 font-heading font-bold text-sm';
                }

                const timestamp = timestampByStatus[step.key];

                return (
                  <div key={step.key} className="timeline-step relative">
                    {/* Dot positioned on the left border */}
                    <div
                      className={`absolute -left-10 top-0 ${dotClass}`}
                      style={dotStyle}
                    />

                    <p className={labelClass}>{step.label}</p>

                    {isCompleted && timestamp && (
                      <p className="font-body text-xs text-primary/40 mt-0.5">
                        {formatTimestamp(timestamp)}
                      </p>
                    )}

                    {isActive && (
                      <>
                        {timestamp && (
                          <p className="font-body text-xs text-primary/40 mt-0.5">
                            {formatTimestamp(timestamp)}
                          </p>
                        )}
                        <p className="font-body text-xs text-accent/80 mt-1">
                          {step.description}
                        </p>
                      </>
                    )}

                    {isPending && (
                      <p className="font-body text-xs text-primary/30 mt-0.5">
                        Pendiente
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
