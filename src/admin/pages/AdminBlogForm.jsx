import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowLeft, Check, AlertCircle, Trash2, Upload, X } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import AdminLayout from '../components/AdminLayout';
import {
  createPost,
  updatePost,
  getPostByIdAdmin,
  getPostCategories,
  uploadPostCover,
  uploadPostInlineImage,
  slugifyTitle,
} from '../../services/blogService';
import { getAllProductsAdmin } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  body_md: '',
  cover_image_url: '',
  category_id: '',
  related_product_ids: [],
  reading_minutes: '',
  seo_title: '',
  seo_description: '',
  og_image_url: '',
  published: false,
};

export default function AdminBlogForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const inlineFileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getPostCategories(),
      getAllProductsAdmin().catch(() => []),
      isEditing ? getPostByIdAdmin(id) : Promise.resolve(null),
    ])
      .then(([cats, prods, post]) => {
        if (cancelled) return;
        setCategories(cats);
        setProducts(prods);
        if (post) {
          setForm({
            title: post.title || '',
            slug: post.slug || '',
            excerpt: post.excerpt || '',
            body_md: post.body_md || '',
            cover_image_url: post.cover_image_url || '',
            category_id: post.category_id || '',
            related_product_ids: post.related_product_ids || [],
            reading_minutes: post.reading_minutes ?? '',
            seo_title: post.seo_title || '',
            seo_description: post.seo_description || '',
            og_image_url: post.og_image_url || '',
            published: !!post.published,
          });
          setSlugTouched(true);
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('error', 'No se pudo cargar el artículo');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.form-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(els, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  function showToast(type, msg, ttl = 3500) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), ttl);
  }

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function setTitle(val) {
    setForm((f) => ({
      ...f,
      title: val,
      slug: slugTouched ? f.slug : slugifyTitle(val),
    }));
  }

  function setSlug(val) {
    setSlugTouched(true);
    setForm((f) => ({ ...f, slug: val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') }));
  }

  function toggleRelatedProduct(productId) {
    setForm((f) => {
      const has = f.related_product_ids.includes(productId);
      return {
        ...f,
        related_product_ids: has
          ? f.related_product_ids.filter((x) => x !== productId)
          : [...f.related_product_ids, productId],
      };
    });
  }

  async function handleCoverUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPostCover(file, form.slug || form.title || 'post');
      set('cover_image_url', url);
      showToast('success', 'Cover subido. No olvides guardar.');
    } catch (err) {
      showToast('error', err.message || 'Error al subir el cover');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleInlineImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPostInlineImage(file);
      const markdown = `\n![${file.name.replace(/\.[^.]+$/, '')}](${url})\n`;
      setForm((f) => ({ ...f, body_md: (f.body_md || '') + markdown }));
      showToast('success', 'Imagen insertada al final. Copiala donde quieras.');
    } catch (err) {
      showToast('error', err.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
      if (inlineFileInputRef.current) inlineFileInputRef.current.value = '';
    }
  }

  async function handleSave(e) {
    e?.preventDefault();
    if (!form.title.trim()) return showToast('error', 'El título es obligatorio');
    if (!form.slug.trim()) return showToast('error', 'El slug es obligatorio');
    if (!form.body_md.trim()) return showToast('error', 'El contenido es obligatorio');

    setSaving(true);
    try {
      const payload = {
        ...form,
        author_id: user?.id || null,
      };
      const saved = isEditing
        ? await updatePost(id, payload)
        : await createPost(payload);

      showToast('success', isEditing ? 'Artículo actualizado' : 'Artículo creado');

      if (!isEditing) {
        navigate(`/admin/fluir-femenino/${saved.id}`, { replace: true });
      }
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Error al guardar', 5000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout title={isEditing ? 'Editar artículo' : 'Nuevo artículo'}>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const filteredProducts = products.filter((p) => {
    if (!productSearch) return true;
    return p.name.toLowerCase().includes(productSearch.toLowerCase());
  });

  return (
    <AdminLayout title={isEditing ? 'Editar artículo' : 'Nuevo artículo'}>
      <form ref={containerRef} onSubmit={handleSave} className="space-y-6 max-w-5xl">
        <div className="form-el flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/fluir-femenino')}
            className="inline-flex items-center gap-2 text-sm font-heading font-bold text-primary/60 hover:text-primary"
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set('published', e.target.checked)}
                className="w-4 h-4 rounded border-primary/20 text-accent focus:ring-accent/30"
              />
              <span className="font-body text-sm text-primary">Publicado</span>
            </label>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-heading font-bold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando…' : (<><Check size={16} /> Guardar</>)}
            </button>
          </div>
        </div>

        {toast && (
          <div className={`form-el flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body ${
            toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </div>
        )}

        {/* Title + slug */}
        <div className="form-el bg-white border border-primary/5 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Título</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-base focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
              placeholder="Ej. Cómo sincronizar tu nutrición con tu ciclo"
              required
            />
          </div>
          <div>
            <label className="block font-heading font-semibold text-sm text-primary mb-1.5">
              Slug <span className="text-primary/40 font-normal">/fluir-femenino/articulos/{form.slug || '<slug>'}</span>
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
              placeholder="nutricion-y-ciclo"
              required
            />
          </div>
          <div>
            <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Resumen / Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 resize-none"
              placeholder="Frase corta que se muestra en el grid y la meta description."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Categoría</label>
              <select
                value={form.category_id}
                onChange={(e) => set('category_id', e.target.value)}
                className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-heading font-semibold text-sm text-primary mb-1.5">Minutos de lectura</label>
              <input
                type="number" min="1" max="60"
                value={form.reading_minutes}
                onChange={(e) => set('reading_minutes', e.target.value)}
                className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                placeholder="5"
              />
            </div>
          </div>
        </div>

        {/* Cover */}
        <div className="form-el bg-white border border-primary/5 rounded-2xl p-6">
          <label className="block font-heading font-semibold text-sm text-primary mb-3">Imagen de portada</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          {form.cover_image_url ? (
            <div className="relative inline-block">
              <img src={form.cover_image_url} alt="cover" className="max-w-md w-full h-auto rounded-xl" />
              <button
                type="button"
                onClick={() => set('cover_image_url', '')}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 hover:bg-red-50"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-5 py-3 border-2 border-dashed border-primary/20 rounded-xl text-sm font-heading font-bold text-primary/60 hover:border-accent/50 hover:text-accent transition-colors inline-flex items-center gap-2"
            >
              <Upload size={16} /> {uploading ? 'Subiendo…' : 'Subir imagen'}
            </button>
          )}
        </div>

        {/* Body MD editor */}
        <div className="form-el bg-white border border-primary/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block font-heading font-semibold text-sm text-primary">Contenido (Markdown)</label>
            <input ref={inlineFileInputRef} type="file" accept="image/*" onChange={handleInlineImageUpload} className="hidden" />
            <button
              type="button"
              onClick={() => inlineFileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs font-heading font-bold text-accent hover:underline inline-flex items-center gap-1"
            >
              <Upload size={12} /> {uploading ? 'Subiendo…' : 'Insertar imagen'}
            </button>
          </div>
          <div data-color-mode="light">
            <MDEditor
              value={form.body_md}
              onChange={(v) => set('body_md', v || '')}
              height={500}
              preview="live"
              visibleDragbar={false}
            />
          </div>
          <p className="font-body text-xs text-primary/40 mt-2">
            Soporta Markdown estándar + GFM (tablas, listas tachadas, etc.). Usá "Insertar imagen" para subir imágenes inline — quedan al final del cuerpo, copialas donde quieras.
          </p>
        </div>

        {/* Related products */}
        <div className="form-el bg-white border border-primary/5 rounded-2xl p-6">
          <label className="block font-heading font-semibold text-sm text-primary mb-3">
            Productos relacionados <span className="text-primary/40 font-normal">(opcional — se muestran al final del post)</span>
          </label>
          <input
            type="search"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full mb-3 px-4 py-2 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
            {filteredProducts.map((p) => {
              const checked = form.related_product_ids.includes(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    checked ? 'bg-accent/10' : 'hover:bg-primary/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRelatedProduct(p.id)}
                    className="w-4 h-4 rounded border-primary/20 text-accent focus:ring-accent/30"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-heading font-semibold text-sm text-primary truncate">{p.name}</div>
                    <div className="text-xs text-primary/40 font-body">{p.kind} · ${(p.price ?? 0).toFixed(2)}</div>
                  </div>
                </label>
              );
            })}
            {filteredProducts.length === 0 && (
              <p className="text-sm text-primary/40 font-body py-4 text-center col-span-full">
                No hay productos {productSearch ? 'que coincidan' : 'cargados'}.
              </p>
            )}
          </div>
          {form.related_product_ids.length > 0 && (
            <p className="text-xs text-accent font-body mt-2">
              {form.related_product_ids.length} producto{form.related_product_ids.length !== 1 ? 's' : ''} seleccionado{form.related_product_ids.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* SEO */}
        <div className="form-el bg-white border border-primary/5 rounded-2xl p-6 space-y-4">
          <h3 className="font-heading font-bold text-sm text-primary">SEO</h3>
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">Título SEO</label>
            <input
              type="text"
              value={form.seo_title}
              onChange={(e) => set('seo_title', e.target.value)}
              className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50"
              placeholder={form.title || 'Se autocompleta con el título si lo dejás vacío'}
            />
          </div>
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">Descripción SEO</label>
            <textarea
              value={form.seo_description}
              onChange={(e) => set('seo_description', e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50 resize-none"
              placeholder={form.excerpt || 'Se autocompleta con el resumen si lo dejás vacío'}
            />
          </div>
          <div>
            <label className="block font-body text-xs text-primary/50 mb-1">URL imagen Open Graph (Facebook/Instagram preview)</label>
            <input
              type="text"
              value={form.og_image_url}
              onChange={(e) => set('og_image_url', e.target.value)}
              className="w-full px-4 py-2.5 border border-primary/10 rounded-xl font-body text-sm focus:outline-none focus:border-accent/50"
              placeholder="Se usa el cover si lo dejás vacío"
            />
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
