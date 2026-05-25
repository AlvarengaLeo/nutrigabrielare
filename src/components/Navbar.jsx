import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import CartIcon from './CartIcon';
import { useStoreTheme } from '../context/StoreThemeContext';

const navItems = [
  { label: 'Inicio', path: '/' },
  { label: 'Nutrigabrielare', path: '/nutrigabrielare' },
  { label: 'Pleno', path: '/pleno' },
  { label: 'Fluir Femenino', path: '/fluir-femenino' },
];

const PLENO_NAV_BG = '#16693d';
const PLENO_NAV_BG_TOP = '#f1f0ef';
const NUTRI_NAV_BG = '#7A1838';
const NUTRI_NAV_BG_TOP = '#FCF6F7';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme } = useStoreTheme();
  const isPleno = theme === 'pleno';
  const isNutri = theme === 'nutri';
  const isFluir =
    location.pathname === '/fluir-femenino' ||
    location.pathname.startsWith('/fluir-femenino/');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  let navClass;
  let navStyle;
  if (isPleno) {
    navClass = scrolled
      ? 'backdrop-blur-xl shadow-lg text-white'
      : 'shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] text-[#16693d]';
    navStyle = { backgroundColor: scrolled ? PLENO_NAV_BG : PLENO_NAV_BG_TOP };
  } else if (isNutri) {
    navClass = scrolled
      ? 'backdrop-blur-xl shadow-lg text-white'
      : 'shadow-[0_8px_24px_-12px_rgba(0,0,0,0.10)] text-[#7A1838]';
    navStyle = { backgroundColor: scrolled ? NUTRI_NAV_BG : NUTRI_NAV_BG_TOP };
  } else {
    navClass = scrolled
      ? 'bg-background/80 backdrop-blur-xl border border-primary/10 shadow-lg text-primary'
      : 'bg-transparent text-primary';
    navStyle = undefined;
  }

  const logoSrc = isPleno
    ? scrolled
      ? '/media/pleno/logo-pleno-light.png'
      : '/media/pleno/logo-pleno-dark.png'
    : isFluir
      ? '/media/fluir-femenino/logo-fluir-rosado.png'
      : '/media/logo-header.png';
  const logoAlt = isPleno
    ? 'Pleno'
    : isFluir
      ? 'Fluir Femenino'
      : 'Gabriela Retana Logo';

  // Per-theme link colors
  const itemClass = (active) => {
    if (isPleno) {
      return scrolled
        ? `hover:text-white/70 ${active ? 'text-white' : 'text-white/85'}`
        : `hover:text-[#0A4D2E] ${active ? 'text-[#0A4D2E] font-semibold' : 'text-[#16693d]'}`;
    }
    if (isNutri) {
      return scrolled
        ? `hover:text-white/70 ${active ? 'text-white' : 'text-white/85'}`
        : `hover:text-[#5A1228] ${active ? 'text-[#5A1228] font-semibold' : 'text-[#7A1838]'}`;
    }
    return `hover:text-accent ${active ? 'text-accent' : ''}`;
  };

  // Per-theme CTA ("Contactar")
  let ctaClass;
  if (isPleno) {
    ctaClass = scrolled
      ? 'bg-white text-[#16693d] hover:bg-white/90'
      : 'bg-[#16693d] text-white hover:bg-[#11623a]';
  } else if (isNutri) {
    ctaClass = scrolled
      ? 'bg-white text-[#7A1838] hover:bg-white/90'
      : 'bg-[#7A1838] text-white hover:bg-[#5A1228]';
  } else {
    ctaClass = !scrolled && location.pathname === '/'
      ? 'bg-background text-primary hover:bg-white'
      : 'bg-primary text-background hover:bg-primary/90';
  }

  // Mobile menu link color
  const mobileLinkClass = (active) => {
    if (isPleno) {
      return active ? 'text-[#0A4D2E] font-semibold' : 'text-[#16693d]';
    }
    if (isNutri) {
      return active ? 'text-[#5A1228] font-semibold' : 'text-[#7A1838]';
    }
    return active ? 'text-accent' : 'text-primary';
  };

  return (
    <nav
      style={navStyle}
      className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 w-[90%] max-w-5xl rounded-full transition-all duration-500 flex items-center justify-between px-6 py-4 ${navClass}`}
    >
      {/* Logo */}
      <div className="flex items-center md:flex-1">
        <Link to="/">
          <img
            src={logoSrc}
            alt={logoAlt}
            className={`${isPleno ? 'h-[40px] md:h-[50px]' : 'h-[38px] md:h-[44px]'} w-auto object-contain transition-all duration-300`}
          />
        </Link>
      </div>

      {/* Center Nav Items */}
      <div className="hidden md:flex items-center justify-center space-x-8 text-sm font-medium">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`hover-lift transition-colors ${itemClass(location.pathname === item.path)}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Right Actions */}
      <div className="hidden md:flex items-center justify-end md:flex-1 gap-6">
        <CartIcon isLight={(isPleno || isNutri) && scrolled} />
        <a
          href="https://wa.me/50376284719"
          target="_blank"
          rel="noopener noreferrer"
          className={`magnetic-btn px-5 py-2.5 rounded-full font-bold text-sm flex items-center justify-center transition-colors ${ctaClass}`}
        >
          <span className="relative z-10 flex items-center gap-1">Contactar <ArrowUpRight className="w-4 h-4" /></span>
        </a>
      </div>

      <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[calc(100%+1rem)] left-0 w-full bg-background border border-primary/10 rounded-3xl p-6 shadow-xl flex flex-col space-y-4 md:hidden backdrop-blur-xl">
          <div className="flex justify-center mb-4">
            <img
              src={isPleno ? '/media/pleno/logo-pleno-dark.png' : logoSrc}
              alt={logoAlt}
              className={`${isPleno ? 'h-10' : 'h-12'} w-auto object-contain`}
            />
          </div>
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`font-heading text-lg ${mobileLinkClass(location.pathname === item.path)}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
