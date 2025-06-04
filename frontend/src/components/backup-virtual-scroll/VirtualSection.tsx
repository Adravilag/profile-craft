// src/components/VirtualSection.tsx

import React, { Suspense, useRef } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

interface VirtualSectionProps {
  sectionId: string;
  height: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente que simula una sección real en el DOM para el scroll
 * pero renderiza el contenido con lazy loading
 */
const VirtualSection: React.FC<VirtualSectionProps> = ({
  sectionId,
  height,
  children,
  className = ''
}) => {
  const { currentSection } = useNavigation();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Determinar si esta sección debe estar visible
  const shouldRender = currentSection === sectionId;

  return (
    <div
      ref={sectionRef}
      id={sectionId}
      data-section={sectionId}
      className={`virtual-section ${className}`}
      style={{
        minHeight: `${height}px`,
        position: 'relative',
        opacity: shouldRender ? 1 : 0,
        visibility: shouldRender ? 'visible' : 'hidden',
        transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
      }}
    >
      {shouldRender && (
        <Suspense
          fallback={
            <div className="section-loading">
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Cargando sección {sectionId}...</span>
              </div>
            </div>
          }
        >
          {children}
        </Suspense>
      )}
    </div>
  );
};

export default VirtualSection;