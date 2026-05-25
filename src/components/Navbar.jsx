import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import CartIcon from './CartIcon';

const navItems = [
  { label: 'Inicio', path: '/' },
  { label: 'Nutrigabrielare', path: '/nutrigabrielare' },
  { label: 'Pleno', path: '/pleno' },
  { label: 'Fluir Femenino', path: '/fluir-femenino' },
];

const PLENO_NAV_BG = '#16693d';
const PLENO_NAV_BG_TOP = '#f1f0ef';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const PLENO_FLOW_PATHS = ['/pleno', '/producto', '/carrito', '/checkout', '/gracias', '/tracking', '/cuenta'];
  const isPleno = PLENO_FLOW_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`)
  );
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

  const navClass = isPleno
    ? scrolled
      ? 'backdrop-blur-xl shadow-lg text-white'
      : 'shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] text-[#16693d]'
    : scrolled
      ? 'bg-background/80 backdrop-blur-xl border border-primary/10 shadow-lg text-primary'
      : 'bg-transparent text-primary';

  const navStyle = isPleno
    ? { backgroundColor: scrolled ? PLENO_NAV_BG : PLENO_NAV_BG_TOP }
    : undefined;

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

  return (
    <nav
      style={navStyle}
      className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 w-[90%] max-w-5xl rounded-full transition-all duration-500 flex items-center justify-between px-6 py-4 ${navClass}`}
    >
      {/* Logo Container */}
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
            className={`hover-lift transition-colors ${
              isPleno
                ? scrolled
                  ? `hover:text-white/70 ${location.pathname === item.path ? 'text-white' : 'text-white/85'}`
                  : `hover:text-[#0A4D2E] ${location.pathname === item.path ? 'text-[#0A4D2E] font-semibold' : 'text-[#16693d]'}`
                : `hover:text-accent ${location.pathname === item.path ? 'text-accent' : ''}`
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Right Actions */}
      <div className="hidden md:flex items-center justify-end md:flex-1 gap-6">
        <CartIcon isLight={isPleno && scrolled} />
        <a
          href="https://wa.me/50376284719"
          target="_blank"
          rel="noopener noreferrer"
          className={`magnetic-btn px-5 py-2.5 rounded-full font-bold text-sm flex items-center justify-center transition-colors ${
            isPleno
              ? scrolled
                ? 'bg-white text-[#16693d] hover:bg-white/90'
                : 'bg-[#16693d] text-white hover:bg-[#11623a]'
              : !scrolled && location.pathname === '/'
                ? 'bg-background text-primary hover:bg-white'
                : 'bg-primary text-background hover:bg-primary/90'
          }`}
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
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const linkClass = isPleno
              ? active
                ? 'text-[#0A4D2E] font-semibold'
                : 'text-[#16693d]'
              : active
                ? 'text-accent'
                : 'text-primary';
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`font-heading text-lg ${linkClass}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
