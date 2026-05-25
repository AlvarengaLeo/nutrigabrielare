import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const TIENDA_LINKS = [
  { label: 'Suplementos', to: '/pleno' },
  { label: 'Productos digitales', to: '/nutrigabrielare?categoria=digital#nutri-catalogo' },
  { label: 'Servicios', to: '/nutrigabrielare?categoria=service#nutri-catalogo' },
  { label: 'Carrito', to: '/carrito' },
];

const PLENO_LINKS = [
  { label: 'Filosofía', to: '/' },
  { label: 'Nutrición con Alma', to: '/nutricion-con-alma' },
  { label: 'Fluir Femenino', to: '/fluir-femenino' },
  { label: 'Contacto', to: '/contactanos' },
];

function FooterLink({ to, children }) {
  const isExternal = /^https?:/.test(to);
  if (isExternal) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-80 hover:opacity-100 hover:text-white transition-opacity"
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className="opacity-80 hover:opacity-100 hover:text-white transition-opacity">
      {children}
    </Link>
  );
}

export default function PlenoFooter() {
  return (
    <footer
      className="text-white/85 px-6 sm:px-10 lg:px-14 pt-14 pb-7 font-body text-[13px] leading-relaxed"
      style={{ backgroundColor: '#0A4D2E' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-10 lg:gap-12 pb-9 border-b border-white/15">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/media/pleno/logo-pleno.png" alt="Pleno" className="h-8 w-auto" />
              <span className="font-drama text-[26px] tracking-[0.02em] text-white">pleno</span>
            </div>
            <p className="max-w-[300px] opacity-75 m-0 leading-[1.6]">
              Suplementos, productos digitales y consultas con acompañamiento real. Una sola
              tienda para tu bienestar integral. Hecho en El Salvador.
            </p>
          </div>

          {/* Tienda */}
          <div>
            <h4 className="font-drama text-base font-medium tracking-[0.04em] text-white m-0 mb-3.5">
              Tienda
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2">
              {TIENDA_LINKS.map((l) => (
                <li key={l.label}>
                  <FooterLink to={l.to}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Pleno */}
          <div>
            <h4 className="font-drama text-base font-medium tracking-[0.04em] text-white m-0 mb-3.5">
              Pleno
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2">
              {PLENO_LINKS.map((l) => (
                <li key={l.label}>
                  <FooterLink to={l.to}>{l.label}</FooterLink>
                </li>
              ))}
              <li>
                <FooterLink to="https://www.instagram.com/nutrigabrielare/">Instagram</FooterLink>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-drama text-base font-medium tracking-[0.04em] text-white m-0 mb-3.5">
              Recibe nuestras novedades
            </h4>
            <p className="opacity-75 m-0 mb-3 leading-[1.6]">
              Una nota mensual sobre rituales, recetas y bienestar.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2"
            >
              <input
                type="email"
                placeholder="Tu correo"
                className="flex-1 px-4 py-2.5 rounded-full bg-transparent border border-white/30 text-white text-[12px] placeholder:text-white/55 focus:outline-none focus:border-white/60 transition-colors"
              />
              <button
                type="submit"
                aria-label="Suscribirme"
                className="grid place-items-center w-10 h-10 rounded-full bg-white text-[#16693d] hover:bg-white/90 transition-colors shrink-0"
              >
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row sm:justify-between gap-2 opacity-65 text-[11px] tracking-[0.04em]">
          <span>© {new Date().getFullYear()} Pleno · Hecho con cuidado en El Salvador</span>
          <span className="space-x-3">
            <Link to="/contactanos" className="hover:text-white transition-colors">Privacidad</Link>
            <span aria-hidden>·</span>
            <Link to="/contactanos" className="hover:text-white transition-colors">Términos</Link>
            <span aria-hidden>·</span>
            <Link to="/contactanos" className="hover:text-white transition-colors">Cookies</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
