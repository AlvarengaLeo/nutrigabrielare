import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Philosophy from '../components/Philosophy';
import Protocol from '../components/Protocol';
import WhyChooseUs from '../components/WhyChooseUs';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Philosophy />
      <WhyChooseUs />
      <Features />
      <Protocol />
    </>
  );
}
