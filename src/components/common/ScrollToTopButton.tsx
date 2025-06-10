// src/components/common/ScrollToTopButton.tsx

import React, { useState, useEffect } from 'react';
import FloatingActionButton from './FloatingActionButton';

interface ScrollToTopButtonProps {
  threshold?: number; // Píxeles de scroll antes de mostrar el botón
  scrollBehavior?: 'smooth' | 'auto';
  className?: string;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  threshold = 300,
  scrollBehavior = 'smooth',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar el botón cuando el usuario haya hecho scroll hacia abajo
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Agregar el event listener
    window.addEventListener('scroll', toggleVisibility);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: scrollBehavior
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <FloatingActionButton
      onClick={scrollToTop}
      icon="fas fa-arrow-up"
      label="Subir"
      color="secondary"
      position="bottom-left"
      ariaLabel="Volver al inicio de la página"
      className={`scroll-to-top ${className}`}
    />
  );
};

export default ScrollToTopButton;
