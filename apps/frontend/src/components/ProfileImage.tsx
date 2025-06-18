import React from 'react';
import { useImageWithFallback } from '../utils/imageAssets';

interface ProfileImageProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  alt?: string;
}

const sizeMap = {
  small: { width: 150, height: 150 },
  medium: { width: 300, height: 300 },
  large: { width: 500, height: 500 }
};

export const ProfileImage: React.FC<ProfileImageProps> = ({ 
  size = 'medium', 
  className = '',
  alt = 'Adrián Dávila - Foto de perfil' 
}) => {
  const { width, height } = sizeMap[size];
  const { src, onError } = useImageWithFallback('profilePhoto');
  
  return (
    <img 
      src={src}
      alt={alt}
      className={`profile-image ${className}`}
      loading="lazy"
      onError={onError}
      style={{ 
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        maxWidth: '100%'
      }}
    />
  );
};

export default ProfileImage;




