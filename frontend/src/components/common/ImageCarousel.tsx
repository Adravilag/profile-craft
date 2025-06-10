// src/components/common/ImageCarousel.tsx

import React, { useState, useEffect } from 'react';
import ImageModal from './ImageModal';
import styles from './ImageCarousel.module.css';

interface ImageCarouselProps {
  images: string[];
  title: string;
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title, className = '' }) => {  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-play del carrusel
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
    setIsLoading(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  // Filtrar imágenes válidas y únicas
  const validImages = [...new Set(images)].filter((_, index) => !imageErrors.has(index));

  if (validImages.length === 0) {
    return (
      <div className={`${styles.carouselContainer} ${className}`}>
        <div className={styles.carouselPlaceholder}>
          <i className="fas fa-image"></i>
          <p>No hay imágenes disponibles</p>
        </div>
      </div>
    );
  }

  // Si solo hay una imagen, mostrar vista simplificada
  if (validImages.length === 1) {
    return (
      <div className={`${styles.carouselContainer} ${styles.carouselSingle} ${className}`}>
        <div className={styles.carouselWrapper}>
          <div className={styles.carouselMain}>
            {isLoading && (
              <div className={styles.carouselLoading}>
                <i className="fas fa-spinner fa-spin"></i>
              </div>
            )}
              <img
              src={validImages[0]}
              alt={`${title} - Imagen principal`}
              className={styles.carouselImage}
              onLoad={handleImageLoad}
              onError={() => handleImageError(0)}
              onClick={openModal}
              style={{ cursor: 'zoom-in' }}
            />
          </div>
        </div>
        
        {/* Image Modal */}
        <ImageModal
          isOpen={isModalOpen}
          imageUrl={validImages[0]}
          imageAlt={`${title} - Imagen principal`}
          onClose={closeModal}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.carouselContainer} ${className}`}>
      <div className={styles.carouselWrapper}>
        {/* Main Image Display */}
        <div className={styles.carouselMain}>
          {isLoading && (
            <div className={styles.carouselLoading}>
              <i className="fas fa-spinner fa-spin"></i>
            </div>
          )}
            <img
            src={validImages[currentIndex]}
            alt={`${title} - Imagen ${currentIndex + 1}`}
            className={styles.carouselImage}
            onLoad={handleImageLoad}
            onError={() => handleImageError(currentIndex)}
            onClick={openModal}
            style={{ cursor: 'zoom-in' }}
          />

          {/* Navigation Arrows */}
          {validImages.length > 1 && (
            <>
              <button
                className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
                onClick={goToPrevious}
                aria-label="Imagen anterior"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
                onClick={goToNext}
                aria-label="Imagen siguiente"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </>
          )}

          {/* Image Counter */}
          {validImages.length > 1 && (
            <div className={styles.carouselCounter}>
              {currentIndex + 1} / {validImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {validImages.length > 1 && (
          <div className={styles.carouselThumbnails}>
            {validImages.map((image, index) => (
              <button
                key={index}
                className={`${styles.carouselThumbnail} ${
                  index === currentIndex ? styles.carouselThumbnailActive : ''
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`Miniatura ${index + 1}`}
                  onError={() => handleImageError(index)}
                />
              </button>
            ))}
          </div>
        )}

        {/* Dots Navigation (for mobile) */}
        {validImages.length > 1 && (
          <div className={styles.carouselDots}>
            {validImages.map((_, index) => (
              <button
                key={index}
                className={`${styles.carouselDot} ${
                  index === currentIndex ? styles.carouselDotActive : ''
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        imageUrl={validImages[currentIndex]}
        imageAlt={`${title} - Imagen ${currentIndex + 1}`}
        onClose={closeModal}
      />
    </div>
  );
};

export default ImageCarousel;
