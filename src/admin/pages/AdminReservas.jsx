import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import {
  getAllReservations,
  updateReservationStatus,
  RESERVATION_STATUSES,
} from '../../services/reservationService';

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  contactado: 'Contactado',
  confirmado: 'Confirmado',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

function formatDate(value, opts) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('es-SV', opts ?? { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminReservas() {
  const containerRef = useRef(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    getAllReservations()
      .then(setReservations)
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.res-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(
        els,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  async function handleStatusChange(id, nextStatus) {
    setUpdatingId(id);
    try {
      const updated = await updateReservationStatus(id, nextStatus);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r))
      );
    } catch (err) {
      console.error('Failed to update reservation status:', err);
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = statusFilter
    ? reservations.filter((r) => r.status === statusFilter)
    : reservations;

  if (loading) {
    return (
      <AdminLayout title="Reservas">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Reservas">
      <div ref={containerRef}>
        <div className="res-el flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h2 className="font-heading font-bold text-lg text-primary">Todas las reservas</h2>
          <select
            className="bg-white border border-primary/10 rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {RESERVATION_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="res-el bg-white rounded-2xl border border-primary/5 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm font-body">
              <thead>
                <tr className="border-b border-primary/5">
                  <th className="px-4 py-3 font-semibold text-primary/50 whitespace-nowrap">Cliente</th>
                  <th className="px-4 py-3 font-semibold text-primary/50 whitespace-nowrap">Servicio</th>
                  <th className="px-4 py-3 font-semibold text-primary/50 whitespace-nowrap">Fecha preferida</th>
                  <th className="px-4 py-3 font-semibold text-primary/50 whitespace-nowrap">Recibida</th>
                  <th className="px-4 py-3 font-semibold text-primary/50 whitespace-nowrap">Estado</th>
                  <th className="px-4 py-3 font-semibold text-primary/50 whitespace-nowrap">Cambiar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-primary/40">No hay reservas</td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02] transition-colors align-top">
                      <td className="px-4 py-3 text-primary/80 whitespace-nowrap">
                        <div className="font-heading font-bold text-primary">{r.contactName}</div>
                        <div className="text-xs text-primary/50">{r.contactEmail}</div>
                        {r.contactPhone && <div className="text-xs text-primary/50">{r.contactPhone}</div>}
                      </td>
                      <td className="px-4 py-3 text-primary/80">{r.productName}</td>
                      <td className="px-4 py-3 text-primary/70 whitespace-nowrap">
                        {formatDate(r.preferredDate)}
                        {r.preferredTime && <div className="text-xs text-primary/50">{r.preferredTime}</div>}
                      </td>
                      <td className="px-4 py-3 text-primary/50 whitespace-nowrap">
                        {formatDate(r.createdAt, { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          disabled={updatingId === r.id}
                          value={r.status}
                          onChange={(e) => handleStatusChange(r.id, e.target.value)}
                          className="bg-white border border-primary/10 rounded-lg px-3 py-1.5 text-xs text-primary outline-none focus:ring-2 focus:ring-accent/40"
                        >
                          {RESERVATION_STATUSES.map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes preview list (only when a row has notes) */}
        {filtered.some((r) => r.notes) && (
          <div className="res-el mt-8">
            <h3 className="font-heading font-bold text-sm text-primary/70 uppercase tracking-widest mb-3">Notas</h3>
            <div className="space-y-3">
              {filtered.filter((r) => r.notes).map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-primary/5 p-4">
                  <div className="text-xs text-primary/50 mb-1">
                    {r.contactName} · {r.productName}
                  </div>
                  <p className="text-sm text-primary/80 leading-relaxed">{r.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
