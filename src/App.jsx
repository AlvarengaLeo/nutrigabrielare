import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TiendaPage from './pages/TiendaPage';
import DonacionPage from './pages/DonacionPage';
import ContactanosPage from './pages/ContactanosPage';
import ComunidadPage from './pages/ComunidadPage';

gsap.registerPlugin(ScrollTrigger);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <svg className="noise-overlay pointer-events-none fixed inset-0 z-[9999] h-full w-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
      </svg>
      
      <main className="min-h-screen bg-background relative selection:bg-accent selection:text-white">
        <Navbar />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tienda" element={<TiendaPage />} />
          <Route path="/donacion" element={<DonacionPage />} />
          <Route path="/comunidad" element={<ComunidadPage />} />
          <Route path="/contactanos" element={<ContactanosPage />} />
        </Routes>
        <Footer />
      </main>
    </>
  );
}
