import React from 'react';
import { HomeContentProvider } from '../context/HomeContentContext';
import Hero from '../components/Hero';
import Philosophy from '../components/Philosophy';
import WhyChooseUs from '../components/WhyChooseUs';
import Features from '../components/Features';

export default function HomePage() {
  return (
    <HomeContentProvider>
      <Hero />
      <Philosophy />
      <WhyChooseUs />
      <Features />
    </HomeContentProvider>
  );
}
