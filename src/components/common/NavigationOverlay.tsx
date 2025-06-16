// src/components/common/NavigationOverlay.tsx

import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useData } from '../../contexts/DataContext';
import styles from './NavigationOverlay.module.css';

const NavigationOverlay: React.FC = () => {
  const { isNavigating, targetSection } = useNavigation();
  const { isAnyLoading } = useData();

  // Solo mostrar el overlay si estamos navegando o cargando datos
  const shouldShow = isNavigating || isAnyLoading;

  if (!shouldShow) return null;

  const getSectionDisplayName = (section: string | null) => {
    switch (section) {
      case 'home': return 'Inicio';
      case 'about': return 'Sobre Mí';
      case 'experience': return 'Experiencia';
      case 'articles': return 'Artículos';
      case 'skills': return 'Habilidades';
      case 'certifications': return 'Certificaciones';
      case 'testimonials': return 'Testimonios';
      case 'contact': return 'Contacto';
      default: return 'Cargando';
    }
  };

  return (
    <div className={`${styles.overlay} ${shouldShow ? styles.visible : ''}`}>
      <div className={styles.content}>
        <div className={styles.spinner}>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
        </div>
        <p className={styles.message}>
          {isNavigating && targetSection 
            ? `Navegando a ${getSectionDisplayName(targetSection)}...`
            : 'Cargando contenido...'
          }
        </p>
      </div>
    </div>
  );
};

export default NavigationOverlay;
