import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import { useAppContext } from '../hooks/useAppContext';
import { CheckCircle, Layers, Cloud, Shield, Code, Database } from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  Cloud,
  Shield,
  Code,
  Database,
};

const ServiceDetailPage: React.FC = () => {
    const { serviceId } = useParams<{ serviceId: string }>();
    const { services } = useAppContext();
    const service = services.find(s => s.id === serviceId);

    if (!service) {
        return <Navigate to="/services" replace />;
    }

    const Icon = iconMap[service.icon] || Code;

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                {/* Service Hero */}
                <section className="relative py-28 bg-surface">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <div className="inline-block bg-gradient-to-r from-primary to-secondary text-white p-5 rounded-full mb-6">
                            <Icon size={48} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-text-primary">{service.title}</h1>
                        <p className="text-text-secondary mt-4 max-w-3xl mx-auto">
                            {service.description}
                        </p>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container mx-auto px-6 grid lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <h2 className="text-3xl font-bold text-text-primary mb-6">Service Overview</h2>
                            <div className="space-y-4 text-text-secondary leading-relaxed">
                                {service.detailedDescription.map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside>
                            <div className="bg-surface/50 backdrop-blur-lg border border-neutral p-8 rounded-lg sticky top-28">
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center">
                                        <CheckCircle size={20} className="mr-3 text-primary" /> Key Features
                                    </h3>
                                    <ul className="space-y-3">
                                        {service.keyFeatures.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="text-primary mt-1 mr-2">&#10148;</span>
                                                <span className="text-text-secondary">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center">
                                        <Layers size={20} className="mr-3 text-secondary" /> Technologies We Use
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {service.technologies.map((tech, index) => (
                                            <span key={index} className="bg-neutral text-text-secondary text-sm font-medium px-3 py-1 rounded-full">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>
                
                 {/* CTA Section */}
                <section className="bg-surface py-20">
                     <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold text-text-primary mb-4">Ready to elevate your business?</h2>
                        <p className="text-text-secondary max-w-2xl mx-auto mb-8">
                           Let's discuss how our {service.title} services can be tailored to meet your specific goals.
                        </p>
                        <Link 
                            to="/contact"
                            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/30"
                        >
                            Get a Free Consultation
                        </Link>
                     </div>
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default ServiceDetailPage;
