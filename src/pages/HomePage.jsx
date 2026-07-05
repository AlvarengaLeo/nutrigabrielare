import React from 'react';
import { HomeContentProvider, useHomeContent } from '../context/HomeContentContext';
import Hero from '../components/Hero';
import SuccessStats from '../components/SuccessStats';
import Philosophy from '../components/Philosophy';
import WhyChooseUs from '../components/WhyChooseUs';
import Featured from '../components/Featured';
import HomeResources from '../components/HomeResources';
import Testimonials from '../components/Testimonials';

// id de sección (config/homeSections.js) → componente que la renderiza.
const SECTION_COMPONENTS = {
  stats: SuccessStats,
  philosophy: Philosophy,
  digital_resources: HomeResources,
  featured: Featured,
  testimonials: Testimonials,
  why_choose_us: WhyChooseUs,
};

function HomeSections() {
  const { content } = useHomeContent();
  const order = content.section_order || [];

  return (
    <>
      {/* El Hero queda siempre fijo arriba (no reordenable). */}
      <Hero />

      {order
        .filter((s) => s.visible !== false)
        .map((s) => {
          const Comp = SECTION_COMPONENTS[s.id];
          return Comp ? <Comp key={s.id} /> : null;
        })}

      {/* White extender que rellena el corte redondeado del footer para que
          coincida con el fondo blanco de la sección de arriba. */}
      <div aria-hidden="true" className="relative z-10 -mb-16 h-16 w-full bg-white" />
    </>
  );
}

export default function HomePage() {
  return (
    <HomeContentProvider>
      <HomeSections />
    </HomeContentProvider>
  );
}
