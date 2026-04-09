import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import AdminLayout from '../components/AdminLayout';
import ImageUploader from '../components/ImageUploader';
import {
  getCategories,
  createProduct,
  updateProduct,
  createVariant,
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
  const [stock, setStock] = useState('0');
  const [images, setImages] = useState([]);
  // Pending files for new products (not yet saved to DB)
  const [pendingFiles, setPendingFiles] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const cats = await getCategories();
        setCategories(cats);

        if (isEdit) {
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

          // Calculate total stock from variants
          const totalStock = (product.product_variants ?? [])
            .filter(v => v.active)
            .reduce((sum, v) => sum + (v.stock ?? 0), 0);
          setStock(String(totalStock));

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

        // Update stock: find existing default variant or create one
        const { data: existingVars } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', id);

        if (existingVars && existingVars.length > 0) {
          // Update the first variant's stock
          await supabase
            .from('product_variants')
            .update({ stock: parseInt(stock) || 0 })
            .eq('id', existingVars[0].id);
        } else {
          // Create a default variant
          await createVariant(id, {
            size: 'Único',
            colorName: 'Estándar',
            colorHex: '#73D9CF',
            stock: parseInt(stock) || 0,
            active: true,
          });
        }

        navigate(0); // refresh page
      } else {
        // Create product
        const created = await createProduct({
          name, slug, categoryId, price: parseFloat(price),
          description, descriptionLong, active, featured,
        });

        // Create a default variant with stock
        await createVariant(created.id, {
          size: 'Único',
          colorName: 'Estándar',
          colorHex: '#73D9CF',
          stock: parseInt(stock) || 0,
          active: true,
        });

        // Upload pending images
        for (const file of pendingFiles) {
          await uploadProductImage(created.id, file);
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
    if (isEdit) {
      // Direct upload for existing products
      const result = await uploadProductImage(id, file);
      setImages((prev) => [...prev, { id: result.id, url: result.url, sortOrder: result.sort_order }]);
    } else {
      // Queue files for upload after product creation
      setPendingFiles((prev) => [...prev, file]);
    }
  }

  async function handleImageDelete(imageId, url) {
    await deleteProductImage(imageId, url);
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  function removePendingFile(index) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
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

          <div className="form-el grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
              <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">Stock</label>
              <input className={inputClass} type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>

          <div className="form-el">
            <label className="font-body text-xs font-semibold text-primary/50 uppercase tracking-widest mb-1 block">Descripción</label>
            <textarea className={`${inputClass} min-h-[160px] font-mono text-[13px] leading-relaxed`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={"## Detalles del Producto\n\n- **Composición:** Contiene 30 vitaminas\n- **Pureza:** USDA Organic\n- **Uso:** 4 cápsulas diarias"} />
            <p className="mt-1.5 font-body text-[11px] text-primary/30">
              Formato: **negrita**, *cursiva*, ## título, - viñetas
            </p>
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

          {/* Images */}
          <div className="form-el">
            <h3 className="font-heading font-bold text-lg text-primary mb-3">Imágenes</h3>
            {isEdit ? (
              <ImageUploader productId={id} images={images} onUpload={handleImageUpload} onDelete={handleImageDelete} />
            ) : (
              <div>
                {/* File picker for new products */}
                <div
                  onClick={() => document.getElementById('new-product-images')?.click()}
                  className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors border-primary/20 hover:border-primary/40"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    <span className="font-body text-sm text-primary/50">Haz click para seleccionar imágenes</span>
                    <span className="font-body text-xs text-primary/30">Se subirán al guardar el producto</span>
                  </div>
                  <input
                    id="new-product-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        for (const file of e.target.files) {
                          handleImageUpload(file);
                        }
                      }
                    }}
                  />
                </div>

                {/* Preview pending files */}
                {pendingFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {pendingFiles.map((file, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-primary/5">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePendingFile(i)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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

