import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import TiendaPage from './pages/TiendaPage';
import DonacionPage from './pages/DonacionPage';
import ContactanosPage from './pages/ContactanosPage';
import ComunidadPage from './pages/ComunidadPage';
import ProductoPage from './pages/ProductoPage';
import CarritoPage from './pages/CarritoPage';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import CheckoutPage from './pages/CheckoutPage';
import GraciasPage from './pages/GraciasPage';
import TrackingPage from './pages/TrackingPage';
import CuentaPage from './pages/CuentaPage';
import NotFoundPage from './pages/NotFoundPage';

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
    <AuthProvider>
      <CartProvider>
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
            <Route path="/producto/:slug" element={<ProductoPage />} />
            <Route path="/carrito" element={<CarritoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/gracias" element={<ProtectedRoute><GraciasPage /></ProtectedRoute>} />
            <Route path="/tracking/:code" element={<TrackingPage />} />
            <Route path="/cuenta" element={<ProtectedRoute><CuentaPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Footer />
          <CartDrawer />
        </main>
      </CartProvider>
    </AuthProvider>
  );
}
