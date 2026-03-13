import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import { getAllCategoriesAdmin, createCategory, updateCategory, deleteCategory } from '../../services/categoryService';

const EMPTY_FORM = { id: '', num: '', title: '', tagline: '', description: '', cta: '', sortOrder: 0, active: true };

export default function AdminCategorias() {
  const containerRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const cats = await getAllCategoriesAdmin();
      setCategories(cats);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.cat-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(els, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(cat) {
    setForm({
      id: cat.id,
      num: cat.num,
      title: cat.title,
      tagline: cat.tagline || '',
      description: cat.desc || '',
      cta: cat.cta || '',
      sortOrder: cat.sortOrder ?? 0,
      active: cat.active,
    });
    setEditingId(cat.id);
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, {
          num: form.num, title: form.title, tagline: form.tagline,
          description: form.description, cta: form.cta, sortOrder: form.sortOrder, active: form.active,
        });
      } else {
        await createCategory({
          id: form.id, num: form.num, title: form.title, tagline: form.tagline,
          description: form.description, cta: form.cta, sortOrder: form.sortOrder, active: form.active,
        });
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al guardar');
    } finally { setSaving(false); }
  }

  async function handleDelete(e, cat) {
    e.stopPropagation();
    if (!window.confirm(`¿Eliminar "${cat.title}"?`)) return;
    try {
      await deleteCategory(cat.id);
      await loadData();
    } catch (err) { alert(err.message || 'Error al eliminar'); }
  }

  const columns = [
    { key: 'num', label: '#' },
    { key: 'title', label: 'Título', render: (v) => <span className="font-heading font-semibold">{v}</span> },
    { key: 'tagline', label: 'Tagline' },
    { key: 'cta', label: 'CTA' },
    { key: 'sortOrder', label: 'Orden' },
    { key: 'active', label: 'Activo', render: (v) => <span className={`text-lg ${v ? 'text-green-500' : 'text-red-400'}`}>●</span> },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="text-primary/40 hover:text-accent"><Pencil size={15} /></button>
          <button onClick={(e) => handleDelete(e, row)} className="text-primary/40 hover:text-red-500"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  const inputClass = 'bg-[#f8f6f3] rounded-xl px-4 py-3 text-sm text-primary placeholder:text-primary/40 outline-none focus:ring-2 focus:ring-accent/40 w-full';

  if (loading) {
    return (
      <AdminLayout title="Categorías">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Categorías">
      <div ref={containerRef}>
        <div className="cat-el flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-lg text-primary">Todas las categorías</h2>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-background px-5 py-2.5 rounded-xl font-heading font-bold text-sm hover:opacity-90 transition-opacity">
            <Plus size={16} /> Nueva categoría
          </button>
        </div>

        <div className="cat-el bg-white rounded-2xl border border-primary/5 overflow-hidden">
          <DataTable columns={columns} data={categories} emptyMessage="No hay categorías" />
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-primary">{editingId ? 'Editar categoría' : 'Nueva categoría'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-primary/40 hover:text-primary"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              {!editingId && (
                <div>
                  <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">ID (slug)</label>
                  <input className={inputClass} value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} required placeholder="ej: ropa" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">Número</label>
                  <input className={inputClass} value={form.num} onChange={(e) => setForm({ ...form, num: e.target.value })} required placeholder="01" />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">Orden</label>
                  <input className={inputClass} type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">Título</label>
                <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">Tagline</label>
                <input className={inputClass} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">Descripción</label>
                <textarea className={`${inputClass} min-h-[80px]`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">CTA</label>
                <input className={inputClass} value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} placeholder="Ver ropa" />
              </div>
              <label className="flex items-center gap-2 font-body text-sm text-primary cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-accent w-4 h-4" />
                Activa
              </label>
              <button type="submit" disabled={saving} className={`bg-primary text-background py-3 rounded-xl font-heading font-bold text-sm transition-opacity mt-2 ${saving ? 'opacity-50' : 'hover:opacity-90'}`}>
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear categoría'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
