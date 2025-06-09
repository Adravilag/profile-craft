// src/components/navigation/NavigationOverlay.tsx

import React from 'react';
import styles from './NavigationOverlay.module.css';

interface NavigationOverlayProps {
  isVisible: boolean;
  targetSection?: string;
  duration?: number;
}

/**
 * Overlay sutil que se muestra durante la navegación entre secciones
 * Proporciona feedback visual durante el scroll programático
 */
const NavigationOverlay: React.FC<NavigationOverlayProps> = ({ 
  isVisible, 
  targetSection,
  duration = 800 
}) => {
  if (!isVisible) return null;
  const getSectionLabel = (section: string) => {
    const sectionLabels: Record<string, string> = {
      home: 'Inicio',
      about: 'Sobre mí',
      experience: 'Experiencia',
      articles: 'Proyectos',
      skills: 'Habilidades',
      certifications: 'Certificaciones',
      testimonials: 'Testimonios',
      contact: 'Contacto'
    };
    
    return sectionLabels[section] || section;
  };

  const getSectionIcon = (section: string) => {
    const sectionIcons: Record<string, string> = {
      home: 'fas fa-home',
      about: 'fas fa-user',
      experience: 'fas fa-briefcase',
      articles: 'fas fa-project-diagram',
      skills: 'fas fa-tools',
      certifications: 'fas fa-certificate',
      testimonials: 'fas fa-comments',
      contact: 'fas fa-envelope'
    };
    
    return sectionIcons[section] || 'fas fa-arrow-right';
  };return (
    <div className={styles.navigationOverlay}>
      <div className={styles.overlayContent}>
        <div className={styles.navigationIndicator}>
          <div className={styles.iconContainer}>
            <i className={getSectionIcon(targetSection || '')}></i>
          </div>
          
          <div className={styles.textContainer}>
            <span className={styles.navigatingText}>Navegando a</span>
            <span className={styles.sectionName}>
              {getSectionLabel(targetSection || '')}
            </span>
          </div>
        </div>
        
        {/* Barra de progreso animada */}
        <div className={styles.progressContainer}>
          <div 
            className={styles.progressBar}
            style={{
              animationDuration: `${duration}ms`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NavigationOverlay;
