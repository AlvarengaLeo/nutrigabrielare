import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { updateHomeSection } from '../../../services/homeContentService';

export default function FeaturedEditor({ data, onSaved }) {
  const [form, setForm] = useState({
    titleLine1: data?.titleLine1 ?? 'Pleno',
    titleLine2: data?.titleLine2 ?? 'Market.',
    ctaLabel: data?.ctaLabel ?? 'Ver todo',
    ctaTo: data?.ctaTo ?? '/pleno',
    productLimit: data?.productLimit ?? 5,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  async function handleSave(e) {
    e.preventDefault();
    if (!form.titleLine1?.trim()) {
      setToast({ type: 'error', msg: 'El título línea 1 es obligatorio' });
      return;
    }
    const limit = parseInt(form.productLimit, 10);
    if (!Number.isFinite(limit) || limit < 1 || limit > 12) {
      setToast({ type: 'error', msg: 'La cantidad de productos debe estar entre 1 y 12' });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, productLimit: limit };
      const updated = await updateHomeSection('featured', payload);
      onSaved?.(updated.featured);
      setToast({ type: 'success', msg: 'Pleno Market guardado correctamente' });
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Título línea 1</label>
          <input
            type="text" value={form.titleLine1} onChange={(e) => set('titleLine1', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            placeholder="Pleno" required
          />
        </div>
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">
            Título línea 2 <span className="text-accent font-normal">(itálica accent)</span>
          </label>
          <input
            type="text" value={form.titleLine2} onChange={(e) => set('titleLine2', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            placeholder="Market."
          />
        </div>
      </div>

      <div className="border border-primary/5 rounded-2xl p-5 bg-primary/[0.02]">
        <h4 className="font-heading font-bold text-sm text-primary mb-4">Botón "Ver todo"</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">Texto del botón</label>
            <input type="text" value={form.ctaLabel} onChange={(e) => set('ctaLabel', e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50"
              placeholder="Ver todo" />
          </div>
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">Enlace destino</label>
            <input type="text" value={form.ctaTo} onChange={(e) => set('ctaTo', e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50"
              placeholder="/pleno" />
          </div>
        </div>
      </div>

      <div>
        <label className="block font-heading font-semibold text-sm text-primary mb-1.5">
          Cantidad de productos visibles
        </label>
        <input
          type="number" min="1" max="12" value={form.productLimit}
          onChange={(e) => set('productLimit', e.target.value)}
          className="w-32 px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
        />
        <p className="font-body text-xs text-primary/40 mt-1.5">Entre 1 y 12 productos destacados.</p>
      </div>

      <button
        type="submit" disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl font-heading font-bold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Check size={16} />
            Guardar Pleno Market
          </>
        )}
      </button>
    </form>
  );
}
