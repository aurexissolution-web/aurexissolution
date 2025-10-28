import React from 'react';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, Shield, Users, Rocket } from 'lucide-react';

const AboutPage: React.FC = () => {
  const values = [
    { icon: Rocket, title: 'Innovation', description: 'We constantly push the boundaries of technology to deliver forward-thinking solutions.' },
    { icon: Heart, title: 'Customer-Centricity', description: 'Our clients are at the heart of everything we do. Your success is our success.' },
    { icon: Shield, title: 'Integrity', description: 'We operate with transparency, honesty, and the highest ethical standards.' },
    { icon: Users, title: 'Collaboration', description: 'We believe in the power of teamwork, both internally and with our partners.' },
  ];

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-28 bg-surface text-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="container mx-auto px-6 relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-text-primary animate-fade-in-down">Forging the Future of Technology</h1>
                <p className="text-text-secondary mt-4 max-w-3xl mx-auto animate-fade-in-up">
                    Aurexis Solution was founded on the principle of innovation to help businesses navigate the complexities of the digital landscape.
                </p>
                <div className="w-24 h-1 bg-primary mx-auto mt-6"></div>
            </div>
        </section>

        {/* Mission and Vision Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary/10 text-primary">
                  <Target size={32} />
                </div>
                <h2 className="text-3xl font-bold text-text-primary mb-4">Our Mission</h2>
                <p className="text-text-secondary leading-relaxed">
                  To empower businesses with transformative IT solutions that drive growth, efficiency, and market leadership. We are committed to delivering excellence, fostering innovation, and building long-lasting partnerships based on trust and tangible results.
                </p>
              </div>
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-secondary/10 text-secondary">
                  <Eye size={32} />
                </div>
                <h2 className="text-3xl font-bold text-text-primary mb-4">Our Vision</h2>
                <p className="text-text-secondary leading-relaxed">
                  To be a globally recognized leader in the IT industry, renowned for our pioneering solutions, unwavering commitment to client success, and our role in shaping a smarter, more connected digital future for all.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="bg-surface py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Our Core Values</h2>
              <p className="text-text-secondary mt-2">The principles that guide our every action.</p>
              <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-background/50 border border-neutral p-8 rounded-lg text-center transition-all duration-300 hover:border-secondary hover:-translate-y-2 hover:shadow-2xl hover:shadow-secondary/20">
                  <div className="inline-block bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-full mb-4">
                    <value.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">{value.title}</h3>
                  <p className="text-text-secondary">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Meet the Team CTA */}
        <section className="py-20">
             <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold text-text-primary mb-4">Meet the Visionaries</h2>
                <p className="text-text-secondary max-w-2xl mx-auto mb-8">
                    Our leadership team combines decades of experience, deep industry knowledge, and a shared passion for innovation.
                </p>
                <Link 
                    to="/founders" 
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/30"
                >
                    Meet Our Founders
                </Link>
             </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
