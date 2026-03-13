import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';

const roleClassMap = {
  admin:  'bg-accent/15 text-accent',
  editor: 'bg-green-100 text-green-700',
  gestor: 'bg-amber-100 text-amber-700',
};

export default function AdminLayout({ children, title }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleClass = roleClassMap[user?.role] ?? 'bg-primary/10 text-primary/60';

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-primary/5 bg-white flex items-center justify-between px-6 flex-shrink-0">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-primary/5 text-primary/60 hover:text-primary transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          <h1 className="font-heading font-bold text-lg text-primary">{title}</h1>

          {/* User pill */}
          <div className="flex items-center gap-2">
            <span className="font-body text-sm text-primary/70">
              {user?.firstName}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-body font-semibold ${roleClass}`}>
              {user?.role}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
