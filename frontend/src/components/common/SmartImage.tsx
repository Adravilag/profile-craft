// SmartImage Component with Intelligent Loading and Fallbacks
import React, { useState, useRef, useEffect } from 'react';
import styles from './SmartImage.module.css';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  srcSet?: string;
}

const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  fallbackSrc,
  onLoad,
  onError,
  loading = 'lazy',
  sizes,
  srcSet
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer para lazy loading manual
  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px' // Empezar a cargar 50px antes de que sea visible
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Manejar carga de imagen
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    
    img.onload = () => {
      setImageState('loaded');
      onLoad?.();
    };

    img.onerror = () => {
      if (retryCount < 2) {
        // Reintentar hasta 2 veces
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000 * (retryCount + 1)); // Backoff exponencial
      } else if (fallbackSrc && imageSrc !== fallbackSrc) {
        // Usar imagen de fallback
        setImageSrc(fallbackSrc);
        setRetryCount(0);
      } else {
        setImageState('error');
        onError?.();
      }
    };

    // Establecer src para iniciar la carga
    img.src = imageSrc;
    
    // Si srcSet está disponible, también lo configuramos
    if (srcSet) {
      img.srcset = srcSet;
    }
    if (sizes) {
      img.sizes = sizes;
    }

  }, [isInView, imageSrc, retryCount, fallbackSrc, onLoad, onError, srcSet, sizes]);

  const containerClasses = [
    styles.smartImageContainer,
    className,
    styles[imageState]
  ].filter(Boolean).join(' ');

  return (
    <div ref={imgRef} className={containerClasses}>
      {/* Skeleton/Placeholder mientras carga */}
      {imageState === 'loading' && (
        <div className={styles.placeholder}>
          {placeholder || (
            <div className={styles.skeleton}>
              <div className={styles.skeletonShimmer}></div>
            </div>
          )}
        </div>
      )}

      {/* Imagen principal */}
      {(imageState === 'loaded' || isInView) && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${styles.image} ${imageState === 'loaded' ? styles.visible : ''}`}
          loading={loading}
          sizes={sizes}
          srcSet={srcSet}
          onLoad={() => {
            setImageState('loaded');
            onLoad?.();
          }}
          onError={() => {
            if (retryCount < 2) {
              setRetryCount(prev => prev + 1);
            } else if (fallbackSrc && imageSrc !== fallbackSrc) {
              setImageSrc(fallbackSrc);
              setRetryCount(0);
            } else {
              setImageState('error');
              onError?.();
            }
          }}
        />
      )}

      {/* Estado de error */}
      {imageState === 'error' && (
        <div className={styles.errorState}>
          <i className="fas fa-image" />
          <span>No se pudo cargar la imagen</span>
        </div>
      )}

      {/* Indicador de carga */}
      {imageState === 'loading' && isInView && (
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
};

export default SmartImage;
