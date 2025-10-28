import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../hooks/useAppContext';
import { ExternalLink, Github, Eye, Filter, X } from 'lucide-react';

interface Project {
  id: string;
  imageData: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

const Portfolio3D: React.FC = () => {
  const { projects } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Filter: Only show portfolio items (NOT internal customer projects)
  const portfolioItems = projects.filter(p => p.isPortfolioItem === true);

  // Enhanced projects with additional data
  const enhancedProjects: Project[] = portfolioItems.map(project => ({
    ...project,
    technologies: getTechnologiesForCategory(project.category || ''),
    featured: Math.random() > 0.7, // Randomly mark some as featured
  }));

  const categories = ['All', ...Array.from(new Set(enhancedProjects.map(p => p.category)))];

  const filteredProjects = selectedCategory === 'All' 
    ? enhancedProjects 
    : enhancedProjects.filter(project => project.category === selectedCategory);

  function getTechnologiesForCategory(category: string): string[] {
    const techMap: { [key: string]: string[] } = {
      'Software Development': ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      'Cloud Solutions': ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
      'Data & Analytics': ['Python', 'TensorFlow', 'PostgreSQL', 'Tableau'],
      'Mobile Development': ['React Native', 'Flutter', 'Swift', 'Kotlin'],
      'Web Development': ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      'E-commerce': ['React', 'Node.js', 'MongoDB', 'Stripe'],
    };
    return techMap[category] || ['React', 'Node.js', 'TypeScript'];
  }

  const handleCarouselNext = () => {
    if (carouselRef.current) {
      const maxIndex = filteredProjects.length - 1;
      setCarouselIndex(prev => prev >= maxIndex ? 0 : prev + 1);
    }
  };

  const handleCarouselPrev = () => {
    if (carouselRef.current) {
      const maxIndex = filteredProjects.length - 1;
      setCarouselIndex(prev => prev <= 0 ? maxIndex : prev - 1);
    }
  };

  // Auto-rotate carousel
  useEffect(() => {
    if (viewMode === 'carousel') {
      const interval = setInterval(handleCarouselNext, 5000);
      return () => clearInterval(interval);
    }
  }, [viewMode, filteredProjects.length]);

  return (
    <section className="py-20 bg-gradient-to-br from-surface/30 via-background to-surface/30 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-text-primary mb-4"
          >
            Our Portfolio
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-text-secondary text-lg max-w-2xl mx-auto mb-8"
          >
            Immersive showcase of our latest projects and achievements
          </motion.p>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center items-center gap-4 mb-12"
        >
          {/* View Mode Toggle */}
          <div className="flex bg-surface/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                viewMode === 'grid' 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('carousel')}
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                viewMode === 'carousel' 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              3D Carousel
            </button>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-surface/50 rounded-lg text-text-secondary hover:text-text-primary transition-colors duration-300"
          >
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </motion.div>

        {/* Filter Dropdown */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsFilterOpen(false);
                  }}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-surface/50 text-text-secondary hover:bg-surface hover:text-text-primary'
                  }`}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portfolio Content */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -10, 
                  rotateX: 5,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group relative bg-surface/80 backdrop-blur-lg border border-neutral rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500"
              >
                {/* Featured Badge */}
                {project.featured && (
                  <div className="absolute top-4 right-4 z-10 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </div>
                )}

                {/* Project Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={project.imageData} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-full p-3 text-white hover:bg-white/30 transition-colors duration-300"
                    >
                      <Eye size={20} />
                    </button>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-full p-3 text-white hover:bg-white/30 transition-colors duration-300"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-full p-3 text-white hover:bg-white/30 transition-colors duration-300"
                      >
                        <Github size={20} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-text-primary mb-2 group-hover:text-primary transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-primary font-medium mb-3">{project.category}</p>
                  <p className="text-text-secondary mb-4 line-clamp-2">{project.description}</p>
                  
                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-3 py-1 bg-neutral text-text-secondary text-sm rounded-full">
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* 3D Carousel View */
          <motion.div 
            ref={carouselRef}
            className="relative h-96 flex items-center justify-center perspective-1000"
          >
            <div className="relative w-full max-w-4xl h-full">
              {filteredProjects.map((project, index) => {
                const distance = Math.abs(index - carouselIndex);
                const isActive = index === carouselIndex;
                const isPrev = index === carouselIndex - 1 || (carouselIndex === 0 && index === filteredProjects.length - 1);
                const isNext = index === carouselIndex + 1 || (carouselIndex === filteredProjects.length - 1 && index === 0);

                return (
                  <motion.div
                    key={project.id}
                    className="absolute inset-0"
                    animate={{
                      x: isActive ? 0 : isPrev ? -300 : isNext ? 300 : 0,
                      y: isActive ? 0 : 50,
                      scale: isActive ? 1 : 0.8,
                      rotateY: isActive ? 0 : isPrev ? -45 : isNext ? 45 : 0,
                      z: isActive ? 50 : 10,
                      opacity: distance <= 1 ? 1 : 0.3,
                    }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                    onClick={() => setSelectedProject(project)}
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="relative bg-surface/90 backdrop-blur-lg border border-neutral rounded-2xl overflow-hidden shadow-2xl h-full cursor-pointer group">
                      <div className="h-2/3 relative overflow-hidden">
                        <img 
                          src={project.imageData} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                          <p className="text-primary font-medium">{project.category}</p>
                        </div>
                      </div>
                      <div className="p-4 h-1/3">
                        <p className="text-text-secondary text-sm line-clamp-2 mb-3">{project.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 2).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Carousel Controls */}
            <button
              onClick={handleCarouselPrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-surface/80 backdrop-blur-lg border border-neutral rounded-full p-3 text-text-primary hover:text-primary transition-colors duration-300 z-10"
            >
              ←
            </button>
            <button
              onClick={handleCarouselNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-surface/80 backdrop-blur-lg border border-neutral rounded-full p-3 text-text-primary hover:text-primary transition-colors duration-300 z-10"
            >
              →
            </button>

            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {filteredProjects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCarouselIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === carouselIndex ? 'bg-primary' : 'bg-neutral'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Project Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-surface/95 backdrop-blur-lg border border-neutral rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 z-10 bg-surface/80 backdrop-blur-lg border border-neutral rounded-full p-2 text-text-primary hover:text-primary transition-colors duration-300"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="h-64 md:h-96 relative overflow-hidden">
                    <img 
                      src={selectedProject.imageData} 
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-3xl font-bold mb-2">{selectedProject.title}</h3>
                      <p className="text-primary text-lg">{selectedProject.category}</p>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <p className="text-text-secondary text-lg mb-6">{selectedProject.description}</p>
                    
                    <div className="mb-6">
                      <h4 className="font-bold text-lg text-text-primary mb-3">Technologies Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      {selectedProject.liveUrl && (
                        <a
                          href={selectedProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors duration-300"
                        >
                          <ExternalLink size={18} />
                          <span>View Live</span>
                        </a>
                      )}
                      {selectedProject.githubUrl && (
                        <a
                          href={selectedProject.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 bg-surface border border-neutral text-text-primary px-6 py-3 rounded-lg hover:bg-surface/80 transition-colors duration-300"
                        >
                          <Github size={18} />
                          <span>View Code</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Portfolio3D;
