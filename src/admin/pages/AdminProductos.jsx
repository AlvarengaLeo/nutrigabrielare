import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Plus } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import { getAllProductsAdmin, getCategories, deleteProduct } from '../../services/productService';

export default function AdminProductos() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);

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
      gsap.fromTo(els, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const filtered = products.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !catFilter || p.category === catFilter;
    return matchesSearch && matchesCat;
  });

  async function handleDelete(e, product) {
    e.stopPropagation();
    if (!window.confirm(`¿Desactivar "${product.name}"?`)) return;
    await deleteProduct(product.id);
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, active: false } : p));
  }

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.title]));

  const columns = [
    {
      key: 'image',
      label: '',
      render: (_, row) => {
        const color = row.variants?.colors?.[0]?.hex || '#1A1A1A';
        const img = row.images?.[0];
        return img && !img.includes('placeholder') ? (
          <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: color }} />
        );
      },
    },
    { key: 'name', label: 'Nombre', render: (v) => <span className="font-heading font-semibold">{v}</span> },
    { key: 'category', label: 'Categoría', render: (v) => catMap[v] || v },
    { key: 'price', label: 'Precio', render: (v) => `$${(v ?? 0).toFixed(2)}` },
    { key: 'stock', label: 'Stock' },
    {
      key: 'active',
      label: 'Activo',
      render: (v) => <span className={`text-lg ${v ? 'text-green-500' : 'text-red-400'}`}>●</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <button onClick={(e) => handleDelete(e, row)} className="text-red-400 hover:text-red-600 text-xs font-body">
          Desactivar
        </button>
      ),
    },
  ];

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
          <div className="flex items-center gap-3">
            <input
              className="bg-white border border-primary/10 rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-primary/40 outline-none focus:ring-2 focus:ring-accent/40 w-64"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="bg-white border border-primary/10 rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <button
            onClick={() => navigate('/admin/productos/nuevo')}
            className="flex items-center gap-2 bg-primary text-background px-5 py-2.5 rounded-xl font-heading font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Nuevo producto
          </button>
        </div>

        {/* Table */}
        <div className="prod-el bg-white rounded-2xl border border-primary/5 overflow-hidden">
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(row) => navigate(`/admin/productos/${row.id}`)}
            emptyMessage="No hay productos"
          />
        </div>
      </div>
    </AdminLayout>
  );
}
