import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import SingleImageUploader from './SingleImageUploader';
import { updateHomeSection, uploadHomeImage, deleteHomeImage } from '../../../services/homeContentService';

export default function PlenoHeroEditor({ data, onSaved }) {
  const [form, setForm] = useState({
    titleLine1: data?.titleLine1 ?? 'Bienestar en su forma',
    titleLine2: data?.titleLine2 ?? 'más plena.',
    subtitle: data?.subtitle ?? 'Productos digitales, suplementos seleccionados y consultas con acompañamiento real. Una sola tienda para tu bienestar integral.',
    image: data?.image ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  async function handleImageUpload(file) {
    try {
      const url = await uploadHomeImage(file, 'vitrinas', 'pleno-hero');
      set('image', url);
      setToast({ type: 'success', msg: 'Foto subida. No olvides guardar.' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: 'error', msg: err?.message || 'Error al subir la foto' });
      setTimeout(() => setToast(null), 4000);
      throw err;
    }
  }

  async function handleImageDelete() {
    try {
      if (form.image) await deleteHomeImage(form.image);
    } catch { /* ignore */ }
    set('image', '');
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.titleLine1?.trim()) {
      setToast({ type: 'error', msg: 'El título línea 1 es obligatorio' });
      return;
    }
    setSaving(true);
    try {
      const updated = await updateHomeSection('pleno_hero', form);
      onSaved?.(updated.pleno_hero);
      setToast({ type: 'success', msg: 'Hero de Pleno guardado correctamente' });
    } catch (err) {
      setToast({ type: 'error', msg: err.message || 'Error al guardar' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <p className="font-body text-xs text-primary/40">Estos textos aparecen en el hero verde de /pleno.</p>

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
            placeholder="Bienestar en su forma" required
          />
        </div>
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">
            Título línea 2 <span className="text-accent font-normal">(itálica)</span>
          </label>
          <input
            type="text" value={form.titleLine2} onChange={(e) => set('titleLine2', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            placeholder="más plena."
          />
        </div>
      </div>

      <div>
        <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Subtítulo</label>
        <textarea
          value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 resize-none"
          placeholder="Productos digitales, suplementos seleccionados y consultas con acompañamiento real."
        />
      </div>

      <SingleImageUploader
        label="Foto de la vitrina (opcional)"
        value={form.image}
        onUpload={handleImageUpload}
        onDelete={handleImageDelete}
        hint="Tu foto aparece a la derecha del hero verde. Si la dejás vacía, se muestra el producto destacado. PNG recomendado, máx 2MB."
      />

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
            Guardar Hero Pleno
          </>
        )}
      </button>
    </form>
  );
}
