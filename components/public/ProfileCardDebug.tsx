import React from 'react';

interface ProfileCardProps {
  avatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  onContactClick?: () => void;
}

const ProfileCardDebug: React.FC<ProfileCardProps> = ({
  avatarUrl = 'https://picsum.photos/seed/avatar/400/600',
  name = 'Test User',
  title = 'Test Title',
  handle = 'testuser',
  status = 'Online',
  contactText = 'Contact',
  onContactClick
}) => {
  return (
    <div className="bg-surface/50 backdrop-blur-lg border border-neutral p-8 rounded-lg text-center transition-all duration-300 hover:border-primary hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 max-w-md mx-auto">
      <div className="mb-4">
        <img
          src={avatarUrl}
          alt={`${name} avatar`}
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x600/666/fff?text=No+Image';
          }}
        />
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">{name}</h3>
      <p className="text-text-secondary mb-2">{title}</p>
      <p className="text-sm text-text-secondary mb-4">@{handle} • {status}</p>
      <button
        onClick={onContactClick}
        className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105"
      >
        {contactText}
      </button>
    </div>
  );
};

export default ProfileCardDebug;
