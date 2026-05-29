import React, { createContext, useContext, useEffect, useState } from 'react';
import { getHomeContent } from '../services/homeContentService';

// ─── Default content (current hardcoded values as fallback) ──────────────────

export const DEFAULT_HOME = {
  hero: {
    badge: 'Enfoque Holístico',
    titleLine1: 'Armonía entre',
    titleHighlight1: 'Cuerpo',
    titleLine2: 'y Salud',
    titleHighlight2: 'Hormonal',
    subtitle: 'Te acompaño a lograr un balance integral conectando alma, mente y cuerpo. Alcanza tus objetivos físicos cuidando tu salud hormonal, metabólica y digestiva en todo momento.',
    primaryCta: { text: 'Explorar Servicios', href: '#servicios' },
    secondaryCta: { text: 'Recursos y Ebooks', href: '#recursos' },
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
    ctaLabel: 'Ver todo',
    ctaTo: '/pleno',
    productLimit: 5,
  },
  testimonials: {
    badge: 'Testimonios',
    titleLine1: 'Historias reales de',
    titleHighlight1: 'Mujeres',
    titleLine2: 'que recuperaron su',
    titleHighlight2: 'Equilibrio',
    subtitle: 'Acompañamiento cercano, sin dietas extremas. Esto es lo que viven quienes confían su salud hormonal, metabólica y digestiva a este proceso.',
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
};

// ─── Context ─────────────────────────────────────────────────────────────────

const HomeContentContext = createContext(null);

export function HomeContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_HOME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getHomeContent()
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setContent({
            hero: { ...DEFAULT_HOME.hero, ...(data.hero || {}) },
            philosophy: { ...DEFAULT_HOME.philosophy, ...(data.philosophy || {}) },
            why_choose_us: { ...DEFAULT_HOME.why_choose_us, ...(data.why_choose_us || {}) },
            featured: { ...DEFAULT_HOME.featured, ...(data.featured || {}) },
            testimonials: { ...DEFAULT_HOME.testimonials, ...(data.testimonials || {}) },
          });
        }
      })
      .catch(() => {
        // Keep defaults on error
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
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
