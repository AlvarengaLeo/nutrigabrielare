import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import IconPicker from './IconPicker';
import SingleImageUploader from './SingleImageUploader';
import { updateHomeSection, uploadHomeImage, deleteHomeImage } from '../../../services/homeContentService';

export default function WhyChooseUsEditor({ data, onSaved }) {
  const [form, setForm] = useState({ ...data });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const updateReason = (idx, key, val) => {
    const newReasons = [...(form.reasons || [])];
    newReasons[idx] = { ...newReasons[idx], [key]: val };
    set('reasons', newReasons);
  };

  async function handleSave(e) {
    e.preventDefault();
    if (!form.badge?.trim() || !form.titleLine1?.trim()) {
      setToast({ type: 'error', msg: 'Badge y título son obligatorios' });
      return;
    }
    setSaving(true);
    try {
      const updated = await updateHomeSection('why_choose_us', form);
      onSaved?.(updated.why_choose_us);
      setToast({ type: 'success', msg: 'Diferenciador guardado correctamente' });
    } catch (err) {
      setToast({ type: 'error', msg: err.message || 'Error al guardar' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handlePlateUpload(file) {
    const url = await uploadHomeImage(file, 'why-choose-us', 'plate');
    set('plateImage', url);
  }

  async function handlePlateDelete() {
    if (form.plateImage && !form.plateImage.startsWith('/media/')) {
      await deleteHomeImage(form.plateImage);
    }
    set('plateImage', '/media/healthy_plate.png');
  }

  const reasons = form.reasons || [];

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

      {/* Reasons */}
      <div className="border border-primary/5 rounded-2xl p-5 bg-primary/[0.02]">
        <h4 className="font-heading font-bold text-sm text-primary mb-4">Diferenciadores (3 fijos)</h4>
        <div className="space-y-4">
          {reasons.map((r, i) => (
            <div key={i} className="border border-primary/5 rounded-xl p-4 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <IconPicker value={r.icon} onChange={(name) => updateReason(i, 'icon', name)} />
                <input type="text" value={r.title || ''} onChange={(e) => updateReason(i, 'title', e.target.value)}
                  className="flex-1 px-3 py-2 border border-primary/10 rounded-lg font-body text-sm font-semibold focus:outline-none focus:border-accent/50"
                  placeholder={`Título diferenciador ${i + 1}`} />
              </div>
              <textarea value={r.description || ''} onChange={(e) => updateReason(i, 'description', e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50 resize-none"
                placeholder="Descripción del diferenciador" />
            </div>
          ))}
        </div>
      </div>

      {/* Plate Image */}
      <SingleImageUploader
        label="Imagen de plato / apoyo visual"
        value={form.plateImage}
        onUpload={handlePlateUpload}
        onDelete={handlePlateDelete}
        hint="PNG transparente recomendado. Max 2MB."
      />

      {/* Save */}
      <button type="submit" disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl font-heading font-bold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
        {saving ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
        ) : (
          <><Check size={16} /> Guardar Diferenciador</>
        )}
      </button>
    </form>
  );
}
