import React from 'react';
import { Link } from 'react-router-dom';

const navItems = [
  { label: 'Inicio', path: '/' },
  { label: 'Tienda', path: '/tienda' },
  { label: 'Proyecto Banquita', path: '/proyecto-banquita' },
  { label: 'Contáctanos', path: '/contactanos' },
];

const communityLinks = [
  { name: 'Instagram', url: 'https://www.instagram.com/majesdesivar/' },
  { name: 'YouTube', url: 'https://www.youtube.com/@majesdesivar' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@majesdesivarr' },
  { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61562686467881' },
  { name: 'Kick', url: 'https://kick.com/majesdesivar' },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-[#F5F0EB] py-16 md:py-24 rounded-t-[4rem] mt-10 w-full relative z-20 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          <div className="md:col-span-6 flex flex-col items-start pr-0 md:pr-16">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-6 tracking-tight">
              Majes de Sivar
            </h2>
            <p className="font-drama italic text-xl md:text-2xl text-white/60 leading-relaxed max-w-md">
              "Y mientras tengamos algo que contar y de qué reírnos... seguiremos siendo Majes de Sivar."
            </p>
          </div>
          
          <div className="md:col-span-3">
            <h4 className="font-heading font-bold mb-6 text-white/50 uppercase tracking-widest text-sm">Sitio</h4>
            <ul className="space-y-4 font-body">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="hover-lift inline-block text-white/80 hover:text-accent transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-3">
            <h4 className="font-heading font-bold mb-6 text-white/50 uppercase tracking-widest text-sm">Comunidad</h4>
            <ul className="space-y-4 font-body">
              {communityLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover-lift inline-block text-white/80 hover:text-accent transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-body text-white/40 text-sm">
            © Majes de Sivar 2026
          </div>
          <div className="flex items-center space-x-3 text-sm font-body text-white/60">
            <span>Hermandad activa</span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
