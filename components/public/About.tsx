import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';

const About: React.FC = () => {
  const { siteContent } = useAppContext();

  return (
    <section id="about" className="bg-surface py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
            {siteContent.aboutTitle}
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center text-text-secondary leading-relaxed">
          <p>
            {siteContent.aboutText}
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;