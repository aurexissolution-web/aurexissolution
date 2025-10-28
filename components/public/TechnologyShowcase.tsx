import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface TechBadge {
  name: string;
  category: 'Frontend' | 'Backend' | 'Cloud' | 'Database' | 'DevOps' | 'Mobile';
  icon: string;
  color: string;
  level: number; // 1-5 skill level
  description: string;
}

const techBadges: TechBadge[] = [
  // Frontend
  { name: 'React', category: 'Frontend', icon: '⚛️', color: '#61DAFB', level: 5, description: 'Modern UI Library' },
  { name: 'TypeScript', category: 'Frontend', icon: '🔷', color: '#3178C6', level: 5, description: 'Type-safe JavaScript' },
  { name: 'Next.js', category: 'Frontend', icon: '▲', color: '#000000', level: 4, description: 'React Framework' },
  { name: 'Vue.js', category: 'Frontend', icon: '💚', color: '#4FC08D', level: 4, description: 'Progressive Framework' },
  { name: 'Angular', category: 'Frontend', icon: '🅰️', color: '#DD0031', level: 3, description: 'Enterprise Framework' },
  
  // Backend
  { name: 'Node.js', category: 'Backend', icon: '🟢', color: '#339933', level: 5, description: 'JavaScript Runtime' },
  { name: 'Python', category: 'Backend', icon: '🐍', color: '#3776AB', level: 4, description: 'Versatile Language' },
  { name: 'Java', category: 'Backend', icon: '☕', color: '#007396', level: 4, description: 'Enterprise Language' },
  { name: 'Go', category: 'Backend', icon: '🐹', color: '#00ADD8', level: 3, description: 'Concurrent Language' },
  { name: 'Rust', category: 'Backend', icon: '🦀', color: '#DEA584', level: 3, description: 'Memory-safe Language' },
  
  // Cloud
  { name: 'AWS', category: 'Cloud', icon: '☁️', color: '#FF9900', level: 5, description: 'Amazon Web Services' },
  { name: 'Azure', category: 'Cloud', icon: '🔵', color: '#0078D4', level: 4, description: 'Microsoft Cloud' },
  { name: 'Google Cloud', category: 'Cloud', icon: '🌩️', color: '#4285F4', level: 4, description: 'Google Cloud Platform' },
  { name: 'Docker', category: 'Cloud', icon: '🐳', color: '#2496ED', level: 5, description: 'Containerization' },
  { name: 'Kubernetes', category: 'Cloud', icon: '⚙️', color: '#326CE5', level: 4, description: 'Container Orchestration' },
  
  // Database
  { name: 'PostgreSQL', category: 'Database', icon: '🐘', color: '#336791', level: 5, description: 'Relational Database' },
  { name: 'MongoDB', category: 'Database', icon: '🍃', color: '#47A248', level: 4, description: 'NoSQL Database' },
  { name: 'Redis', category: 'Database', icon: '🔴', color: '#DC382D', level: 4, description: 'In-memory Database' },
  { name: 'MySQL', category: 'Database', icon: '🐬', color: '#4479A1', level: 4, description: 'Popular RDBMS' },
  { name: 'Elasticsearch', category: 'Database', icon: '🔍', color: '#005571', level: 3, description: 'Search Engine' },
  
  // DevOps
  { name: 'Git', category: 'DevOps', icon: '📝', color: '#F05032', level: 5, description: 'Version Control' },
  { name: 'Jenkins', category: 'DevOps', icon: '🔧', color: '#D24939', level: 4, description: 'CI/CD Pipeline' },
  { name: 'Terraform', category: 'DevOps', icon: '🏗️', color: '#623CE4', level: 4, description: 'Infrastructure as Code' },
  { name: 'Ansible', category: 'DevOps', icon: '🔴', color: '#EE0000', level: 3, description: 'Configuration Management' },
  { name: 'GitLab', category: 'DevOps', icon: '🦊', color: '#FCA326', level: 4, description: 'DevOps Platform' },
  
  // Mobile
  { name: 'React Native', category: 'Mobile', icon: '📱', color: '#61DAFB', level: 4, description: 'Cross-platform Mobile' },
  { name: 'Flutter', category: 'Mobile', icon: '🦋', color: '#02569B', level: 3, description: 'Google Mobile SDK' },
  { name: 'Swift', category: 'Mobile', icon: '🍎', color: '#FA7343', level: 3, description: 'iOS Development' },
  { name: 'Kotlin', category: 'Mobile', icon: '🟣', color: '#7F52FF', level: 3, description: 'Android Development' },
];

const TechnologyShowcase: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hoveredBadge, setHoveredBadge] = useState<TechBadge | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const categories = ['All', 'Frontend', 'Backend', 'Cloud', 'Database', 'DevOps', 'Mobile'];

  const filteredBadges = selectedCategory === 'All' 
    ? techBadges 
    : techBadges.filter(badge => badge.category === selectedCategory);

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    });
  }, [controls, selectedCategory]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create parallax effect for badges
    const badges = containerRef.current.querySelectorAll('.tech-badge');
    badges.forEach((badge, index) => {
      const element = badge as HTMLElement;
      const speed = 0.02 + (index % 3) * 0.01;
      const moveX = (x - rect.width / 2) * speed;
      const moveY = (y - rect.height / 2) * speed;
      
      element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background via-surface/30 to-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-text-primary mb-4"
          >
            Our Technology Stack
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-text-secondary text-lg max-w-2xl mx-auto"
          >
            Cutting-edge technologies we use to build exceptional digital solutions
          </motion.p>
          <div className="w-24 h-1 bg-primary mx-auto mt-6"></div>
        </div>

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-surface/50 text-text-secondary hover:bg-surface hover:text-text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Tech Badges Grid */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative min-h-[500px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {filteredBadges.map((badge, index) => (
            <motion.div
              key={badge.name}
              initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.05,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.1, 
                rotateY: 10,
                z: 50,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoveredBadge(badge)}
              onHoverEnd={() => setHoveredBadge(null)}
              className="tech-badge group cursor-pointer"
            >
              <div 
                className="relative bg-surface/80 backdrop-blur-lg border border-neutral rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20"
                style={{ 
                  borderColor: badge.color + '40',
                  background: `linear-gradient(135deg, ${badge.color}10, ${badge.color}05)`
                }}
              >
                {/* Skill Level Indicator */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < badge.level ? 'bg-primary' : 'bg-neutral'
                      }`}
                    />
                  ))}
                </div>

                {/* Tech Icon */}
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {badge.icon}
                </div>

                {/* Tech Name */}
                <h3 
                  className="font-bold text-lg text-text-primary mb-2 group-hover:text-primary transition-colors duration-300"
                  style={{ color: hoveredBadge?.name === badge.name ? badge.color : undefined }}
                >
                  {badge.name}
                </h3>

                {/* Category Badge */}
                <span 
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
                  style={{ 
                    backgroundColor: badge.color + '20',
                    color: badge.color
                  }}
                >
                  {badge.category}
                </span>

                {/* Description */}
                <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-300">
                  {badge.description}
                </p>

                {/* Hover Effect Overlay */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${badge.color}20, transparent)`
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hovered Badge Details */}
        {hoveredBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-surface/95 backdrop-blur-lg border border-neutral rounded-2xl p-6 shadow-2xl max-w-md"
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{hoveredBadge.icon}</div>
              <div>
                <h4 className="font-bold text-lg text-text-primary">{hoveredBadge.name}</h4>
                <p className="text-text-secondary">{hoveredBadge.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-text-secondary">Skill Level:</span>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < hoveredBadge.level ? 'bg-primary' : 'bg-neutral'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TechnologyShowcase;
