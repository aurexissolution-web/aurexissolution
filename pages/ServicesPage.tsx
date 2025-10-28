import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import { useAppContext } from '../hooks/useAppContext';
import { ArrowRight, Cloud, Shield, Code, Database } from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  Cloud,
  Shield,
  Code,
  Database,
};

const ServicesPage: React.FC = () => {
  const { services } = useAppContext();

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="relative py-28 bg-surface text-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="container mx-auto px-6 relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-text-primary animate-fade-in-down">Our Suite of IT Services</h1>
                <p className="text-text-secondary mt-4 max-w-3xl mx-auto animate-fade-in-up">
                    Driving business transformation with a comprehensive range of technology solutions tailored to your unique needs.
                </p>
                <div className="w-24 h-1 bg-primary mx-auto mt-6"></div>
            </div>
        </section>
        
        <section className="py-20">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map(service => {
                        const Icon = iconMap[service.icon] || Code;
                        return (
                            <div key={service.id} className="bg-surface/50 backdrop-blur-lg border border-neutral p-8 rounded-lg transition-all duration-300 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 flex flex-col">
                                <div className="flex items-start mb-4">
                                    <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-full mr-6">
                                        <Icon size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-text-primary mb-2">{service.title}</h3>
                                        <p className="text-text-secondary">{service.description}</p>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4">
                                    <Link to={`/services/${service.id}`} className="inline-flex items-center font-semibold text-primary hover:text-primary/80 transition-colors">
                                        Learn More <ArrowRight size={18} className="ml-2" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
