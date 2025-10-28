import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';

const Portfolio: React.FC = () => {
  const { projects } = useAppContext();

  return (
    <section id="portfolio" className="bg-surface py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2">Our Recent Work</h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto">Check out some of the projects we're proud of.</p>
          <div className="w-16 sm:w-24 h-1 bg-primary mx-auto mt-3 sm:mt-4"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {projects.map(project => (
            <div key={project.id} className="bg-surface/50 backdrop-blur-lg border border-neutral rounded-lg shadow-lg overflow-hidden group transition-transform duration-300 hover:scale-105 portfolio-card">
              <div className="relative">
                <img 
                  src={project.imageData} 
                  alt={project.title} 
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-start p-4 sm:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{project.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{project.description}</p>
                  </div>
                </div>
              </div>
               <div className="p-3 sm:p-4">
                 <h4 className="font-bold text-base sm:text-lg text-text-primary mb-1">{project.title}</h4>
                 <p className="text-sm text-primary">{project.category}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;