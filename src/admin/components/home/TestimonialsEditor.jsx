import React, { useState } from 'react';
import { Check, AlertCircle, Plus, Trash2, ChevronUp, ChevronDown, Star } from 'lucide-react';
import { updateHomeSection } from '../../../services/homeContentService';

const MAX_ITEMS = 9;
const MIN_ITEMS = 1;

const EMPTY_ITEM = { name: '', role: '', location: '', rating: 5, quote: '' };

const inputCls =
  'w-full px-3 py-2 border border-primary/10 rounded-lg font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20';

export default function TestimonialsEditor({ data, onSaved }) {
  const [form, setForm] = useState({
    titleLine1: data?.titleLine1 ?? '',
    titleHighlight1: data?.titleHighlight1 ?? '',
    titleLine2: data?.titleLine2 ?? '',
    titleHighlight2: data?.titleHighlight2 ?? '',
    subtitle: data?.subtitle ?? '',
    items: Array.isArray(data?.items) && data.items.length ? data.items.map((i) => ({ ...EMPTY_ITEM, ...i })) : [{ ...EMPTY_ITEM }],
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const updateItem = (idx, key, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [key]: val };
    set('items', items);
  };

  const addItem = () => {
    if (form.items.length >= MAX_ITEMS) return;
    set('items', [...form.items, { ...EMPTY_ITEM }]);
  };

  const removeItem = (idx) => {
    if (form.items.length <= MIN_ITEMS) return;
    set('items', form.items.filter((_, i) => i !== idx));
  };

  const moveItem = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= form.items.length) return;
    const items = [...form.items];
    [items[idx], items[target]] = [items[target], items[idx]];
    set('items', items);
  };

  const flash = (type, msg, ms = 3000) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), ms);
  };

  async function handleSave(e) {
    e.preventDefault();
    if (!form.titleLine1?.trim()) {
      flash('error', 'El título línea 1 es obligatorio');
      return;
    }
    const cleanItems = form.items
      .map((i) => ({
        name: (i.name || '').trim(),
        role: (i.role || '').trim(),
        location: (i.location || '').trim(),
        rating: Math.min(5, Math.max(0, Number(i.rating) || 0)),
        quote: (i.quote || '').trim(),
      }))
      .filter((i) => i.name || i.quote);

    if (cleanItems.length < MIN_ITEMS) {
      flash('error', 'Agregá al menos un testimonio con nombre y comentario');
      return;
    }
    const incomplete = cleanItems.find((i) => !i.name || !i.quote);
    if (incomplete) {
      flash('error', 'Cada testimonio necesita nombre y comentario');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, items: cleanItems };
      const updated = await updateHomeSection('testimonials', payload);
      onSaved?.(updated.testimonials);
      flash('success', 'Testimonios guardados correctamente');
    } catch (err) {
      flash('error', err.message || 'Error al guardar', 4000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {toast && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Título línea 1</label>
          <input type="text" value={form.titleLine1} onChange={(e) => set('titleLine1', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            placeholder="Historias reales de" required />
        </div>
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Destacado 1</label>
          <input type="text" value={form.titleHighlight1} onChange={(e) => set('titleHighlight1', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            placeholder="Mujeres" />
        </div>
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Título línea 2</label>
          <input type="text" value={form.titleLine2} onChange={(e) => set('titleLine2', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            placeholder="que recuperaron su" />
        </div>
        <div>
          <label className="block font-heading font-semibold text-sm text-primary mb-1.5">
            Destacado 2 <span className="text-accent font-normal">(color)</span>
          </label>
          <input type="text" value={form.titleHighlight2} onChange={(e) => set('titleHighlight2', e.target.value)}
            className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            placeholder="Equilibrio" />
        </div>
      </div>

      {/* Subtitle */}
      <div>
        <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Subtítulo</label>
        <textarea value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} rows={2}
          className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 resize-none"
          placeholder="Texto breve debajo del título" />
      </div>

      {/* Items */}
      <div className="border border-primary/5 rounded-2xl p-5 bg-primary/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-heading font-bold text-sm text-primary">
            Testimonios <span className="font-normal text-primary/40">({form.items.length}/{MAX_ITEMS})</span>
          </h4>
          <button type="button" onClick={addItem} disabled={form.items.length >= MAX_ITEMS}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading font-bold text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Plus size={14} /> Agregar
          </button>
        </div>

        <div className="space-y-4">
          {form.items.map((item, i) => (
            <div key={i} className="border border-primary/5 rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading font-bold text-xs text-primary/60">Testimonio {i + 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveItem(i, -1)} disabled={i === 0}
                    aria-label="Subir testimonio"
                    className="p-1.5 rounded-lg text-primary/50 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronUp size={15} />
                  </button>
                  <button type="button" onClick={() => moveItem(i, 1)} disabled={i === form.items.length - 1}
                    aria-label="Bajar testimonio"
                    className="p-1.5 rounded-lg text-primary/50 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronDown size={15} />
                  </button>
                  <button type="button" onClick={() => removeItem(i)} disabled={form.items.length <= MIN_ITEMS}
                    aria-label="Eliminar testimonio"
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block font-body text-xs text-primary/50 mb-1">Nombre</label>
                  <input type="text" value={item.name || ''} onChange={(e) => updateItem(i, 'name', e.target.value)}
                    className={inputCls} placeholder="Andrea Martínez" />
                </div>
                <div>
                  <label className="block font-body text-xs text-primary/50 mb-1">Plan / Servicio</label>
                  <input type="text" value={item.role || ''} onChange={(e) => updateItem(i, 'role', e.target.value)}
                    className={inputCls} placeholder="Plan Hormonal" />
                </div>
                <div>
                  <label className="block font-body text-xs text-primary/50 mb-1">Ubicación</label>
                  <input type="text" value={item.location || ''} onChange={(e) => updateItem(i, 'location', e.target.value)}
                    className={inputCls} placeholder="San Salvador / Online" />
                </div>
                <div>
                  <label className="block font-body text-xs text-primary/50 mb-1 flex items-center gap-1">
                    Calificación <Star size={11} className="fill-accent text-accent" />
                  </label>
                  <select value={String(item.rating ?? 5)} onChange={(e) => updateItem(i, 'rating', Number(e.target.value))}
                    className={inputCls}>
                    {['5', '4.5', '4', '3.5', '3'].map((r) => (
                      <option key={r} value={r}>{r} estrellas</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-body text-xs text-primary/50 mb-1">Comentario</label>
                <textarea value={item.quote || ''} onChange={(e) => updateItem(i, 'quote', e.target.value)} rows={3}
                  className={`${inputCls} resize-none`} placeholder="Lo que dice la paciente sobre su experiencia…" />
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
          <><Check size={16} /> Guardar Testimonios</>
        )}
      </button>
    </form>
  );
}
