import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import IconPicker from './IconPicker';
import SingleImageUploader from './SingleImageUploader';
import { updateHomeSection, uploadHomeImage, deleteHomeImage } from '../../../services/homeContentService';

export default function PhilosophyEditor({ data, onSaved }) {
  const [form, setForm] = useState({ ...data });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const updateValue = (idx, key, val) => {
    const newValues = [...(form.values || [])];
    newValues[idx] = { ...newValues[idx], [key]: val };
    set('values', newValues);
  };

  const updateStat = (idx, key, val) => {
    const newStats = [...(form.stats || [])];
    newStats[idx] = { ...newStats[idx], [key]: val };
    set('stats', newStats);
  };

  const updateDecImg = (slot, url) => {
    set('decorativeImages', { ...(form.decorativeImages || {}), [slot]: url });
  };

  async function handleSave(e) {
    e.preventDefault();
    if (!form.badge?.trim() || !form.titleLine1?.trim()) {
      setToast({ type: 'error', msg: 'Badge y título son obligatorios' });
      return;
    }
    setSaving(true);
    try {
      const updated = await updateHomeSection('philosophy', form);
      onSaved?.(updated.philosophy);
      setToast({ type: 'success', msg: 'Filosofía guardada correctamente' });
    } catch (err) {
      setToast({ type: 'error', msg: err.message || 'Error al guardar' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handleDecorativeUpload(slot, file) {
    const url = await uploadHomeImage(file, 'philosophy', slot);
    updateDecImg(slot, url);
  }

  async function handleDecorativeDelete(slot) {
    const currentUrl = form.decorativeImages?.[slot];
    if (currentUrl && !currentUrl.startsWith('/media/')) {
      await deleteHomeImage(currentUrl);
    }
    const defaults = { topLeft: '/media/ora.png', midLeft: '/media/pom.png', topRight: '/media/tom.png', midRight: '/media/broc.png' };
    updateDecImg(slot, defaults[slot]);
  }

  const values = form.values || [];
  const stats = form.stats || [];
  const imgs = form.decorativeImages || {};

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
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Destacado 1</label>
          <input type="text" value={form.titleHighlight1 || ''} onChange={(e) => set('titleHighlight1', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20" />
        </div>
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Título línea 2</label>
          <input type="text" value={form.titleLine2 || ''} onChange={(e) => set('titleLine2', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20" />
        </div>
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Destacado 2 <span className="text-accent font-normal">(color)</span></label>
          <input type="text" value={form.titleHighlight2 || ''} onChange={(e) => set('titleHighlight2', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20" />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Descripción</label>
        <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} rows={3}
          className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 resize-none" />
      </div>

      {/* Values / Pillars */}
      <div className="border border-primary/5 rounded-2xl p-5 bg-primary/[0.02]">
        <h4 className="font-heading font-bold text-sm text-primary mb-4">Pilares (3 fijos)</h4>
        <div className="space-y-3">
          {values.map((v, i) => (
            <div key={i} className="flex items-center gap-3">
              <IconPicker value={v.icon} onChange={(name) => updateValue(i, 'icon', name)} />
              <input type="text" value={v.label || ''} onChange={(e) => updateValue(i, 'label', e.target.value)}
                className="flex-1 px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50"
                placeholder={`Pilar ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="border border-primary/5 rounded-2xl p-5 bg-primary/[0.02]">
        <h4 className="font-heading font-bold text-sm text-primary mb-4">Estadísticas (4 fijas)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={s.value || ''} onChange={(e) => updateStat(i, 'value', e.target.value)}
                className="w-24 px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50"
                placeholder="99%" />
              <input type="text" value={s.label || ''} onChange={(e) => updateStat(i, 'label', e.target.value)}
                className="flex-1 px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50"
                placeholder="Descripción" />
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Images */}
      <div className="border border-primary/5 rounded-2xl p-5 bg-primary/[0.02]">
        <h4 className="font-heading font-bold text-sm text-primary mb-4">Imágenes decorativas</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { slot: 'topLeft', label: 'Arriba izq.' },
            { slot: 'midLeft', label: 'Centro izq.' },
            { slot: 'topRight', label: 'Arriba der.' },
            { slot: 'midRight', label: 'Centro der.' },
          ].map(({ slot, label }) => (
            <SingleImageUploader
              key={slot}
              label={label}
              value={imgs[slot]}
              onUpload={(file) => handleDecorativeUpload(slot, file)}
              onDelete={() => handleDecorativeDelete(slot)}
              hint="PNG transparente"
            />
          ))}
        </div>
      </div>

      {/* Save */}
      <button type="submit" disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl font-heading font-bold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
        {saving ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
        ) : (
          <><Check size={16} /> Guardar Filosofía</>
        )}
      </button>
    </form>
  );
}
