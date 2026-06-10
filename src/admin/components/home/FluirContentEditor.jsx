import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { updateHomeSection } from '../../../services/homeContentService';

export default function FluirContentEditor({ data, onSaved }) {
  const [form, setForm] = useState({
    heroTitle: data?.heroTitle ?? 'Un espacio para fluir',
    heroHighlight: data?.heroHighlight ?? 'en tu propio tiempo.',
    heroSubtitle: data?.heroSubtitle ?? 'Lecturas, recursos y una comunidad para acompañar tu salud hormonal, tu mente y tu ciclo — sin prisa, sin pausa forzada.',
    lecturasTitle: data?.lecturasTitle ?? 'Lecturas',
    lecturasHighlight: data?.lecturasHighlight ?? 'recientes.',
    resourcesTitleLine1: data?.resourcesTitleLine1 ?? 'Lo que la lectura',
    resourcesTitleLine2: data?.resourcesTitleLine2 ?? 'no alcanza a cubrir.',
    resourcesSubtitle: data?.resourcesSubtitle ?? 'Ebooks, cursos y guías diseñados por Gabriela para acompañarte más allá del artículo.',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  async function handleSave(e) {
    e.preventDefault();
    if (!form.heroTitle?.trim()) {
      setToast({ type: 'error', msg: 'El título del hero es obligatorio' });
      return;
    }
    setSaving(true);
    try {
      const updated = await updateHomeSection('fluir_content', form);
      onSaved?.(updated.fluir_content);
      setToast({ type: 'success', msg: 'Fluir Femenino guardado correctamente' });
    } catch (err) {
      setToast({ type: 'error', msg: err.message || 'Error al guardar' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <p className="font-body text-xs text-primary/40">Estos textos aparecen en /fluir-femenino.</p>

      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="border border-primary/5 rounded-2xl p-5 bg-primary/[0.02]">
        <h4 className="font-heading font-bold text-sm text-primary mb-4">Hero</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">Título</label>
            <input type="text" value={form.heroTitle} onChange={(e) => set('heroTitle', e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50"
              placeholder="Un espacio para fluir" required />
          </div>
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">
              Título destacado <span className="text-accent">(itálica magenta)</span>
            </label>
            <input type="text" value={form.heroHighlight} onChange={(e) => set('heroHighlight', e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50"
              placeholder="en tu propio tiempo." />
          </div>
        </div>
        <div>
          <label className="block font-body text-xs text-primary/50 mb-1">Subtítulo</label>
          <textarea value={form.heroSubtitle} onChange={(e) => set('heroSubtitle', e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50 resize-none"
            placeholder="Lecturas, recursos y una comunidad para acompañar tu salud hormonal." />
        </div>
      </div>

      <div className="border border-primary/5 rounded-2xl p-5 bg-primary/[0.02]">
        <h4 className="font-heading font-bold text-sm text-primary mb-4">Lecturas recientes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">Título</label>
            <input type="text" value={form.lecturasTitle} onChange={(e) => set('lecturasTitle', e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50"
              placeholder="Lecturas" />
          </div>
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">
              Título destacado <span className="text-accent">(itálica magenta)</span>
            </label>
            <input type="text" value={form.lecturasHighlight} onChange={(e) => set('lecturasHighlight', e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50"
              placeholder="recientes." />
          </div>
        </div>
      </div>

      <div className="border border-primary/5 rounded-2xl p-5 bg-primary/[0.02]">
        <h4 className="font-heading font-bold text-sm text-primary mb-4">Bloque de recursos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">Título línea 1</label>
            <input type="text" value={form.resourcesTitleLine1} onChange={(e) => set('resourcesTitleLine1', e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50"
              placeholder="Lo que la lectura" />
          </div>
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">
              Título línea 2 <span className="text-accent">(itálica)</span>
            </label>
            <input type="text" value={form.resourcesTitleLine2} onChange={(e) => set('resourcesTitleLine2', e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50"
              placeholder="no alcanza a cubrir." />
          </div>
        </div>
        <div>
          <label className="block font-body text-xs text-primary/50 mb-1">Subtítulo</label>
          <textarea value={form.resourcesSubtitle} onChange={(e) => set('resourcesSubtitle', e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50 resize-none"
            placeholder="Ebooks, cursos y guías diseñados por Gabriela." />
        </div>
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
            Guardar Fluir Femenino
          </>
        )}
      </button>
    </form>
  );
}
