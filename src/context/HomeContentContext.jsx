import React, { createContext, useContext, useEffect, useState } from 'react';
import { getHomeContent } from '../services/homeContentService';
import { DEFAULT_SECTION_ORDER, reconcileSectionOrder } from '../config/homeSections';

// ─── Default content (current hardcoded values as fallback) ──────────────────

export const DEFAULT_HOME = {
  hero: {
    badge: 'Enfoque Holístico',
    titleLine1: 'Armonía entre',
    titleHighlight1: 'Cuerpo',
    titleLine2: 'y Salud',
    titleHighlight2: 'Hormonal',
    subtitle: 'Te acompaño a lograr un balance integral conectando alma, mente y cuerpo. Alcanza tus objetivos físicos cuidando tu salud hormonal, metabólica y digestiva en todo momento.',
    primaryCta: { text: 'Explorar Servicios', href: '/nutrigabrielare?categoria=service#nutri-catalogo' },
    secondaryCta: { text: 'Recursos y Ebooks', href: '/nutrigabrielare?categoria=digital#nutri-catalogo' },
    heroImage: '/media/hero_model.png',
    showDecorativeLeaves: true,
  },
  philosophy: {
    badge: 'Mi Filosofía',
    titleLine1: 'Bienestar',
    titleHighlight1: 'Integral',
    titleLine2: 'para la Mujer de',
    titleHighlight2: 'Hoy',
    values: [
      { icon: 'Heart', label: 'Cercanía' },
      { icon: 'Activity', label: 'Salud Hormonal' },
      { icon: 'Brain', label: 'Mente y Alma' },
    ],
    description: 'Te ofrezco un espacio lleno de calma y motivación. Creo firmemente en que los resultados físicos llegan por sí solos cuando construimos una base sólida de hábitos, cuidando nuestro entorno emocional y nuestro balance hormonal interno.',
    stats: [
      { value: '99%', label: 'Casos de Éxito' },
      { value: '12+', label: 'Años de Experiencia' },
      { value: '1,200+', label: 'Planes Creados' },
      { value: '200+', label: 'Recursos Disponibles' },
    ],
    decorativeImages: {
      topLeft: '/media/ora.png',
      midLeft: '/media/pom.png',
      topRight: '/media/tom.png',
      midRight: '/media/broc.png',
    },
  },
  why_choose_us: {
    badge: 'Tu Diferenciador',
    titleLine1: 'Más que una',
    titleHighlight1: 'Dieta',
    titleLine2: 'Un Estilo de',
    titleHighlight2: 'Vida',
    reasons: [
      { icon: 'Scale', title: 'Especialización en Salud Hormonal', description: 'Enfocamos nuestros planes en el cuidado de tu metabolismo y balance hormonal, un pilar fundamental para la pérdida de peso sostenible en la mujer.' },
      { icon: 'HeartPulse', title: 'Enfoque Holístico Integral', description: 'No solo contamos calorías. Evaluamos tu calidad de sueño, salud mental, digestiva y opciones de movimiento para crear una rutina verdaderamente adaptada a ti.' },
      { icon: 'Carrot', title: 'Herramientas Digitales y App', description: 'A través de una app exclusiva podrás visualizar tu progreso y acceder a tu plan. También encontrarás guías y recetarios desde la tienda online.' },
    ],
    plateImage: '/media/healthy_plate.png',
  },
  featured: {
    titleLine1: 'Pleno',
    titleLine2: 'Market.',
    subtitle: 'Seleccionados por Gabriela para tu bienestar',
    ctaLabel: 'Ver todo',
    ctaTo: '/pleno',
    productLimit: 5,
  },
  digital_resources: {
    eyebrow: 'APRENDE CON GABRIELA',
    titleLine1: 'Recursos que puedes',
    titleLine2: 'usar hoy.',
    subtitle: 'Ebooks, guías y cursos diseñados por Gabriela. Cómpralos de una vez y úsalos ¡siempre!',
  },
  section_order: DEFAULT_SECTION_ORDER,
  testimonials: {
    badge: 'Testimonios',
    titleLine1: 'Historias reales de',
    titleHighlight1: 'Mujeres',
    titleLine2: 'que recuperaron su',
    titleHighlight2: 'Equilibrio',
    subtitle: 'Acompañamiento cercano, sin dietas extremas. Esto es lo que viven quienes confían su salud hormonal, metabólica y digestiva a este proceso.',
    ctaLabel: 'Quiero empezar mi proceso',
    ctaTo: '/nutrigabrielare?categoria=digital#nutri-catalogo',
    items: [
      {
        name: 'Andrea Martínez',
        role: 'Plan Hormonal',
        location: 'San Salvador',
        rating: 5,
        quote: 'Después de años con desórdenes hormonales, por fin entendí mi cuerpo. Me acompañó sin dietas extremas y hoy tengo energía toda la semana.',
      },
      {
        name: 'Valeria Reyes',
        role: 'Acompañamiento Fluir',
        location: 'Santa Tecla',
        rating: 5,
        quote: 'No solo bajé de peso, recuperé mi ciclo y mi calma. El enfoque integral cambió por completo mi relación con la comida.',
      },
      {
        name: 'Karla Sánchez',
        role: 'Consulta 1:1',
        location: 'Antiguo Cuscatlán',
        rating: 5,
        quote: 'Cada plan se sintió hecho para mí. Las guías y la app hicieron fácil sostener mis hábitos incluso en las semanas más ocupadas.',
      },
      {
        name: 'Daniela Guzmán',
        role: 'Programa Digestivo',
        location: 'San Miguel',
        rating: 5,
        quote: 'Mis problemas digestivos eran diarios. En pocas semanas noté la diferencia y aprendí a comer sin miedo.',
      },
      {
        name: 'Mónica Portillo',
        role: 'Plan Metabólico',
        location: 'Soyapango',
        rating: 4.5,
        quote: 'Profesional, cercana y honesta. Me explicó el porqué de cada cambio y eso me dio la confianza para sostenerlo en el tiempo.',
      },
      {
        name: 'Gabriela Aguilar',
        role: 'Recursos & Ebooks',
        location: 'Online',
        rating: 5,
        quote: 'Los ebooks son oro: información clara, recetas reales y un acompañamiento que se siente humano de principio a fin.',
      },
    ],
  },
  pleno_hero: {
    titleLine1: 'Bienestar en su forma',
    titleLine2: 'más plena.',
    subtitle: 'Productos digitales, suplementos seleccionados y consultas con acompañamiento real. Una sola tienda para tu bienestar integral.',
    image: '', // foto fija de la vitrina; vacío = usa el producto destacado
  },
  nutri_hero: {
    titleLine1: 'Recursos y consultas',
    titleHighlight: 'para tu camino.',
    subtitle: 'Ebooks, guías y consultas 1:1 con enfoque holístico. Descargables al instante y acompañamiento real cuando lo necesitás.',
    image: '', // foto fija de la vitrina; vacío = usa el producto destacado
  },
  fluir_content: {
    heroTitle: 'Un espacio para fluir',
    heroHighlight: 'en tu propio tiempo.',
    heroSubtitle: 'Lecturas, recursos y una comunidad para acompañar tu salud hormonal, tu mente y tu ciclo — sin prisa, sin pausa forzada.',
    lecturasTitle: 'Lecturas',
    lecturasHighlight: 'recientes.',
    resourcesTitleLine1: 'Lo que la lectura',
    resourcesTitleLine2: 'no alcanza a cubrir.',
    resourcesSubtitle: 'Ebooks, cursos y guías diseñados por Gabriela para acompañarte más allá del artículo.',
  },
};

// ─── Context ─────────────────────────────────────────────────────────────────

const HomeContentContext = createContext(null);

// Stale-while-revalidate: la última fila conocida de home_content se cachea en
// localStorage para que las visitas siguientes rendericen el contenido real al
// instante (sin flash de los textos default) mientras se refresca en silencio.
const CACHE_KEY = 'nutri-home-content:v3';

function mergeRow(data) {
  return {
    hero: { ...DEFAULT_HOME.hero, ...(data.hero || {}) },
    philosophy: { ...DEFAULT_HOME.philosophy, ...(data.philosophy || {}) },
    why_choose_us: { ...DEFAULT_HOME.why_choose_us, ...(data.why_choose_us || {}) },
    featured: { ...DEFAULT_HOME.featured, ...(data.featured || {}) },
    digital_resources: { ...DEFAULT_HOME.digital_resources, ...(data.digital_resources || {}) },
    testimonials: { ...DEFAULT_HOME.testimonials, ...(data.testimonials || {}) },
    pleno_hero: { ...DEFAULT_HOME.pleno_hero, ...(data.pleno_hero || {}) },
    nutri_hero: { ...DEFAULT_HOME.nutri_hero, ...(data.nutri_hero || {}) },
    fluir_content: { ...DEFAULT_HOME.fluir_content, ...(data.fluir_content || {}) },
    section_order: reconcileSectionOrder(data.section_order),
  };
}

function loadCachedRow() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function HomeContentProvider({ children }) {
  const [{ content, loading }, setState] = useState(() => {
    const cached = loadCachedRow();
    return cached
      ? { content: mergeRow(cached), loading: false }
      : { content: DEFAULT_HOME, loading: true };
  });

  useEffect(() => {
    let cancelled = false;

    // Si Supabase cuelga (sin fallar), soltamos loading a los 4s para que la
    // página renderice con los defaults en vez de quedarse en blanco.
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setState((s) => (s.loading ? { ...s, loading: false } : s));
      }
    }, 4000);

    getHomeContent()
      .then((data) => {
        if (cancelled || !data) return;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
          // ignore quota errors
        }
        setState({ content: mergeRow(data), loading: false });
      })
      .catch(() => {
        // Keep defaults/cache on error
      })
      .finally(() => {
        clearTimeout(timeoutId);
        if (!cancelled) {
          setState((s) => (s.loading ? { ...s, loading: false } : s));
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <HomeContentContext.Provider value={{ content, loading }}>
      {children}
    </HomeContentContext.Provider>
  );
}

/**
 * Hook to access the home page content.
 * Returns { content, loading } where content always has a valid shape (with defaults).
 */
export function useHomeContent() {
  const ctx = useContext(HomeContentContext);
  if (!ctx) {
    // If used outside provider, return defaults
    return { content: DEFAULT_HOME, loading: false };
  }
  return ctx;
}
