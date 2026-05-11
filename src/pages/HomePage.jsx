import React from 'react';
import { HomeContentProvider } from '../context/HomeContentContext';
import Hero from '../components/Hero';
import Philosophy from '../components/Philosophy';
import WhyChooseUs from '../components/WhyChooseUs';
import Featured from '../components/Featured';
import DigitalResources from '../components/DigitalResources';

export default function HomePage() {
  return (
    <HomeContentProvider>
      <Hero />
      <Philosophy />
      <Featured />
      <DigitalResources />
      <WhyChooseUs />
      {/* White extender that fills the footer's rounded-corner cut so it
          matches the white bg of the section above instead of revealing
          the page background. */}
      <div aria-hidden="true" className="relative z-10 -mb-16 h-16 w-full bg-white" />
    </HomeContentProvider>
  );
}
