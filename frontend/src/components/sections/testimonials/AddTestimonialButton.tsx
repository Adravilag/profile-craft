// src/components/sections/testimonials/AddTestimonialButton.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useScrollVisibility } from '../../../hooks/useScrollVisibility';
import { useNavigation } from '../../../contexts/NavigationContext';
import FloatingActionButton from '../../common/FloatingActionButton';

interface AddTestimonialButtonProps {
  onClick: () => void;
  debug?: boolean; // Prop para activar el modo debug
}

const AddTestimonialButton: React.FC<AddTestimonialButtonProps> = ({ 
  onClick, 
  debug = false 
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const isScrollVisible = useScrollVisibility(true, 300);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Hooks para detección dual: URL y NavigationContext
  const location = useLocation();
  const { currentSection } = useNavigation();
  
  // Detección dual: URL o NavigationContext
  const isOnTestimonialsURL = location.pathname === '/testimonials';
  const isInTestimonialsSection = currentSection === 'testimonials';
  const shouldShowByNavigation = isOnTestimonialsURL || isInTestimonialsSection;
  
  // Usar Intersection Observer para detectar cuando la sección de testimonios está visible
  useEffect(() => {
    const testimonialsSectionElem = document.getElementById('testimonials');
    
    if (!testimonialsSectionElem) {
      if (debug) console.log('[TESTIMONIO_DEBUG] Sección de testimonios no encontrada');
      return;
    }
    
    // Crear el Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.5; // Visible al menos 50%
        
        setShouldShow(isVisible);
        
        // Añadir/quitar clase del body
        if (isVisible) {
          document.body.classList.add('in-testimonials-section');
        } else {
          document.body.classList.remove('in-testimonials-section');
        }
        
        // Log para desarrollo
        if (debug) {
          console.log(`[TESTIMONIO_DEBUG] Sección visible: ${isVisible}`);
          console.log(`[TESTIMONIO_DEBUG] Intersection ratio: ${entry.intersectionRatio}`);
          console.log(`[TESTIMONIO_DEBUG] Mostrar botón: ${isVisible}`);
        }
      },
      {
        // Configuración del observer - MÁS RESTRICTIVA
        root: null, // viewport
        rootMargin: '-20% 0px -40% 0px', // Solo cuando esté bien centrada en viewport
        threshold: [0, 0.5, 0.8, 1] // Umbrales más altos
      }
    );
    
    // Observar la sección de testimonios
    observerRef.current.observe(testimonialsSectionElem);
    
    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      document.body.classList.remove('in-testimonials-section');
    };
  }, [debug]);

  // El botón es visible SOLO si:
  // 1. Estamos en la URL /testimonials O la sección actual es 'testimonials' (NavigationContext)
  // 2. Y la sección está visible en viewport (Intersection Observer)
  // 3. Y el scroll es visible
  const isVisible = shouldShowByNavigation && shouldShow && isScrollVisible;
  
  // Log adicional para debug
  if (debug) {
    console.log(`[TESTIMONIO_DEBUG] === ESTADO DETECCIÓN DUAL ===`);
    console.log(`[TESTIMONIO_DEBUG] URL actual: ${location.pathname}`);
    console.log(`[TESTIMONIO_DEBUG] Sección actual (NavigationContext): ${currentSection}`);
    console.log(`[TESTIMONIO_DEBUG] ¿En URL /testimonials?: ${isOnTestimonialsURL}`);
    console.log(`[TESTIMONIO_DEBUG] ¿En sección testimonials?: ${isInTestimonialsSection}`);
    console.log(`[TESTIMONIO_DEBUG] ¿Mostrar por navegación?: ${shouldShowByNavigation}`);
    console.log(`[TESTIMONIO_DEBUG] ¿Sección visible (Intersection)?: ${shouldShow}`);
    console.log(`[TESTIMONIO_DEBUG] ¿Scroll visible?: ${isScrollVisible}`);
    console.log(`[TESTIMONIO_DEBUG] ¿Botón final visible?: ${isVisible}`);
  }
  
  return (
    <>
      <FloatingActionButton
        onClick={onClick}
        icon="fas fa-plus"
        label="Añadir Testimonio"
        color="secondary"
        position="bottom-right"
        className={`add-testimonial ${isVisible ? 'visible' : ''}`}
        usePortal={true}
        ariaLabel="Añadir nuevo testimonio"
      />
      
      {/* Indicador de depuración - solo visible en modo desarrollo */}
      {debug && (
        <div className="button-debug-indicator" 
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '30px',
              background: isVisible ? 'rgba(0,128,0,0.7)' : 'rgba(255,0,0,0.7)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              zIndex: 9999,
              pointerEvents: 'none',
              maxWidth: '280px',
              wordBreak: 'break-word'
            }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {isVisible ? 'Botón VISIBLE ✓' : 'Botón OCULTO ✗'}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>
            URL: {location.pathname} {isOnTestimonialsURL ? '✓' : '✗'}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>
            Sección: {currentSection} {isInTestimonialsSection ? '✓' : '✗'}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>
            Navegación: {shouldShowByNavigation ? 'Sí' : 'No'}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>
            Intersection: {shouldShow ? 'Sí' : 'No'}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>
            Scroll: {isScrollVisible ? 'Sí' : 'No'}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '2px' }}>
            Final: {isVisible ? 'MOSTRAR' : 'OCULTAR'}
          </div>
        </div>
      )}
    </>
  );
};

export default AddTestimonialButton;
