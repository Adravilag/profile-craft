import React, { useState, useCallback } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  placeholderClass?: string;
  loadingClass?: string;
  errorClass?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc,
  placeholderClass = 'lazy-image-placeholder',
  loadingClass = 'lazy-image-loading',
  errorClass = 'lazy-image-error',
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  ...props
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: true
  });

  // Cargar imagen cuando entre en vista
  React.useEffect(() => {
    if (isIntersecting && !imageSrc) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setImageState('loaded');
        onLoad?.();
      };
      
      img.onerror = () => {
        setImageState('error');
        if (fallbackSrc) {
          setImageSrc(fallbackSrc);
        }
        onError?.();
      };
      
      img.src = src;
    }
  }, [isIntersecting, src, fallbackSrc, imageSrc, onLoad, onError]);

  const getStateClass = useCallback(() => {
    switch (imageState) {
      case 'loading':
        return loadingClass;
      case 'error':
        return errorClass;
      case 'loaded':
        return '';
      default:
        return placeholderClass;
    }
  }, [imageState, loadingClass, errorClass, placeholderClass]);

  return (
    <div
      ref={elementRef}
      className={`lazy-image-container ${getStateClass()} ${className}`}
      {...(props as any)}
    >
      {imageState === 'loading' && !imageSrc && (
        <div className="lazy-image-skeleton">
          <div className="skeleton-shimmer"></div>
        </div>
      )}
        {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`lazy-image ${imageState === 'loaded' ? 'fade-in' : ''} ${className}`}
          loading="lazy"
          decoding="async"
        />
      )}
      
      {imageState === 'error' && !fallbackSrc && (
        <div className="lazy-image-error-state">
          <i className="fas fa-image" />
          <span>Error al cargar imagen</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
