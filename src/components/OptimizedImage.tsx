import React from 'react';
import { cloudinaryUrl, getOptimizedImageUrl, cloudinaryTransforms } from '../utils/cloudinary';

// src/components/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  variant?: keyof typeof cloudinaryTransforms;
  className?: string;
  fallback?: string; // Imagen local de fallback
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src, 
  alt, 
  width = 800, 
  height = 600, 
  quality = 80,
  variant,
  className = '',
  fallback
}) => {
  // Si src ya es una URL completa, usarla tal como está
  // Si es un public ID, aplicar transformaciones
  const isFullUrl = src.startsWith('http://') || src.startsWith('https://');
  
  const optimizedSrc = isFullUrl 
    ? src // Usar URL completa tal como está
    : variant 
      ? getOptimizedImageUrl(src, variant)
      : cloudinaryUrl(src, `w_${width},h_${height},c_fill,q_${quality},f_auto`);
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallback) {
      e.currentTarget.src = fallback;
    }
  };
  
  return (
    <img 
      src={optimizedSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={handleError}
      style={{ 
        width: width ? `${width}px` : '100%', 
        height: 'auto',
        maxWidth: '100%'
      }}
    />
  );
};