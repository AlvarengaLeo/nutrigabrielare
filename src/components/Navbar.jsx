import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import CartIcon from './CartIcon';

const navItems = [
  { label: 'Inicio', path: '/' },
  { label: 'Tienda', path: '/tienda' },
  { label: 'Nutrición con Alma', path: '/nutricion-con-alma' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  return (
    <nav className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 w-[90%] max-w-5xl rounded-full transition-all duration-500 flex items-center justify-between px-6 py-4 ${scrolled ? 'bg-background/80 backdrop-blur-xl border border-primary/10 shadow-lg' : 'bg-transparent text-primary'}`}>
      {/* Logo Container */}
      <div className="flex items-center md:flex-1">
        <Link to="/">
          <img src="/media/logo-header.png" alt="Gabriela Retana Logo" className="h-[38px] md:h-[44px] w-auto object-contain transition-all duration-300" />
        </Link>
      </div>

      {/* Center Nav Items */}
      <div className="hidden md:flex items-center justify-center space-x-8 text-sm font-medium">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`hover-lift hover:text-accent transition-colors ${location.pathname === item.path ? 'text-accent' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Right Actions */}
      <div className="hidden md:flex items-center justify-end md:flex-1 gap-6">
        <CartIcon isLight={!scrolled && location.pathname === '/'} />
        <a 
          href="https://wa.me/50376284719" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`magnetic-btn px-5 py-2.5 rounded-full font-bold text-sm flex items-center justify-center transition-colors ${
            !scrolled && location.pathname === '/' 
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
            <img src="/media/logo-header.png" alt="Gabriela Retana Logo" className="h-12 w-auto object-contain" />
          </div>
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`font-heading text-lg ${location.pathname === item.path ? 'text-accent' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
