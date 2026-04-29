import React from 'react';
import { HomeContentProvider } from '../context/HomeContentContext';
import Hero from '../components/Hero';
import Philosophy from '../components/Philosophy';
import WhyChooseUs from '../components/WhyChooseUs';
import Featured from '../components/Featured';

export default function HomePage() {
  return (
    <HomeContentProvider>
      <Hero />
      <Philosophy />
      <WhyChooseUs />
      <Featured />
    </HomeContentProvider>
  );
}
