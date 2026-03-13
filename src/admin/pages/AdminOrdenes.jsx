import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { getAllOrders } from '../../services/orderService';

export default function AdminOrdenes() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.ord-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(els, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const filtered = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;

  const columns = [
    { key: 'id', label: 'ID', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'contactName', label: 'Cliente' },
    { key: 'total', label: 'Total', render: (v) => `$${(v ?? 0).toFixed(2)}` },
    { key: 'status', label: 'Estado', render: (v) => <StatusBadge status={v} /> },
    { key: 'trackingCode', label: 'Tracking', render: (v) => <span className="font-mono text-xs text-primary/50">{v}</span> },
    { key: 'createdAt', label: 'Fecha', render: (v) => v ? new Date(v).toLocaleDateString('es-SV') : '' },
  ];

  if (loading) {
    return (
      <AdminLayout title="Órdenes">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Órdenes">
      <div ref={containerRef}>
        <div className="ord-el flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-lg text-primary">Todas las órdenes</h2>
          <select
            className="bg-white border border-primary/10 rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="confirmed">Pendiente</option>
            <option value="preparing">Preparando</option>
            <option value="shipped">En camino</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <div className="ord-el bg-white rounded-2xl border border-primary/5 overflow-hidden">
          <DataTable columns={columns} data={filtered} onRowClick={(row) => navigate(`/admin/ordenes/${row.id}`)} emptyMessage="No hay órdenes" />
        </div>
      </div>
    </AdminLayout>
  );
}
