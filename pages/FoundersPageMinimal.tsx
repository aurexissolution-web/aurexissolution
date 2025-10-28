import React from 'react';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';

const FoundersPageMinimal: React.FC = () => {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section id="founders" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary animate-fade-in-down">Meet Our Leadership</h1>
              <p className="text-text-secondary mt-4 max-w-2xl mx-auto animate-fade-in-up">
                The visionary leaders dedicated to revolutionizing the IT landscape and driving our mission forward.
              </p>
              <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-24 max-w-6xl mx-auto items-start">
              <div className="flex flex-col items-center">
                <div className="bg-surface/50 backdrop-blur-lg border border-neutral p-8 rounded-lg text-center transition-all duration-300 hover:border-primary hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 max-w-md mx-auto">
                  <div className="mb-4">
                    <img
                      src="https://picsum.photos/seed/sanjay/400/600"
                      alt="Sanjay Gunabalan avatar"
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Sanjay Gunabalan</h3>
                  <p className="text-text-secondary mb-2">Co-Founder & CEO</p>
                  <p className="text-sm text-text-secondary mb-4">@sanjayg • Driving Innovation</p>
                  <button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105">
                    View Profile
                  </button>
                </div>
                <div className="mt-8 text-center max-w-md">
                  <p className="text-text-secondary leading-relaxed mb-6">
                    Sanjay is a visionary leader with a passion for driving technological innovation and business strategy. He co-founded Aurexis Solution to deliver exceptional IT services and empower businesses to thrive in the digital age.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-surface/50 backdrop-blur-lg border border-neutral p-8 rounded-lg text-center transition-all duration-300 hover:border-primary hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 max-w-md mx-auto">
                  <div className="mb-4">
                    <img
                      src="https://picsum.photos/seed/tharshann/400/600"
                      alt="Tharshann Rao avatar"
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Tharshann Rao</h3>
                  <p className="text-text-secondary mb-2">Founder & CTO</p>
                  <p className="text-sm text-text-secondary mb-4">@tharshannr • Building the Future</p>
                  <button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105">
                    View Profile
                  </button>
                </div>
                <div className="mt-8 text-center max-w-md">
                  <p className="text-text-secondary leading-relaxed mb-6">
                    Tharshann, the technical architect of Aurexis Solution, brings deep expertise in software engineering and cybersecurity. He is dedicated to building robust, scalable, and secure systems that solve complex challenges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FoundersPageMinimal;
