import React, { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/tienda';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const containerRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.login-el', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    login(email, password);
    navigate(redirect, { replace: true });
  }

  function handleGoogle() {
    loginWithGoogle();
    navigate(redirect, { replace: true });
  }

  return (
    <div ref={containerRef} className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#1A1A1A]">
        <img
          src="/logo.png"
          alt="Majes de Sivar"
          className="w-20 h-20 rounded-full object-cover mb-4"
        />
        <span className="font-drama italic text-xl text-accent">Majes de Sivar</span>
        <span className="text-sm text-white/40 mt-1">Hermandad. Con propósito.</span>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-sm">
          <h1 className="login-el font-heading font-extrabold text-2xl text-primary mb-1">
            Iniciá sesión
          </h1>
          <p className="login-el font-body text-primary/50 text-sm mb-6">
            Para continuar con tu compra
          </p>

          {/* Google OAuth button */}
          <button
            type="button"
            onClick={handleGoogle}
            className="login-el w-full bg-white border border-primary/10 rounded-xl py-3 flex items-center justify-center gap-3 font-heading font-bold text-sm text-primary hover:bg-gray-50 transition-colors mb-4"
          >
            <span
              className="w-5 h-5 rounded-full flex-shrink-0"
              style={{
                background: 'conic-gradient(#4285F4 90deg, #EA4335 90deg 180deg, #FBBC04 180deg 270deg, #34A853 270deg)',
              }}
            />
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="login-el flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-primary/10" />
            <span className="text-xs text-primary/30">o</span>
            <div className="flex-1 h-px bg-primary/10" />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              className="login-el bg-[#f8f6f3] rounded-xl px-4 py-3 text-sm text-primary placeholder:text-primary/40 outline-none focus:ring-2 focus:ring-accent/40"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="login-el bg-[#f8f6f3] rounded-xl px-4 py-3 text-sm text-primary placeholder:text-primary/40 outline-none focus:ring-2 focus:ring-accent/40"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="login-el bg-primary text-background w-full py-3.5 rounded-xl font-heading font-bold text-sm hover:opacity-90 transition-opacity mt-1"
            >
              Iniciar sesión
            </button>
          </form>

          <p className="login-el font-body text-sm text-primary/50 mt-5 text-center">
            ¿No tenés cuenta?{' '}
            <Link to="/registro" className="text-accent font-semibold hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
