// Secciones reordenables del inicio. El Hero queda SIEMPRE fijo arriba y no
// entra en esta lista. El orden y la visibilidad se administran desde
// /admin/home → tab "Orden".

export const ORDERABLE_SECTION_IDS = [
  'stats',
  'philosophy',
  'digital_resources',
  'featured',
  'testimonials',
  'why_choose_us',
];

// Nombre amable de cada sección (mostrado en el panel de orden).
export const SECTION_LABELS = {
  stats: 'Casos de éxito',
  philosophy: 'Filosofía',
  digital_resources: 'Recursos',
  featured: 'Pleno Market',
  testimonials: 'Testimonios',
  why_choose_us: 'Acerca de mí',
};

// Descripción corta bajo cada nombre en el panel.
export const SECTION_DESCRIPTIONS = {
  stats: 'Barra 97% · 10+ · 9,000+ · 200+',
  philosophy: 'Bienestar Integral + pilares',
  digital_resources: 'Ebooks, guías y cursos',
  featured: 'Carrusel de suplementos destacados',
  testimonials: 'Historias de clientas',
  why_choose_us: 'Diferenciador / sobre Gabriela',
};

export const DEFAULT_SECTION_ORDER = ORDERABLE_SECTION_IDS.map((id) => ({
  id,
  visible: true,
}));

/**
 * Reconcilia el orden guardado con las secciones que existen en el código:
 * descarta ids desconocidos/repetidos y agrega al final las secciones nuevas
 * que falten. Así el sitio nunca rompe si el código gana o pierde una sección.
 */
export function reconcileSectionOrder(saved) {
  const list = Array.isArray(saved) ? saved : [];
  const seen = new Set();
  const result = [];
  for (const item of list) {
    const id = item?.id;
    if (ORDERABLE_SECTION_IDS.includes(id) && !seen.has(id)) {
      seen.add(id);
      result.push({ id, visible: item.visible !== false });
    }
  }
  for (const id of ORDERABLE_SECTION_IDS) {
    if (!seen.has(id)) result.push({ id, visible: true });
  }
  return result;
}
