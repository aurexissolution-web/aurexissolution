import React from 'react';
import Header from '../components/public/Header';
import Hero from '../components/public/Hero';
import Services from '../components/public/Services';
import TechnologyShowcase from '../components/public/TechnologyShowcase';
import Portfolio from '../components/public/Portfolio';
import Testimonials from '../components/public/Testimonials';
import Footer from '../components/public/Footer';
import ParallaxSection from '../components/effects/ParallaxSection';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <ParallaxSection speed={0.3} fadeIn={true}>
          <Services />
        </ParallaxSection>
        <ParallaxSection speed={0.5} direction="down" fadeIn={true}>
          <TechnologyShowcase />
        </ParallaxSection>
        <ParallaxSection speed={0.4} fadeIn={true}>
          <Portfolio />
        </ParallaxSection>
        <ParallaxSection speed={0.3} fadeIn={true}>
          <Testimonials />
        </ParallaxSection>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;