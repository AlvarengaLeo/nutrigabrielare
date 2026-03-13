import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';
  const containerRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in with admin role
  useEffect(() => {
    if (user && ['admin', 'editor', 'gestor'].includes(user.role)) {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  // GSAP animation
  useEffect(() => {
    const els = containerRef.current?.querySelectorAll('.admin-login-el');
    if (!els) return;
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(els,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result?.error) {
        setError(result.error.message || 'Credenciales incorrectas.');
      }
    } catch {
      setError('Error al iniciar sesión. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen flex bg-background">
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#1A1A1A]">
        <img src="/logo.png" alt="Majes de Sivar" className="w-20 h-20 rounded-full object-cover mb-4" />
        <span className="font-drama italic text-xl text-accent">Majes de Sivar</span>
        <span className="text-sm text-white/40 mt-1">Panel Administrativo</span>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-sm">
          <h1 className="admin-login-el font-heading font-extrabold text-2xl text-primary mb-1">Acceso al panel</h1>
          <p className="admin-login-el font-body text-primary/50 text-sm mb-6">Solo para el equipo</p>
          {error && <p className="admin-login-el text-sm text-red-500 font-body mb-3">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input className="admin-login-el bg-[#f8f6f3] rounded-xl px-4 py-3 text-sm text-primary placeholder:text-primary/40 outline-none focus:ring-2 focus:ring-accent/40" type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="admin-login-el bg-[#f8f6f3] rounded-xl px-4 py-3 text-sm text-primary placeholder:text-primary/40 outline-none focus:ring-2 focus:ring-accent/40" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" disabled={submitting} className={`admin-login-el bg-primary text-background w-full py-3.5 rounded-xl font-heading font-bold text-sm transition-opacity mt-1 ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}>
              {submitting ? 'Iniciando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
