// src/components/sections/skills/hooks/useStickyFilter.ts
import { useState, useEffect, useRef, RefObject } from 'react';
import { useNavigation } from '@cv-maker/shared';

interface StickyFilterOptions {
  sectionId?: string;
  threshold?: number;
  offsetTop?: number;
  debug?: boolean;
}

interface StickyFilterState {
  isSticky: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  styles: {
    container: React.CSSProperties;
    panel: React.CSSProperties;
  };
  isInSection: boolean;
}

/**
 * Hook personalizado para manejar el comportamiento "sticky" del panel de filtros
 * Permite que el panel se mantenga visible mientras se desplaza dentro de la sección,
 * pero permanece en su posición original cuando está en la parte superior
 */
export const useStickyFilter = ({
  sectionId = 'skills',
  threshold = 100,
  offsetTop = 80,
  debug = false
}: StickyFilterOptions = {}): StickyFilterState => {
  // Referencias a los elementos DOM
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  
  // Estados
  const [isSticky, setIsSticky] = useState(false);
  const [isInSection, setIsInSection] = useState(false);
  const [sectionRect, setSectionRect] = useState<DOMRect | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [panelRect, setPanelRect] = useState<DOMRect | null>(null);
  
  // Utilizar el contexto de navegación para detectar la sección activa
  const { currentSection } = useNavigation();
  
  // Estilos dinámicos
  const [styles, setStyles] = useState<{
    container: React.CSSProperties;
    panel: React.CSSProperties;
  }>({
    container: {},
    panel: {}
  });
  
  // Efecto para detectar si estamos en la sección correcta
  useEffect(() => {
    const isInSkillsSection = currentSection === sectionId;
    setIsInSection(isInSkillsSection);
    
    if (debug) {
      console.log(`[STICKY_FILTER] Sección actual: ${currentSection}, En sección de habilidades: ${isInSkillsSection}`);
    }
  }, [currentSection, sectionId, debug]);
  
  // Función para calcular los rectángulos de los elementos
  const updateRects = () => {
    const sectionElement = document.getElementById(sectionId);
    
    if (sectionElement) {
      setSectionRect(sectionElement.getBoundingClientRect());
    }
    
    if (containerRef.current) {
      setContainerRect(containerRef.current.getBoundingClientRect());
    }
    
    if (panelRef.current) {
      setPanelRect(panelRef.current.getBoundingClientRect());
    }
  };
  
  // Función para actualizar el estado sticky según la posición de scroll
  const updateStickyState = () => {
    if (!isInSection || !sectionRect || !containerRect || !panelRect) return;
    
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const sectionTop = scrollTop + sectionRect.top;
    const sectionBottom = sectionTop + sectionRect.height;
    const viewportHeight = window.innerHeight;
    
    // Calcular cuando el panel debe volverse sticky
    const shouldBeSticky = 
      scrollTop > sectionTop + threshold && 
      scrollTop + viewportHeight < sectionBottom;
    
    if (shouldBeSticky !== isSticky) {
      setIsSticky(shouldBeSticky);
      
      if (debug) {
        console.log(`[STICKY_FILTER] Estado sticky cambiado a: ${shouldBeSticky}`);
      }
    }
    
    // Actualizar estilos según el estado
    updateStyles();
  };
  
  // Función para actualizar los estilos del contenedor y el panel
  const updateStyles = () => {
    if (!containerRect || !panelRect) return;
    
    const newStyles = {
      container: { ...styles.container },
      panel: { ...styles.panel }
    };
    
    if (isSticky) {
      // Cuando es sticky, el panel sigue al scroll
      newStyles.panel = {
        position: 'fixed',
        top: `${offsetTop}px`,
        width: `${containerRect.width}px`,
        maxHeight: `calc(100vh - ${offsetTop * 2}px)`,
        overflowY: 'auto'
      };
    } else {
      // Cuando no es sticky, el panel mantiene su posición normal
      newStyles.panel = {
        position: 'relative',
        top: 'auto',
        width: '100%',
        maxHeight: 'none',
        overflowY: 'visible'
      };
    }
    
    setStyles(newStyles);
  };
  
  // Efecto para configurar los listeners de scroll y resize
  useEffect(() => {
    if (!isInSection) return;
    
    // Actualizar rectángulos inicialmente y configurar observadores
    updateRects();
    window.addEventListener('scroll', updateStickyState);
    window.addEventListener('resize', () => {
      updateRects();
      updateStickyState();
    });
    
    return () => {
      window.removeEventListener('scroll', updateStickyState);
      window.removeEventListener('resize', updateRects);
    };
  }, [isInSection, sectionRect, containerRect, panelRect]);
  
  // Efecto para recalcular cuando cambia la sección
  useEffect(() => {
    updateRects();
    updateStickyState();
  }, [isInSection]);
  
  return {
    isSticky,
    containerRef,
    panelRef,
    styles,
    isInSection
  };
};
