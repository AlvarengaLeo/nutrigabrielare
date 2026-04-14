import React, { useState } from 'react';
import { Check, AlertCircle, Plus, Trash2, GripVertical } from 'lucide-react';
import { updateHomeSection } from '../../../services/homeContentService';

const EMPTY_SERVICE = { num: '', title: '', description: '', price: '', isVip: false };

export default function FeaturesEditor({ data, onSaved }) {
  const [form, setForm] = useState({ ...data });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const services = form.services || [];

  const updateService = (idx, key, val) => {
    const newServices = [...services];
    newServices[idx] = { ...newServices[idx], [key]: val };
    set('services', newServices);
  };

  const addService = () => {
    if (services.length >= 8) {
      setToast({ type: 'error', msg: 'Máximo 8 servicios permitidos' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const nextNum = String(services.length + 1).padStart(2, '0');
    set('services', [...services, { ...EMPTY_SERVICE, num: nextNum }]);
  };

  const removeService = (idx) => {
    if (services.length <= 1) {
      setToast({ type: 'error', msg: 'Mínimo 1 servicio requerido' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    set('services', services.filter((_, i) => i !== idx));
  };

  const moveService = (idx, direction) => {
    const newServices = [...services];
    const target = idx + direction;
    if (target < 0 || target >= newServices.length) return;
    [newServices[idx], newServices[target]] = [newServices[target], newServices[idx]];
    set('services', newServices);
  };

  async function handleSave(e) {
    e.preventDefault();
    if (!form.badge?.trim() || !form.titleLine1?.trim()) {
      setToast({ type: 'error', msg: 'Badge y título son obligatorios' });
      return;
    }
    if (services.some((s) => !s.title?.trim())) {
      setToast({ type: 'error', msg: 'Todos los servicios deben tener título' });
      return;
    }
    setSaving(true);
    try {
      const updated = await updateHomeSection('features', form);
      onSaved?.(updated.features);
      setToast({ type: 'success', msg: 'Servicios guardados correctamente' });
    } catch (err) {
      setToast({ type: 'error', msg: err.message || 'Error al guardar' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Badge */}
      <div>
        <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Badge / Etiqueta</label>
        <input type="text" value={form.badge || ''} onChange={(e) => set('badge', e.target.value)}
          className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20" required />
      </div>

      {/* Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Título línea 1</label>
          <input type="text" value={form.titleLine1 || ''} onChange={(e) => set('titleLine1', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20" required />
        </div>
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Subtítulo <span className="text-accent font-normal">(itálica color)</span></label>
          <input type="text" value={form.titleLine2 || ''} onChange={(e) => set('titleLine2', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20" />
        </div>
      </div>

      {/* Service Cards */}
      <div className="border border-primary/5 rounded-2xl p-5 bg-primary/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-heading font-bold text-sm text-primary">
            Tarjetas de servicio <span className="font-normal text-primary/40">({services.length}/8)</span>
          </h4>
          <button type="button" onClick={addService}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading font-bold text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors">
            <Plus size={14} /> Agregar
          </button>
        </div>

        <div className="space-y-3">
          {services.map((svc, i) => (
            <div key={i} className={`border rounded-xl p-4 ${svc.isVip ? 'border-accent/30 bg-accent/5' : 'border-primary/5 bg-white'}`}>
              <div className="flex items-start gap-3">
                {/* Reorder handle */}
                <div className="flex flex-col gap-0.5 pt-2">
                  <button type="button" onClick={() => moveService(i, -1)} disabled={i === 0}
                    className="p-0.5 text-primary/30 hover:text-primary disabled:opacity-30 transition-colors">
                    <GripVertical size={14} />
                  </button>
                </div>

                <div className="flex-1 space-y-3">
                  {/* Row 1: Num + Title + VIP + Delete */}
                  <div className="flex items-center gap-2">
                    <input type="text" value={svc.num || ''} onChange={(e) => updateService(i, 'num', e.target.value)}
                      className="w-16 px-2 py-1.5 border border-primary/10 rounded-lg font-drama italic text-lg text-center focus:outline-none focus:border-accent/50"
                      placeholder="01" />
                    <input type="text" value={svc.title || ''} onChange={(e) => updateService(i, 'title', e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-primary/10 rounded-lg font-heading font-bold text-sm focus:outline-none focus:border-accent/50"
                      placeholder="Nombre del servicio" required />
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-body text-primary/50 whitespace-nowrap">
                      <input type="checkbox" checked={svc.isVip || false} onChange={(e) => updateService(i, 'isVip', e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-primary/20 text-accent focus:ring-accent/30" />
                      VIP
                    </label>
                    <button type="button" onClick={() => removeService(i)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Row 2: Description */}
                  <textarea value={svc.description || ''} onChange={(e) => updateService(i, 'description', e.target.value)} rows={2}
                    className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50 resize-none"
                    placeholder="Descripción del servicio" />

                  {/* Row 3: Price */}
                  <input type="text" value={svc.price || ''} onChange={(e) => updateService(i, 'price', e.target.value)}
                    className="w-32 px-3 py-1.5 border border-primary/10 rounded-lg font-heading font-bold text-sm focus:outline-none focus:border-accent/50"
                    placeholder="$35.00" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <button type="submit" disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl font-heading font-bold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
        {saving ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
        ) : (
          <><Check size={16} /> Guardar Servicios</>
        )}
      </button>
    </form>
  );
}
