import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import { getAllUsers, updateUserRole } from '../../services/userService';

const ROLE_COLORS = {
  admin: 'bg-accent/20 text-accent',
  editor: 'bg-green-100 text-green-700',
  gestor: 'bg-amber-100 text-amber-700',
  customer: 'bg-primary/10 text-primary/60',
};

export default function AdminUsuarios() {
  const containerRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.usr-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(els, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  async function handleRoleChange(userId, newRole, userName) {
    if (!window.confirm(`¿Cambiar rol de ${userName} a "${newRole}"?`)) return;
    try {
      await updateUserRole(userId, newRole);
      await loadUsers();
    } catch (err) { alert(err.message || 'Error al cambiar rol'); }
  }

  const columns = [
    { key: 'email', label: 'Email', render: (v) => <span className="font-body text-sm">{v}</span> },
    {
      key: 'name',
      label: 'Nombre',
      render: (_, row) => <span className="font-heading font-semibold">{row.firstName} {row.lastName}</span>,
    },
    {
      key: 'role',
      label: 'Rol',
      render: (v, row) => (
        <select
          value={v}
          onChange={(e) => handleRoleChange(row.id, e.target.value, row.email)}
          className={`${ROLE_COLORS[v] || ''} text-xs font-semibold px-2.5 py-1 rounded-full font-body border-0 outline-none cursor-pointer`}
        >
          <option value="customer">customer</option>
          <option value="admin">admin</option>
          <option value="editor">editor</option>
          <option value="gestor">gestor</option>
        </select>
      ),
    },
    {
      key: 'createdAt',
      label: 'Registrado',
      render: (v) => v ? new Date(v).toLocaleDateString('es-SV') : '',
    },
  ];

  if (loading) {
    return (
      <AdminLayout title="Usuarios">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Usuarios">
      <div ref={containerRef}>
        <div className="usr-el mb-6">
          <h2 className="font-heading font-bold text-lg text-primary">Todos los usuarios</h2>
        </div>
        <div className="usr-el bg-white rounded-2xl border border-primary/5 overflow-hidden">
          <DataTable columns={columns} data={users} emptyMessage="No hay usuarios" />
        </div>
      </div>
    </AdminLayout>
  );
}
