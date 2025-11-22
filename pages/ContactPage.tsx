import React, { useState } from 'react';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import { MapPin, Phone } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';

const ContactPage: React.FC = () => {
  const { addMessage, siteContent } = useAppContext();
  const contactInfo = siteContent.contactInfo;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);

  const formatPhoneForLink = (phone: string) => phone.replace(/[^+\d]/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus({ type: 'error', message: 'Please fill out all fields.' });
      return;
    }
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    const success = await addMessage({ name, email, message });

    setLoading(false);
    if (success) {
      setStatus({ type: 'success', message: 'Thank you! Your message has been sent.' });
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 4000);
    } else {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="relative py-16 sm:py-20 lg:py-28 bg-surface text-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary animate-fade-in-down">Get In Touch</h1>
            <p className="text-sm sm:text-base text-text-secondary mt-3 sm:mt-4 max-w-3xl mx-auto animate-fade-in-up px-2">
              We're here to help and answer any question you might have. We look forward to hearing from you.
            </p>
            <div className="w-16 sm:w-24 h-1 bg-primary mx-auto mt-4 sm:mt-6"></div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Info */}
              <div className="order-2 lg:order-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4 sm:mb-6">{contactInfo.heading}</h2>
                <p className="text-sm sm:text-base text-text-secondary mb-6 sm:mb-8">
                  {contactInfo.description}
                </p>
                <div className="space-y-4 sm:space-y-6">
                  {contactInfo.contacts.length > 0 ? (
                    contactInfo.contacts.map(contact => (
                      <div key={contact.id} className="flex items-start">
                        <div className="bg-primary/10 text-primary p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                          <Phone size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-text-primary">
                            {contact.name}
                          </h3>
                          {contact.role && (
                            <p className="text-xs sm:text-sm text-text-secondary mb-1">{contact.role}</p>
                          )}
                          {contact.phone && (
                            <a 
                              href={`tel:${formatPhoneForLink(contact.phone)}`}
                              className="text-sm sm:text-base text-text-secondary hover:text-primary transition-colors touch-target"
                            >
                              {contact.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-secondary">No contact persons configured yet.</p>
                  )}
                  {contactInfo.office?.address && (
                    <div className="flex items-start">
                      <div className="bg-primary/10 text-primary p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                        <MapPin size={20} className="sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-text-primary">{contactInfo.office.label}</h3>
                        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">{contactInfo.office.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-surface/50 backdrop-blur-lg border border-neutral p-4 sm:p-6 lg:p-8 rounded-lg shadow-md order-1 lg:order-2">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="contact-name" className="block text-sm sm:text-base text-text-secondary font-bold mb-2">Name</label>
                    <input 
                      type="text" 
                      id="contact-name" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      disabled={loading} 
                      required 
                      className="w-full px-3 py-3 sm:py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-base" 
                      placeholder="Your Name" 
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="contact-email" className="block text-sm sm:text-base text-text-secondary font-bold mb-2">Email</label>
                    <input 
                      type="email" 
                      id="contact-email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      disabled={loading} 
                      required 
                      className="w-full px-3 py-3 sm:py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-base" 
                      placeholder="Your Email" 
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="contact-message" className="block text-sm sm:text-base text-text-secondary font-bold mb-2">Message</label>
                    <textarea 
                      id="contact-message" 
                      rows={4} 
                      value={message} 
                      onChange={e => setMessage(e.target.value)} 
                      disabled={loading} 
                      required 
                      className="w-full px-3 py-3 sm:py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-base resize-none" 
                      placeholder="Your Message"
                    ></textarea>
                  </div>
                  <div className="text-center sm:text-left">
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-3 px-6 sm:px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                  {status.message && (
                    <p className={`mt-4 text-sm text-center sm:text-left ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                        {status.message}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;