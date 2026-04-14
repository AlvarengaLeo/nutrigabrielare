import React from 'react';
import { Link } from 'react-router-dom';

const navItems = [
  { label: 'Inicio', path: '/' },
  { label: 'Tienda', path: '/tienda' },
  { label: 'Nutrición con Alma', path: '/nutricion-con-alma' },
];

const communityLinks = [
  { name: 'Instagram', url: 'https://www.instagram.com/nutrigabrielare/' },
  { name: 'Comunidad', url: '/comunidad' },
  { name: 'Términos y Condiciones', url: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-background py-16 md:py-24 rounded-t-[4rem] mt-10 w-full relative z-20 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          <div className="md:col-span-5 flex flex-col items-start pr-0 md:pr-10">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-6 tracking-tight text-highlight">
              Gabriela Retana
            </h2>
            <p className="font-body text-lg md:text-xl text-background/80 leading-relaxed max-w-md mb-8">
              Especialista en salud hormonal de la mujer con enfoque holístico. Te acompaño a lograr tus objetivos cuidando tu cuerpo, mente y alma.
            </p>
            <a href="https://wa.me/50376284719" target="_blank" rel="noopener noreferrer" className="magnetic-btn inline-flex items-center justify-center px-8 py-3 rounded-full bg-accent text-white font-medium text-sm transition-transform hover:scale-105 shadow-lg shadow-accent/20">
              <span className="relative z-10">Agenda tu Cita Ahora</span>
            </a>
          </div>
          
          <div className="md:col-span-3">
            <h4 className="font-heading font-bold mb-6 text-white/50 uppercase tracking-widest text-sm">Sitio & Comunidad</h4>
            <ul className="space-y-4 font-body mb-8">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="hover-lift inline-block text-white/80 hover:text-accent transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-4 font-body">
              {communityLinks.map((link) => (
                <li key={link.name}>
                  {link.url.startsWith('/') ? (
                    <Link to={link.url} className="hover-lift inline-block text-white/80 hover:text-accent transition-colors">
                      {link.name}
                    </Link>
                  ) : (
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover-lift inline-block text-white/80 hover:text-accent transition-colors">
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-4">
            <h4 className="font-heading font-bold mb-6 text-white/50 uppercase tracking-widest text-sm">Ubicación y Atención</h4>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
              <p className="font-body text-white/90 leading-relaxed mb-6">
                <strong className="text-accent block mb-1">Presencial</strong>
                Santa Ana, El Salvador.<br/>
              </p>
              <p className="font-body text-white/90 leading-relaxed">
                <strong className="text-accent block mb-1">Online</strong>
                Cobertura Nacional e Internacional para que logres tus metas desde cualquier lugar del mundo.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-body text-background/40 text-sm">
            © Gabriela Retana 2026. Todos los derechos reservados.
          </div>
          <div className="flex items-center space-x-3 text-sm font-body text-background/60">
            <span>Consultas activas</span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-health opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-health"></span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
