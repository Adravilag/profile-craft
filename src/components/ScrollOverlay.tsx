// src/components/ScrollOverlay.tsx

import React from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import './ScrollOverlay.css';

interface ScrollOverlayProps {
  variant?: 'default' | 'subtle';
  showIcon?: boolean;
}

const ScrollOverlay: React.FC<ScrollOverlayProps> = ({ 
  variant = 'default', 
  showIcon = true 
}) => {
  const { showScrollOverlay, targetSection } = useNavigation();

  // Generar mensaje dinámico basado en la sección objetivo
  const getMessage = () => {
    if (!targetSection) return 'Navegando...';
    
    const sectionNames: { [key: string]: string } = {
      'home': 'Inicio',
      'about': 'Sobre mí',
      'experience': 'Experiencia',
      'articles': 'Artículos',
      'skills': 'Habilidades',
      'certifications': 'Certificaciones',
      'testimonials': 'Testimonios',
      'contact': 'Contacto'
    };
    
    const sectionName = sectionNames[targetSection] || targetSection;
    return `Navegando a ${sectionName}...`;
  };

  return (
    <div className={`scroll-overlay ${variant} ${showScrollOverlay ? 'show' : ''}`}>
      <div className="scroll-indicator">
        {showIcon && <div className="scroll-icon"></div>}
        <span>{getMessage()}</span>
      </div>
    </div>
  );
};

export default ScrollOverlay;
