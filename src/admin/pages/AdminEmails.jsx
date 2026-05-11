import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Mail, AlertCircle, Check, Clock, MinusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getEmailLogs, getEmailLogSummary } from '../../services/emailLogService';

const TEMPLATE_LABELS = {
  purchase_confirm: 'Confirmación de compra',
  digital_download: 'Descarga digital',
  reservation_confirm: 'Confirmación de reserva',
};

const STATUS_META = {
  sent:    { label: 'Enviado',    bg: 'bg-green-50',  fg: 'text-green-700',  icon: Check },
  failed:  { label: 'Fallido',    bg: 'bg-red-50',    fg: 'text-red-600',    icon: AlertCircle },
  queued:  { label: 'En cola',    bg: 'bg-amber-50',  fg: 'text-amber-700',  icon: Clock },
  skipped: { label: 'Omitido',    bg: 'bg-stone-100', fg: 'text-stone-600',  icon: MinusCircle },
  bounced: { label: 'Rebotado',   bg: 'bg-red-50',    fg: 'text-red-600',    icon: AlertCircle },
};

const PAGE_SIZE = 25;

function formatWhen(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminEmails() {
  const containerRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ sent: 0, failed: 0, skipped: 0, queued: 0, bounced: 0 });
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState('');
  const [template, setTemplate] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    getEmailLogSummary({ days: 7 }).then(setSummary).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEmailLogs({
      recipient,
      template,
      status,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    })
      .then(({ rows: r, total: t }) => {
        if (cancelled) return;
        setRows(r);
        setTotal(t);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [recipient, template, status, page]);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.email-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(els, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminLayout title="Email Logs">
      <div ref={containerRef}>
        {/* Header */}
        <div className="email-el flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Mail size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-primary">Logs de correos</h2>
            <p className="font-body text-xs text-primary/50">Auditoría de los envíos transaccionales vía Resend</p>
          </div>
        </div>

        {/* Summary cards — last 7 days */}
        <div className="email-el grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {(['sent', 'failed', 'skipped', 'queued', 'bounced']).map((s) => {
            const meta = STATUS_META[s];
            return (
              <div key={s} className={`rounded-2xl p-4 ${meta.bg}`}>
                <div className={`text-xs uppercase tracking-wider font-heading font-bold ${meta.fg}`}>{meta.label}</div>
                <div className="text-2xl font-heading font-extrabold text-primary mt-1">{summary[s]}</div>
                <div className="text-[10px] text-primary/40 mt-0.5">últimos 7 días</div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="email-el flex flex-wrap items-center gap-3 mb-4">
          <input
            type="search"
            value={recipient}
            onChange={(e) => { setRecipient(e.target.value); setPage(0); }}
            placeholder="Filtrar por destinatario…"
            className="bg-white border border-primary/10 rounded-xl px-4 py-2.5 text-sm w-64 outline-none focus:ring-2 focus:ring-accent/40"
          />
          <select
            value={template}
            onChange={(e) => { setTemplate(e.target.value); setPage(0); }}
            className="bg-white border border-primary/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="">Todos los templates</option>
            <option value="purchase_confirm">Confirmación de compra</option>
            <option value="digital_download">Descarga digital</option>
            <option value="reservation_confirm">Confirmación de reserva</option>
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="bg-white border border-primary/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="">Todos los estados</option>
            <option value="sent">Enviado</option>
            <option value="failed">Fallido</option>
            <option value="skipped">Omitido</option>
            <option value="queued">En cola</option>
            <option value="bounced">Rebotado</option>
          </select>
        </div>

        {/* Table */}
        <div className="email-el bg-white rounded-2xl border border-primary/5 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center font-body text-primary/50 text-sm">
              No hay correos registrados con esos filtros.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-primary/[0.02] text-left text-xs font-heading font-bold uppercase tracking-wider text-primary/50">
                <tr>
                  <th className="p-4">Cuándo</th>
                  <th className="p-4">Destinatario</th>
                  <th className="p-4">Template</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Orden</th>
                  <th className="p-4">Error</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const meta = STATUS_META[row.status] || STATUS_META.sent;
                  const Icon = meta.icon;
                  return (
                    <tr key={row.id} className="border-t border-primary/5">
                      <td className="p-4 font-body text-xs text-primary/60 whitespace-nowrap">
                        {formatWhen(row.sent_at)}
                      </td>
                      <td className="p-4 font-mono text-xs text-primary truncate max-w-xs" title={row.recipient_email}>
                        {row.recipient_email}
                      </td>
                      <td className="p-4 font-body text-xs text-primary/80">
                        {TEMPLATE_LABELS[row.template] || row.template}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-heading font-bold ${meta.bg} ${meta.fg}`}>
                          <Icon size={11} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-primary/60">
                        {row.related_order_id || '—'}
                      </td>
                      <td className="p-4 font-body text-xs text-red-600 max-w-md truncate" title={row.error_message || ''}>
                        {row.error_message || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="email-el mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/10 bg-white text-sm font-body disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <span className="font-body text-xs text-primary/50">
              Página {page + 1} de {totalPages} · {total} {total === 1 ? 'envío' : 'envíos'}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/10 bg-white text-sm font-body disabled:opacity-40"
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
