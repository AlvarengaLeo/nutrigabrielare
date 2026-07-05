import React, { useState } from 'react';
import {
  Check, AlertCircle, GripVertical, Eye, EyeOff, ChevronUp, ChevronDown,
  Trophy, Heart, GraduationCap, ShoppingBag, MessageCircleHeart, Shield,
} from 'lucide-react';
import { updateHomeSection } from '../../../services/homeContentService';
import { SECTION_LABELS, SECTION_DESCRIPTIONS, reconcileSectionOrder } from '../../../config/homeSections';

const ICONS = {
  stats: Trophy,
  philosophy: Heart,
  digital_resources: GraduationCap,
  featured: ShoppingBag,
  testimonials: MessageCircleHeart,
  why_choose_us: Shield,
};

export default function SectionOrderEditor({ data, onSaved }) {
  const [order, setOrder] = useState(() => reconcileSectionOrder(data));
  const [dragIndex, setDragIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const move = (from, to) => {
    if (to < 0 || to >= order.length || from === to) return;
    setOrder((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const toggleVisible = (i) =>
    setOrder((prev) => prev.map((s, idx) => (idx === i ? { ...s, visible: s.visible === false } : s)));

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateHomeSection('section_order', order);
      onSaved?.(reconcileSectionOrder(updated.section_order));
      setToast({ type: 'success', msg: 'Orden guardado correctamente' });
    } catch (err) {
      setToast({ type: 'error', msg: err.message || 'Error al guardar' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <div className="space-y-6">
      <p className="font-body text-xs text-primary/40">
        Arrastrá con el <GripVertical size={12} className="inline align-text-bottom" /> o usá las flechas para cambiar el orden de las
        secciones del inicio. El ojo <Eye size={12} className="inline align-text-bottom" /> muestra u oculta una sección sin borrarla.
        El <strong>Hero</strong> (portada) queda siempre fijo arriba.
      </p>

      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Hero fijo (referencia visual) */}
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/15 bg-primary/[0.02] px-3 py-3">
        <span className="text-primary/20"><GripVertical size={18} /></span>
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary/40">
          <Sparkle />
        </span>
        <div className="min-w-0 flex-1">
          <span className="font-heading font-bold text-sm text-primary/60">Hero</span>
          <p className="font-body text-xs text-primary/30">Portada — siempre primero</p>
        </div>
        <span className="text-[10px] font-heading font-bold uppercase tracking-wide text-primary/30 bg-primary/5 px-2 py-0.5 rounded-full">Fijo</span>
      </div>

      <div className="space-y-2">
        {order.map((s, i) => {
          const Icon = ICONS[s.id] || Trophy;
          const hidden = s.visible === false;
          return (
            <div
              key={s.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragEnter={() => {
                if (dragIndex !== null && dragIndex !== i) {
                  move(dragIndex, i);
                  setDragIndex(i);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={() => setDragIndex(null)}
              className={`flex items-center gap-3 rounded-2xl border bg-white px-3 py-3 transition-all ${
                dragIndex === i ? 'border-accent/50 shadow-md' : 'border-primary/10'
              } ${hidden ? 'opacity-60' : ''}`}
            >
              <span className="cursor-grab active:cursor-grabbing text-primary/30 hover:text-primary/60">
                <GripVertical size={18} />
              </span>
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-primary">{SECTION_LABELS[s.id] || s.id}</span>
                  <span className="text-xs font-body text-primary/30">#{i + 1}</span>
                  {hidden && (
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wide text-primary/40 bg-primary/5 px-2 py-0.5 rounded-full">
                      Oculta
                    </span>
                  )}
                </div>
                <p className="font-body text-xs text-primary/40 truncate">{SECTION_DESCRIPTIONS[s.id] || ''}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleVisible(i)}
                title={hidden ? 'Mostrar sección' : 'Ocultar sección'}
                className={`p-2 rounded-lg transition-colors ${
                  hidden ? 'text-primary/30 hover:text-primary hover:bg-primary/5' : 'text-accent hover:bg-accent/10'
                }`}
              >
                {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <div className="flex flex-col">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Subir"
                  className="p-1 rounded text-primary/50 hover:text-primary hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronUp size={15} />
                </button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === order.length - 1} aria-label="Bajar"
                  className="p-1 rounded text-primary/50 hover:text-primary hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronDown size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
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
            Guardar orden
          </>
        )}
      </button>
    </div>
  );
}

// Pequeño ícono para la fila fija del Hero (estrella de "portada").
function Sparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" opacity="0.5" />
    </svg>
  );
}
