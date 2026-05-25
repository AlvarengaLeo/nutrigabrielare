import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { Plus, ChevronDown, ChevronRight, Tags, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { DIGITAL_SUBTYPES, getAllProductsAdmin, getCategories, deleteProduct } from '../../services/productService';

const KIND_LABEL = {
  physical: 'Físico',
  digital: 'Digital',
  service: 'Servicio',
};

// Front-of-house: which public store each kind is published to.
const KIND_TO_STORE = {
  physical: { label: 'Pleno', className: 'bg-[#16693d]/10 text-[#16693d]' },
  digital: { label: 'Nutrigabrielare', className: 'bg-primary/10 text-primary' },
  service: { label: 'Nutrigabrielare', className: 'bg-primary/10 text-primary' },
};

export default function AdminProductos() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [storeFilter, setStoreFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [collapsedCats, setCollapsedCats] = useState({});

  useEffect(() => {
    Promise.all([getAllProductsAdmin(), getCategories()])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.prod-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(els, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  // Group products by category, respecting category sort_order, with
  // optional search + status filter.
  const groupedProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = products.filter((p) => {
      if (statusFilter === 'active' && !p.active) return false;
      if (statusFilter === 'inactive' && p.active) return false;
      if (storeFilter === 'pleno' && p.kind !== 'physical') return false;
      if (storeFilter === 'nutri' && p.kind !== 'digital' && p.kind !== 'service') return false;
      if (term && !p.name.toLowerCase().includes(term)) return false;
      return true;
    });

    // Sort category order: respect categories array order (already sort_order)
    const byCat = {};
    for (const cat of categories) {
      byCat[cat.id] = { category: cat, items: [] };
    }
    // Bucket for products whose category_id no longer exists (orphans)
    byCat.__orphan__ = { category: { id: '__orphan__', title: 'Sin categoría' }, items: [] };

    for (const p of filtered) {
      const bucket = byCat[p.category] || byCat.__orphan__;
      bucket.items.push(p);
    }

    // Within each category, sort: featured first by featuredOrder, then alphabetical
    for (const b of Object.values(byCat)) {
      b.items.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        if (a.featured && b.featured) return (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0);
        return (a.name || '').localeCompare(b.name || '');
      });
    }

    return Object.values(byCat).filter((b) => b.items.length > 0);
  }, [products, categories, search, statusFilter, storeFilter]);

  async function handleDelete(e, product) {
    e.stopPropagation();
    if (!window.confirm(`¿Desactivar "${product.name}"?`)) return;
    await deleteProduct(product.id);
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, active: false } : p));
  }

  function toggleCat(catId) {
    setCollapsedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }

  if (loading) {
    return (
      <AdminLayout title="Productos">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Productos">
      <div ref={containerRef}>
        {/* Header */}
        <div className="prod-el flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              className="bg-white border border-primary/10 rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-primary/40 outline-none focus:ring-2 focus:ring-accent/40 w-64"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="bg-white border border-primary/10 rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="active">Solo activos</option>
              <option value="inactive">Solo inactivos</option>
              <option value="all">Todos</option>
            </select>
            <select
              className="bg-white border border-primary/10 rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40"
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              title="Filtrar por tienda pública"
            >
              <option value="all">Todas las tiendas</option>
              <option value="pleno">Pleno (suplementos)</option>
              <option value="nutri">Nutrigabrielare (digital + servicios)</option>
            </select>
            <Link
              to="/admin/categorias"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-primary/10 bg-white text-sm font-heading font-bold text-primary/70 hover:text-primary hover:border-primary/30 transition-colors"
            >
              <Tags size={14} /> Editar categorías
            </Link>
          </div>
          <button
            onClick={() => navigate('/admin/productos/nuevo')}
            className="flex items-center gap-2 bg-primary text-background px-5 py-2.5 rounded-xl font-heading font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Nuevo producto
          </button>
        </div>

        {/* Grouped by category */}
        <div className="space-y-6">
          {groupedProducts.length === 0 && (
            <div className="prod-el bg-white rounded-2xl border border-primary/5 py-16 text-center font-body text-primary/50">
              No hay productos con esos filtros.
            </div>
          )}

          {groupedProducts.map(({ category, items }) => {
            const collapsed = collapsedCats[category.id];
            return (
              <section key={category.id} className="prod-el">
                {/* Category header */}
                <header className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => toggleCat(category.id)}
                    className="flex items-center gap-2 text-left group"
                  >
                    {collapsed
                      ? <ChevronRight size={18} className="text-primary/40 group-hover:text-primary transition-colors" />
                      : <ChevronDown size={18} className="text-primary/40 group-hover:text-primary transition-colors" />}
                    <h3 className="font-heading font-extrabold text-base text-primary">{category.title}</h3>
                    <span className="text-xs font-body text-primary/40">· {items.length} {items.length === 1 ? 'producto' : 'productos'}</span>
                  </button>
                  {category.id !== '__orphan__' && (
                    <Link
                      to="/admin/categorias"
                      className="text-xs font-heading font-bold text-accent hover:underline"
                    >
                      Editar categoría →
                    </Link>
                  )}
                </header>

                {/* Products grid */}
                {!collapsed && (
                  <div className="bg-white rounded-2xl border border-primary/5 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-primary/[0.02] text-left text-xs font-heading font-bold uppercase tracking-wider text-primary/40">
                        <tr>
                          <th className="p-3 w-14"></th>
                          <th className="p-3">Producto</th>
                          <th className="p-3 w-32">Vitrina</th>
                          <th className="p-3 w-24">Tipo</th>
                          <th className="p-3 w-20">Precio</th>
                          <th className="p-3 w-16">Stock</th>
                          <th className="p-3 w-20">Destacado</th>
                          <th className="p-3 w-20">Activo</th>
                          <th className="p-3 w-24"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((p) => {
                          const img = p.images?.[0];
                          const kindBadge = p.digitalSubtype
                            ? DIGITAL_SUBTYPES[p.digitalSubtype]
                            : KIND_LABEL[p.kind];
                          const store = KIND_TO_STORE[p.kind] ?? KIND_TO_STORE.physical;
                          return (
                            <tr
                              key={p.id}
                              onClick={() => navigate(`/admin/productos/${p.id}`)}
                              className="border-t border-primary/5 hover:bg-primary/[0.02] cursor-pointer"
                            >
                              <td className="p-3">
                                {img ? (
                                  <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary/30">
                                    <ImageIcon size={16} />
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="font-heading font-semibold text-primary">{p.name}</div>
                                <div className="text-xs text-primary/40 font-mono mt-0.5">{p.id}</div>
                              </td>
                              <td className="p-3">
                                <span className={`inline-block px-2 py-1 rounded-md text-[11px] font-heading font-bold ${store.className}`}>
                                  {store.label}
                                </span>
                              </td>
                              <td className="p-3 font-body text-xs text-primary/60">{kindBadge}</td>
                              <td className="p-3 font-body text-primary/80">${(p.price ?? 0).toFixed(2)}</td>
                              <td className="p-3 font-body text-primary/60">
                                {p.kind === 'physical' ? p.stock : '—'}
                              </td>
                              <td className="p-3">
                                {p.featured ? (
                                  <span className="text-amber-500 text-lg" title="Destacado">★</span>
                                ) : (
                                  <span className="text-primary/15">—</span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className={`text-lg ${p.active ? 'text-green-500' : 'text-red-400'}`}>●</span>
                              </td>
                              <td className="p-3">
                                {p.active && (
                                  <button
                                    onClick={(e) => handleDelete(e, p)}
                                    className="text-red-400 hover:text-red-600 text-xs font-body"
                                  >
                                    Desactivar
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
