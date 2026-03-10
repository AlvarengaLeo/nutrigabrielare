import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Philosophy from '../components/Philosophy';
import Protocol from '../components/Protocol';
import Membership from '../components/Membership';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Philosophy />
      <Protocol />
      <Membership />
    </>
  );
}
