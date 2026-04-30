import React, { Suspense, useEffect } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ConfigurationErrorScreen from './components/ConfigurationErrorScreen';
import {
  hasRequiredPublicRuntimeConfig,
  missingPublicRuntimeVarDetails,
} from './config/runtimeConfig';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import PlenoLandingPage from './pages/PlenoLandingPage';
import PlenoCategoryPage from './pages/PlenoCategoryPage';
import NutricionConAlmaPage from './pages/NutricionConAlmaPage';
import ContactanosPage from './pages/ContactanosPage';
import ComunidadPage from './pages/ComunidadPage';
import ProductoPage from './pages/ProductoPage';
import ReservarPage from './pages/ReservarPage';
import CarritoPage from './pages/CarritoPage';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import CheckoutPage from './pages/CheckoutPage';
import GraciasPage from './pages/GraciasPage';
import TrackingPage from './pages/TrackingPage';
import CuentaPage from './pages/CuentaPage';
import NotFoundPage from './pages/NotFoundPage';

gsap.registerPlugin(ScrollTrigger);

// ── Lazy-loaded admin pages ──
const AdminLoginPage = React.lazy(() => import('./admin/pages/AdminLoginPage'));
const AdminDashboard = React.lazy(() => import('./admin/pages/AdminDashboard'));
const AdminProductos = React.lazy(() => import('./admin/pages/AdminProductos'));
const AdminProductoForm = React.lazy(() => import('./admin/pages/AdminProductoForm'));
const AdminCategorias = React.lazy(() => import('./admin/pages/AdminCategorias'));
const AdminOrdenes = React.lazy(() => import('./admin/pages/AdminOrdenes'));
const AdminOrdenDetalle = React.lazy(() => import('./admin/pages/AdminOrdenDetalle'));
const AdminReservas = React.lazy(() => import('./admin/pages/AdminReservas'));
const AdminUsuarios = React.lazy(() => import('./admin/pages/AdminUsuarios'));
const AdminHomePage = React.lazy(() => import('./admin/pages/AdminHomePage'));
const AdminRoute = React.lazy(() => import('./admin/components/AdminRoute'));

function AdminSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);
  return null;
}

function AppContent() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <>
      <svg className="noise-overlay pointer-events-none fixed inset-0 z-[9999] h-full w-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
      </svg>

      <main className="min-h-screen bg-background relative selection:bg-accent selection:text-white">
        {!isAdminRoute && <Navbar />}
        <ScrollToTop />
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/pleno" element={<PlenoLandingPage />} />
          <Route path="/pleno/:kindSlug" element={<PlenoCategoryPage />} />
          <Route path="/tienda" element={<Navigate to="/pleno" replace />} />
          <Route path="/tienda/*" element={<Navigate to="/pleno" replace />} />
          <Route
            path="/donacion"
            element={<Navigate to="/nutricion-con-alma" replace />}
          />
          <Route
            path="/proyecto-banquita"
            element={<Navigate to="/nutricion-con-alma" replace />}
          />
          <Route
            path="/nutricion-con-alma"
            element={<NutricionConAlmaPage />}
          />
          <Route path="/comunidad" element={<ComunidadPage />} />
          <Route path="/contactanos" element={<ContactanosPage />} />
          <Route path="/producto/:slug" element={<ProductoPage />} />
          <Route path="/reservar/:slug" element={<ProtectedRoute><ReservarPage /></ProtectedRoute>} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/gracias" element={<GraciasPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/tracking/:code" element={<TrackingPage />} />
          <Route path="/cuenta" element={<ProtectedRoute><CuentaPage /></ProtectedRoute>} />

          {/* ── Admin routes ── */}
          <Route path="/admin/login" element={<Suspense fallback={<AdminSpinner />}><AdminLoginPage /></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','editor','gestor']}><AdminDashboard /></AdminRoute></Suspense>} />
          <Route path="/admin/home" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','editor']}><AdminHomePage /></AdminRoute></Suspense>} />
          <Route path="/admin/productos" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','editor']}><AdminProductos /></AdminRoute></Suspense>} />
          <Route path="/admin/productos/nuevo" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','editor']}><AdminProductoForm /></AdminRoute></Suspense>} />
          <Route path="/admin/productos/:id" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','editor']}><AdminProductoForm /></AdminRoute></Suspense>} />
          <Route path="/admin/categorias" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','editor']}><AdminCategorias /></AdminRoute></Suspense>} />
          <Route path="/admin/ordenes" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','gestor']}><AdminOrdenes /></AdminRoute></Suspense>} />
          <Route path="/admin/ordenes/:id" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','gestor']}><AdminOrdenDetalle /></AdminRoute></Suspense>} />
          <Route path="/admin/reservas" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','gestor']}><AdminReservas /></AdminRoute></Suspense>} />
          <Route path="/admin/usuarios" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin']}><AdminUsuarios /></AdminRoute></Suspense>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <CartDrawer />}
      </main>
    </>
  );
}

export default function App() {
  if (!hasRequiredPublicRuntimeConfig) {
    return (
      <ConfigurationErrorScreen missingVars={missingPublicRuntimeVarDetails} />
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
