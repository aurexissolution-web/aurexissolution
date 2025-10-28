import React from 'react';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import { useAppContext } from '../hooks/useAppContext';

const PortfolioPage: React.FC = () => {
  const { projects } = useAppContext();
  
  // Only show items marked as portfolio items (NOT internal customer projects)
  const portfolioProjects = projects.filter(p => p.isPortfolioItem === true);

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section id="portfolio" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary animate-fade-in-down">Our Portfolio</h1>
              <p className="text-text-secondary mt-4 max-w-2xl mx-auto animate-fade-in-up">
                Explore a selection of projects that showcase our expertise and commitment to delivering excellence.
              </p>
              <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioProjects.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-text-secondary text-lg">No portfolio items to display yet.</p>
                  <p className="text-text-secondary text-sm mt-2">Check back soon for our showcase projects!</p>
                </div>
              ) : (
                portfolioProjects.map(project => (
                <div key={project.id} className="bg-surface/50 backdrop-blur-lg border border-neutral rounded-lg shadow-lg overflow-hidden group transition-transform duration-300 hover:scale-105">
                  <div className="relative">
                    <img src={project.imageData} alt={project.title} className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-start p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-xl font-bold text-white">{project.title}</h3>
                        <p className="text-sm text-text-secondary">{project.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-lg text-text-primary">{project.title}</h4>
                    <p className="text-primary">{project.category}</p>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioPage;