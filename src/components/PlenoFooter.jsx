import React from 'react';
import { Link } from 'react-router-dom';
import { useStoreTheme } from '../context/StoreThemeContext';

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

const THEMES = {
  pleno: {
    bg: '#0A4D2E',
    logoSrc: '/media/pleno/logo-pleno.png',
    brandWord: 'pleno',
    brandLabel: 'Pleno',
    description:
      'Suplementos, productos digitales y consultas con acompañamiento real. Una sola tienda para tu bienestar integral. Hecho en El Salvador.',
    sectionTitle: 'Pleno',
    copyright: 'Pleno',
  },
  nutri: {
    bg: '#D6517B',
    // Use the brand wordmark for the rose theme so users immediately know
    // they're in the Nutrigabrielare side of the site.
    logoSrc: '/media/logo-header.png',
    brandWord: 'nutrigabrielare',
    brandLabel: 'Nutrigabrielare',
    description:
      'Recursos digitales y consultas 1:1 para acompañar tu bienestar — descargables al instante y acompañamiento real cuando lo necesitás.',
    sectionTitle: 'Nutrigabrielare',
    copyright: 'Nutrigabrielare',
  },
};

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

/**
 * Footer for both Pleno and Nutrigabrielare flows. Reads `theme` from
 * StoreThemeContext to pick the deep-green or deep-rose palette.
 */
export default function PlenoFooter() {
  const { theme } = useStoreTheme();
  const t = THEMES[theme === 'nutri' ? 'nutri' : 'pleno'];

  return (
    <footer
      className="text-white/85 px-6 sm:px-10 lg:px-14 pt-14 pb-7 font-body text-[13px] leading-relaxed"
      style={{ backgroundColor: t.bg }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-[1.8fr_1fr_1fr] gap-10 lg:gap-12 pb-9 border-b border-white/15">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src={t.logoSrc} alt={t.brandLabel} className="h-8 w-auto" />
              <span className="font-drama text-[26px] tracking-[0.02em] text-white">
                {t.brandWord}
              </span>
            </div>
            <p className="max-w-[300px] opacity-75 m-0 leading-[1.6]">{t.description}</p>
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

          {/* Brand section */}
          <div>
            <h4 className="font-drama text-base font-medium tracking-[0.04em] text-white m-0 mb-3.5">
              {t.sectionTitle}
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
        </div>

        <div className="pt-5 flex flex-col sm:flex-row sm:justify-between gap-2 opacity-65 text-[11px] tracking-[0.04em]">
          <span>© {new Date().getFullYear()} {t.copyright} · Hecho con cuidado en El Salvador</span>
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
