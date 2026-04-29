import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Calendar,
  Users,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const allItems = [
  { icon: LayoutDashboard, label: 'Dashboard',        path: '/admin',            roles: ['admin', 'editor', 'gestor'] },
  { icon: Home,            label: 'Página Principal',  path: '/admin/home',       roles: ['admin', 'editor'] },
  { icon: Package,         label: 'Productos',         path: '/admin/productos',  roles: ['admin', 'editor'] },
  { icon: Tags,            label: 'Categorías',        path: '/admin/categorias', roles: ['admin', 'editor'] },
  { icon: ShoppingBag,     label: 'Órdenes',           path: '/admin/ordenes',    roles: ['admin', 'gestor'] },
  { icon: Calendar,        label: 'Reservas',          path: '/admin/reservas',   roles: ['admin', 'gestor'] },
  { icon: Users,           label: 'Usuarios',          path: '/admin/usuarios',   roles: ['admin'] },
];

export default function AdminSidebar({ mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin-sidebar-collapsed', String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  const navItems = allItems.filter((item) => item.roles.includes(user?.role));

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // ── Shared nav content ────────────────────────────────────────────────────

  const NavContent = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="relative flex items-center justify-center px-4 py-3 border-b border-primary/5">
        <img
          src="/media/admin-sidebar-logo-v2.png"
          alt="Nutrigabrielare"
          className={`object-contain transition-all duration-300 mx-auto ${collapsed && !onClose ? 'w-10' : 'w-[40%]'}`}
        />
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-1 rounded-lg hover:bg-primary/5 text-primary/50 hover:text-primary transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isRoot = path === '/admin';
          return (
            <NavLink
              key={path}
              to={path}
              end={isRoot}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors font-body text-sm font-medium
                ${isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-primary/60 hover:bg-primary/5 hover:text-primary'
                }
                ${collapsed && !onClose ? 'justify-center' : ''}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {(!collapsed || onClose) && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className={`border-t border-primary/5 py-3 px-2 space-y-0.5 ${collapsed && !onClose ? 'items-center flex flex-col' : ''}`}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-primary/60 hover:bg-primary/5 hover:text-primary transition-colors font-body text-sm font-medium
            ${collapsed && !onClose ? 'justify-center' : ''}`}
        >
          <ExternalLink size={18} className="flex-shrink-0" />
          {(!collapsed || onClose) && <span>Ir al sitio</span>}
        </a>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-primary/60 hover:bg-red-50 hover:text-red-600 transition-colors font-body text-sm font-medium
            ${collapsed && !onClose ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {(!collapsed || onClose) && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* Collapse toggle (desktop only) */}
      {!onClose && (
        <div className="border-t border-primary/5 p-2 flex justify-end">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg hover:bg-primary/5 text-primary/40 hover:text-primary transition-colors"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-primary/5 transition-all duration-200 flex-shrink-0
          ${collapsed ? 'w-16' : 'w-60'}`}
      >
        <NavContent onClose={null} />
      </aside>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-primary/40 z-40 md:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col md:hidden shadow-xl">
            <NavContent onClose={onMobileClose} />
          </aside>
        </>
      )}
    </>
  );
}
