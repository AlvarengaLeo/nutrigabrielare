// ─── Categories ────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  {
    id: 'ropa',
    num: '01',
    title: 'Ropa',
    tagline: 'Viste tu identidad',
    desc: 'Prendas diseñadas para los que llevan El Salvador en la sangre. Calidad real, estética callejera.',
    cta: 'Ver ropa',
  },
  {
    id: 'accesorios',
    num: '02',
    title: 'Accesorios',
    tagline: 'Los detalles que te definen',
    desc: 'Complementa tu look con piezas únicas que hablan de dónde venís y quién sos.',
    cta: 'Ver accesorios',
  },
  {
    id: 'edicion-limitada',
    num: '03',
    title: 'Edición Limitada',
    tagline: 'Solo para los que llegan primero',
    desc: 'Drops exclusivos de producción limitada. Cuando se acaban, se acaban.',
    cta: 'Ver edición limitada',
  },
];

// ─── Products ──────────────────────────────────────────────────────────────────

export const PRODUCTS = [
  // ── Ropa ──
  {
    id: 'prod-001',
    slug: 'playera-hermandad',
    name: 'Playera Hermandad',
    category: 'ropa',
    price: 28,
    description: 'Playera que representa la unidad de los majes. Corte unisex, tela 100% algodón pesado.',
    descriptionLong:
      'La Hermandad no es solo una playera — es un símbolo. Diseñada para los que saben que ser maje es más que una actitud: es una forma de vida. Confeccionada en algodón peinado de 220 g/m², con serigrafía resistente al lavado y un fit que aguanta el día a día sin perder forma.',
    images: [
      '/products/placeholder-dark.jpg',
      '/products/placeholder-dark.jpg',
    ],
    variants: {
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Negro', hex: '#111111' },
        { name: 'Blanco Hueso', hex: '#F5F0EB' },
      ],
    },
    stock: 40,
    active: true,
    featured: true,
  },
  {
    id: 'prod-002',
    slug: 'hoodie-origenes',
    name: 'Hoodie Orígenes',
    category: 'ropa',
    price: 55,
    description: 'Hoodie pesado con bordado de los orígenes. Para los días fríos con identidad caliente.',
    descriptionLong:
      'Inspirado en las raíces pipiles y la cultura urbana de El Salvador, el Hoodie Orígenes combina un bordado artesanal en el pecho con una tela de felpa francesa de 320 g/m². Capucha doble capa, bolsa canguro y puños acanalados. Hecho para durar tanto como tu amor por este suelo.',
    images: [
      '/products/placeholder-dark.jpg',
      '/products/placeholder-dark.jpg',
    ],
    variants: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Carbón', hex: '#2C2C2C' },
        { name: 'Caqui', hex: '#C3A882' },
      ],
    },
    stock: 25,
    active: true,
    featured: true,
  },
  {
    id: 'prod-003',
    slug: 'playera-cipote',
    name: 'Playera Cipote',
    category: 'ropa',
    price: 28,
    description: 'Para los cipotes que crecieron en las calles de Sivar. Gráfica bold, actitud más bold.',
    descriptionLong:
      'La Cipote es un guiño directo a la infancia salvadoreña. Gráfica de gran formato en el frente, tipografía custom y ese feeling de que la usaste hasta que se hizo trizas — pero esta aguanta mucho más. Algodón 100%, corte holgado, serigrafía plastisol de alta definición.',
    images: [
      '/products/placeholder-dark.jpg',
      '/products/placeholder-dark.jpg',
    ],
    variants: {
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Negro', hex: '#111111' },
        { name: 'Gris Mele', hex: '#9E9E9E' },
      ],
    },
    stock: 35,
    active: true,
    featured: false,
  },
  {
    id: 'prod-004',
    slug: 'crewneck-raices',
    name: 'Crewneck Raíces',
    category: 'ropa',
    price: 45,
    description: 'Crewneck clásico con el símbolo de las raíces. Hecho para los que nunca se olvidan de dónde son.',
    descriptionLong:
      'Un clásico reinventado. El Crewneck Raíces lleva bordado en el pecho el símbolo que une a todos los majes: las raíces que nos conectan a esta tierra. Felpa francesa de 300 g/m², cuello reforzado y un fit mid que queda bien con todo. La versión definitiva del crewneck centroamericano.',
    images: [
      '/products/placeholder-dark.jpg',
      '/products/placeholder-dark.jpg',
    ],
    variants: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Crema', hex: '#F5F0EB' },
        { name: 'Azul Noche', hex: '#1A2340' },
      ],
    },
    stock: 20,
    active: true,
    featured: false,
  },

  // ── Accesorios ──
  {
    id: 'prod-005',
    slug: 'gorra-clasica',
    name: 'Gorra Clásica',
    category: 'accesorios',
    price: 22,
    description: 'La gorra que completa el fit. Bordado Majes de Sivar en frente, estructura firme, ajuste metálico.',
    descriptionLong:
      'No hay fit completo sin la gorra. La Clásica de Majes de Sivar tiene 6 paneles de twill de algodón, visera curva pre-arqueada y bordado 3D en el frente. Ajuste metálico en la parte trasera para que le quede a cualquiera. Disponible en los colores que ya sabés que van con todo.',
    images: [
      '/products/placeholder-dark.jpg',
      '/products/placeholder-dark.jpg',
    ],
    variants: {
      sizes: ['Talla única'],
      colors: [
        { name: 'Negro', hex: '#111111' },
        { name: 'Crema', hex: '#F5F0EB' },
        { name: 'Verde Olivo', hex: '#5A6338' },
      ],
    },
    stock: 50,
    active: true,
    featured: true,
  },
  {
    id: 'prod-006',
    slug: 'taza-majes',
    name: 'Taza Majes',
    category: 'accesorios',
    price: 15,
    description: 'Para el café de las 6 a.m. antes de la pega. Cerámica resistente con el logo grabado.',
    descriptionLong:
      'Empezá el día como maje: con tu café en la taza de Majes de Sivar. Cerámica de alta temperatura, apta para microondas y lavavajillas. Logo grabado en relieve que no se borra con el uso. Capacidad de 350 ml — lo suficiente para aguantar hasta el primer break.',
    images: [
      '/products/placeholder-dark.jpg',
      '/products/placeholder-dark.jpg',
    ],
    variants: {
      sizes: ['350 ml'],
      colors: [
        { name: 'Negro Mate', hex: '#1A1A1A' },
        { name: 'Blanco', hex: '#FFFFFF' },
      ],
    },
    stock: 60,
    active: true,
    featured: false,
  },
  {
    id: 'prod-007',
    slug: 'sticker-pack',
    name: 'Sticker Pack',
    category: 'accesorios',
    price: 8,
    description: 'Pack de 6 stickers resistentes al agua. Ponelos donde quieras, duran lo que la hermandad.',
    descriptionLong:
      'Seis diseños exclusivos de Majes de Sivar en vinilo resistente al agua y al sol. Perfectos para laptops, skates, cascos o donde se te antoje. Impresión a todo color con acabado mate que no refleja la luz. Cada pack es diferente — todos tienen el mismo espíritu.',
    images: [
      '/products/placeholder-dark.jpg',
    ],
    variants: {
      sizes: ['Pack x6'],
      colors: [
        { name: 'Diseño surtido', hex: '#9fc2ff' },
      ],
    },
    stock: 100,
    active: true,
    featured: false,
  },

  // ── Edición Limitada ──
  {
    id: 'prod-008',
    slug: 'playera-edicion-001',
    name: 'Playera Edición 001',
    category: 'edicion-limitada',
    price: 40,
    description: 'El primer drop de edición limitada. Solo 100 unidades numeradas a mano. Ya van pocas.',
    descriptionLong:
      'La Edición 001 marcó el inicio de Majes de Sivar como lo conocés hoy. Cada pieza está numerada a mano en el cuello interno del 1 al 100. Diseño colaborativo con artistas salvadoreños, impresión serigráfica de 4 colores sobre base negra. Algodón peinado de 240 g/m². Cuando se acaban, se acaban — y estas no vuelven.',
    images: [
      '/products/placeholder-dark.jpg',
      '/products/placeholder-dark.jpg',
    ],
    variants: {
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Negro', hex: '#111111' },
      ],
    },
    stock: 12,
    active: true,
    featured: true,
  },
  {
    id: 'prod-009',
    slug: 'hoodie-numerado',
    name: 'Hoodie Numerado',
    category: 'edicion-limitada',
    price: 70,
    description: 'Solo 50 unidades. Hoodie premium numerado, con parche woven y caja coleccionable.',
    descriptionLong:
      'El Hoodie Numerado es el objeto de colección definitivo de Majes de Sivar. 50 unidades, cada una con número serigrafiado en el interior y parche woven cosido en la manga. Felpa francesa premium de 380 g/m², doble costura en todo el perímetro y cierre YKK. Viene en caja negra con papel de seda y tarjeta de autenticidad firmada. Para el maje que sabe que esto es historia.',
    images: [
      '/products/placeholder-dark.jpg',
      '/products/placeholder-dark.jpg',
    ],
    variants: {
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Negro', hex: '#111111' },
        { name: 'Azul Índigo', hex: '#2D3A8C' },
      ],
    },
    stock: 8,
    active: true,
    featured: true,
  },
];

// ─── Helper Functions ───────────────────────────────────────────────────────────

export function getProductsByCategory(categoryId) {
  return PRODUCTS.filter((p) => p.category === categoryId && p.active);
}

export function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export function getCategoryById(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId) ?? null;
}
