
import React, { useMemo, useCallback } from 'react';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import ProfileCard from '../components/public/ProfileCard';
import { Linkedin, Twitter, Github, Loader2 } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import type { Founder } from '../types';

const FoundersPage: React.FC = () => {
  const { founders, loading } = useAppContext();

  // Static fallback data in case Firebase is not working
  const staticFounders: Founder[] = [
    {
      id: '1',
      name: 'Sanjay Gunabalan',
      title: 'Co-Founder & CEO',
      handle: 'sanjayg',
      status: 'Driving Innovation',
      imageData: 'https://picsum.photos/seed/sanjay/400/600',
      bio: 'Sanjay is a visionary leader with a passion for driving technological innovation and business strategy. He co-founded Aurexis Solution to deliver exceptional IT services and empower businesses to thrive in the digital age.',
      linkedinUrl: 'https://www.linkedin.com/',
      twitterUrl: 'https://twitter.com/',
      githubUrl: '',
      profileUrl: 'https://www.linkedin.com/'
    },
    {
      id: '2',
      name: 'Tharshann Rao',
      title: 'Founder & CTO',
      handle: 'tharshannr',
      status: 'Building the Future',
      imageData: 'https://picsum.photos/seed/tharshann/400/600',
      bio: 'Tharshann, the technical architect of Aurexis Solution, brings deep expertise in software engineering and cybersecurity. He is dedicated to building robust, scalable, and secure systems that solve complex challenges.',
      linkedinUrl: 'https://www.linkedin.com/',
      twitterUrl: '',
      githubUrl: 'https://github.com/',
      profileUrl: 'https://www.linkedin.com/'
    }
  ];

  // Validate founder data and provide fallbacks
  const validateFounder = useCallback((founder: Founder): Founder => {
    return {
      ...founder,
      name: founder.name || 'Unknown',
      title: founder.title || 'Team Member',
      handle: founder.handle || 'unknown',
      status: founder.status || 'Available',
      imageData: founder.imageData || 'https://picsum.photos/seed/default/400/600',
      bio: founder.bio || 'No bio available.',
      linkedinUrl: founder.linkedinUrl || '',
      twitterUrl: founder.twitterUrl || '',
      githubUrl: founder.githubUrl || '',
      profileUrl: founder.profileUrl || ''
    };
  }, []);

  // Determine which founders to display based on loading state and data availability
  const displayFounders = useMemo(() => {
    if (loading) {
      return []; // Show loading state
    }
    
    if (founders.length > 0) {
      return founders.map(validateFounder);
    }
    
    return staticFounders.map(validateFounder);
  }, [founders, loading, validateFounder]);

  const handleContactClick = useCallback((url: string) => {
    if (url && url.trim() !== '') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  // Loading state component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-text-secondary text-lg">Loading our leadership team...</p>
    </div>
  );

  // Error boundary component for individual founder cards
  const FounderCard = React.memo(({ founder }: { founder: Founder }) => {
    const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      target.src = 'https://picsum.photos/seed/default/400/600';
    }, []);

    return (
      <div className="flex flex-col items-center">
        <ProfileCard
          name={founder.name}
          title={founder.title}
          handle={founder.handle}
          status={founder.status}
          avatarUrl={founder.imageData}
          contactText="View Profile"
          onContactClick={() => handleContactClick(founder.profileUrl)}
          enableTilt={true}
          enableMobileTilt={false}
          showUserInfo={true}
        />
        <div className="mt-8 text-center max-w-md">
          <p className="text-text-secondary leading-relaxed mb-6">{founder.bio}</p>
          <div className="flex justify-center space-x-4">
            {founder.linkedinUrl && (
              <a 
                href={founder.linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-text-secondary hover:text-primary transition-colors" 
                aria-label={`${founder.name}'s LinkedIn Profile`}
              >
                <Linkedin size={24} />
              </a>
            )}
            {founder.twitterUrl && (
              <a 
                href={founder.twitterUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-text-secondary hover:text-primary transition-colors" 
                aria-label={`${founder.name}'s Twitter Profile`}
              >
                <Twitter size={24} />
              </a>
            )}
            {founder.githubUrl && (
              <a 
                href={founder.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-text-secondary hover:text-primary transition-colors" 
                aria-label={`${founder.name}'s GitHub Profile`}
              >
                <Github size={24} />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  });

  FounderCard.displayName = 'FounderCard';

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section id="founders" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary animate-fade-in-down">
                Meet Our Leadership
              </h1>
              <p className="text-text-secondary mt-4 max-w-2xl mx-auto animate-fade-in-up">
                The visionary leaders dedicated to revolutionizing the IT landscape and driving our mission forward.
              </p>
              <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
            </div>
            
            {loading ? (
              <LoadingState />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-24 max-w-6xl mx-auto items-start">
                {displayFounders.map((founder) => (
                  <FounderCard key={founder.id} founder={founder} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FoundersPage;
