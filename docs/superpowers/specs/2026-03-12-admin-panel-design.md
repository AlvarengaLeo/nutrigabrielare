# Phase 3: Admin Panel — Design Spec

## Overview

Admin panel integrated into the existing Majes de Sivar React app under `/admin/*` routes. Uses lazy loading to keep the public bundle lightweight. Shares the existing design system (crema, accent blue, Jakarta/Cormorant/Outfit fonts).

## Roles & Permissions

Three admin roles beyond `customer`:

| Capability | admin | editor | gestor |
|-----------|-------|--------|--------|
| Dashboard (all metrics) | Yes | Products only | Orders only |
| Products CRUD | Yes | Yes | No |
| Categories CRUD | Yes | Yes | No |
| Image upload | Yes | Yes | No |
| Orders (view/update status) | Yes | No | Yes |
| Users (view/assign roles) | Yes | No | No |

## Database Changes

### Schema

- `profiles.role` check constraint changes from `('customer', 'admin')` to `('customer', 'admin', 'editor', 'gestor')`
- New Supabase Storage bucket: `product-images` (public read, authenticated admin/editor write)

### New SQL Functions (SECURITY DEFINER)

- `is_editor()` — returns true if current user role is 'editor' or 'admin'
- `is_gestor()` — returns true if current user role is 'gestor' or 'admin'

### Updated RLS Policies

- Products/categories/images/variants: admin OR editor can manage
- Orders/order_items/order_status_history: admin OR gestor can manage
- Profiles: only admin can update roles

## Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/admin/login` | AdminLoginPage | Public |
| `/admin` | AdminDashboard | admin, editor, gestor |
| `/admin/productos` | AdminProductos | admin, editor |
| `/admin/productos/nuevo` | AdminProductoForm | admin, editor |
| `/admin/productos/:id` | AdminProductoForm | admin, editor |
| `/admin/categorias` | AdminCategorias | admin, editor |
| `/admin/ordenes` | AdminOrdenes | admin, gestor |
| `/admin/ordenes/:id` | AdminOrdenDetalle | admin, gestor |
| `/admin/usuarios` | AdminUsuarios | admin |

All admin routes are lazy-loaded via `React.lazy()` in App.jsx.

## Layout

### AdminLayout (wrapper for all /admin/* pages)

- Collapsible sidebar: expanded ~240px (icon + text), collapsed ~64px (icon only)
- Toggle button at top of sidebar, state persisted in localStorage
- Mobile: sidebar becomes drawer with hamburger toggle
- Header bar: section title + breadcrumb + user info (name + role badge)

### Sidebar Items (filtered by role)

| Icon (lucide) | Label | Route | Roles |
|---------------|-------|-------|-------|
| LayoutDashboard | Dashboard | /admin | all |
| Package | Productos | /admin/productos | admin, editor |
| Tags | Categorias | /admin/categorias | admin, editor |
| ShoppingBag | Ordenes | /admin/ordenes | admin, gestor |
| Users | Usuarios | /admin/usuarios | admin |

- Active item: `bg-accent/10 text-accent`
- Majes logo at top
- "Cerrar sesion" button at bottom
- "Ir al sitio" link to public site

## Pages

### AdminDashboard

4 metric cards:
- Total ventas ($) — sum of all delivered orders
- Ordenes pendientes — count where status = 'confirmed'
- Productos activos — count where active = true
- Usuarios registrados — count of profiles

Recent orders table: last 10 orders (ID, client name, total, status badge, date)

Alerts section:
- Low stock: variants with stock < 5
- Unprocessed orders: status = 'confirmed' older than 24 hours

Metrics filtered by role: editor sees only product metrics, gestor sees only order metrics.

### AdminProductos

Table view with columns: thumbnail image, name, category, price, total stock, active toggle.
Filters: category dropdown + text search by name.
Actions: "Nuevo producto" button, click row to edit, delete button.

### AdminProductoForm (create/edit)

Form fields:
- name (text)
- slug (auto-generated from name, editable)
- category_id (dropdown from categories)
- price (number)
- description (textarea)
- description_long (textarea)
- active (toggle)
- featured (toggle)

Variants section:
- Table of existing variants (size, color_name, color_hex, stock, active)
- "Agregar variante" button opens inline row
- Each variant can be edited or deleted

Images section:
- Grid of current images with sort order
- Drag & drop upload zone
- Upload to Supabase Storage: `product-images/{productId}/{filename}`
- Delete image button
- Reorder via sort_order

### AdminCategorias

Table: num, title, tagline, description, cta, sort_order, active.
Actions: create, edit (modal or inline), delete, reorder.

### AdminOrdenes

Table: ID, client (contact_name), total, status (colored badge), tracking_code, date.
Filter by status dropdown.
Click row to open detail.

### AdminOrdenDetalle

- Client info: name, email, phone
- Shipping address: full address fields
- Items table: image, product_name, size, color, quantity, price, line total
- Order totals: subtotal, shipping, total
- Status timeline (same as public tracking page)
- Status update: dropdown to change status + "Actualizar" button (appends to order_status_history)

### AdminUsuarios (admin only)

Table: email, first_name, last_name, role (badge), created_at.
Action: change role via dropdown (customer/admin/editor/gestor) with confirmation.

## Auth Changes

- `AuthContext.mapUser()` includes `role` field from profiles
- `fetchProfile()` selects `first_name, last_name, role`
- Context exposes: `user.role`, plus helpers `isAdmin`, `isEditor`, `isGestor`
- `AdminRoute` component: checks user role against allowed roles, redirects to `/admin/login` if unauthorized

## Supabase Storage

- Bucket: `product-images`
- Public read policy (anyone can view images)
- Write policy: authenticated users where `is_admin()` or `is_editor()`
- Path pattern: `product-images/{productId}/{timestamp}-{filename}`
- Product images table (`product_images.url`) stores the public URL

## Service Layer

### New: adminService.js

- `getDashboardMetrics()` — aggregated counts and sums for dashboard cards
- `getLowStockVariants(threshold)` — variants with stock < threshold
- `getRecentOrders(limit)` — last N orders with basic info

### Extended: productService.js

- `createProduct(data)` — insert product + variants + images
- `updateProduct(id, data)` — update product fields
- `deleteProduct(id)` — soft delete (set active=false) or hard delete
- `createVariant(productId, variant)` — add variant
- `updateVariant(variantId, data)` — update variant
- `deleteVariant(variantId)` — remove variant
- `uploadProductImage(productId, file)` — upload to Storage, insert to product_images
- `deleteProductImage(imageId)` — remove from Storage + product_images
- `getAllProductsAdmin()` — includes inactive products (no active filter)

### Extended: orderService.js

Already has: `getAllOrders()`, `updateOrderStatus()`, `getOrderById()`. No changes needed.

### New: categoryService.js

- `createCategory(data)` — insert category
- `updateCategory(id, data)` — update category
- `deleteCategory(id)` — soft delete or hard delete
- `getAllCategoriesAdmin()` — includes inactive categories

### New: userService.js

- `getAllUsers()` — fetch all profiles
- `updateUserRole(userId, role)` — update role field

## File Structure

```
src/
  admin/
    components/
      AdminLayout.jsx       — sidebar + header wrapper
      AdminSidebar.jsx       — collapsible sidebar
      AdminRoute.jsx         — role-based route guard
      DataTable.jsx          — reusable table component
      MetricCard.jsx         — dashboard metric card
      ImageUploader.jsx      — drag & drop image upload
      StatusBadge.jsx        — order status colored badge
      VariantEditor.jsx      — inline variant add/edit
    pages/
      AdminLoginPage.jsx
      AdminDashboard.jsx
      AdminProductos.jsx
      AdminProductoForm.jsx
      AdminCategorias.jsx
      AdminOrdenes.jsx
      AdminOrdenDetalle.jsx
      AdminUsuarios.jsx
  services/
    adminService.js          — NEW
    categoryService.js       — NEW
    userService.js           — NEW
    productService.js        — EXTEND
    orderService.js          — NO CHANGE
  context/
    AuthContext.jsx           — MODIFY (add role)
```

## Animation Pattern

Same GSAP pattern as public site but lighter:
- `gsap.fromTo` with `power3.out` easing
- 0.5s duration for page entrance
- 0.08s stagger for table rows
- No ScrollTrigger in admin (all content above fold)
