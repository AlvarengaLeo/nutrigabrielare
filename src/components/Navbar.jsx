import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import CartIcon from './CartIcon';

const navItems = [
  { label: 'Inicio', path: '/' },
  { label: 'Tienda', path: '/tienda' },
  { label: 'Proyecto Banquita', path: '/proyecto-banquita' },
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
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
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

      <div className="hidden md:flex items-center gap-4">
        <CartIcon />
        <Link to="/contactanos" className="magnetic-btn px-6 py-2.5 rounded-full bg-primary text-background font-medium text-sm flex items-center justify-center">
          <span className="relative z-10 transition-colors">Contáctanos</span>
        </Link>
      </div>

      <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[calc(100%+1rem)] left-0 w-full bg-background border border-primary/10 rounded-3xl p-6 shadow-xl flex flex-col space-y-4 md:hidden backdrop-blur-xl">
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
