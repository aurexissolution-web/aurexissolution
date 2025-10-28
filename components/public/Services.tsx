import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Cloud, Shield, Code, Database, Smartphone, Globe, Users, Headphones, ArrowRight, BarChart3, Star, CheckCircle, Zap, Target, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap: { [key: string]: React.ElementType } = {
  Cloud,
  Shield,
  Code,
  Database,
  Smartphone,
  Globe,
  Users,
  Headphones,
};

const Services: React.FC = () => {
  const { services } = useAppContext();
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  return (
    <section id="services" className="relative bg-gradient-to-br from-background via-background to-neutral-light/30 py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-4 py-2 mb-4">
            <Star className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-semibold text-primary">Our Services</span>
            <Star className="w-4 h-4 text-primary ml-2" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4 bg-gradient-to-r from-text-primary via-primary to-secondary bg-clip-text text-transparent">
            Technology Solutions
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Empowering businesses with cutting-edge technology solutions tailored to your unique needs
          </p>
          <div className="flex items-center justify-center mt-6 space-x-2">
            <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            <div className="w-8 h-1 bg-gradient-to-r from-secondary to-primary rounded-full"></div>
            <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Code;
            const isHovered = hoveredService === service.id;
            
            return (
              <div
                key={service.id}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
              >
                {/* Card */}
                <Link 
                  to={`/services/${service.id}`} 
                  className="block relative bg-surface/80 backdrop-blur-xl border border-neutral/50 rounded-2xl p-6 sm:p-8 text-center transition-all duration-500 hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 touch-target w-full h-full min-h-[280px] flex flex-col justify-between"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
                    isHovered 
                      ? 'opacity-100' 
                      : 'opacity-0'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 rounded-2xl"></div>
                  </div>

                  {/* Icon Container */}
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center rounded-2xl p-4 mb-6 transition-all duration-500 ${
                      isHovered
                        ? 'bg-gradient-to-r from-primary to-secondary text-white scale-110 shadow-lg shadow-primary/30'
                        : 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary'
                    }`}>
                      <Icon size={32} className="transition-transform duration-500 group-hover:rotate-12" />
                    </div>

                    {/* Service Title */}
                    <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 transition-colors duration-300 group-hover:text-primary">
                      {service.title}
                    </h3>

                    {/* Service Description */}
                    <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6 flex-grow">
                      {service.description}
                    </p>

                    {/* Key Features */}
                    <div className="space-y-2 mb-6">
                      {service.keyFeatures.slice(0, 2).map((feature, idx) => (
                        <div key={idx} className="flex items-center text-xs sm:text-sm text-text-secondary">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Learn More Button */}
                    <div className="flex items-center justify-center text-primary font-semibold text-sm group-hover:text-secondary transition-colors duration-300">
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className={`absolute inset-0 rounded-2xl border-2 transition-opacity duration-500 ${
                    isHovered 
                      ? 'opacity-100 border-primary/30' 
                      : 'opacity-0 border-transparent'
                  }`}></div>
                </Link>

                {/* Floating Elements */}
                <div className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}>
                  <Zap className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-16 sm:mt-20 lg:mt-24">
          <div className="bg-gradient-to-r from-surface/50 to-surface/30 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-neutral/20">
            <div className="flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-primary mr-3" />
              <h3 className="text-2xl sm:text-3xl font-bold text-text-primary">Ready to Transform Your Business?</h3>
            </div>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Let's discuss how our technology solutions can drive your success
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/services" 
                className="group inline-flex items-center justify-center bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/30 w-full sm:w-auto"
              >
                <Award className="w-5 h-5 mr-2" />
                View All Services 
                <ArrowRight size={20} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/contact" 
                className="group inline-flex items-center justify-center bg-surface/80 backdrop-blur-xl border border-neutral/50 hover:border-primary/50 text-text-primary font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                <Users className="w-5 h-5 mr-2" />
                Get Consultation
                <ArrowRight size={20} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;