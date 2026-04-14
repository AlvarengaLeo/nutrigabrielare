import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import SingleImageUploader from './SingleImageUploader';
import { updateHomeSection, uploadHomeImage, deleteHomeImage } from '../../../services/homeContentService';

export default function HeroEditor({ data, onSaved }) {
  const [form, setForm] = useState({ ...data });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setCta = (which, key, val) =>
    setForm((f) => ({ ...f, [which]: { ...f[which], [key]: val } }));

  async function handleSave(e) {
    e.preventDefault();
    if (!form.badge?.trim() || !form.titleLine1?.trim()) {
      setToast({ type: 'error', msg: 'Badge y título son obligatorios' });
      return;
    }
    setSaving(true);
    try {
      const updated = await updateHomeSection('hero', form);
      onSaved?.(updated.hero);
      setToast({ type: 'success', msg: 'Hero guardado correctamente' });
    } catch (err) {
      setToast({ type: 'error', msg: err.message || 'Error al guardar' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handleImageUpload(file) {
    const url = await uploadHomeImage(file, 'hero', 'hero_model');
    set('heroImage', url);
  }

  async function handleImageDelete() {
    if (form.heroImage && !form.heroImage.startsWith('/media/')) {
      await deleteHomeImage(form.heroImage);
    }
    set('heroImage', '/media/hero_model.png');
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Toast */}
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
        <input
          type="text"
          value={form.badge || ''}
          onChange={(e) => set('badge', e.target.value)}
          className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
          placeholder="Enfoque Holístico"
          required
        />
      </div>

      {/* Title fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Título línea 1</label>
          <input
            type="text" value={form.titleLine1 || ''} onChange={(e) => set('titleLine1', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            required
          />
        </div>
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Destacado 1 <span className="text-primary/40 font-normal">(bold)</span></label>
          <input
            type="text" value={form.titleHighlight1 || ''} onChange={(e) => set('titleHighlight1', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Título línea 2</label>
          <input
            type="text" value={form.titleLine2 || ''} onChange={(e) => set('titleLine2', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Destacado 2 <span className="text-accent font-normal">(color accent)</span></label>
          <input
            type="text" value={form.titleHighlight2 || ''} onChange={(e) => set('titleHighlight2', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
          />
        </div>
      </div>

      {/* Subtitle */}
      <div>
        <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Subtítulo</label>
        <textarea
          value={form.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 resize-none"
        />
      </div>

      {/* CTAs */}
      <div className="border border-primary/5 rounded-2xl p-5 bg-primary/[0.02]">
        <h4 className="font-heading font-bold text-sm text-primary mb-4">Botones CTA</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">Texto botón principal</label>
            <input type="text" value={form.primaryCta?.text || ''} onChange={(e) => setCta('primaryCta', 'text', e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">Enlace / Acción</label>
            <input type="text" value={form.primaryCta?.href || ''} onChange={(e) => setCta('primaryCta', 'href', e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50"
              placeholder="#servicios o /ruta" />
          </div>
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">Texto botón secundario</label>
            <input type="text" value={form.secondaryCta?.text || ''} onChange={(e) => setCta('secondaryCta', 'text', e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">Enlace / Acción</label>
            <input type="text" value={form.secondaryCta?.href || ''} onChange={(e) => setCta('secondaryCta', 'href', e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50"
              placeholder="#recursos o /ruta" />
          </div>
        </div>
      </div>

      {/* Image */}
      <SingleImageUploader
        label="Imagen principal (modelo)"
        value={form.heroImage}
        onUpload={handleImageUpload}
        onDelete={handleImageDelete}
        hint="PNG transparente recomendado. Max 2MB."
      />

      {/* Decorative toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.showDecorativeLeaves !== false}
          onChange={(e) => set('showDecorativeLeaves', e.target.checked)}
          className="w-4 h-4 rounded border-primary/20 text-accent focus:ring-accent/30"
        />
        <span className="font-body text-sm text-primary/70">Mostrar hojas decorativas</span>
      </label>

      {/* Save */}
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
            Guardar Hero
          </>
        )}
      </button>
    </form>
  );
}
