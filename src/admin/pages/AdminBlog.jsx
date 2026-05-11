import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Plus, ExternalLink } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import {
  getAllPostsAdmin,
  deletePost,
  getPostCategories,
} from '../../services/blogService';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-SV', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminBlog() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    setLoading(true);
    try {
      const [{ rows }, cats] = await Promise.all([
        getAllPostsAdmin({ limit: 100 }),
        getPostCategories(),
      ]);
      setPosts(rows);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.blog-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(els, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  async function handleDelete(e, post) {
    e.stopPropagation();
    if (!window.confirm(`¿Eliminar el artículo "${post.title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (err) {
      alert('Error al eliminar: ' + (err.message || err));
    }
  }

  const filtered = posts.filter((p) => {
    if (statusFilter === 'published' && !p.published) return false;
    if (statusFilter === 'draft' && p.published) return false;
    if (catFilter && p.category_id !== catFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <AdminLayout title="Fluir Femenino">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Fluir Femenino">
      <div ref={containerRef}>
        <div className="blog-el flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <input
              className="bg-white border border-primary/10 rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-primary/40 outline-none focus:ring-2 focus:ring-accent/40 w-64"
              placeholder="Buscar por título…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="bg-white border border-primary/10 rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="published">Publicados</option>
              <option value="draft">Borradores</option>
            </select>
            <select
              className="bg-white border border-primary/10 rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => navigate('/admin/fluir-femenino/nuevo')}
            className="flex items-center gap-2 bg-primary text-background px-5 py-2.5 rounded-xl font-heading font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Nuevo artículo
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="blog-el bg-white rounded-2xl border border-primary/5 py-16 text-center font-body text-primary/50">
            No hay artículos {statusFilter !== 'all' ? `en estado "${statusFilter === 'published' ? 'publicado' : 'borrador'}"` : ''}.
          </div>
        ) : (
          <div className="blog-el bg-white rounded-2xl border border-primary/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-primary/[0.02] text-left text-xs font-heading font-bold uppercase tracking-wider text-primary/50">
                <tr>
                  <th className="p-4 w-16">Cover</th>
                  <th className="p-4">Título</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Actualizado</th>
                  <th className="p-4 w-32">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/admin/fluir-femenino/${p.id}`)}
                      className="border-t border-primary/5 hover:bg-primary/[0.02] cursor-pointer"
                    >
                      <td className="p-4">
                        {p.cover_image_url ? (
                          <img src={p.cover_image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/5" />
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-heading font-semibold text-primary">{p.title}</div>
                        <div className="text-xs text-primary/40 font-body mt-0.5 truncate max-w-md">/fluir-femenino/articulos/{p.slug}</div>
                      </td>
                      <td className="p-4 font-body text-primary/70">{cat?.name || '—'}</td>
                      <td className="p-4">
                        {p.published ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-heading font-bold">
                            ● Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-heading font-bold">
                            ● Borrador
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-body text-primary/60 text-xs">
                        {formatDate(p.updated_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {p.published && (
                            <a
                              href={`/fluir-femenino/articulos/${p.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-accent hover:underline text-xs font-heading font-bold inline-flex items-center gap-1"
                            >
                              <ExternalLink size={12} /> Ver
                            </a>
                          )}
                          <button
                            onClick={(e) => handleDelete(e, p)}
                            className="text-red-500 hover:text-red-700 text-xs font-heading font-bold"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
