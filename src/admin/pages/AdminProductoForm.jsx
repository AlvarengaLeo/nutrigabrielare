import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import AdminLayout from '../components/AdminLayout';
import VariantEditor from '../components/VariantEditor';
import ImageUploader from '../components/ImageUploader';
import {
  getProductBySlug,
  getAllProductsAdmin,
  getCategories,
  createProduct,
  updateProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  uploadProductImage,
  deleteProductImage,
} from '../../services/productService';
import { supabase } from '../../lib/supabase';

function generateSlug(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminProductoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionLong, setDescriptionLong] = useState('');
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [originalVariants, setOriginalVariants] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const cats = await getCategories();
        setCategories(cats);

        if (isEdit) {
          // Fetch product by ID (not slug) - get raw from supabase
          const { data: product, error: fetchErr } = await supabase
            .from('products')
            .select(`
              id, slug, name, category_id, price, description, description_long, active, featured,
              product_images ( id, url, sort_order ),
              product_variants ( id, size, color_name, color_hex, stock, active )
            `)
            .eq('id', id)
            .single();

          if (fetchErr) throw fetchErr;

          setName(product.name);
          setSlug(product.slug);
          setCategoryId(product.category_id);
          setPrice(String(product.price));
          setDescription(product.description || '');
          setDescriptionLong(product.description_long || '');
          setActive(product.active);
          setFeatured(product.featured);

          const vars = (product.product_variants ?? []).map((v) => ({
            id: v.id,
            size: v.size,
            colorName: v.color_name,
            colorHex: v.color_hex,
            stock: v.stock,
            active: v.active,
          }));
          setVariants(vars);
          setOriginalVariants(vars);

          const imgs = (product.product_images ?? [])
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((img) => ({ id: img.id, url: img.url, sortOrder: img.sort_order }));
          setImages(imgs);
        }
      } catch (err) {
        setError('Error cargando datos.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isEdit]);

  // GSAP
  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.form-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(els, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  // Auto-slug on name change (only in create mode)
  useEffect(() => {
    if (!isEdit && name) setSlug(generateSlug(name));
  }, [name, isEdit]);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (isEdit) {
        // Update product fields
        await updateProduct(id, {
          name, slug, categoryId, price: parseFloat(price),
          description, descriptionLong, active, featured,
        });

        // Sync variants
        const originalIds = new Set(originalVariants.map((v) => v.id));
        const currentIds = new Set(variants.filter((v) => v.id).map((v) => v.id));

        // Delete removed variants
        for (const ov of originalVariants) {
          if (!currentIds.has(ov.id)) await deleteVariant(ov.id);
        }

        // Create new + update existing
        for (const v of variants) {
          if (v.id && originalIds.has(v.id)) {
            await updateVariant(v.id, { size: v.size, colorName: v.colorName, colorHex: v.colorHex, stock: v.stock, active: v.active });
          } else if (!v.id) {
            await createVariant(id, { size: v.size, colorName: v.colorName, colorHex: v.colorHex, stock: v.stock, active: v.active });
          }
        }

        // Reload
        navigate(0); // refresh page
      } else {
        // Create product
        const created = await createProduct({
          name, slug, categoryId, price: parseFloat(price),
          description, descriptionLong, active, featured,
        });

        // Create variants
        for (const v of variants) {
          await createVariant(created.id, { size: v.size, colorName: v.colorName, colorHex: v.colorHex, stock: v.stock, active: v.active });
        }

        navigate(`/admin/productos/${created.id}`, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(file) {
    const result = await uploadProductImage(id, file);
    setImages((prev) => [...prev, { id: result.id, url: result.url, sortOrder: result.sort_order }]);
  }

  async function handleImageDelete(imageId, url) {
    await deleteProductImage(imageId, url);
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  const inputClass = 'bg-[#f8f6f3] rounded-xl px-4 py-3 text-sm text-primary placeholder:text-primary/40 outline-none focus:ring-2 focus:ring-accent/40 w-full';

  if (loading) {
    return (
      <AdminLayout title={isEdit ? 'Editar producto' : 'Nuevo producto'}>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Editar producto' : 'Nuevo producto'}>
      <div ref={containerRef} className="max-w-3xl">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {error && <p className="form-el text-sm text-red-500 font-body">{error}</p>}

          {/* Basic fields */}
          <div className="form-el grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">Nombre</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">Slug</label>
              <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
          </div>

          <div className="form-el grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">Categoría</label>
              <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                <option value="">Seleccionar...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">Precio ($)</label>
              <input className={inputClass} type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
          </div>

          <div className="form-el">
            <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">Descripción corta</label>
            <textarea className={`${inputClass} min-h-[80px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="form-el">
            <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">Descripción larga</label>
            <textarea className={`${inputClass} min-h-[120px]`} value={descriptionLong} onChange={(e) => setDescriptionLong(e.target.value)} />
          </div>

          <div className="form-el flex items-center gap-6">
            <label className="flex items-center gap-2 font-body text-sm text-primary cursor-pointer">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-accent w-4 h-4" />
              Activo
            </label>
            <label className="flex items-center gap-2 font-body text-sm text-primary cursor-pointer">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-accent w-4 h-4" />
              Destacado
            </label>
          </div>

          {/* Variants */}
          <div className="form-el">
            <h3 className="font-heading font-bold text-lg text-primary mb-3">Variantes</h3>
            <div className="bg-white rounded-2xl border border-primary/5 p-4">
              <VariantEditor variants={variants} onChange={setVariants} />
            </div>
          </div>

          {/* Images (edit mode only) */}
          {isEdit && (
            <div className="form-el">
              <h3 className="font-heading font-bold text-lg text-primary mb-3">Imágenes</h3>
              <ImageUploader productId={id} images={images} onUpload={handleImageUpload} onDelete={handleImageDelete} />
            </div>
          )}

          {/* Save */}
          <button
            type="submit"
            disabled={saving}
            className={`form-el bg-primary text-background py-3.5 rounded-xl font-heading font-bold text-sm transition-opacity ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
