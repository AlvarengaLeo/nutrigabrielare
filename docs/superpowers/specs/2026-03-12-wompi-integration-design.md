# Fase 4: Integración Wompi — Spec de Diseño

## Resumen

Integrar Wompi (El Salvador) como pasarela de pagos con tarjeta de crédito/débito. Usa el flujo de Payment Links: el backend crea un enlace de pago via API, el frontend redirige al usuario a Wompi, y un webhook actualiza el estado del pedido al completarse el pago.

## Flujo de Pago

```
1. Usuario completa formulario de envío en /checkout
2. Frontend → POST /api/wompi/create-link (orderId + JWT del usuario)
3. Backend verifica JWT, busca orden en DB, valida ownership y status
4. Backend → POST https://api.wompi.sv/EnlacePago (con API Secret, monto desde DB)
5. Backend ← { idEnlace, urlEnlace }
6. Backend → inserta registro en tabla payments (status: 'pending')
7. Frontend ← { urlEnlace }
8. Frontend redirige a urlEnlace (página de pago de Wompi)
9. Usuario paga en Wompi
10. Wompi redirige a /gracias?order=MJS-2026-XXXX&id=TRANSACTION_ID&esAprobada=true
11. Webhook: Wompi → POST /api/wompi/webhook → valida firma → actualiza payment + order
```

## Arquitectura

### Backend — Vercel Serverless Functions

Dos funciones en `/api`:

#### `POST /api/wompi/create-link`

**Input (JSON body):**
```json
{
  "orderId": "MJS-2026-0001"
}
```

**Headers:**
```
Authorization: Bearer <supabase_access_token>
```

**Lógica:**
1. Extrae JWT del header `Authorization`
2. Verifica el JWT con Supabase para obtener el `user_id`
3. Busca la orden en DB: confirma que `order.user_id === user_id` y `order.status === 'pending_payment'`
4. Usa `order.total` de la DB como monto (nunca confía en el cliente)
5. Construye `returnUrl` desde `APP_URL` env var + orderId (no del cliente)
6. Llama a `POST https://api.wompi.sv/EnlacePago` con:
   - `identificadorEnlaceComercio`: orderId
   - `monto`: order.total (verificar si Wompi espera centavos o decimales)
   - `nombreProducto`: `"Orden {orderId} — Majes de Sivar"`
   - `urlRetorno`: returnUrl construido server-side
   - Headers de autenticación con `WOMPI_APP_ID` + `WOMPI_API_SECRET`
7. Inserta registro en `payments` tabla via Supabase (service role key):
   - `order_id`: orderId
   - `provider`: 'wompi'
   - `provider_transaction_id`: idEnlace
   - `amount`: order.total
   - `currency`: 'USD'
   - `status`: 'pending'
8. Retorna `{ urlEnlace }` al frontend

**Output (JSON):**
```json
{ "urlEnlace": "https://pay.wompi.sv/..." }
```

**Errores:**
```json
{ "error": "mensaje descriptivo" }
```
- `401` — JWT inválido o ausente
- `403` — Orden no pertenece al usuario
- `400` — Orden no existe o no está en status `pending_payment`
- `500` — Error al crear enlace en Wompi o al insertar payment

**Variables de entorno (Vercel, sin prefijo VITE_):**
- `WOMPI_APP_ID`
- `WOMPI_API_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (para escribir en DB sin RLS)
- `APP_URL` (ej: `https://majesdesiver.com`, para construir returnUrl)

#### `POST /api/wompi/webhook`

**Input:** Payload de Wompi con evento de transacción.

**Lógica:**
1. Valida firma SHA256:
   - Extrae propiedades de `signature.properties` (en orden)
   - Concatena valores + `timestamp` + event secret
   - Genera SHA256 y compara con `signature.checksum`
2. **Idempotencia:** Busca el payment por `provider_transaction_id`. Si ya tiene status `approved` o `declined`, retorna `200 OK` sin procesar de nuevo.
3. Si el pago fue aprobado:
   - Actualiza `payments.status` → `'approved'`
   - Guarda `raw_response` (jsonb) con el payload completo
   - Actualiza `orders.status` → `'confirmed'`
   - Inserta en `order_status_history`
4. Si el pago fue rechazado:
   - Actualiza `payments.status` → `'declined'`
   - Guarda `raw_response`
   - Actualiza `orders.status` → `'cancelled'`
5. Retorna `200 OK`

**Variables de entorno adicionales:**
- `WOMPI_EVENT_SECRET` (para validar firma del webhook)

### Frontend

#### CheckoutPage.jsx — Cambios

Flujo actual:
```
Submit → createOrder() → clearCart → navigate(/gracias)
```

Flujo nuevo:
```
Submit → validar stock → createOrder(status: 'pending_payment') → POST /api/wompi/create-link → window.location.href = urlEnlace
```

- No se limpia el carrito hasta que el pago sea exitoso (en GraciasPage)
- Se guarda `orderId` en `localStorage` como respaldo
- Si falla la creación del link, muestra error y no redirige
- Pasa el `access_token` del usuario en el header Authorization
- Fix: eliminar el campo `notes` duplicado (bug existente)

#### GraciasPage.jsx — Cambios

- Lee `order` de query params (ya lo hace)
- Consulta el estado del pago de la orden
- Si `payment.status === 'approved'`: muestra confirmación normal + limpia carrito
- Si `payment.status === 'pending'`: muestra "Procesando tu pago..." con polling cada 5 segundos (máx 60s)
- Si después de 60s sigue pendiente: muestra "Tu pago está siendo procesado. Te enviaremos un correo cuando se confirme." con link a `/cuenta`
- Si `payment.status === 'declined'`: muestra mensaje de error con opción de reintentar
- Nota: `/gracias` es ruta protegida — si la sesión expira durante el pago en Wompi, el redirect a login debe preservar los query params del return URL

#### Nuevo: `src/services/paymentService.js`

```js
// Llama al serverless function para crear link de pago
async function createPaymentLink(orderId, accessToken)

// Consulta el estado del pago de una orden (via Supabase client)
async function getPaymentByOrderId(orderId)
```

#### orderService.js — Cambios

- `createOrder()` usa status `'pending_payment'` en vez de `'confirmed'`
- Cart se limpia en GraciasPage después de confirmar pago, no en CheckoutPage

#### CartContext.jsx — Cambios

- `clearCart()` ya existe, solo cambia cuándo se llama (de CheckoutPage a GraciasPage)

### Base de Datos

#### Migración 006: Agregar `pending_payment` al status check

La columna `orders.status` es `text` con CHECK constraint, no un enum de PostgreSQL:

```sql
ALTER TABLE public.orders DROP CONSTRAINT orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending_payment', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'));
```

No se necesitan cambios en la tabla `payments` — ya existe con los campos correctos.

Nota: el backend usa `SUPABASE_SERVICE_ROLE_KEY` para insertar en `payments` desde los serverless functions, bypassing RLS. Esto es intencional — no hay insert policy para payments porque solo el backend escribe ahí.

### Seguridad

- `WOMPI_API_SECRET` y `WOMPI_EVENT_SECRET` solo en el backend (variables de Vercel sin VITE_)
- `VITE_WOMPI_APP_ID` se puede mantener en frontend (es público)
- Webhook valida firma SHA256 antes de procesar
- Webhook es idempotente — no reprocesa pagos ya finalizados
- `create-link` valida JWT, ownership de la orden, y usa monto de la DB
- `returnUrl` se construye server-side (no del cliente)
- Service role key de Supabase solo en el backend
- RLS protege lecturas de payments (usuario solo ve los suyos)

### Variables de Entorno — Resumen

**Frontend (.env con VITE_ prefix):**
- `VITE_SUPABASE_URL` (ya existe)
- `VITE_SUPABASE_ANON_KEY` (ya existe)

**Backend (Vercel dashboard, sin VITE_):**
- `WOMPI_APP_ID`
- `WOMPI_API_SECRET`
- `WOMPI_EVENT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_URL` (ej: `https://majesdesiver.com`)

**Nota:** Remover `VITE_WOMPI_API_SECRET` del `.env` — el API Secret no debe estar en el frontend. Actualizar CLAUDE.md para reflejar esto.

### Estructura de Archivos Nuevos

```
api/
├── wompi/
│   ├── create-link.js      ← Serverless: crea enlace de pago
│   └── webhook.js           ← Serverless: recibe notificaciones de Wompi
src/
├── services/
│   └── paymentService.js    ← Frontend: llama a /api y consulta payments
supabase/
├── migrations/
│   └── 006_pending_payment_status.sql
```

### Archivos Modificados

```
src/pages/CheckoutPage.jsx    ← Redirige a Wompi en vez de /gracias
src/pages/GraciasPage.jsx     ← Verifica estado de pago + polling
src/services/orderService.js  ← Status inicial 'pending_payment'
src/context/CartContext.jsx    ← clearCart se llama desde GraciasPage
CLAUDE.md                     ← Actualizar env vars (remover VITE_WOMPI_API_SECRET)
.env                           ← Remover VITE_WOMPI_API_SECRET
```

### Estados del Pedido (Actualizado)

```
pending_payment → confirmed → preparing → shipped → delivered
                ↘ cancelled (si pago falla o timeout)
```

### Órdenes Huérfanas

Las órdenes en `pending_payment` que nunca se pagan quedan en la DB. Por ahora se manejan manualmente desde el panel admin. Se puede agregar un cron de limpieza en una fase futura.

### Testing Manual

1. Ir a `/checkout` con productos en el carrito
2. Completar formulario de envío
3. Click "Pagar con Wompi" → redirige a Wompi
4. Usar tarjeta de prueba de Wompi
5. Redirige a `/gracias` → muestra confirmación o "procesando"
6. Verificar en DB: order status = 'confirmed', payment status = 'approved'
7. Verificar en admin: orden aparece con status correcto
8. Test de pago fallido: usar tarjeta que decline
9. Test de idempotencia: webhook repetido no duplica registros
