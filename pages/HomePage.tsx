import React from 'react';
import Header from '../components/public/Header';
import Hero from '../components/public/Hero';
import Services from '../components/public/Services';
import TechnologyShowcase from '../components/public/TechnologyShowcase';
import Portfolio from '../components/public/Portfolio';
import Testimonials from '../components/public/Testimonials';
import Footer from '../components/public/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services />
        <TechnologyShowcase />
        <Portfolio />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;