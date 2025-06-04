// src/components/debug/SectionVisibilityDebug.tsx

import React, { useEffect, useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';

interface SectionVisibilityDebugProps {
  enabled?: boolean;
}

const SectionVisibilityDebug: React.FC<SectionVisibilityDebugProps> = ({ 
  enabled = process.env.NODE_ENV === 'development'
}) => {
  const { currentSection } = useNavigation();
  const [visibleSections, setVisibleSections] = useState<{[key: string]: boolean}>({});
  const [bodyClasses, setBodyClasses] = useState<string[]>([]);
  const [activeElement, setActiveElement] = useState<Element | null>(null);
  const [intersectionRatios, setIntersectionRatios] = useState<{[key: string]: number}>({});
  
  useEffect(() => {
    if (!enabled) return;
    
    // Actualizar clases del body
    const updateBodyClasses = () => {
      setBodyClasses(Array.from(document.body.classList));
    };
    
    // Detectar secciones visibles
    const sections = document.querySelectorAll('section[id]');
    const observers: IntersectionObserver[] = [];
    
    sections.forEach(section => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            setVisibleSections(prev => ({
              ...prev,
              [entry.target.id]: entry.isIntersecting
            }));
            
            setIntersectionRatios(prev => ({
              ...prev,
              [entry.target.id]: Math.round(entry.intersectionRatio * 100) / 100
            }));
          });
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      
      observer.observe(section);
      observers.push(observer);
    });
    
    // Actualizar elemento activo
    const updateActiveElement = () => {
      setActiveElement(document.activeElement);
    };
    
    // Configurar actualización periódica
    const interval = setInterval(() => {
      updateBodyClasses();
      updateActiveElement();
    }, 1000);
    
    // Limpieza
    return () => {
      clearInterval(interval);
      observers.forEach(obs => obs.disconnect());
    };
  }, [enabled]);
  
  if (!enabled) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        maxWidth: '300px',
        maxHeight: '200px',
        overflow: 'auto',
        zIndex: 10000,
        opacity: 0.8,
      }}
    >
      <div><strong>Sección actual:</strong> {currentSection}</div>
      <div>
        <strong>Body clases:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          {bodyClasses.map((cls) => (
            <li key={cls} style={{ 
              color: cls.includes('testimonials') ? '#4ade80' : 'white',
              fontWeight: cls.includes('testimonials') ? 'bold' : 'normal'
            }}>
              {cls}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Secciones visibles:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          {Object.entries(visibleSections).map(([id, isVisible]) => (
            <li key={id} style={{ color: isVisible ? '#4ade80' : '#d1d5db' }}>
              {id} ({intersectionRatios[id] || 0})
            </li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Activo:</strong> {activeElement?.tagName.toLowerCase()}
        {activeElement?.id ? `#${activeElement.id}` : ''}
      </div>
    </div>
  );
};

export default SectionVisibilityDebug;
