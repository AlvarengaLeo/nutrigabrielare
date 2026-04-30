import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import {
  getAllZones,
  createZone,
  updateZone,
  deleteZone,
} from '../../services/shippingService';

const EMPTY_FORM = {
  name: '',
  cost: '',
  freeThreshold: '',
  sortOrder: 0,
  active: true,
};

export default function AdminEnvios() {
  const containerRef = useRef(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getAllZones();
      setZones(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.env-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(
        els,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' },
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(zone) {
    setForm({
      name: zone.name,
      cost: String(zone.cost ?? ''),
      freeThreshold: zone.freeThreshold == null ? '' : String(zone.freeThreshold),
      sortOrder: zone.sortOrder ?? 0,
      active: zone.active,
    });
    setEditingId(zone.id);
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        cost: Number(form.cost) || 0,
        freeThreshold:
          form.freeThreshold === '' ? null : Number(form.freeThreshold),
        sortOrder: Number(form.sortOrder) || 0,
        active: form.active,
      };
      if (editingId) {
        await updateZone(editingId, payload);
      } else {
        await createZone(payload);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e, zone) {
    e.stopPropagation();
    if (!window.confirm(`¿Eliminar la zona "${zone.name}"?`)) return;
    try {
      await deleteZone(zone.id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al eliminar');
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Zona',
      render: (v) => <span className="font-heading font-semibold">{v}</span>,
    },
    {
      key: 'cost',
      label: 'Costo',
      render: (v) => `$${Number(v ?? 0).toFixed(2)}`,
    },
    {
      key: 'freeThreshold',
      label: 'Envío gratis sobre',
      render: (v) => (v == null ? '—' : `$${Number(v).toFixed(2)}`),
    },
    { key: 'sortOrder', label: 'Orden' },
    {
      key: 'active',
      label: 'Activa',
      render: (v) => (
        <span className={`text-lg ${v ? 'text-green-500' : 'text-red-400'}`}>●</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
            className="text-primary/40 hover:text-accent"
            aria-label="Editar"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={(e) => handleDelete(e, row)}
            className="text-primary/40 hover:text-red-500"
            aria-label="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const inputClass =
    'bg-[#f8f6f3] rounded-xl px-4 py-3 text-sm text-primary placeholder:text-primary/40 outline-none focus:ring-2 focus:ring-accent/40 w-full';

  if (loading) {
    return (
      <AdminLayout title="Envíos">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Envíos">
      <div ref={containerRef}>
        <div className="env-el flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-bold text-lg text-primary">Zonas de envío</h2>
            <p className="font-body text-sm text-primary/50 mt-1">
              El costo de envío se aplica según la zona elegida en checkout. Si la
              compra supera el monto de envío gratis, el costo será $0.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-background px-5 py-2.5 rounded-xl font-heading font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Nueva zona
          </button>
        </div>

        <div className="env-el bg-white rounded-2xl border border-primary/5 overflow-hidden">
          <DataTable
            columns={columns}
            data={zones}
            emptyMessage="No hay zonas de envío"
          />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-primary">
                {editingId ? 'Editar zona' : 'Nueva zona'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-primary/40 hover:text-primary"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <div>
                <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">
                  Nombre
                </label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Ej: San Salvador"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">
                    Costo (USD)
                  </label>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    required
                    placeholder="3.50"
                  />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">
                    Orden
                  </label>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">
                  Envío gratis sobre (opcional)
                </label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.freeThreshold}
                  onChange={(e) =>
                    setForm({ ...form, freeThreshold: e.target.value })
                  }
                  placeholder="50.00"
                />
              </div>
              <label className="flex items-center gap-2 font-body text-sm text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="accent-accent w-4 h-4"
                />
                Activa
              </label>
              <button
                type="submit"
                disabled={saving}
                className={`bg-primary text-background py-3 rounded-xl font-heading font-bold text-sm transition-opacity mt-2 ${
                  saving ? 'opacity-50' : 'hover:opacity-90'
                }`}
              >
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear zona'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
