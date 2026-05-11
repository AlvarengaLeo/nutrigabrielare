import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  DollarSign, ShoppingBag, Repeat, Receipt, AlertTriangle, Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import AdminLayout from '../components/AdminLayout';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getCommercialKPIs } from '../../services/analyticsService';

const PERIODS = [
  { id: 7, label: '7 días' },
  { id: 30, label: '30 días' },
  { id: 90, label: '90 días' },
];

const STATUS_COLORS = {
  pending_payment: '#F59E0B',
  confirmed: '#3B82F6',
  preparing: '#8B5CF6',
  shipped: '#06B6D4',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const STATUS_LABELS = {
  pending_payment: 'Pendiente pago',
  confirmed: 'Confirmada',
  preparing: 'Preparando',
  shipped: 'Enviada',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
};

function fmtMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function fmtPct(n) {
  if (n == null) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

function fmtDayShort(iso) {
  return new Date(iso).toLocaleDateString('es-SV', { day: 'numeric', month: 'short' });
}

export default function AdminDashboard() {
  const { isAdmin, isEditor, isGestor } = useAuth();
  const containerRef = useRef(null);
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCommercialKPIs({ days: period })
      .then(setData)
      .catch((err) => {
        console.error(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.dash-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(els,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  if (loading || !data) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const statusPieData = data.statusDistribution.map((s) => ({
    name: STATUS_LABELS[s.status] || s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] || '#94A3B8',
  }));

  return (
    <AdminLayout title="Dashboard">
      <div ref={containerRef}>
        {/* Header: period selector */}
        <div className="dash-el flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-heading font-extrabold text-xl text-primary">Comercial</h2>
            <p className="font-body text-xs text-primary/50">KPIs y actividad del período</p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-white border border-primary/5 rounded-xl">
            {PERIODS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPeriod(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-colors ${
                  period === id ? 'bg-accent text-white' : 'text-primary/60 hover:text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        {(isAdmin || isGestor) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard icon={DollarSign} label="Ingresos del período" value={fmtMoney(data.revenue)} className="dash-el" />
            <MetricCard icon={Receipt} label="Ticket promedio (AOV)" value={fmtMoney(data.aov)} className="dash-el" />
            <MetricCard icon={ShoppingBag} label="Órdenes confirmadas" value={data.ordersConfirmed} className="dash-el" />
            <MetricCard icon={Repeat} label="Tasa de recompra (90d)" value={fmtPct(data.repeatRate)} className="dash-el" />
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Revenue line chart */}
          <div className="dash-el lg:col-span-2 bg-white rounded-2xl border border-primary/5 p-6">
            <h3 className="font-heading font-bold text-sm text-primary mb-1">Ingresos por día</h3>
            <p className="font-body text-xs text-primary/50 mb-4">Órdenes en estado confirmada → entregada</p>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={data.revenueByDay} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0001" />
                  <XAxis
                    dataKey="day"
                    tickFormatter={fmtDayShort}
                    tick={{ fontSize: 11, fill: '#999' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#999' }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(v) => fmtMoney(v)}
                    labelFormatter={(l) => new Date(l).toLocaleDateString('es-SV', { weekday: 'short', day: 'numeric', month: 'short' })}
                    contentStyle={{ borderRadius: 12, border: '1px solid #0001', fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#D51663" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status donut */}
          <div className="dash-el bg-white rounded-2xl border border-primary/5 p-6">
            <h3 className="font-heading font-bold text-sm text-primary mb-1">Estado de órdenes</h3>
            <p className="font-body text-xs text-primary/50 mb-4">Distribución en el período</p>
            {statusPieData.length > 0 ? (
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {statusPieData.map((s, i) => (
                        <Cell key={i} fill={s.color} />
                      ))}
                    </Pie>
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-primary/40 font-body py-12 text-center">Sin órdenes en el período</p>
            )}
          </div>
        </div>

        {/* Top products */}
        {data.topProducts.length > 0 && (
          <div className="dash-el bg-white rounded-2xl border border-primary/5 p-6 mb-6">
            <h3 className="font-heading font-bold text-sm text-primary mb-1">Top productos</h3>
            <p className="font-body text-xs text-primary/50 mb-4">Por ingreso en el período</p>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={data.topProducts} margin={{ top: 5, right: 10, left: -10, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0001" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#999' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#999' }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(v, name) => name === 'revenue' ? fmtMoney(v) : v}
                    contentStyle={{ borderRadius: 12, border: '1px solid #0001', fontSize: 12 }}
                  />
                  <Bar dataKey="revenue" fill="#D51663" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Stock + Reservations row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(isAdmin || isEditor) && data.stockCritical.length > 0 && (
            <div className="dash-el bg-white rounded-2xl border border-primary/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-heading font-bold text-sm text-primary">Stock crítico</h3>
                <span className="ml-auto text-xs font-body text-primary/40">{data.stockCritical.length} ítem{data.stockCritical.length !== 1 && 's'}</span>
              </div>
              <div className="space-y-2">
                {data.stockCritical.slice(0, 8).map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-2 border-b border-primary/5 last:border-0">
                    <div>
                      <span className="font-heading font-semibold text-sm text-primary">{v.productName}</span>
                      {(v.size || v.color) && (
                        <span className="text-primary/50 text-xs font-body ml-2">
                          {[v.size, v.color].filter(Boolean).join(' / ')}
                        </span>
                      )}
                    </div>
                    <span className={`font-mono text-sm font-bold ${v.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      {v.stock} uds
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(isAdmin || isGestor) && data.upcomingReservations.length > 0 && (
            <div className="dash-el bg-white rounded-2xl border border-primary/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-accent" />
                <h3 className="font-heading font-bold text-sm text-primary">Reservas próximas</h3>
                <span className="ml-auto text-xs font-body text-primary/40">{data.upcomingReservations.length}</span>
              </div>
              <div className="space-y-2">
                {data.upcomingReservations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-primary/5 last:border-0">
                    <div>
                      <span className="font-heading font-semibold text-sm text-primary">{r.productName}</span>
                      <div className="text-xs font-body text-primary/50 mt-0.5">
                        {r.contactName}
                        {r.preferredDate && (
                          <> · {new Date(r.preferredDate).toLocaleDateString('es-SV', { day: 'numeric', month: 'short' })}{r.preferredTime ? ` · ${r.preferredTime}` : ''}</>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
              <Link to="/admin/reservas" className="block mt-4 text-accent text-xs font-heading font-bold hover:underline text-center">
                Ver todas las reservas →
              </Link>
            </div>
          )}
        </div>

        {/* Conversion proxy footer */}
        {data.conversionProxy != null && (
          <div className="dash-el mt-6 bg-primary/[0.02] rounded-2xl p-5 text-xs font-body text-primary/60">
            <strong className="font-heading font-bold text-primary">Conversión interna (proxy):</strong>{' '}
            {fmtPct(data.conversionProxy)} —{' '}
            <span className="text-primary/50">
              {data.ordersConfirmed} de {data.ordersStarted} órdenes iniciadas en el período llegaron a estado confirmada o posterior.
              Para conversión real (visitor → buyer) hace falta Vercel Analytics activo.
            </span>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
