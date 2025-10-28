import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';

const Footer: React.FC = () => {
  const { siteContent } = useAppContext();
  const { socialMedia } = siteContent;

  // Custom TikTok icon component since it's not available in lucide-react
  const TikTokIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );

  const socialLinks = [
    { platform: 'facebook', url: socialMedia.facebook, icon: Facebook, label: 'Follow us on Facebook' },
    { platform: 'twitter', url: socialMedia.twitter, icon: Twitter, label: 'Follow us on Twitter' },
    { platform: 'linkedin', url: socialMedia.linkedin, icon: Linkedin, label: 'Connect with us on LinkedIn' },
    { platform: 'instagram', url: socialMedia.instagram, icon: Instagram, label: 'Follow us on Instagram' },
    { platform: 'tiktok', url: socialMedia.tiktok, icon: TikTokIcon, label: 'Follow us on TikTok' },
  ].filter(link => link.url && link.url.trim() !== '');

  return (
    <footer className="bg-background border-t border-neutral safe-area-bottom">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1">Aurexis Solution</h3>
            <p className="text-sm text-text-secondary">© {new Date().getFullYear()} All Rights Reserved.</p>
          </div>
          {socialLinks.length > 0 && (
            <div className="flex space-x-6">
              {socialLinks.map(({ platform, url, icon: Icon, label }) => (
                <a 
                  key={platform}
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-primary transition-colors touch-target"
                  aria-label={label}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
