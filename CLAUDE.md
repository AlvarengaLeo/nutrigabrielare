# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — ESLint

No test framework is configured.

## Architecture

**Vite + React 19 SPA** with React Router DOM v7 for client-side routing. Styled with Tailwind CSS 3. Animated with GSAP + ScrollTrigger.

### Routing (src/App.jsx)

| Route | Page |
|-------|------|
| `/` | HomePage (Hero, Features, Philosophy, Protocol, Membership sections) |
| `/tienda` | TiendaPage |
| `/donacion` | DonacionPage |
| `/contactanos` | ContactanosPage |
| `/comunidad` | ComunidadPage |

Navbar and Footer render on all routes. `ScrollToTop` component resets scroll and refreshes ScrollTrigger on route changes.

### Project Structure

- `src/components/` — Shared components (Navbar, Footer) and homepage sections (Hero, Features, Philosophy, Protocol, Membership)
- `src/pages/` — Page-level components, one per route
- `public/` — Static assets (logo.png, favicons, site.webmanifest)

### Design System (tailwind.config.js)

- **Colors:** `background` (#F5F0EB cream), `dark` (#111111), `accent` (#9fc2ff blue), `primary` (#1A1A1A)
- **Fonts:** `font-heading` (Plus Jakarta Sans), `font-drama` (Cormorant Garamond), `font-body` (Outfit) — loaded via Google Fonts in index.html
- **Custom CSS:** `.magnetic-btn` and `.hover-lift` utilities in src/index.css
- Global SVG noise overlay at z-[9999] with 5% opacity in App.jsx

### GSAP Animation Pattern

Every animated component follows this pattern — always use it for new animations:

```jsx
useEffect(() => {
  const ctx = gsap.context(() => {
    // animations with ScrollTrigger here
  }, containerRef);
  return () => ctx.revert();
}, []);
```

Key conventions: `power3.out` easing for entrances, 0.08s stagger for text, 0.12-0.15s for cards.

## Deployment

Deployed on Vercel. `.npmrc` has `legacy-peer-deps=true` for React 19 peer dependency compatibility. `package.json` has `overrides` for react/react-dom to enforce v19.

## Language

This is a Spanish-language site (El Salvador brand). All user-facing text should be in Spanish.

## Tienda Pública — Design Decisions (Approved)

### New Routes

| Route | Page | Auth |
|-------|------|------|
| `/tienda` | TiendaPage (MODIFY — expandable categories) | Public |
| `/producto/:slug` | ProductoPage | Public |
| `/carrito` | CarritoPage | Public |
| `/login` | LoginPage | Public |
| `/registro` | RegistroPage | Public |
| `/checkout` | CheckoutPage | Protected 🔒 |
| `/gracias` | GraciasPage | Protected 🔒 |
| `/tracking/:code` | TrackingPage | Public |
| `/cuenta` | CuentaPage | Protected 🔒 |

### Category Expansion (TiendaPage)

Hybrid approach: 3 category cards **keep their original design**. Active card gets `border-accent/30 shadow-lg`, inactive cards dim to `opacity-0.6`. A collection panel renders **below** the card grid with category header, accent divider, and product grid. One active category at a time. GSAP animations on card transitions + panel entrance + product stagger.

### Product Detail (/producto/:slug)

Dedicated route (not modal). Includes: image gallery with thumbnails, variant selectors (size + color), stock indicator, "Agregar al carrito" CTA. Breadcrumb navigation.

### Cart System

- **CartContext** (React Context) — global state with `addItem`, `removeItem`, `updateQuantity`, `clearCart`. Persisted in `localStorage` (migrates to Supabase later).
- **CartDrawer** — slide-in sidebar from right for quick view after adding product.
- **CarritoPage** — full page with item list, quantity controls, summary panel, CTA to checkout.
- **CartIcon** — in Navbar with item count badge.

### Product Variants

Each product supports **size + color** variants. Sizes: S, M, L, XL. Colors: name + hex value. Each combination is a selectable option on the product detail page.

### Checkout (/checkout)

- **Login required** — redirects to `/login` if not authenticated, then back to checkout.
- **Delivery: only "Envío a domicilio"** — no pickup option.
- **Fields:** contact data (pre-filled from account), phone, full address (dirección, ciudad, departamento, indicaciones), optional notes.
- **Order summary** sidebar with item list + totals.
- **CTA:** "Pagar con Wompi" (prepared for integration, placeholder for now).

### Order Tracking

- Each order generates a unique tracking code (format: `MJS-YYYY-NNNN-TRK`).
- **TrackingPage** (`/tracking/:code`) — public page with search bar + timeline visualization. States: Confirmada → Preparando → En camino → Entregado.
- Tracking code shown on GraciasPage + sent via confirmation email.

### Auth (Supabase Auth)

- **Registration:** minimal — nombre, apellido, correo, contraseña. Google OAuth supported.
- **Login:** email/password + Google OAuth. Split layout with brand panel (logo + tagline) on left.
- Users stored in Supabase `profiles` table, visible in admin panel.
- Login is **required before checkout**, not before browsing or adding to cart.

### Confirmation Email

Post-purchase email sent automatically with: Majes logo/banner, order summary, tracking number, "Rastrear pedido" CTA link, social media links in footer.

### User Account (/cuenta)

Protected page showing: user email, list of past orders with status badges and tracking codes. Each order links to its tracking page.

### New File Structure

```
src/
├── data/
│   ├── products.js           ← mock product data (replaced by Supabase later)
│   └── orders.js             ← order utilities: create, read, update in localStorage
├── context/
│   ├── CartContext.jsx        ← cart provider + useCart() hook
│   └── AuthContext.jsx        ← mock auth state (replaced by Supabase Auth in Phase 2)
├── components/
│   ├── CartDrawer.jsx         ← sidebar slide-in mini-cart
│   ├── CartIcon.jsx           ← navbar badge
│   ├── ProductCard.jsx        ← reusable product card
│   ├── VariantSelector.jsx    ← size + color picker
│   └── ProtectedRoute.jsx     ← auth gate wrapper for protected routes
├── pages/
│   ├── TiendaPage.jsx         ← MODIFY (expandable categories)
│   ├── ProductoPage.jsx       ← NEW
│   ├── CarritoPage.jsx        ← NEW
│   ├── CheckoutPage.jsx       ← NEW
│   ├── GraciasPage.jsx        ← NEW
│   ├── TrackingPage.jsx       ← NEW
│   ├── LoginPage.jsx          ← NEW
│   ├── RegistroPage.jsx       ← NEW
│   └── CuentaPage.jsx         ← NEW
├── templates/
│   └── confirmation-email.html ← email HTML template
└── App.jsx                    ← MODIFY (routes + CartProvider + AuthProvider)
```

### Route Notes

- Public user auth uses `/login` and `/registro`. Admin login (Phase 3) will use `/admin/login` to avoid conflict.

### Sub-project Phases

1. **Fase 1:** Tienda pública — UI completa con mock data, carrito, auth pages
2. **Fase 2:** Supabase schema + auth + storage + real data
3. **Fase 3:** Panel admin — login, CRUD productos, órdenes, usuarios
4. **Fase 4 (current):** Wompi integration — Payment Links, webhooks, Vercel serverless functions

## Phase 2 — Supabase Backend (Current)

### Environment Variables

**Frontend (.env, VITE_ prefix):**
```
VITE_SUPABASE_URL — Supabase project URL
VITE_SUPABASE_ANON_KEY — Supabase publishable/anon key
VITE_WOMPI_APP_ID — Wompi App ID (public)
```

**Backend (Vercel dashboard, no VITE_ prefix):**
```
WOMPI_APP_ID — Wompi App ID
WOMPI_API_SECRET — Wompi API Secret (server-side only)
WOMPI_EVENT_SECRET — Wompi webhook signature secret
SUPABASE_URL — Supabase project URL
SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (bypasses RLS)
APP_URL — Production URL (e.g., https://majesdesiver.com)
```

Frontend vars stored in `.env` (gitignored). Backend vars set in Vercel dashboard.

### Supabase Client

`src/lib/supabase.js` — initializes and exports the Supabase client.

### Service Layer Pattern

- `src/services/productService.js` — wraps Supabase queries for products + categories. Transforms DB snake_case to UI camelCase. Adds `variantStock` map for per-variant stock.
- `src/services/orderService.js` — wraps Supabase queries for orders. Uses `generate_order_id()` RPC for MJS-YYYY-NNNN format.

### Auth

Supabase Auth (not mock localStorage). `src/context/AuthContext.jsx` uses `onAuthStateChange` for session management. `loading` state prevents redirect flash. Supports email/password + Google OAuth.

### Stock Model

Phase 1 used product-level stock (single number). Phase 2 uses **per-variant stock** via `product_variants` table (each size+color combo has its own stock count). ProductoPage shows stock for the selected variant via `product.variantStock["size__colorName"]`.

### Database Schema

SQL migrations in `supabase/migrations/`. Tables: `profiles`, `product_categories`, `products`, `product_images`, `product_variants`, `orders`, `order_items`, `order_status_history`, `payments`. All have RLS enabled.

### Cart

Still uses localStorage (`src/context/CartContext.jsx`). No Supabase dependency.

## Phase 4 — Wompi Payment Integration

### Payment Flow

1. User submits checkout form → order created with `pending_payment` status
2. Frontend calls `POST /api/wompi/create-link` with user JWT
3. Serverless function validates ownership, calls Wompi `EnlacePago` API, inserts `payments` record
4. User is redirected to Wompi's hosted payment page
5. After payment, Wompi redirects back to `/gracias?order=ORDER_ID`
6. Webhook (`POST /api/wompi/webhook`) updates payment + order status

### Serverless Functions (Vercel)

- `api/wompi/create-link.js` — Creates Wompi payment link. Validates JWT, checks order ownership and status, uses DB amount (not client).
- `api/wompi/webhook.js` — Processes Wompi webhook events. Validates SHA256 signature, updates payment/order idempotently.

### Order Status Flow

`pending_payment → confirmed → preparing → shipped → delivered`
`pending_payment → cancelled` (if payment declined)

### Payment Service

`src/services/paymentService.js` — `createPaymentLink(orderId, accessToken)` and `getPaymentByOrderId(orderId)`

## Phase 5 — Home CMS (Editable Homepage)

### Architecture

Single Supabase table `home_content` with one row (`id = 'main'`). Each homepage section is stored as a separate JSONB column: `hero`, `philosophy`, `why_choose_us`, `features`, `protocol`. Public site fetches one row, admin updates individual columns.

### Database

- **Table:** `home_content` — single row, JSONB per section, `updated_at` timestamp
- **Storage bucket:** `home-images` — for uploaded hero/decorative/plate images
- **RLS:** Public `SELECT`, editors can `INSERT`/`UPDATE`
- **Migration:** `supabase/migrations/007_home_content.sql`

### Service Layer

`src/services/homeContentService.js`:
- `getHomeContent()` — fetches entire row
- `updateHomeSection(sectionName, data)` — updates single section JSONB
- `uploadHomeImage(file, folder, fileName)` — uploads to `home-images` bucket
- `deleteHomeImage(fullUrl)` — removes from storage

### Content Context

`src/context/HomeContentContext.jsx`:
- `HomeContentProvider` wraps all homepage sections
- `useHomeContent()` hook returns `{ content, loading }`
- Always returns valid data via deep-merge with `DEFAULT_HOME` fallback
- If Supabase fails, homepage renders with hardcoded defaults (never breaks)

### Homepage Components (Dynamic)

All 5 components consume content from `useHomeContent()`:
- `Hero.jsx` — badge, title lines, highlights, subtitle, CTAs, hero image, decorative leaves toggle
- `Philosophy.jsx` — badge, title, values (dynamic icon via ICON_MAP), stats, decorative images
- `WhyChooseUs.jsx` — badge, title, reasons (dynamic icon), plate image
- `Features.jsx` — badge, title, service cards array (dynamic count, VIP flag)
- `Protocol.jsx` — badge, title, steps array (dynamic count)

### Admin Module

Single module at `/admin/home` — "Página Principal" in sidebar (admin + editor roles).

**Page:** `src/admin/pages/AdminHomePage.jsx` — 5 tabs (Hero, Filosofía, Diferenciador, Servicios, Reservas)

**Editors** in `src/admin/components/home/`:
- `HeroEditor.jsx` — badge, titles, CTAs, image upload, decorative toggle
- `PhilosophyEditor.jsx` — badge, titles, 3 fixed pillars (IconPicker + label), 4 fixed stats, 4 decorative images
- `WhyChooseUsEditor.jsx` — badge, titles, 3 fixed differentiators (IconPicker + title + desc), plate image
- `FeaturesEditor.jsx` — badge, titles, dynamic service cards (1-8, add/remove/reorder, VIP toggle)
- `ProtocolEditor.jsx` — badge, titles, dynamic steps (1-6, add/remove/reorder)

**Shared components:**
- `SingleImageUploader.jsx` — single-image upload with preview, replace, delete
- `IconPicker.jsx` — dropdown of 19 pre-approved Lucide icons

### Content Reflection

Immediate on save. No draft/publish. Public site fetches fresh data on each page load (~50ms).

