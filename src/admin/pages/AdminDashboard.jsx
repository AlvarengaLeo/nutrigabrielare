import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { DollarSign, Clock, Package, Users, AlertTriangle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import MetricCard from '../components/MetricCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getDashboardMetrics, getRecentOrders, getLowStockVariants } from '../../services/adminService';

export default function AdminDashboard() {
  const { isAdmin, isEditor, isGestor } = useAuth();
  const containerRef = useRef(null);
  const [metrics, setMetrics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardMetrics(),
      getRecentOrders(10),
      getLowStockVariants(5),
    ])
      .then(([m, orders, stock]) => {
        setMetrics(m);
        setRecentOrders(orders);
        setLowStock(stock);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // GSAP animation after loading
  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.dash-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(els,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const orderColumns = [
    { key: 'id', label: 'ID' },
    { key: 'contactName', label: 'Cliente' },
    { key: 'total', label: 'Total', render: (v) => `$${(v ?? 0).toFixed(2)}` },
    { key: 'status', label: 'Estado', render: (v) => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Fecha', render: (v) => v ? new Date(v).toLocaleDateString('es-SV') : '' },
  ];

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div ref={containerRef}>
        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {(isAdmin || isGestor) && (
            <>
              <MetricCard icon={DollarSign} label="Ventas totales" value={`$${(metrics?.totalSales ?? 0).toFixed(2)}`} className="dash-el" />
              <MetricCard icon={Clock} label="Órdenes pendientes" value={metrics?.pendingOrders ?? 0} className="dash-el" />
            </>
          )}
          {(isAdmin || isEditor) && (
            <MetricCard icon={Package} label="Productos activos" value={metrics?.activeProducts ?? 0} className="dash-el" />
          )}
          {isAdmin && (
            <MetricCard icon={Users} label="Usuarios" value={metrics?.totalUsers ?? 0} className="dash-el" />
          )}
        </div>

        {/* Recent orders */}
        {(isAdmin || isGestor) && (
          <div className="dash-el mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg text-primary">Órdenes recientes</h2>
              <Link to="/admin/ordenes" className="text-accent text-sm font-body font-semibold hover:underline">Ver todas</Link>
            </div>
            <div className="bg-white rounded-2xl border border-primary/5 overflow-hidden">
              <DataTable columns={orderColumns} data={recentOrders} onRowClick={(row) => window.location.href = `/admin/ordenes/${row.id}`} emptyMessage="No hay órdenes aún" />
            </div>
          </div>
        )}

        {/* Alerts */}
        {(isAdmin || isEditor) && lowStock.length > 0 && (
          <div className="dash-el">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-heading font-bold text-lg text-primary">Stock bajo</h2>
            </div>
            <div className="bg-white rounded-2xl border border-primary/5 p-4">
              <div className="space-y-2">
                {lowStock.map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-2 border-b border-primary/5 last:border-0">
                    <div>
                      <span className="font-heading font-semibold text-sm text-primary">{v.productName}</span>
                      <span className="text-primary/50 text-sm font-body ml-2">{v.size} / {v.colorName}</span>
                    </div>
                    <span className={`font-mono text-sm font-bold ${v.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      {v.stock} uds
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
