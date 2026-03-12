-- ═══════════════════════════════════════════════════════════════════
-- Majes de Sivar — Phase 2: Seed Data
-- ═══════════════════════════════════════════════════════════════════

-- ─── CATEGORIES ──────────────────────────────────────────────────

insert into public.product_categories (id, num, title, tagline, description, cta, sort_order) values
  ('ropa', '01', 'Ropa', 'Viste tu identidad', 'Prendas diseñadas para los que llevan El Salvador en la sangre. Calidad real, estética callejera.', 'Ver ropa', 1),
  ('accesorios', '02', 'Accesorios', 'Los detalles que te definen', 'Complementa tu look con piezas únicas que hablan de dónde venís y quién sos.', 'Ver accesorios', 2),
  ('edicion-limitada', '03', 'Edición Limitada', 'Solo para los que llegan primero', 'Drops exclusivos de producción limitada. Cuando se acaban, se acaban.', 'Ver edición limitada', 3);

-- ─── PRODUCTS ────────────────────────────────────────────────────

insert into public.products (id, slug, name, category_id, price, description, description_long, active, featured) values
  ('prod-001', 'playera-hermandad', 'Playera Hermandad', 'ropa', 28.00,
    'Playera que representa la unidad de los majes. Corte unisex, tela 100% algodón pesado.',
    'La Hermandad no es solo una playera — es un símbolo. Diseñada para los que saben que ser maje es más que una actitud: es una forma de vida. Confeccionada en algodón peinado de 220 g/m², con serigrafía resistente al lavado y un fit que aguanta el día a día sin perder forma.',
    true, true),
  ('prod-002', 'hoodie-origenes', 'Hoodie Orígenes', 'ropa', 55.00,
    'Hoodie pesado con bordado de los orígenes. Para los días fríos con identidad caliente.',
    'Inspirado en las raíces pipiles y la cultura urbana de El Salvador, el Hoodie Orígenes combina un bordado artesanal en el pecho con una tela de felpa francesa de 320 g/m². Capucha doble capa, bolsa canguro y puños acanalados. Hecho para durar tanto como tu amor por este suelo.',
    true, true),
  ('prod-003', 'playera-cipote', 'Playera Cipote', 'ropa', 28.00,
    'Para los cipotes que crecieron en las calles de Sivar. Gráfica bold, actitud más bold.',
    'La Cipote es un guiño directo a la infancia salvadoreña. Gráfica de gran formato en el frente, tipografía custom y ese feeling de que la usaste hasta que se hizo trizas — pero esta aguanta mucho más. Algodón 100%, corte holgado, serigrafía plastisol de alta definición.',
    true, false),
  ('prod-004', 'crewneck-raices', 'Crewneck Raíces', 'ropa', 45.00,
    'Crewneck clásico con el símbolo de las raíces. Hecho para los que nunca se olvidan de dónde son.',
    'Un clásico reinventado. El Crewneck Raíces lleva bordado en el pecho el símbolo que une a todos los majes: las raíces que nos conectan a esta tierra. Felpa francesa de 300 g/m², cuello reforzado y un fit mid que queda bien con todo. La versión definitiva del crewneck centroamericano.',
    true, false),
  ('prod-005', 'gorra-clasica', 'Gorra Clásica', 'accesorios', 22.00,
    'La gorra que completa el fit. Bordado Majes de Sivar en frente, estructura firme, ajuste metálico.',
    'No hay fit completo sin la gorra. La Clásica de Majes de Sivar tiene 6 paneles de twill de algodón, visera curva pre-arqueada y bordado 3D en el frente. Ajuste metálico en la parte trasera para que le quede a cualquiera. Disponible en los colores que ya sabés que van con todo.',
    true, true),
  ('prod-006', 'taza-majes', 'Taza Majes', 'accesorios', 15.00,
    'Para el café de las 6 a.m. antes de la pega. Cerámica resistente con el logo grabado.',
    'Empezá el día como maje: con tu café en la taza de Majes de Sivar. Cerámica de alta temperatura, apta para microondas y lavavajillas. Logo grabado en relieve que no se borra con el uso. Capacidad de 350 ml — lo suficiente para aguantar hasta el primer break.',
    true, false),
  ('prod-007', 'sticker-pack', 'Sticker Pack', 'accesorios', 8.00,
    'Pack de 6 stickers resistentes al agua. Ponelos donde quieras, duran lo que la hermandad.',
    'Seis diseños exclusivos de Majes de Sivar en vinilo resistente al agua y al sol. Perfectos para laptops, skates, cascos o donde se te antoje. Impresión a todo color con acabado mate que no refleja la luz. Cada pack es diferente — todos tienen el mismo espíritu.',
    true, false),
  ('prod-008', 'playera-edicion-001', 'Playera Edición 001', 'edicion-limitada', 40.00,
    'El primer drop de edición limitada. Solo 100 unidades numeradas a mano. Ya van pocas.',
    'La Edición 001 marcó el inicio de Majes de Sivar como lo conocés hoy. Cada pieza está numerada a mano en el cuello interno del 1 al 100. Diseño colaborativo con artistas salvadoreños, impresión serigráfica de 4 colores sobre base negra. Algodón peinado de 240 g/m². Cuando se acaban, se acaban — y estas no vuelven.',
    true, true),
  ('prod-009', 'hoodie-numerado', 'Hoodie Numerado', 'edicion-limitada', 70.00,
    'Solo 50 unidades. Hoodie premium numerado, con parche woven y caja coleccionable.',
    'El Hoodie Numerado es el objeto de colección definitivo de Majes de Sivar. 50 unidades, cada una con número serigrafiado en el interior y parche woven cosido en la manga. Felpa francesa premium de 380 g/m², doble costura en todo el perímetro y cierre YKK. Viene en caja negra con papel de seda y tarjeta de autenticidad firmada. Para el maje que sabe que esto es historia.',
    true, true);

-- ─── PRODUCT IMAGES ──────────────────────────────────────────────

insert into public.product_images (product_id, url, sort_order) values
  ('prod-001', '/products/placeholder-dark.jpg', 0),
  ('prod-001', '/products/placeholder-dark.jpg', 1),
  ('prod-002', '/products/placeholder-dark.jpg', 0),
  ('prod-002', '/products/placeholder-dark.jpg', 1),
  ('prod-003', '/products/placeholder-dark.jpg', 0),
  ('prod-003', '/products/placeholder-dark.jpg', 1),
  ('prod-004', '/products/placeholder-dark.jpg', 0),
  ('prod-004', '/products/placeholder-dark.jpg', 1),
  ('prod-005', '/products/placeholder-dark.jpg', 0),
  ('prod-005', '/products/placeholder-dark.jpg', 1),
  ('prod-006', '/products/placeholder-dark.jpg', 0),
  ('prod-006', '/products/placeholder-dark.jpg', 1),
  ('prod-007', '/products/placeholder-dark.jpg', 0),
  ('prod-008', '/products/placeholder-dark.jpg', 0),
  ('prod-008', '/products/placeholder-dark.jpg', 1),
  ('prod-009', '/products/placeholder-dark.jpg', 0),
  ('prod-009', '/products/placeholder-dark.jpg', 1);

-- ─── PRODUCT VARIANTS ────────────────────────────────────────────

-- prod-001: Playera Hermandad (stock ~40)
insert into public.product_variants (product_id, size, color_name, color_hex, stock) values
  ('prod-001', 'S', 'Negro', '#111111', 5),
  ('prod-001', 'M', 'Negro', '#111111', 5),
  ('prod-001', 'L', 'Negro', '#111111', 5),
  ('prod-001', 'XL', 'Negro', '#111111', 5),
  ('prod-001', 'S', 'Blanco Hueso', '#F5F0EB', 5),
  ('prod-001', 'M', 'Blanco Hueso', '#F5F0EB', 5),
  ('prod-001', 'L', 'Blanco Hueso', '#F5F0EB', 5),
  ('prod-001', 'XL', 'Blanco Hueso', '#F5F0EB', 5);

-- prod-002: Hoodie Orígenes (stock ~25)
insert into public.product_variants (product_id, size, color_name, color_hex, stock) values
  ('prod-002', 'S', 'Carbón', '#2C2C2C', 2),
  ('prod-002', 'M', 'Carbón', '#2C2C2C', 3),
  ('prod-002', 'L', 'Carbón', '#2C2C2C', 3),
  ('prod-002', 'XL', 'Carbón', '#2C2C2C', 2),
  ('prod-002', 'XXL', 'Carbón', '#2C2C2C', 2),
  ('prod-002', 'S', 'Caqui', '#C3A882', 2),
  ('prod-002', 'M', 'Caqui', '#C3A882', 3),
  ('prod-002', 'L', 'Caqui', '#C3A882', 3),
  ('prod-002', 'XL', 'Caqui', '#C3A882', 3),
  ('prod-002', 'XXL', 'Caqui', '#C3A882', 2);

-- prod-003: Playera Cipote (stock ~35)
insert into public.product_variants (product_id, size, color_name, color_hex, stock) values
  ('prod-003', 'S', 'Negro', '#111111', 4),
  ('prod-003', 'M', 'Negro', '#111111', 5),
  ('prod-003', 'L', 'Negro', '#111111', 5),
  ('prod-003', 'XL', 'Negro', '#111111', 4),
  ('prod-003', 'S', 'Gris Mele', '#9E9E9E', 4),
  ('prod-003', 'M', 'Gris Mele', '#9E9E9E', 5),
  ('prod-003', 'L', 'Gris Mele', '#9E9E9E', 4),
  ('prod-003', 'XL', 'Gris Mele', '#9E9E9E', 4);

-- prod-004: Crewneck Raíces (stock ~20)
insert into public.product_variants (product_id, size, color_name, color_hex, stock) values
  ('prod-004', 'S', 'Crema', '#F5F0EB', 2),
  ('prod-004', 'M', 'Crema', '#F5F0EB', 2),
  ('prod-004', 'L', 'Crema', '#F5F0EB', 2),
  ('prod-004', 'XL', 'Crema', '#F5F0EB', 2),
  ('prod-004', 'XXL', 'Crema', '#F5F0EB', 2),
  ('prod-004', 'S', 'Azul Noche', '#1A2340', 2),
  ('prod-004', 'M', 'Azul Noche', '#1A2340', 2),
  ('prod-004', 'L', 'Azul Noche', '#1A2340', 2),
  ('prod-004', 'XL', 'Azul Noche', '#1A2340', 2),
  ('prod-004', 'XXL', 'Azul Noche', '#1A2340', 2);

-- prod-005: Gorra Clásica (stock ~50)
insert into public.product_variants (product_id, size, color_name, color_hex, stock) values
  ('prod-005', 'Talla única', 'Negro', '#111111', 17),
  ('prod-005', 'Talla única', 'Crema', '#F5F0EB', 17),
  ('prod-005', 'Talla única', 'Verde Olivo', '#5A6338', 16);

-- prod-006: Taza Majes (stock ~60)
insert into public.product_variants (product_id, size, color_name, color_hex, stock) values
  ('prod-006', '350 ml', 'Negro Mate', '#1A1A1A', 30),
  ('prod-006', '350 ml', 'Blanco', '#FFFFFF', 30);

-- prod-007: Sticker Pack (stock ~100)
insert into public.product_variants (product_id, size, color_name, color_hex, stock) values
  ('prod-007', 'Pack x6', 'Diseño surtido', '#9fc2ff', 100);

-- prod-008: Playera Edición 001 (stock ~12)
insert into public.product_variants (product_id, size, color_name, color_hex, stock) values
  ('prod-008', 'S', 'Negro', '#111111', 3),
  ('prod-008', 'M', 'Negro', '#111111', 3),
  ('prod-008', 'L', 'Negro', '#111111', 3),
  ('prod-008', 'XL', 'Negro', '#111111', 3);

-- prod-009: Hoodie Numerado (stock ~8)
insert into public.product_variants (product_id, size, color_name, color_hex, stock) values
  ('prod-009', 'S', 'Negro', '#111111', 1),
  ('prod-009', 'M', 'Negro', '#111111', 1),
  ('prod-009', 'L', 'Negro', '#111111', 1),
  ('prod-009', 'XL', 'Negro', '#111111', 1),
  ('prod-009', 'S', 'Azul Índigo', '#2D3A8C', 1),
  ('prod-009', 'M', 'Azul Índigo', '#2D3A8C', 1),
  ('prod-009', 'L', 'Azul Índigo', '#2D3A8C', 1),
  ('prod-009', 'XL', 'Azul Índigo', '#2D3A8C', 1);
