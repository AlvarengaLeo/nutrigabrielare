import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import gsap from 'gsap';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import { getOrderById, updateOrderStatus } from '../../services/orderService';

const STATUSES = ['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdenDetalle() {
  const { id } = useParams();
  const containerRef = useRef(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  async function loadOrder() {
    setLoading(true);
    try {
      const o = await getOrderById(id);
      setOrder(o);
      setNewStatus(o.status);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { loadOrder(); }, [id]);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.det-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(els, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  async function handleStatusUpdate() {
    if (newStatus === order.status) return;
    setUpdating(true);
    try {
      await updateOrderStatus(id, newStatus);
      await loadOrder();
    } catch (err) { alert(err.message || 'Error'); }
    finally { setUpdating(false); }
  }

  if (loading) {
    return (
      <AdminLayout title="Detalle de orden">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Detalle de orden">
        <p className="font-body text-primary/50 text-center py-20">Orden no encontrada.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Orden ${order.id}`}>
      <div ref={containerRef} className="max-w-4xl">
        {/* Order header */}
        <div className="det-el flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-bold text-xl text-primary">{order.id}</h2>
            <p className="font-mono text-xs text-primary/40 mt-1">{order.trackingCode}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Client info */}
          <div className="det-el bg-white rounded-2xl border border-primary/5 p-5">
            <h3 className="font-heading font-bold text-sm text-primary mb-3">Cliente</h3>
            <p className="font-body text-sm text-primary">{order.contactName}</p>
            <p className="font-body text-sm text-primary/60">{order.contactEmail}</p>
            <p className="font-body text-sm text-primary/60">{order.contactPhone}</p>
          </div>

          {/* Shipping */}
          <div className="det-el bg-white rounded-2xl border border-primary/5 p-5">
            <h3 className="font-heading font-bold text-sm text-primary mb-3">Envío</h3>
            <p className="font-body text-sm text-primary">{order.shippingAddress}</p>
            <p className="font-body text-sm text-primary/60">{order.shippingCity}, {order.shippingDepartment}</p>
            {order.shippingNotes && <p className="font-body text-sm text-primary/40 mt-1 italic">{order.shippingNotes}</p>}
          </div>
        </div>

        {/* Items */}
        <div className="det-el bg-white rounded-2xl border border-primary/5 overflow-hidden mb-8">
          <div className="p-5 border-b border-primary/5">
            <h3 className="font-heading font-bold text-sm text-primary">Artículos</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-primary/50 font-body border-b border-primary/5">
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Talla</th>
                <th className="px-5 py-3">Color</th>
                <th className="px-5 py-3">Cant.</th>
                <th className="px-5 py-3">Precio</th>
                <th className="px-5 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items ?? []).map((item, i) => (
                <tr key={i} className="border-b border-primary/5 last:border-0">
                  <td className="px-5 py-3 font-heading font-semibold text-primary">{item.productName}</td>
                  <td className="px-5 py-3 font-body text-primary/60">{item.size}</td>
                  <td className="px-5 py-3 font-body text-primary/60">{item.color}</td>
                  <td className="px-5 py-3 font-body">{item.quantity}</td>
                  <td className="px-5 py-3 font-body">${(item.price ?? 0).toFixed(2)}</td>
                  <td className="px-5 py-3 font-heading font-semibold">${((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-5 border-t border-primary/5 flex justify-end">
            <div className="text-right">
              <p className="font-body text-sm text-primary/50">Subtotal: ${(order.subtotal ?? 0).toFixed(2)}</p>
              <p className="font-body text-sm text-primary/50">Envío: ${(order.shippingCost ?? 0).toFixed(2)}</p>
              <p className="font-heading font-bold text-lg text-primary mt-1">Total: ${(order.total ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Status timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="det-el bg-white rounded-2xl border border-primary/5 p-5 mb-8">
            <h3 className="font-heading font-bold text-sm text-primary mb-4">Historial</h3>
            <div className="space-y-3">
              {order.statusHistory.map((entry, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  <StatusBadge status={entry.status} />
                  <span className="font-body text-xs text-primary/40">
                    {new Date(entry.createdAt).toLocaleString('es-SV')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status update */}
        <div className="det-el bg-white rounded-2xl border border-primary/5 p-5">
          <h3 className="font-heading font-bold text-sm text-primary mb-3">Actualizar estado</h3>
          <div className="flex items-center gap-3">
            <select
              className="bg-[#f8f6f3] rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40 flex-1"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s === 'confirmed' ? 'Pendiente' : s === 'preparing' ? 'Preparando' : s === 'shipped' ? 'En camino' : s === 'delivered' ? 'Entregado' : 'Cancelado'}</option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={updating || newStatus === order.status}
              className={`bg-primary text-background px-6 py-2.5 rounded-xl font-heading font-bold text-sm transition-opacity ${updating || newStatus === order.status ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
            >
              {updating ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
