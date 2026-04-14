import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CheckoutAuthPanel({ defaultEmail = '' }) {
  const { loading, login, register, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState('login');
  const [loginEmail, setLoginEmail] = useState(defaultEmail);
  const [loginPassword, setLoginPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState(defaultEmail);
  const [registerPassword, setRegisterPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultEmail) {
      setLoginEmail((prev) => prev || defaultEmail);
      setRegisterEmail((prev) => prev || defaultEmail);
    }
  }, [defaultEmail]);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      const result = await login(loginEmail, loginPassword);
      if (result?.error) {
        setError('No pudimos iniciar sesion. Revisa tus datos e intenta de nuevo.');
      }
    } catch {
      setError('No pudimos iniciar sesion. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      const result = await register(
        registerFirstName,
        registerLastName,
        registerEmail,
        registerPassword,
      );

      if (result?.error) {
        setError(result.error.message || 'No pudimos crear tu cuenta.');
      } else if (result?.data?.session) {
        setNotice('Tu cuenta ya esta activa y puedes seguir con el checkout.');
      } else {
        setNotice(
          'Tu cuenta fue creada. Si tu correo requiere confirmacion, puedes seguir como invitado mientras la activas.',
        );
      }
    } catch {
      setError('No pudimos crear tu cuenta.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setNotice('');
    await loginWithGoogle('/checkout');
  }

  return (
    <section className="checkout-el bg-white rounded-2xl p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-heading font-bold text-sm text-primary">
            Compra sin friccion
          </h2>
          <p className="mt-2 max-w-xl font-body text-sm text-primary/60">
            Puedes completar tu compra como invitado. Si ya tienes cuenta, inicia
            sesion aqui mismo. Si quieres guardar tus pedidos y comprar mas rapido
            despues, tambien puedes crear una cuenta sin salir del checkout.
          </p>
        </div>
        <div className="inline-flex rounded-xl bg-primary/5 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-lg px-3 py-2 font-body text-xs transition-colors ${
              mode === 'login'
                ? 'bg-primary text-background'
                : 'text-primary/60 hover:text-primary'
            }`}
          >
            Iniciar sesion
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-lg px-3 py-2 font-body text-xs transition-colors ${
              mode === 'register'
                ? 'bg-primary text-background'
                : 'text-primary/60 hover:text-primary'
            }`}
          >
            Crear cuenta
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-primary/10 bg-white py-3 font-heading text-sm font-bold text-primary transition-colors hover:bg-primary/5"
      >
        <span
          className="h-5 w-5 flex-shrink-0 rounded-full"
          style={{
            background:
              'conic-gradient(#4285F4 90deg, #EA4335 90deg 180deg, #FBBC04 180deg 270deg, #34A853 270deg)',
          }}
        />
        Continuar con Google
      </button>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-primary/10" />
        <span className="font-body text-xs text-primary/30">o</span>
        <div className="h-px flex-1 bg-primary/10" />
      </div>

      {error ? (
        <p className="mb-3 font-body text-sm text-red-500">{error}</p>
      ) : null}
      {notice ? (
        <p className="mb-3 font-body text-sm text-green-600">{notice}</p>
      ) : null}
      {loading ? (
        <div className="flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-accent" />
          <span className="font-body text-sm text-primary/60">
            Revisando tu sesion...
          </span>
        </div>
      ) : mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="Correo electronico"
            className="rounded-xl bg-[#f8f6f3] px-4 py-3 font-body text-sm text-primary outline-none transition-colors focus:ring-2 focus:ring-accent/30"
            required
          />
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Contrasena"
            className="rounded-xl bg-[#f8f6f3] px-4 py-3 font-body text-sm text-primary outline-none transition-colors focus:ring-2 focus:ring-accent/30"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className={`rounded-xl bg-primary py-3.5 font-heading text-sm font-bold text-background transition-opacity ${
              submitting ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90'
            }`}
          >
            {submitting ? 'Iniciando...' : 'Entrar y seguir con la compra'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={registerFirstName}
              onChange={(e) => setRegisterFirstName(e.target.value)}
              placeholder="Nombre"
              className="rounded-xl bg-[#f8f6f3] px-4 py-3 font-body text-sm text-primary outline-none transition-colors focus:ring-2 focus:ring-accent/30"
              required
            />
            <input
              type="text"
              value={registerLastName}
              onChange={(e) => setRegisterLastName(e.target.value)}
              placeholder="Apellido"
              className="rounded-xl bg-[#f8f6f3] px-4 py-3 font-body text-sm text-primary outline-none transition-colors focus:ring-2 focus:ring-accent/30"
              required
            />
          </div>
          <input
            type="email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            placeholder="Correo electronico"
            className="rounded-xl bg-[#f8f6f3] px-4 py-3 font-body text-sm text-primary outline-none transition-colors focus:ring-2 focus:ring-accent/30"
            required
          />
          <input
            type="password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            placeholder="Contrasena"
            className="rounded-xl bg-[#f8f6f3] px-4 py-3 font-body text-sm text-primary outline-none transition-colors focus:ring-2 focus:ring-accent/30"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className={`rounded-xl bg-primary py-3.5 font-heading text-sm font-bold text-background transition-opacity ${
              submitting ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90'
            }`}
          >
            {submitting ? 'Creando...' : 'Crear cuenta y seguir con la compra'}
          </button>
        </form>
      )}
    </section>
  );
}
