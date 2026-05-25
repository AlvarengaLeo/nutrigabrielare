import React, { Suspense, useEffect } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ConfigurationErrorScreen from './components/ConfigurationErrorScreen';
import {
  hasRequiredPublicRuntimeConfig,
  missingPublicRuntimeVarDetails,
} from './config/runtimeConfig';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { StoreThemeProvider, useStoreTheme } from './context/StoreThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PlenoFooter from './components/PlenoFooter';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import PlenoLandingPage from './pages/PlenoLandingPage';
import PlenoCategoryPage from './pages/PlenoCategoryPage';
import NutrigabrielareLandingPage from './pages/NutrigabrielareLandingPage';
import ContactanosPage from './pages/ContactanosPage';
import FluirFemeninoPage from './pages/FluirFemeninoPage';
const FluirFemeninoV2Page = React.lazy(() => import('./pages/FluirFemeninoV2Page'));
const FluirFemeninoArchivePage = React.lazy(() => import('./pages/FluirFemeninoArchivePage'));
const FluirFemeninoPostPage = React.lazy(() => import('./pages/FluirFemeninoPostPage'));
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
const AdminEnvios = React.lazy(() => import('./admin/pages/AdminEnvios'));
const AdminUsuarios = React.lazy(() => import('./admin/pages/AdminUsuarios'));
const AdminEmails = React.lazy(() => import('./admin/pages/AdminEmails'));
const AdminHomePage = React.lazy(() => import('./admin/pages/AdminHomePage'));
const AdminBlog = React.lazy(() => import('./admin/pages/AdminBlog'));
const AdminBlogForm = React.lazy(() => import('./admin/pages/AdminBlogForm'));
const AdminRoute = React.lazy(() => import('./admin/components/AdminRoute'));

function AdminSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

function PageSpinner() {
  return (
    <div className="min-h-screen bg-fluir-mist flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-fluir-magenta/20 border-t-fluir-magenta rounded-full animate-spin" />
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
  const PLENO_FLOW_PATHS = ['/pleno', '/producto', '/carrito', '/checkout', '/gracias', '/tracking', '/cuenta'];
  const isPlenoRoute = PLENO_FLOW_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isNutriRoute = pathname === '/nutrigabrielare' || pathname.startsWith('/nutrigabrielare/');

  // Drive the store theme from the route. /pleno* and the post-catalog flow
  // (carrito, checkout, gracias, tracking, cuenta) lock to 'pleno'.
  // /nutrigabrielare* locks to 'nutri'. /producto/:slug is special: the page
  // itself overrides this based on the loaded product's kind, so we don't
  // force a value here.
  const { theme, setTheme } = useStoreTheme();
  useEffect(() => {
    const isProductRoute = pathname === '/producto' || pathname.startsWith('/producto/');
    if (isProductRoute) return; // ProductoPage takes over
    if (isNutriRoute) {
      setTheme('nutri');
    } else if (isPlenoRoute) {
      setTheme('pleno');
    } else {
      setTheme(null);
    }
  }, [pathname, isNutriRoute, isPlenoRoute, setTheme]);

  const showStoreFooter = isPlenoRoute || isNutriRoute || theme === 'nutri' || theme === 'pleno';

  return (
    <>
      <svg className="noise-overlay pointer-events-none fixed inset-0 z-[9999] h-full w-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
      </svg>

      <main className="min-h-screen bg-background relative">
        {!isAdminRoute && <Navbar />}
        <ScrollToTop />
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/nutrigabrielare" element={<NutrigabrielareLandingPage />} />
          <Route path="/pleno" element={<PlenoLandingPage />} />
          <Route path="/pleno/suplementos" element={<Navigate to="/pleno" replace />} />
          <Route path="/pleno/:kindSlug" element={<PlenoCategoryPage />} />
          <Route path="/tienda" element={<Navigate to="/pleno" replace />} />
          <Route path="/tienda/*" element={<Navigate to="/pleno" replace />} />
          <Route path="/donacion" element={<Navigate to="/fluir-femenino" replace />} />
          <Route path="/proyecto-banquita" element={<Navigate to="/fluir-femenino" replace />} />
          <Route path="/nutricion-con-alma" element={<Navigate to="/fluir-femenino" replace />} />
          <Route path="/fluir-femenino" element={<FluirFemeninoPage />} />
          <Route path="/fluir-femenino-v2" element={<Suspense fallback={<PageSpinner />}><FluirFemeninoV2Page /></Suspense>} />
          <Route path="/fluir-femenino/articulos" element={<Suspense fallback={<PageSpinner />}><FluirFemeninoArchivePage /></Suspense>} />
          <Route path="/fluir-femenino/articulos/:slug" element={<Suspense fallback={<PageSpinner />}><FluirFemeninoPostPage /></Suspense>} />
          <Route path="/comunidad" element={<Navigate to="/fluir-femenino" replace />} />
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
          <Route path="/admin/fluir-femenino" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','editor']}><AdminBlog /></AdminRoute></Suspense>} />
          <Route path="/admin/fluir-femenino/nuevo" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','editor']}><AdminBlogForm /></AdminRoute></Suspense>} />
          <Route path="/admin/fluir-femenino/:id" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','editor']}><AdminBlogForm /></AdminRoute></Suspense>} />
          <Route path="/admin/productos" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','editor']}><AdminProductos /></AdminRoute></Suspense>} />
          <Route path="/admin/productos/nuevo" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','editor']}><AdminProductoForm /></AdminRoute></Suspense>} />
          <Route path="/admin/productos/:id" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','editor']}><AdminProductoForm /></AdminRoute></Suspense>} />
          <Route path="/admin/categorias" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','editor']}><AdminCategorias /></AdminRoute></Suspense>} />
          <Route path="/admin/ordenes" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','gestor']}><AdminOrdenes /></AdminRoute></Suspense>} />
          <Route path="/admin/ordenes/:id" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','gestor']}><AdminOrdenDetalle /></AdminRoute></Suspense>} />
          <Route path="/admin/reservas" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','gestor']}><AdminReservas /></AdminRoute></Suspense>} />
          <Route path="/admin/envios" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin','gestor']}><AdminEnvios /></AdminRoute></Suspense>} />
          <Route path="/admin/usuarios" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin']}><AdminUsuarios /></AdminRoute></Suspense>} />
          <Route path="/admin/emails" element={<Suspense fallback={<AdminSpinner />}><AdminRoute allowedRoles={['admin']}><AdminEmails /></AdminRoute></Suspense>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        {!isAdminRoute && (showStoreFooter ? <PlenoFooter /> : <Footer />)}
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
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <StoreThemeProvider>
            <AppContent />
            <Analytics />
          </StoreThemeProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
