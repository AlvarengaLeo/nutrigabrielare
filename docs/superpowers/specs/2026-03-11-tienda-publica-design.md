# Tienda Pública — Design Spec

**Date:** 2026-03-11
**Sub-project:** 1 of 4 (Tienda Pública)
**Scope:** All frontend pages, cart system, auth pages, tracking, and confirmation email — using mock data. Backend integration (Supabase, Wompi) deferred to Phases 2-4.

---

## 1. Problem Statement

The `/tienda` page has 3 static category cards with dead-end CTAs (`href="#"`). There is no product browsing, no cart, no checkout, no user authentication, and no order tracking. The site needs a complete e-commerce frontend that feels like a natural extension of the Majes de Sivar editorial brand — not a generic storefront.

## 2. Goals

- Convert category cards into an in-page expandable collection experience
- Build complete purchase flow: browse → detail → cart → checkout → confirmation
- Implement user auth (login/register) as a gate before checkout
- Generate tracking codes for order visibility
- Send confirmation emails with brand identity
- Maintain the existing visual language (paleta, tipografía, animaciones, tono)

## 3. Non-Goals (deferred to later phases)

- Supabase schema and real database (Phase 2)
- Admin panel and CRUD (Phase 3)
- Wompi payment processing (Phase 4)
- Real email sending infrastructure (Phase 2 — Supabase Edge Functions)
- Real inventory management

---

## 4. Routes

| Route | Component | Auth | Description |
|-------|-----------|------|-------------|
| `/tienda` | TiendaPage | Public | Category expansion + product grid |
| `/producto/:slug` | ProductoPage | Public | Product detail with gallery + variants |
| `/carrito` | CarritoPage | Public | Full cart page |
| `/login` | LoginPage | Public | Email/password + Google OAuth (admin uses `/admin/login` in Phase 3) |
| `/registro` | RegistroPage | Public | Minimal registration form |
| `/checkout` | CheckoutPage | Protected | Shipping form + order summary |
| `/gracias` | GraciasPage | Protected | Order confirmation + tracking |
| `/tracking/:code` | TrackingPage | Public | Order tracking timeline |
| `/cuenta` | CuentaPage | Protected | User's orders + tracking codes |

**Protected routes** redirect to `/login?redirect=<current-path>` if user is not authenticated.

---

## 5. TiendaPage — Category Expansion

### Behavior
- 3 category cards maintain their original design (number, title, description, CTA)
- Clicking a card sets it as active:
  - Active card: `border-accent/30 shadow-lg`, full opacity
  - Inactive cards: `opacity-0.6`, scale 0.97
- A collection panel renders below the card grid with `key={activeCategory}` for remount on switch
- One active category at a time; clicking same card again does nothing
- Clicking a different card switches the panel content

### Collection Panel Structure
- Category number (font-drama italic accent) + title (font-heading bold) + tagline (font-body)
- Accent divider: `w-16 h-[2px] bg-accent`
- Product grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Each product card: image placeholder, name, price, "Ver producto" link to `/producto/:slug`

### GSAP Animations
- Card transitions: `gsap.to` scale + opacity, 0.5s, ease power2.out
- Panel entrance: `gsap.fromTo` opacity 0→1, y 30→0, 0.7s, ease power3.out, delay 0.15
- Product stagger: `gsap.from` y:20, opacity:0, stagger 0.08, delay 0.3

### Category Taglines
- **Ropa:** "Piezas que llevan la identidad de Majes de Sivar a la calle."
- **Accesorios:** "Objetos que acompañan la vibra y la presencia del proyecto."
- **Edición Limitada:** "Piezas especiales pensadas para momentos, drops o lanzamientos puntuales."

---

## 6. ProductoPage — Product Detail

### Layout
- **Breadcrumb:** Tienda → {Category} → {Product name}
- **Split layout:** Gallery (left) + Details (right)

### Gallery
- Main image (aspect-ratio 3/4, rounded-2xl)
- Thumbnail strip below (3-4 images, active has accent border)

### Details Panel
- Category label (uppercase, accent color)
- Product name (font-heading, extrabold)
- Price (font-drama, italic)
- Description (font-body)
- **Color selector:** circular swatches, active has accent ring
- **Size selector:** S, M, L, XL buttons, active has accent border + background tint
- Stock indicator: green dot + count
- "Agregar al carrito" CTA (dark bg, white text, rounded-xl)

### Data Shape
```js
{
  id: 'r1',
  slug: 'playera-hermandad',
  name: 'Playera Hermandad',
  category: 'ropa',
  price: 28.00,
  description: 'Short description',
  descriptionLong: 'Extended description',
  images: ['/products/r1-1.jpg', '/products/r1-2.jpg'],
  variants: {
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Negro', hex: '#1A1A1A' }, { name: 'Blanco', hex: '#F5F0EB' }]
  },
  stock: 25,
  active: true,
  featured: false
}
```

---

## 7. Cart System

### CartContext (React Context + localStorage)

**State shape:**
```js
{
  items: [{
    productId, slug, name, price, size, color, quantity, image
  }],
  itemCount,  // computed: sum of quantities
  subtotal    // computed: sum of price × quantity
}
```

**Actions:** `addItem(product, size, color, qty)`, `removeItem(productId, size, color)`, `updateQuantity(productId, size, color, qty)`, `clearCart()`

**Persistence:** `localStorage` key `majes-cart`. Hydrates on mount, writes on every change. Migrates to Supabase in Phase 2.

**Stock note:** In Phase 1, stock is tracked at the product level (single number). In Phase 2, stock moves to variant-level (per size/color combination) via Supabase `inventory` and `product_variants` tables.

### CartDrawer (slide-in sidebar)
- Triggered by: adding a product, clicking CartIcon in Navbar
- Slides from right with dark overlay on page
- Shows: item list with thumbnails, quantity +/- controls, subtotal
- CTAs: "Ir al checkout" and "Ver carrito completo"
- Close: X button or click overlay

### CartIcon (Navbar)
- Shopping bag icon with badge showing `itemCount`
- Badge hidden when cart is empty
- Positioned in Navbar next to existing CTA

### CarritoPage (/carrito)
- Full page with item list (image, name, variant, quantity controls, line total, remove button)
- Summary sidebar: subtotal, shipping (placeholder "Por calcular"), total, CTA "Proceder al checkout"
- Empty state: message + CTA back to tienda
- "Seguir comprando" link

---

## 8. Auth Pages

### LoginPage (/login)
- Split layout: left panel dark with logo + tagline, right panel with form
- Google OAuth button (primary CTA)
- Divider "o"
- Email + password fields
- "Iniciar sesión" button
- Link to /registro: "¿No tenés cuenta? Crear cuenta"
- Accepts `?redirect=` query param to return user after login

### RegistroPage (/registro)
- Same split layout as login
- Google OAuth button
- Divider "o"
- Fields: nombre, apellido (side by side), correo, contraseña
- "Crear cuenta" button
- Link to /login: "¿Ya tenés cuenta? Iniciar sesión"
- On success: auto-login + redirect to previous page or /tienda

### Auth State
- **Phase 1 (mock):** simple React state simulating auth (no real Supabase yet). A mock `AuthContext` with `user`, `login()`, `register()`, `logout()`.
- **Phase 2:** replace with Supabase Auth (email + Google OAuth provider).

---

## 9. Checkout (/checkout — Protected)

### Prerequisites
- User must be logged in (redirect to /login if not)
- Cart must not be empty (redirect to /carrito if empty)

### Layout
- Two columns: form (left 2/3) + order summary (right 1/3, sticky)

### Form Sections
1. **Datos de contacto** — pre-filled from user account (nombre, email). Phone field manual.
2. **Dirección de envío** — only home delivery (no pickup). Fields: dirección, ciudad, departamento, indicaciones (optional).
3. **Notas adicionales** — optional textarea.

### Order Summary Sidebar
- Mini item list with thumbnails
- Subtotal, shipping cost, total
- "Pagar con Wompi" CTA (placeholder in Phase 1 — creates mock order)

### On Submit (Phase 1 mock)
1. Generate order ID: `MJS-YYYY-NNNN`
2. Generate tracking code: `MJS-YYYY-NNNN-TRK`
3. Store order via `src/data/orders.js` utilities (localStorage key `majes-orders`)
4. Clear cart
5. Redirect to `/gracias?order=MJS-YYYY-NNNN`

### Order Data Management (`src/data/orders.js`)

Utility module for order CRUD in localStorage. Used by CheckoutPage (create), GraciasPage (read), TrackingPage (read by tracking code), and CuentaPage (read all by user).

```js
// Key functions
createOrder(orderData)        // generates ID + tracking, saves to localStorage
getOrderById(orderId)         // lookup by order ID
getOrderByTracking(code)      // lookup by tracking code
getOrdersByUser(userId)       // all orders for a user
updateOrderStatus(orderId, status) // update tracking state
getAllOrders()                 // read all (for future admin use)
```

**Order shape:**
```js
{
  id: 'MJS-2026-0047',
  trackingCode: 'MJS-2026-0047-TRK',
  userId: 'mock-user-1',
  items: [{ productId, name, size, color, quantity, price, image }],
  contact: { name, email, phone },
  shipping: { address, city, department, notes },
  subtotal: 56.00,
  shippingCost: 5.00,
  total: 61.00,
  status: 'confirmed', // confirmed | preparing | shipped | delivered
  statusHistory: [
    { status: 'confirmed', timestamp: '2026-03-11T14:34:00Z' }
  ],
  createdAt: '2026-03-11T14:34:00Z'
}
```

---

## 10. GraciasPage (/gracias — Protected)

- Decorative "✦" symbol
- "¡Gracias, Maje!" heading (font-drama italic)
- "Tu orden ha sido creada y confirmada."
- Email confirmation notice: "📧 Enviamos confirmación a {email}"
- **Order card:** order number, status (Confirmada), total, item list
- **Tracking card (dark bg):** tracking code in large monospace, "Rastrear mi pedido" CTA linking to `/tracking/:code`, note "También lo recibiste por correo"
- Action buttons: "Volver a la tienda", "Mi cuenta"

---

## 11. TrackingPage (/tracking/:code — Public)

### Search
- Title "Rastrear pedido"
- Input field for tracking code + "Buscar" button
- If accessed via `/tracking/MJS-2026-0047-TRK`, auto-fills and searches

### Timeline
- Vertical timeline with 4 states:
  1. **Orden confirmada** — green dot when complete
  2. **Preparando pedido** — green dot when complete
  3. **En camino** — accent dot + glow when active
  4. **Entregado** — gray dot when pending, green when complete
- Each step shows timestamp when completed
- Active step shows description text

### Data
- Phase 1: reads from localStorage mock orders
- Phase 2: reads from Supabase `orders` table

---

## 12. CuentaPage (/cuenta — Protected)

- User email + "Cerrar sesión" button
- "Mis pedidos" list showing:
  - Order thumbnail, order number, date, item count
  - Status badge (color-coded: accent=en camino, green=entregado, yellow=pendiente)
  - Tracking code (monospace)
  - Click → navigates to `/tracking/:code`

---

## 13. Confirmation Email (Template Only in Phase 1)

### Structure
- **Header:** dark bg, Majes logo, brand name
- **Body:** "¡Gracias por tu compra, Maje!", tracking number in highlighted box with "Rastrear pedido" CTA, order detail list, total
- **Footer:** cream bg, "Majes de Sivar · El Salvador", social media links

### Implementation
- Phase 1: HTML template built and stored in `src/templates/confirmation-email.html` (or equivalent)
- Phase 2: sent via Supabase Edge Function triggered on order creation

---

## 14. New File Structure

```
src/
├── data/
│   ├── products.js              ← mock product catalog
│   └── orders.js               ← order utilities: create, read, update in localStorage
├── context/
│   ├── CartContext.jsx           ← cart state + actions + localStorage
│   └── AuthContext.jsx           ← mock auth state (replaced by Supabase in Phase 2)
├── components/
│   ├── CartDrawer.jsx            ← slide-in mini-cart sidebar
│   ├── CartIcon.jsx              ← Navbar cart badge
│   ├── ProductCard.jsx           ← reusable product card
│   ├── VariantSelector.jsx       ← size + color picker
│   └── ProtectedRoute.jsx        ← auth gate wrapper
├── pages/
│   ├── TiendaPage.jsx            ← MODIFY
│   ├── ProductoPage.jsx          ← NEW
│   ├── CarritoPage.jsx           ← NEW
│   ├── CheckoutPage.jsx          ← NEW
│   ├── GraciasPage.jsx           ← NEW
│   ├── TrackingPage.jsx          ← NEW
│   ├── LoginPage.jsx             ← NEW
│   ├── RegistroPage.jsx          ← NEW
│   └── CuentaPage.jsx            ← NEW
├── templates/
│   └── confirmation-email.html   ← email HTML template
└── App.jsx                       ← MODIFY (routes + providers)
```

---

## 15. Design Principles

- **No generic e-commerce templates.** Every page follows the Majes editorial aesthetic.
- **Same design system:** cream bg, dark/accent colors, Jakarta/Cormorant/Outfit fonts, rounded-[2.5rem] cards.
- **GSAP animations** on every page following the established pattern (context + revert).
- **Mobile-first responsive:** all layouts stack on mobile, grids reduce columns.
- **Spanish language** for all user-facing text (Salvadoran tone).
- **Mock data first:** all product/order data is local. Supabase replaces it in Phase 2 with minimal refactoring (swap data source, keep components).
- **Auto-scroll on category expansion:** when a collection panel opens in TiendaPage, smooth-scroll the panel into view.
- **CartDrawer on mobile:** full-width on screens < 768px.
- **404 catch-all route:** App.jsx should include a catch-all `*` route with a branded "Página no encontrada" screen.
- **GSAP easing convention:** `power3.out` for entrance animations, `power2.out` is acceptable for state transitions (active/inactive card toggling).
