import React from 'react';
import { Star } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';

const Testimonials: React.FC = () => {
  const { testimonials } = useAppContext();

  return (
    <section id="testimonials" className="bg-background py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Clients Say</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Trusted by businesses worldwide. Here's what our clients have to say about our services.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-surface/50 backdrop-blur-sm border border-neutral/20 p-6 rounded-xl hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              {/* Stars */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              {/* Quote */}
              <blockquote className="text-text-secondary italic mb-6 text-sm leading-relaxed">
                "{testimonial.quote.length > 150 ? testimonial.quote.substring(0, 150) + '...' : testimonial.quote}"
              </blockquote>
              
              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary text-sm truncate">{testimonial.author}</p>
                  <p className="text-primary text-xs truncate">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;