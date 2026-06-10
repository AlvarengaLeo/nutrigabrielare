# Manual Técnico — Nutrigabrielare

> **Versión del documento:** Junio 2026
> **Audiencia:** desarrolladores y personal técnico que deba entender, operar y mantener el sistema.
> **Sitio en producción:** https://nutrigabrielare.com

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura](#2-arquitectura)
3. [Estructura del repositorio](#3-estructura-del-repositorio)
4. [Rutas del sitio](#4-rutas-del-sitio)
5. [Base de datos](#5-base-de-datos)
6. [Variables de entorno](#6-variables-de-entorno)
7. [Integraciones](#7-integraciones)
8. [CMS de contenido (home_content)](#8-cms-de-contenido-home_content)
9. [Flujos críticos](#9-flujos-críticos)
10. [Deploy](#10-deploy)
11. [Desarrollo local](#11-desarrollo-local)
12. [Runbooks operativos](#12-runbooks-operativos)
13. [Seguridad](#13-seguridad)

---

## 1. Resumen ejecutivo

**Nutrigabrielare** es la plataforma web de la marca de nutrición holística de Gabriela (El Salvador). Combina en una sola aplicación:

- **Sitio de marca** (home editable desde un CMS propio).
- **Tienda e-commerce "Pleno"** con tres tipos de producto (`kind`): físicos (suplementos), digitales (ebooks, cursos, guías) y servicios (consultas 1:1 reservables).
- **Blog editorial "Fluir Femenino"** con artículos en Markdown.
- **Panel de administración** (`/admin`) con roles diferenciados (admin / editor / gestor).
- **Pagos en línea** vía Wompi (El Salvador) y **correos transaccionales** vía Resend.

### Stack tecnológico

| Capa | Tecnología | Detalle |
|---|---|---|
| Frontend | **Vite 5 + React 19** (SPA) | React Router DOM v7, GSAP + ScrollTrigger, Tailwind CSS 3, lucide-react, recharts (dashboard admin), react-markdown (blog) |
| Backend | **Funciones serverless de Vercel** (Node) | Carpeta `api/` en la raíz del repo |
| Base de datos / Auth / Storage | **Supabase** (PostgreSQL + RLS) | Migraciones SQL versionadas en `supabase/migrations/` |
| Pagos | **Wompi El Salvador** | API `EnlacePago` (links de pago hospedados) + webhook firmado HMAC |
| Correos | **Resend** | SDK `resend` v6, templates HTML en `api/_lib/email.js`, auditoría en tabla `email_logs` |
| Hosting / CDN | **Vercel** | Build estático del SPA + funciones `api/` en el mismo proyecto |
| DNS y correo corporativo | **Hostinger** | Dominio `nutrigabrielare.com` apuntado a Vercel; buzones corporativos |

### Proveedores externos y sus paneles

| Proveedor | Qué administra | Panel |
|---|---|---|
| Vercel | Deploys, variables de entorno serverless, logs de funciones | vercel.com |
| Supabase | Base de datos, usuarios (Auth), buckets de Storage, SQL Editor | supabase.com |
| Wompi | Credenciales de pago, transacciones, reintentos de webhook | wompi.sv |
| Resend | Dominio de envío verificado, API keys, actividad de correos | resend.com |
| Hostinger | DNS del dominio, correo corporativo (bandejas) | hostinger.com |

---

## 2. Arquitectura

```
                                   ┌─────────────────────────────┐
                                   │   Hostinger (DNS + email)   │
                                   │  nutrigabrielare.com        │
                                   │  • A record  →  Vercel      │
                                   │  • MX/buzones corporativos  │
                                   │  • TXT/CNAME de Resend      │
                                   └──────────────┬──────────────┘
                                                  │ DNS
                                                  ▼
┌──────────────┐   HTTPS   ┌──────────────────────────────────────────────┐
│   Navegador  │──────────▶│                  VERCEL                      │
│  (clienta /  │           │  ┌────────────────────┐  ┌────────────────┐  │
│   admin)     │           │  │  SPA Vite + React  │  │  Funciones     │  │
└──────────────┘           │  │  (build estático,  │  │  serverless    │  │
       ▲                   │  │  dist/ + rewrites  │  │  api/wompi/*   │  │
       │ redirect          │  │  a index.html)     │  │  api/digital/* │  │
       │ de pago           │  └─────────┬──────────┘  │  api/reserva…  │  │
       │                   │            │             │  api/sitemap   │  │
┌──────┴───────┐  webhook  │            │             └──────┬─────────┘  │
│    WOMPI     │──────────▶│            │                    │            │
│  (pagos SV)  │  HMAC     └────────────┼────────────────────┼────────────┘
│  EnlacePago  │                        │ anon key (RLS)     │ service role
└──────────────┘                        ▼                    ▼
                           ┌──────────────────────────────────────────────┐
                           │                  SUPABASE                    │
                           │  • PostgreSQL + Row Level Security           │
                           │  • Auth (email/password + Google OAuth)     │
                           │  • Storage:                                  │
                           │      product-images  (público)               │
                           │      home-images     (público)               │
                           │      blog-images     (público)               │
                           │      digital-products(PRIVADO, signed URLs)  │
                           └──────────────────────────────────────────────┘
                                                  ▲
                                                  │ API key
                                       ┌──────────┴──────────┐
                                       │       RESEND        │
                                       │  correos transac-   │
                                       │  cionales (dominio  │
                                       │  verificado)        │
                                       └─────────────────────┘
```

Puntos clave:

- **El frontend nunca habla directo con Wompi ni con Resend.** Todo pasa por las funciones `api/`, que usan la `SUPABASE_SERVICE_ROLE_KEY` (omite RLS) y los secretos de Wompi/Resend.
- **El frontend habla con Supabase** usando la *anon key* pública; la seguridad de datos la garantiza RLS (políticas por tabla).
- **`vercel.json`** define los rewrites: `/api/*` → funciones, `/sitemap.xml` → `api/sitemap.xml.js`, y todo lo demás → `index.html` (SPA fallback).
- El dominio `nutrigabrielare.com` está registrado/gestionado en **Hostinger**: un **A record apunta a Vercel** (IP de Vercel) y los registros de correo (MX) quedan en Hostinger para el email corporativo. Los registros TXT/CNAME de verificación de Resend (SPF/DKIM) también viven en el DNS de Hostinger.

---

## 3. Estructura del repositorio

```
nutrigabrielare/
├── api/                          ← Funciones serverless de Vercel
│   ├── _lib/
│   │   ├── email.js              ← Cliente Resend + templates HTML + log a email_logs
│   │   └── runtimeConfig.js      ← Validación de variables de entorno del servidor
│   ├── digital/
│   │   ├── refresh-url.js        ← Regenera signed URL (24 h) para la biblioteca del usuario
│   │   └── resend-email.js       ← Reenvía correo de descargas (admin/gestor)
│   ├── reservations/
│   │   └── notify.js             ← Correo de confirmación de reserva (+ aviso al admin)
│   ├── wompi/
│   │   ├── create-link.js        ← Crea orden + link de pago Wompi
│   │   ├── webhook.js            ← Recibe el webhook firmado de Wompi
│   │   └── order-status.js       ← Estado de orden (invitada con key HMAC o sesión)
│   └── sitemap.xml.js            ← Sitemap dinámico (posts + productos)
├── src/
│   ├── App.jsx                   ← Definición de TODAS las rutas + providers globales
│   ├── main.jsx                  ← Entry point
│   ├── index.css                 ← Estilos globales y utilidades custom
│   ├── components/               ← Componentes compartidos del sitio público
│   │   ├── Navbar.jsx, Footer.jsx, PlenoFooter.jsx
│   │   ├── CartDrawer.jsx, CartIcon.jsx, ProductCard.jsx, VariantSelector.jsx
│   │   ├── Hero.jsx, Philosophy.jsx, WhyChooseUs.jsx, Featured.jsx,
│   │   │   Testimonials.jsx, DigitalResources.jsx (secciones del home, CMS)
│   │   ├── ProtectedRoute.jsx    ← Gate de autenticación para rutas protegidas
│   │   ├── ConfigurationErrorScreen.jsx ← Pantalla si faltan VITE_* críticas
│   │   └── pleno/PlenoProductsPLP.jsx
│   ├── pages/                    ← Una página por ruta pública (ver §4)
│   ├── admin/
│   │   ├── pages/                ← Páginas del panel (AdminDashboard, AdminOrdenes…)
│   │   └── components/           ← AdminRoute (gate de roles), AdminLayout, AdminSidebar,
│   │       │                        DataTable, ImageUploader, VariantEditor…
│   │       └── home/             ← Editores del CMS (HeroEditor, TestimonialsEditor…)
│   ├── context/
│   │   ├── AuthContext.jsx       ← Sesión Supabase + rol (RPC get_my_profile)
│   │   ├── CartContext.jsx       ← Carrito global persistido en localStorage
│   │   ├── HomeContentContext.jsx← Contenido del CMS con fallback DEFAULT_HOME
│   │   └── StoreThemeContext.jsx ← Tema visual por sección (pleno / nutri)
│   ├── services/                 ← Capa de acceso a datos (Supabase + fetch a api/)
│   │   ├── productService.js, categoryService.js, orderService.js,
│   │   ├── paymentService.js     ← createPaymentLink / getCheckoutStatus
│   │   ├── shippingService.js    ← Zonas de envío (incluye isPickup)
│   │   ├── reservationService.js, libraryService.js (biblioteca digital),
│   │   ├── blogService.js, homeContentService.js, emailLogService.js,
│   │   └── adminService.js, analyticsService.js, userService.js
│   ├── config/runtimeConfig.js   ← Schema de variables VITE_* (críticas vs opcionales)
│   └── lib/supabase.js           ← Cliente Supabase del frontend (anon key)
├── supabase/
│   └── migrations/               ← 001…021 SQL aplicadas en orden (ver §5)
├── docs/
│   ├── email-setup.md            ← Guía de configuración de Resend
│   └── manuales/                 ← Manuales entregables (este documento)
├── public/                       ← Assets estáticos (favicons, manifest)
├── media/                        ← Imágenes de marca usadas por el sitio
├── scripts/                      ← Seeds y utilidades puntuales (create-admin.mjs, seed-*.cjs)
├── vercel.json                   ← Rewrites (SPA + api + sitemap)
├── vite.config.js                ← Configuración Vite (plugin React)
├── tailwind.config.js            ← Design system (colores, fuentes)
├── .env.example                  ← Plantilla de variables de entorno
├── .npmrc                        ← legacy-peer-deps=true (compatibilidad React 19)
└── package.json                  ← Scripts: dev / build / preview / lint
```

Archivos de raíz auxiliares: `full_migration.sql` (consolidado histórico de migraciones), `run-migrations.cjs`, `seed-categories.mjs`, `setup-db.js` (utilidades de provisión usadas durante el desarrollo; la fuente de verdad del schema son las migraciones numeradas).

---

## 4. Rutas del sitio

Todas las rutas se declaran en `src/App.jsx`. El `Navbar`, el `Footer` y el `CartDrawer` se montan en todas las rutas **no** `/admin`. Las páginas admin se cargan con `React.lazy` (code-splitting).

### 4.1 Rutas públicas

| Ruta | Página | Acceso |
|---|---|---|
| `/` | `HomePage` (secciones del CMS) | Público |
| `/nutrigabrielare` | `NutrigabrielareLandingPage` (recursos + consultas) | Público |
| `/pleno` | `PlenoLandingPage` (vitrina de la tienda) | Público |
| `/pleno/:kindSlug` | `PlenoCategoryPage` (listado por tipo: digitales, suplementos, servicios) | Público |
| `/pleno/suplementos` | Redirect → `/pleno` | — |
| `/tienda`, `/tienda/*` | Redirect → `/pleno` (rutas legadas) | — |
| `/producto/:slug` | `ProductoPage` (detalle, variantes, stock) | Público |
| `/carrito` | `CarritoPage` | Público |
| `/checkout` | `CheckoutPage` — **compra como invitada permitida** (no requiere login) | Público |
| `/gracias` | `GraciasPage` — requiere `?order=<id>&key=<hmac>` o sesión dueña de la orden | Público* |
| `/tracking` y `/tracking/:code` | `TrackingPage` (timeline de estados por código) | Público |
| `/reservar/:slug` | `ReservarPage` (reserva **con pago en línea**) | Pública (compra como invitada) |
| `/cuenta` | `CuentaPage` (pedidos, biblioteca digital "Mis productos") | 🔒 Requiere sesión |
| `/login` / `/registro` | `LoginPage` / `RegistroPage` | Público |
| `/fluir-femenino` | `FluirFemeninoPage` (landing del blog) | Público |
| `/fluir-femenino/articulos` | `FluirFemeninoArchivePage` (archivo) | Público |
| `/fluir-femenino/articulos/:slug` | `FluirFemeninoPostPage` (artículo) | Público |
| `/fluir-femenino-v2` | `FluirFemeninoV2Page` (variante experimental) | Público |
| `/donacion`, `/proyecto-banquita`, `/nutricion-con-alma`, `/comunidad` | Redirects → `/fluir-femenino` | — |
| `/contactanos` | `ContactanosPage` | Público |
| `*` | `NotFoundPage` | Público |

\* `/gracias` es accesible sin sesión, pero los datos de la orden solo se muestran si la URL incluye la `key` HMAC correcta o si el usuario logueado es dueño de la orden (validado por `api/wompi/order-status.js`).

### 4.2 Rutas admin

El gate es `src/admin/components/AdminRoute.jsx`: si no hay sesión redirige a `/admin/login?redirect=…`; si el rol del usuario no está en `allowedRoles` muestra "Acceso denegado".

| Ruta | Página | Roles permitidos |
|---|---|---|
| `/admin/login` | `AdminLoginPage` | Público |
| `/admin` | `AdminDashboard` (métricas, recharts) | `admin`, `editor`, `gestor` |
| `/admin/home` | `AdminHomePage` (CMS, ver §8) | `admin`, `editor` |
| `/admin/fluir-femenino` | `AdminBlog` (listado de posts) | `admin`, `editor` |
| `/admin/fluir-femenino/nuevo` | `AdminBlogForm` | `admin`, `editor` |
| `/admin/fluir-femenino/:id` | `AdminBlogForm` (edición) | `admin`, `editor` |
| `/admin/productos` | `AdminProductos` | `admin`, `editor` |
| `/admin/productos/nuevo` | `AdminProductoForm` | `admin`, `editor` |
| `/admin/productos/:id` | `AdminProductoForm` (edición) | `admin`, `editor` |
| `/admin/categorias` | `AdminCategorias` | `admin`, `editor` |
| `/admin/ordenes` | `AdminOrdenes` | `admin`, `gestor` |
| `/admin/ordenes/:id` | `AdminOrdenDetalle` (estados, courier, **reenviar descargas**) | `admin`, `gestor` |
| `/admin/reservas` | `AdminReservas` | `admin`, `gestor` |
| `/admin/envios` | `AdminEnvios` (zonas de envío / retiro en tienda) | `admin`, `gestor` |
| `/admin/usuarios` | `AdminUsuarios` (gestión de roles) | `admin` |
| `/admin/emails` | `AdminEmails` (visor de `email_logs`) | `admin` |

---

## 5. Base de datos

Schema PostgreSQL gestionado por las migraciones `supabase/migrations/001…021`. **Todas las tablas tienen RLS habilitado** con políticas explícitas. Convención: archivos `NNN_descripcion.sql`, idempotentes, aplicados en orden numérico (manualmente en el SQL Editor de Supabase o con `supabase db push`).

### 5.1 Historial de migraciones

| # | Archivo | Qué hace |
|---|---|---|
| 001 | `001_initial_schema.sql` | profiles, product_categories, products, product_images, product_variants, orders, order_items, order_status_history, payments. RPC `generate_order_id()`. Trigger `handle_new_user`. |
| 002 | `002_seed_data.sql` | Seed **legado** de la primera versión del catálogo: categorías y productos de prueba (reemplazado por el catálogo v2 de la migración 008). |
| 003 | `003_fix_rls_recursion.sql` | Crea `is_admin()` (SECURITY DEFINER) y reescribe todas las políticas para evitar recursión infinita de RLS en `profiles`. |
| 004 | `004_admin_roles.sql` | Roles `editor` y `gestor`; funciones `is_editor()` / `is_gestor()`; bucket `product-images` (público) con políticas de Storage. |
| 005 | `005_get_my_profile_rpc.sql` | RPC `get_my_profile()` (SECURITY DEFINER) usado por `AuthContext` para leer nombre y rol sin pelear con RLS. |
| 006 | `006_pending_payment_status.sql` | Agrega `pending_payment` al CHECK de `orders.status`. |
| 007 | `007_home_content.sql` | Tabla `home_content` (CMS, fila única) + bucket `home-images` (público). |
| 008 | `008_catalog_v2.sql` | `products.kind` / `featured_order` / `digital_file_path`; `orders.courier_*`; tablas `shipping_zones`, `user_purchases`, `reservations`; bucket **privado** `digital-products`; función `set_updated_at()`; elimina columna `protocol` de `home_content`. |
| 009 | `009_seed_catalog.sql` | Categorías reales (digitales, suplementos, servicios) + 6 servicios de consulta como productos `kind='service'`. |
| 010 | `010_orders_shipping_zone.sql` | `orders.shipping_zone_id` (FK nullable) + `shipping_zone_name` (snapshot histórico). |
| 011 | `011_featured_section.sql` | Columna JSONB `featured` en `home_content` (carrusel "Pleno Market"). |
| 012 | `012_deactivate_legacy_categories.sql` | Desactiva (`active=false`) las categorías legadas de 002. |
| 013 | `013_decrement_stock_rpc.sql` | Función `decrement_order_stock(p_order_id)` — descuento atómico de stock por orden (solo `service_role`). |
| 014 | `014_email_logs.sql` | Tabla `email_logs` (auditoría de correos; lectura solo admin). |
| 015 | `015_blog.sql` | Blog: `posts`, `post_categories`, `post_tags`, `post_to_tag` + bucket `blog-images` (público). |
| 016 | `016_seed_blog.sql` | Categorías iniciales del blog. |
| 017 | `017_digital_subtype.sql` | `products.digital_subtype` (ebook / curso / guia / evento_grabado / programa / contenido). |
| 018 | `018_testimonials.sql` | Columna JSONB `testimonials` en `home_content`. |
| 019 | `019_landing_sections.sql` | Columnas JSONB `pleno_hero`, `nutri_hero`, `fluir_content` en `home_content`. |
| 020 | `020_pickup_zones.sql` | `shipping_zones.is_pickup` (retiro en tienda). |
| 021 | `021_reservations_paid.sql` | `reservations.order_id` (enlace a la orden que pagó la consulta) + estado `pagado` en el CHECK de `reservations.status`. |

### 5.2 Tablas

#### `profiles`
Perfil 1:1 con `auth.users` (se crea automáticamente al registrarse vía trigger `on_auth_user_created` → `handle_new_user()`).

| Columna | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | FK → `auth.users(id)` ON DELETE CASCADE |
| `email` | text | |
| `first_name`, `last_name` | text | |
| `role` | text | CHECK: `customer` \| `admin` \| `editor` \| `gestor` (default `customer`) |
| `created_at`, `updated_at` | timestamptz | |

RLS: cada usuario lee/actualiza su fila; `is_admin()` lee y actualiza todas (incluyendo `role`).

#### `product_categories`
| Columna | Tipo | Nota |
|---|---|---|
| `id` | text PK | ej. `digitales`, `suplementos`, `servicios` |
| `num`, `title`, `tagline`, `description`, `cta` | text | textos de vitrina |
| `sort_order` | int | |
| `active` | boolean | el frontend solo lista activas |

RLS: SELECT público si `active=true`; gestión total con `is_editor()`.

#### `products`
| Columna | Tipo | Nota |
|---|---|---|
| `id` | text PK | ej. `dig-001` |
| `slug` | text UNIQUE | usado en `/producto/:slug` |
| `name`, `description`, `description_long` | text | |
| `category_id` | text | FK → `product_categories` |
| `price` | decimal(10,2) | el backend SIEMPRE usa este precio, no el del cliente |
| `kind` | text | CHECK: `physical` \| `digital` \| `service` (008) |
| `digital_subtype` | text nullable | CHECK: `ebook`/`curso`/`guia`/`evento_grabado`/`programa`/`contenido` (017) |
| `digital_file_path` | text nullable | ruta del archivo dentro del bucket `digital-products` (008) |
| `featured`, `featured_order` | boolean / int | carrusel destacado |
| `active` | boolean | |

RLS: SELECT público si `active=true`; gestión con `is_editor()`.

#### `product_images`
`id` uuid PK, `product_id` FK (CASCADE), `url`, `sort_order`. SELECT público; gestión `is_editor()`.

#### `product_variants`
Stock **por variante** (combinación talla + color).

| Columna | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | |
| `product_id` | text FK | CASCADE |
| `size`, `color_name`, `color_hex` | text | UNIQUE (product_id, size, color_name) |
| `stock` | int | descuento vía `decrement_order_stock` |
| `active` | boolean | |

RLS: SELECT público si `active=true`; gestión `is_editor()`.

#### `orders`
| Columna | Tipo | Nota |
|---|---|---|
| `id` | text PK | formato `NTG-YYYY-NNNN` (RPC `generate_order_id`) |
| `tracking_code` | text UNIQUE | `<id>-TRK` |
| `user_id` | uuid nullable | FK → `auth.users`; **NULL en compras de invitada** |
| `contact_name`, `contact_email`, `contact_phone` | text | |
| `shipping_address`, `shipping_city`, `shipping_department`, `shipping_notes` | text | vacíos cuando la zona es retiro en tienda |
| `shipping_zone_id` | uuid nullable | FK → `shipping_zones` (010) |
| `shipping_zone_name` | text | snapshot del nombre de la zona (010) |
| `subtotal`, `shipping_cost`, `total` | decimal(10,2) | |
| `status` | text | CHECK: `pending_payment` → `confirmed` → `preparing` → `shipped` → `delivered`, o `cancelled` |
| `courier_name`, `courier_tracking_code` | text nullable | datos del courier (008) |

RLS: dueño lee/inserta las suyas; política pública de SELECT para tracking; gestión total `is_gestor()`. Las órdenes de invitadas las crea el backend con service role.

#### `order_items`
`id` uuid PK, `order_id` FK (CASCADE), `product_id` FK, `product_name`, `size`, `color`, `price`, `quantity`, `image`. Snapshot del producto al momento de la compra (no se rompe si el producto cambia luego).

#### `order_status_history`
`id` uuid PK, `order_id` FK (CASCADE), `status`, `created_at`. Una fila por transición; alimenta el timeline de `/tracking/:code`. SELECT público.

#### `payments`
| Columna | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | |
| `order_id` | text FK | CASCADE |
| `provider` | text | `wompi` |
| `provider_transaction_id` | text | `idEnlace` al crear, `IdTransaccion` al confirmar |
| `amount`, `currency` | decimal / text | USD |
| `status` | text | CHECK: `pending` \| `approved` \| `declined` \| `voided` \| `error` |
| `raw_response` | jsonb | payload completo del webhook (debug) |

RLS: dueño de la orden lee; gestión `is_gestor()`.

#### `shipping_zones`
| Columna | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | |
| `name` | text UNIQUE | ej. "El Salvador", "Retiro en tienda" |
| `cost` | decimal(10,2) | |
| `free_threshold` | decimal nullable | si `subtotal >= free_threshold` ⇒ envío $0 |
| `is_pickup` | boolean | **retiro en tienda** — el checkout omite la dirección (020) |
| `active`, `sort_order` | boolean / int | |

RLS: SELECT público si `active=true`; gestión `is_editor()`.

#### `user_purchases`
Ledger de compras digitales por usuaria (biblioteca "Mis productos" en `/cuenta`).

| Columna | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK | CASCADE — **solo se registra si la compra tuvo sesión** |
| `product_id` | text FK | CASCADE |
| `order_id` | text FK nullable | SET NULL |
| `purchased_at`, `expires_at` | timestamptz | `expires_at` es informativo (ventana del correo); la fila basta como prueba de compra para re-descargas |

UNIQUE (user_id, product_id, order_id). RLS: dueña lee; gestión `is_gestor()`.

#### `reservations`
| Columna | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid nullable | SET NULL |
| `product_id` | text FK | servicio (`kind='service'`) |
| `contact_name`, `contact_email`, `contact_phone` | text | |
| `preferred_date`, `preferred_time` | date / text | |
| `notes` | text | |
| `status` | text | CHECK: `pendiente` \| `contactado` \| `confirmado` \| `completado` \| `cancelado` |

RLS: dueña lee/crea las suyas; gestión `is_gestor()`.

#### `email_logs`
Auditoría de cada intento de envío de correo (insertado por `api/_lib/email.js` con service role; **el fallo del log nunca bloquea el envío**).

| Columna | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | |
| `provider` | text | `resend` |
| `template` | text | `purchase_confirm` \| `digital_download` \| `reservation_confirm` ⧸ `service_paid` ⧸ `service_paid_admin` |
| `recipient_email` | text | |
| `status` | text | CHECK: `queued` \| `sent` \| `failed` \| `skipped` \| `bounced` |
| `error_message` | text | truncado a 1000 chars |
| `provider_message_id` | text | id de Resend |
| `related_order_id` | text FK nullable | SET NULL |
| `related_user_id` | uuid FK nullable | SET NULL |
| `sent_at` | timestamptz | |

RLS: SELECT **solo `is_admin()`** (visor en `/admin/emails`).

#### Blog: `posts`, `post_categories`, `post_tags`, `post_to_tag`
- `posts`: `slug` UNIQUE, `title`, `excerpt`, `body_md` (Markdown), `cover_image_url`, `category_id` FK, `related_product_ids text[]` (referencias blandas, sin FK), `author_id` FK → profiles, `reading_minutes`, `published` + `published_at`, campos SEO (`seo_title`, `seo_description`, `og_image_url`).
- RLS: público lee solo `published=true`; `is_editor()` lee y gestiona todo.

#### `home_content`
Ver §8.

### 5.3 Funciones SQL y triggers

| Función | Tipo | Para qué sirve |
|---|---|---|
| `generate_order_id()` | RPC SECURITY DEFINER | Genera el siguiente id `NTG-YYYY-NNNN` contando órdenes del año. La invoca `api/wompi/create-link.js`. |
| `is_admin()` | SQL SECURITY DEFINER | Predicado de RLS: ¿el `auth.uid()` actual tiene rol `admin`? Evita recursión de políticas. |
| `is_editor()` | SQL SECURITY DEFINER | `true` si rol ∈ {admin, editor}. Protege catálogo, CMS, blog y buckets de imágenes. |
| `is_gestor()` | SQL SECURITY DEFINER | `true` si rol ∈ {admin, gestor}. Protege órdenes, pagos, reservas, envíos. |
| `get_my_profile()` | RPC SECURITY DEFINER | Devuelve `{first_name, last_name, role}` del usuario actual. Usada por `AuthContext` vía REST directo. |
| `decrement_order_stock(p_order_id text)` | RPC SECURITY DEFINER | Recorre los `order_items` de la orden y descuenta `product_variants.stock` (solo productos `kind='physical'`; `GREATEST(stock - qty, 0)`). **EXECUTE solo para `service_role`** — la llama el webhook de Wompi al confirmar el pago. |
| `handle_new_user()` | trigger en `auth.users` | Crea la fila de `profiles` al registrarse (toma first/last name del `raw_user_meta_data`). |
| `set_updated_at()` | trigger | Mantiene `updated_at` en `shipping_zones`, `reservations`, `posts`. |

### 5.4 Buckets de Storage

| Bucket | Visibilidad | Contenido | Políticas |
|---|---|---|---|
| `product-images` | **Público** | Fotos de productos | SELECT público; INSERT/UPDATE/DELETE `is_editor()` |
| `home-images` | **Público** | Imágenes del CMS del home | SELECT público; escritura `is_editor()` |
| `blog-images` | **Público** | Portadas de artículos | SELECT público; escritura `is_editor()` |
| `digital-products` | **PRIVADO** | Archivos vendibles (ebooks, etc.) | Lectura/escritura solo `is_editor()`; los clientes acceden **únicamente** vía signed URLs creadas server-side (7 días en correos, 24 h en biblioteca) |

---

## 6. Variables de entorno

Plantilla completa en **`.env.example`**. Hay dos familias claramente separadas:

### 6.1 Frontend (prefijo `VITE_` — se incrustan en el build)

Definidas en `.env` local y en **Vercel → Project Settings → Environment Variables**. ⚠️ Cualquier `VITE_*` queda **visible en el bundle del navegador**: nunca poner secretos aquí.

| Variable | Obligatoria | Para qué |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ crítica | URL del proyecto Supabase (cliente del frontend) |
| `VITE_SUPABASE_ANON_KEY` | ✅ crítica | Anon/publishable key (segura de exponer; RLS protege los datos) |
| `VITE_WOMPI_APP_ID` | opcional | App ID público de Wompi |

Si falta una crítica, `src/config/runtimeConfig.js` lo detecta y `App.jsx` renderiza `ConfigurationErrorScreen` en lugar del sitio (la app nunca arranca "a medias").

### 6.2 Serverless (sin prefijo — solo runtime de las funciones `api/`)

Se configuran en el **dashboard de Vercel** (Production + Preview). Cada función valida su lista `REQUIRED_ENV` vía `api/_lib/runtimeConfig.js` y responde 500 con la lista de faltantes si algo no está.

| Variable | Secreta | Usada por | Para qué |
|---|---|---|---|
| `SUPABASE_URL` | no | todas las funciones | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | no | `reservations/notify`, `sitemap.xml` | Cliente con RLS (en notify se combina con el JWT de la usuaria) |
| `SUPABASE_SERVICE_ROLE_KEY` | **SÍ** | `wompi/*`, `digital/*`, email logs | Omite RLS. **Jamás en el frontend ni con prefijo VITE_** |
| `WOMPI_APP_ID` | no | `wompi/create-link` | Client ID OAuth de Wompi |
| `WOMPI_API_SECRET` | **SÍ** | `wompi/create-link`, `wompi/webhook`, `wompi/order-status`, `digital/resend-email` | (1) client_secret OAuth, (2) clave HMAC del webhook, (3) clave HMAC de la `key` de acceso a órdenes |
| `APP_URL` | no | varias | URL canónica de producción (`https://nutrigabrielare.com`); construye returnUrl, webhookUrl y links de correo |
| `RESEND_API_KEY` | **SÍ** | `_lib/email.js`, `reservations/notify` | Envío de correos. Si falta, los envíos se omiten con log `skipped` (no rompe nada) |
| `EMAIL_FROM` | no | `_lib/email.js` | Remitente visible. Default: `Nutrigabriela <shop@nutrigabrielare.com>` (debe usar el dominio verificado en Resend) |
| `EMAIL_REPLY_TO` | no | `_lib/email.js` | Dirección de respuesta (buzón corporativo en Hostinger) |
| `ADMIN_NOTIFY_EMAIL` | no | `reservations/notify` | Si está definida, el admin recibe un aviso por cada reserva nueva |

> **Nota:** después de cambiar cualquier variable en Vercel hay que **redeployar** (las `VITE_*` requieren rebuild; las serverless se aplican en el siguiente deploy).

---

## 7. Integraciones

### 7.1 Wompi (pagos)

Tres funciones serverless en `api/wompi/`:

#### Flujo de pago completo

```
CheckoutPage (front)                     create-link.js (server)              Wompi
       │                                        │                               │
       │ POST /api/wompi/create-link            │                               │
       │ body: { checkout }                     │                               │
       │ header: Bearer <JWT>  (opcional,       │                               │
       │         invitadas van sin token) ─────▶│                               │
       │                                        │ 1. Valida items contra DB     │
       │                                        │    (precio y active desde     │
       │                                        │    products, NUNCA del front) │
       │                                        │ 2. Valida zona de envío       │
       │                                        │    (is_pickup ⇒ sin dirección)│
       │                                        │ 3. generate_order_id() RPC    │
       │                                        │ 4. INSERT orders              │
       │                                        │    (status=pending_payment)   │
       │                                        │    + order_items + history    │
       │                                        │ 5. OAuth: POST                │
       │                                        │    id.wompi.sv/connect/token ─▶
       │                                        │ 6. POST api.wompi.sv/EnlacePago▶
       │                                        │    identificadorEnlaceComercio│
       │                                        │      = orderId                │
       │                                        │    urlRedirect = APP_URL/     │
       │                                        │      gracias?order=ID&key=HMAC│
       │                                        │    urlWebhook = APP_URL/      │
       │                                        │      api/wompi/webhook        │
       │                                        │ 7. INSERT payments (pending)  │
       │◀── { orderId, orderKey, urlEnlace } ───│                               │
       │                                        │                               │
       │ window.location = urlEnlace ──────────────────────────────────────────▶│
       │                                        │          (pago en página      │
       │                                        │           hospedada de Wompi) │
       │◀───────────── redirect a /gracias?order=ID&key=HMAC ──────────────────│
       │                                        │                               │
       │                                        │◀── POST /api/wompi/webhook ───│
       │                                        │    header wompi_hash =        │
       │                                        │    HMAC-SHA256(rawBody,       │
       │                                        │      WOMPI_API_SECRET)        │
       │                                        │ webhook.js:                   │
       │                                        │ • valida firma HMAC (401 si no)│
       │                                        │ • idempotente: si payments ya │
       │                                        │   está approved/declined sale │
       │                                        │ • ExitosaAprobada ⇒           │
       │                                        │   payment→approved,           │
       │                                        │   order→confirmed, history    │
       │                                        │ • si no ⇒ declined/cancelled  │
       │                                        │ • decrement_order_stock RPC   │
       │                                        │ • envía correo (físico o      │
       │                                        │   digital) — no bloqueante    │
       │                                        │                               │
       │ GraciasPage hace polling:              │                               │
       │ GET /api/wompi/order-status            │                               │
       │     ?order=ID&key=HMAC ───────────────▶│ order-status.js               │
       │◀── { order, payment, downloadLinks } ──│                               │
```

#### Detalles importantes

- **URL del webhook:** `https://nutrigabrielare.com/api/wompi/webhook` (se envía a Wompi en cada `EnlacePago` vía `configuracion.urlWebhook`; derivada de `APP_URL`).
- **Firma del webhook:** header `wompi_hash` = HMAC-SHA256 del **body crudo** con `WOMPI_API_SECRET`. El handler desactiva el bodyParser de Vercel (`export const config = { api: { bodyParser: false } }`) para hashear los bytes exactos.
- **Key HMAC de acceso a órdenes (`orderKey`):** `HMAC-SHA256(orderId, WOMPI_API_SECRET)` en hex. Se incluye en `urlRedirect` y en los correos digitales. Permite que una compradora **sin cuenta** vea su orden y regenere descargas en `/gracias?order=ID&key=…`. `order-status.js` recalcula la HMAC y compara; alternativamente acepta el JWT de la dueña de la orden.
- **El monto siempre sale de la DB:** `create-link.js` recalcula subtotal con `products.price` y el envío con `shipping_zones` (respeta `free_threshold` e `is_pickup`); el cliente no puede manipular precios.
- **Idempotencia del webhook:** si `payments.status` ya es `approved` o `declined`, responde `Already processed` sin tocar nada (evita doble descuento de stock y correos duplicados).
- El frontend consume estas funciones vía `src/services/paymentService.js` (`createPaymentLink`, `getCheckoutStatus`).

### 7.2 Resend (correos transaccionales)

- **Dominio verificado:** `nutrigabrielare.com` debe estar verificado en Resend (registros DKIM/SPF agregados en el DNS de Hostinger). Guía paso a paso en `docs/email-setup.md`.
- **Módulo central:** `api/_lib/email.js` — inicializa el cliente Resend (cacheado), define la maqueta de marca (`brandLayout`, paleta rosa `#EE7699`/`#D6517B`) y tres templates:

| Template (función) | `email_logs.template` | Disparador |
|---|---|---|
| `purchasePhysicalTemplate` → `sendPurchaseConfirmationEmail` | `purchase_confirm` | Webhook Wompi aprobado con al menos un ítem no digital. Incluye nº de pedido, tracking code y CTA "Seguir mi pedido" → `/tracking/:code` |
| `purchaseDigitalTemplate` → `sendDigitalDownloadEmail` | `digital_download` | Webhook aprobado con **todos** los ítems digitales, o reenvío admin. Incluye botones de descarga (signed URLs de 7 días) y CTA "Ver mi pedido" → `/gracias?order&key` |
| `reservationConfirmationTemplate` → `sendReservationConfirmationEmail` | `reservation_confirm` | Legado: `api/reservations/notify.js` (el flujo actual de reservas cobra al reservar) |
| `servicePaidTemplate` → `sendServicePaidEmail` | `service_paid` | Webhook aprobado con **todos** los ítems `service`: confirma el cupo pagado, incluye fecha preferida y CTA "Ver mi pedido" |
| (HTML simple) → `sendAdminServicePaidNotification` | `service_paid_admin` | Mismo evento, a `ADMIN_NOTIFY_EMAIL`: datos de contacto, fecha preferida, notas y link a la orden |

- **Fail-safe:** si `RESEND_API_KEY` no está configurada, los senders no lanzan error: registran `skipped` en `email_logs` y el flujo (webhook, reserva) continúa. Los fallos de Resend se registran como `failed` con `error_message`.
- **Auditoría:** cada intento queda en `email_logs` (insertado con service role). Visor con filtros (destinataria / template / estado) en **`/admin/emails`** (solo rol admin), vía `src/services/emailLogService.js`.
- **Endpoint de reenvío admin:** `POST /api/digital/resend-email` — requiere JWT con rol `admin` o `gestor`; valida que la orden esté en estado pagado (`confirmed`/`preparing`/`shipped`/`delivered`) y tenga ítems digitales con `digital_file_path`; regenera signed URLs de 7 días y reenvía el correo `digital_download`. Botón "Reenviar enlaces de descarga" en `/admin/ordenes/:id`.
- **Aviso al admin de reservas nuevas:** si `ADMIN_NOTIFY_EMAIL` está configurada, `reservations/notify.js` envía un segundo correo con los datos de la reserva y link a `/admin/reservas`.

### 7.3 Supabase

- **Auth:** email/password + Google OAuth. `src/context/AuthContext.jsx` gestiona la sesión con `onAuthStateChange`, y obtiene el rol con una llamada REST directa a la RPC `get_my_profile` (evita problemas de locks del cliente JS). Expone `isAdmin`, `isEditor` (editor o admin), `isGestor` (gestor o admin).
- **Roles en `profiles.role`:**

| Rol | Alcance |
|---|---|
| `customer` | Default. Compra, reserva, ve sus órdenes y biblioteca. Sin acceso a `/admin`. |
| `editor` | Catálogo (productos, categorías, variantes, imágenes), CMS del home, blog. |
| `gestor` | Órdenes, pagos, reservas, zonas de envío, reenvío de descargas. |
| `admin` | Todo lo anterior + usuarios/roles + visor de email logs. |

- **Storage:** ver tabla de buckets en §5.4. Regla de oro: `digital-products` es **privado**; el único camino de descarga para clientas son **signed URLs** generadas server-side — 7 días desde el webhook/reenvío, 24 horas desde la biblioteca (`POST /api/digital/refresh-url`, que valida la compra en `user_purchases`).
- **Clientes:**
  - Frontend: `src/lib/supabase.js` (anon key; si falta config exporta un proxy que lanza error explicativo).
  - Serverless: cada función crea su cliente con `SUPABASE_SERVICE_ROLE_KEY` (omite RLS), salvo `reservations/notify.js` que usa la anon key + JWT de la usuaria (respeta RLS deliberadamente).

---

## 8. CMS de contenido (home_content)

Tabla **de fila única** (`id = 'main'`) donde cada sección editable es una **columna JSONB** independiente. El sitio público la lee completa en cada carga (vía `HomeContentContext`, con deep-merge sobre `DEFAULT_HOME` para que el sitio **nunca se rompa** si Supabase falla o un campo falta). Los cambios se reflejan al instante: no hay draft/publish.

| Columna JSONB | Migración | Qué controla | Tab en `/admin/home` | Editor (`src/admin/components/home/`) |
|---|---|---|---|---|
| `hero` | 007 | Badge, líneas de título, subtítulo, CTAs, imagen hero, hojas decorativas | **Hero** | `HeroEditor.jsx` |
| `philosophy` | 007 | Badge, título, 3 pilares (icono+label), 4 estadísticas, imágenes decorativas | **Filosofía** | `PhilosophyEditor.jsx` |
| `why_choose_us` | 007 | Badge, título, 3 diferenciadores (icono+título+descripción), imagen del plato | **Diferenciador** | `WhyChooseUsEditor.jsx` |
| `featured` | 011 | Carrusel "Pleno Market" del home: títulos, CTA, límite de productos | **Pleno Market** | `FeaturedEditor.jsx` |
| `testimonials` | 018 | Título de sección y lista dinámica de testimonios (nombre, rol, ubicación, rating, cita) | **Testimonios** | `TestimonialsEditor.jsx` |
| `pleno_hero` | 019 | Textos del hero de `/pleno` | **Pleno** | `PlenoHeroEditor.jsx` |
| `nutri_hero` | 019 | Textos del hero de `/nutrigabrielare` | **Nutrigabrielare** | `NutriHeroEditor.jsx` |
| `fluir_content` | 019 | Textos del landing `/fluir-femenino` (hero, lecturas, recursos) | **Fluir Femenino** | `FluirContentEditor.jsx` |

Notas:
- La columna `features` original se conserva en la tabla pero la sección de servicios del catálogo migró a productos reales (`kind='service'`, migración 009). La columna `protocol` fue eliminada en 008.
- RLS: SELECT público; INSERT/UPDATE solo `is_editor()`.
- Servicio: `src/services/homeContentService.js` (`getHomeContent`, `updateHomeSection(sectionName, data)`, `uploadHomeImage`/`deleteHomeImage` contra el bucket `home-images`).
- Componentes compartidos de los editores: `SingleImageUploader.jsx` (subida con preview) e `IconPicker.jsx` (íconos Lucide pre-aprobados).

---

## 9. Flujos críticos

### 9.1 Compra de producto físico

1. La clienta agrega variantes (talla/color) al carrito (`CartContext`, persistido en `localStorage`).
2. En `/checkout` completa contacto + zona de envío + dirección. **No se exige login** (si hay sesión, el token se adjunta y la orden queda asociada a `user_id`). El formulario se guarda como borrador en `localStorage` (`nutri-checkout-draft`).
3. `createPaymentLink(checkout, token?)` → `api/wompi/create-link.js` crea la orden `pending_payment` y devuelve `urlEnlace`; el front guarda `{id, key}` en `localStorage` (`nutri-pending-order`) y redirige a Wompi.
4. Pago aprobado → webhook: orden `confirmed`, stock descontado (`decrement_order_stock`), correo `purchase_confirm` con tracking code.
5. Gestión posterior en `/admin/ordenes/:id`: avanzar estado (`preparing` → `shipped` → `delivered`), registrar `courier_name` y `courier_tracking_code`.
6. La clienta sigue su pedido en `/tracking/:code` (público, timeline desde `order_status_history`).

### 9.2 Compra digital (sin login, enlaces firmados)

1. Mismo checkout; si la zona elegida no aplica (productos digitales) el costo lo determina la zona igualmente — el flujo es idéntico hasta el webhook.
2. Si **todos** los ítems de la orden son `kind='digital'`, el webhook:
   - registra cada compra en `user_purchases` (solo si la orden tiene `user_id`);
   - genera **signed URLs de 7 días** del bucket privado `digital-products` (una por `digital_file_path`);
   - envía el correo `digital_download` con los botones de descarga y un link "Ver mi pedido" a `/gracias?order=ID&key=HMAC`.
3. **Acceso sin sesión:** la página `/gracias` con `order` + `key` llama a `api/wompi/order-status.js`, que valida la HMAC y, si la orden está pagada, **regenera signed URLs frescas de 7 días** en cada visita. Si los enlaces del correo vencen, basta volver a abrir esa URL.
4. **Con sesión:** además, la clienta ve su biblioteca en `/cuenta` ("Mis productos", `libraryService.getUserDigitalLibrary`) y puede pedir un enlace nuevo de **24 h** vía `POST /api/digital/refresh-url` (valida propiedad contra `user_purchases`).

### 9.3 Retiro en tienda (`is_pickup`)

1. En `/admin/envios` se crea/edita una zona con el flag **retiro en tienda** (`shipping_zones.is_pickup = true`), normalmente con costo $0.
2. En el checkout, al seleccionar esa zona, el formulario **oculta dirección/ciudad/departamento/notas** y muestra "Recoger en tienda"; esos campos se envían vacíos.
3. `create-link.js` detecta `zone.is_pickup` y **omite la validación de dirección** (para zonas normales la dirección es obligatoria).
4. La orden guarda `shipping_zone_name` como snapshot, así el historial conserva "Retiro en tienda" aunque la zona cambie después.

### 9.4 Reservas de servicios

1. Desde la página de un servicio (`/producto/:slug`, `kind='service'`) se navega a `/reservar/:slug` — ruta **pública** (sin sesión).
2. **Servicios con precio > 0:** el formulario (contacto + fecha/horario preferido + notas) llama a `create-link` con el servicio como ítem y un bloque `reservation`; el servidor crea la orden **y** la reserva (`pendiente`, `order_id` enlazado, service role) y redirige a Wompi. **Servicios con precio 0 ("Cotizar"):** se muestra un CTA de WhatsApp con mensaje precargado en lugar del formulario.
3. Al confirmarse el pago, el webhook: marca la reserva `pagado` (o `cancelado` si el pago fue rechazado), envía `service_paid` a la clienta y `service_paid_admin` a `ADMIN_NOTIFY_EMAIL` con los datos para coordinar la cita.
4. El equipo gestiona el ciclo en `/admin/reservas`: `pagado → contactado → confirmado → completado` (o `cancelado`). Las órdenes de servicio no requieren envío (igual que las digitales: el checkout y `create-link` omiten zona y dirección cuando no hay ítems físicos).

### 9.5 Reenvío de descargas desde el admin

1. `/admin/ordenes/:id` → botón **"Reenviar enlaces de descarga"** (visible para órdenes con productos digitales).
2. `orderService.resendDigitalDownloadEmail(orderId)` → `POST /api/digital/resend-email` con el JWT del admin.
3. El servidor valida: rol `admin`/`gestor`, orden en estado pagado, ítems digitales con archivo. Regenera signed URLs (7 días) y reenvía el correo a `orders.contact_email`. El resultado (y cualquier error) queda en `email_logs`.

---

## 10. Deploy

### 10.1 Frontend + funciones (Vercel)

- **Auto-deploy:** cada push a la rama **`main`** dispara un build en Vercel (`npm run build` → `dist/`). Las funciones de `api/` se despliegan en el mismo deploy.
- Los PRs generan **preview deployments** con su propia URL.
- `vercel.json` (rewrites): `/api/*` a funciones, `/sitemap.xml` a `api/sitemap.xml.js`, resto a `index.html`.
- `.npmrc` con `legacy-peer-deps=true` y `overrides` de react/react-dom en `package.json` — necesarios para que el install no falle con React 19. **No eliminarlos.**
- Tras cambiar variables `VITE_*` en Vercel hay que **redeployar** para que entren al bundle.

### 10.2 Migraciones SQL (Supabase) — proceso manual

Las migraciones **no se aplican automáticamente** en el deploy. Procedimiento:

1. Abrir Supabase → **SQL Editor** → New query.
2. Pegar el contenido de la siguiente migración pendiente (el número más bajo aún no aplicado en `supabase/migrations/`).
3. Ejecutar y verificar el resultado. Repetir por cada archivo pendiente, **en orden numérico**.
4. Alternativa CLI: `supabase login && supabase link --project-ref <ref> && supabase db push`.

> **Orden obligatorio: migración primero, merge/deploy después.** El código nuevo suele asumir columnas/tablas nuevas; si se deploya antes de migrar, producción rompe. Las migraciones son idempotentes (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`), así que re-ejecutarlas es seguro.

### 10.3 Checklist de un release típico

1. Merge del PR a `main` **después** de aplicar la migración (si la hay).
2. Verificar el deploy en Vercel (Deployments → estado Ready, revisar Function Logs si hay errores).
3. Smoke test: home carga, `/pleno` lista productos, checkout llega a Wompi sandbox/producción, `/admin` autentica.

---

## 11. Desarrollo local

```bash
# 1. Clonar
git clone <url-del-repo>
cd nutrigabrielare

# 2. Variables de entorno
cp .env.example .env
#   → completar VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (mínimo crítico)
#   → para probar pagos/correos: SUPABASE_SERVICE_ROLE_KEY, WOMPI_*, RESEND_API_KEY…

# 3. Dependencias (el .npmrc ya fija legacy-peer-deps)
npm install

# 4. Servidor de desarrollo
npm run dev        # Vite en http://localhost:5173
```

Otros scripts: `npm run build` (producción), `npm run preview` (sirve el build), `npm run lint` (ESLint). **No hay framework de tests configurado.**

⚠️ **Funciones `api/` en local:** `npm run dev` solo levanta el SPA (Vite no tiene proxy configurado para `/api`). Para probar checkout, webhooks o reenvíos localmente usá la CLI de Vercel:

```bash
npm i -g vercel
vercel dev         # sirve SPA + funciones api/ en el mismo puerto
```

Para que Wompi alcance el webhook local se necesita un túnel público (ej. `ngrok`) y setear `APP_URL` al túnel; en la práctica lo más simple es probar pagos contra un preview deployment de Vercel.

---

## 12. Runbooks operativos

### 12.1 Rotar `RESEND_API_KEY`

1. Resend → **API Keys** → Create API Key (scope: Sending, dominio verificado). Copiar la `re_…`.
2. Vercel → Project Settings → Environment Variables → reemplazar `RESEND_API_KEY` (Production y Preview).
3. **Redeploy** (Deployments → ⋯ → Redeploy del último build).
4. Verificar: hacer una compra/reserva de prueba y confirmar en `/admin/emails` que el log queda `sent`.
5. Revocar la key vieja en Resend.
- Impacto: ninguno sobre enlaces ya enviados (las signed URLs no dependen de Resend). Mientras la key esté ausente/ inválida, los correos quedan `skipped`/`failed` en `email_logs` pero **los pagos y órdenes siguen procesándose**.

### 12.2 Rotar `WOMPI_API_SECRET`

> ⚠️ **Advertencia importante:** este secreto se usa para **tres** cosas: autenticación OAuth con Wompi, validación HMAC del webhook **y derivación de la `orderKey`** (`HMAC-SHA256(orderId, WOMPI_API_SECRET)`). Rotarlo **invalida todos los links "Ver mi pedido" / `/gracias?order&key` ya enviados por correo** — las compradoras invitadas dejarán de poder abrir su pedido con el link viejo.

Procedimiento:
1. Generar el nuevo secret en el dashboard de Wompi.
2. Actualizar `WOMPI_API_SECRET` en Vercel y redeployar.
3. Verificar un pago de prueba completo (create-link → pago → webhook 200). Si el webhook devuelve 401, el secret de Vercel y el de Wompi no coinciden.
4. **Mitigación de links rotos:** para clientas que reporten que su link de pedido ya no funciona, reenviar el correo de descargas desde `/admin/ordenes/:id` (el reenvío genera la `key` con el secret nuevo). Los pedidos asociados a una cuenta no se ven afectados (acceden con su sesión).

### 12.3 Reenviar correo de descargas

1. `/admin/ordenes` → abrir la orden → sección de descargas digitales → **"Reenviar enlaces de descarga"**.
2. Requisitos: orden en estado `confirmed`/`preparing`/`shipped`/`delivered`, con ítems digitales cuyo producto tenga `digital_file_path`.
3. Errores comunes: *"Esta orden no tiene productos digitales"* (orden solo física), *"No se pudieron generar los enlaces"* (producto sin archivo subido al bucket — subirlo desde `/admin/productos/:id`), *"El correo no pudo enviarse"* (revisar `RESEND_API_KEY` y `/admin/emails`).

### 12.4 Agregar una zona de envío

1. `/admin/envios` → nueva zona: **nombre** (único), **costo**, **umbral de envío gratis** (opcional — si `subtotal ≥ umbral`, envío $0), **orden** y **activa**.
2. La zona aparece de inmediato en el selector del checkout (solo zonas `active=true`, ordenadas por `sort_order`).
3. Las órdenes guardan el nombre como snapshot (`orders.shipping_zone_name`); renombrar o borrar la zona no altera órdenes históricas.

### 12.5 Marcar una zona como retiro en tienda

1. `/admin/envios` → editar la zona → activar el flag **retiro en tienda** (`is_pickup`). Sugerencia: costo `0` y nombre claro ("Retiro en tienda — Santa Ana").
2. Efecto inmediato: en el checkout esa zona oculta los campos de dirección, y el backend deja de exigirlos para esa orden.

### 12.6 Ver logs de correos

- `/admin/emails` (solo rol **admin**). Filtros por destinataria (búsqueda parcial), template (`purchase_confirm` / `digital_download` / `reservation_confirm`) y estado (`sent` / `failed` / `skipped`).
- Cada fila enlaza `related_order_id` cuando aplica. `provider_message_id` permite cruzar con el dashboard de actividad de Resend.
- `skipped` casi siempre significa `RESEND_API_KEY` ausente o destinataria vacía; `failed` trae el `error_message` de Resend.

### 12.7 Un pago no se confirma (orden atascada en `pending_payment`)

Diagnóstico en orden:

1. **Dashboard de Wompi:** buscar la transacción del enlace (el `identificadorEnlaceComercio` es el id de la orden, ej. `NTG-2026-0042`). ¿La transacción existe y fue aprobada? ¿El webhook se entregó y con qué código de respuesta? Si Wompi muestra reintentos fallidos, reintentar el envío del webhook desde ahí.
2. **Tabla `payments`:** `status` sigue `pending` ⇒ el webhook nunca llegó o falló la firma. `raw_response` vacío confirma que no se procesó.
3. **Logs de la función:** Vercel → Functions → `api/wompi/webhook` → buscar `Webhook HMAC validation failed` (secret desalineado entre Wompi y Vercel) o errores de Supabase.
4. **`email_logs`:** si hay un `purchase_confirm`/`digital_download` para la orden, el webhook SÍ corrió y el problema es solo de visualización en el front.
5. **Resolución manual** (si Wompi confirmó el cobro pero el webhook no se puede reentregar): actualizar `payments.status='approved'` y `orders.status='confirmed'` + fila en `order_status_history` desde el SQL Editor, **descontar stock** ejecutando `select public.decrement_order_stock('NTG-2026-XXXX');` y reenviar el correo de descargas desde el admin si era digital.

### 12.8 Crear o cambiar el rol de un usuario admin

1. El usuario se registra normalmente en `/registro` (o `/admin/login` → no entrará hasta tener rol).
2. Un **admin** abre `/admin/usuarios` y asigna `admin`, `editor` o `gestor`.
3. Vía SQL (primer admin del sistema): `update public.profiles set role = 'admin' where email = '<correo>';` (también existe `scripts/create-admin.mjs`).

---

## 13. Seguridad

| Mecanismo | Implementación |
|---|---|
| **RLS en todas las tablas** | Cada tabla de `public` tiene políticas explícitas. Lo público (catálogo activo, posts publicados, tracking) usa `USING (true)` o `active=true`; lo sensible exige `auth.uid()` o los predicados `is_admin()` / `is_editor()` / `is_gestor()` (SECURITY DEFINER, definidos en migraciones 003–004). |
| **Service role solo server-side** | `SUPABASE_SERVICE_ROLE_KEY` vive únicamente en variables de entorno de Vercel y se usa solo dentro de `api/`. Nunca tiene prefijo `VITE_` ni aparece en el bundle. El frontend opera con la anon key + RLS. |
| **HMAC doble con `WOMPI_API_SECRET`** | (1) El webhook valida `wompi_hash` = HMAC-SHA256 del body crudo — payloads no firmados reciben 401 y no tocan la DB. (2) La `orderKey` de acceso a órdenes de invitadas es HMAC-SHA256 del orderId — no es adivinable ni enumerable. |
| **Bucket privado para digitales** | `digital-products` no es público; el contenido vendible solo se sirve con signed URLs temporales generadas con service role (7 días correo / 24 h biblioteca). Las políticas de Storage limitan la lectura directa a `is_editor()`. |
| **Precios y montos del lado servidor** | `create-link.js` recalcula subtotal/envío/total desde la DB e ignora cualquier monto del cliente. El webhook usa el estado de `payments` para impedir reprocesos. |
| **Roles con mínimo privilegio** | `editor` no ve órdenes ni pagos; `gestor` no toca catálogo ni CMS; solo `admin` administra usuarios y logs de correo. El gate se aplica en frontend (`AdminRoute`) **y** en backend (RLS + verificación de rol en `api/digital/resend-email.js`). |
| **Idempotencia y no-bloqueo** | El webhook es idempotente (no duplica stock/correos); el descuento de stock y los envíos de correo son no-bloqueantes (un fallo no pierde la confirmación del pago); los inserts a `email_logs` jamás interrumpen el flujo. |
| **Validación de configuración** | `src/config/runtimeConfig.js` (front) y `api/_lib/runtimeConfig.js` (server) detectan variables faltantes y fallan de forma explícita y controlada en vez de comportamientos a medias. |
| **`decrement_order_stock` restringido** | `REVOKE ALL … FROM PUBLIC; GRANT EXECUTE … TO service_role;` — solo el backend puede descontar stock. |

### Recomendaciones permanentes

- No subir `.env` ni `.env.local` al repositorio (están gitignored; `.env.example` es la única plantilla versionada).
- Rotar `SUPABASE_SERVICE_ROLE_KEY`, `WOMPI_API_SECRET` y `RESEND_API_KEY` ante cualquier sospecha de filtración (ver runbooks; recordar el impacto de rotar el secret de Wompi sobre los links de invitadas).
- Mantener un único usuario con rol `admin` por persona real; no compartir credenciales.
- Antes de tocar políticas RLS, probar en un proyecto Supabase de staging: un `USING (true)` mal puesto expone datos; un predicado mal puesto rompe el sitio público.
