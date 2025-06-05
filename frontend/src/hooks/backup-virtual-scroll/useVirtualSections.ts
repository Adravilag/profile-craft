// src/hooks/useVirtualSections.ts

import { useEffect, useCallback, useMemo } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

interface VirtualSection {
  id: string;
  label: string;
  icon: string;
  height: number; // Altura estimada en píxeles
}

interface VirtualScrollConfig {
  headerHeight: number;
  navHeight: number;
  sectionPadding?: number;
}

/**
 * Hook para manejar secciones virtuales con lazy loading
 * Simula un scroll continuo pero carga componentes bajo demanda
 */
export const useVirtualSections = (config: VirtualScrollConfig) => {
  const { headerHeight, navHeight, sectionPadding = 40 } = config;
  const { currentSection, navigateToSection } = useNavigation();
  
  // Definición de secciones con alturas estimadas
  const sections: VirtualSection[] = useMemo(() => [
    {
      id: 'about',
      label: 'Sobre mí',
      icon: 'fas fa-user',
      height: 600
    },
    {
      id: 'experience',
      label: 'Experiencia',
      icon: 'fas fa-briefcase',
      height: 800
    },
    {
      id: 'articles',
      label: 'Proyectos',
      icon: 'fas fa-project-diagram',
      height: 700
    },
    {
      id: 'skills',
      label: 'Habilidades',
      icon: 'fas fa-tools',
      height: 650
    },
    {
      id: 'certifications',
      label: 'Certificaciones',
      icon: 'fas fa-certificate',
      height: 500
    },
    {
      id: 'testimonials',
      label: 'Testimonios',
      icon: 'fas fa-comments',
      height: 600
    },
    {
      id: 'contact',
      label: 'Contacto',
      icon: 'fas fa-envelope',
      height: 500
    }
  ], []);

  // Calcular posiciones acumulativas de cada sección
  const sectionPositions = useMemo(() => {
    let currentY = headerHeight;
    const positions = new Map<string, { start: number; end: number; height: number }>();
    
    sections.forEach(section => {
      const start = currentY;
      const height = section.height + sectionPadding;
      const end = start + height;
      
      positions.set(section.id, { start, end, height });
      currentY = end;
    });
    
    return positions;
  }, [sections, headerHeight, sectionPadding]);

  // Altura total del documento virtual
  const totalHeight = useMemo(() => {
    const lastSection = sections[sections.length - 1];
    const lastPosition = sectionPositions.get(lastSection.id);
    return lastPosition ? lastPosition.end : headerHeight;
  }, [sections, sectionPositions, headerHeight]);

  /**
   * Obtiene la sección que debería estar visible en una posición Y dada
   */
  const getSectionAtPosition = useCallback((scrollY: number): string => {
    // Si estamos en el header, mostrar about
    if (scrollY < headerHeight * 0.7) {
      return 'about';
    }

    // Buscar la sección correspondiente a la posición actual
    for (const [sectionId, position] of sectionPositions) {
      if (scrollY >= position.start - navHeight && scrollY < position.end - navHeight) {
        return sectionId;
      }
    }

    // Fallback a la última sección
    return sections[sections.length - 1].id;
  }, [sectionPositions, headerHeight, navHeight, sections]);

  /**
   * Obtiene la posición Y ideal para una sección
   */
  const getScrollPositionForSection = useCallback((sectionId: string): number => {
    const position = sectionPositions.get(sectionId);
    if (!position) {
      console.warn(`Sección ${sectionId} no encontrada`);
      return 0;
    }

    // La posición ideal es donde la sección comienza, ajustada por el nav
    return Math.max(0, position.start - navHeight);
  }, [sectionPositions, navHeight]);

  /**
   * Scroll suave a una sección específica
   */
  const scrollToSection = useCallback((sectionId: string, duration = 800) => {
    const targetY = getScrollPositionForSection(sectionId);
    
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Función de easing
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentY = startY + (distance * easedProgress);
      
      window.scrollTo(0, currentY);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, [getScrollPositionForSection]);

  /**
   * Crear elementos div virtuales para simular las secciones en el DOM
   */
  const createVirtualSectionElements = useCallback(() => {
    // Limpiar elementos virtuales existentes
    document.querySelectorAll('.virtual-section').forEach(el => el.remove());

    // Crear nuevos elementos virtuales
    sections.forEach(section => {
      const position = sectionPositions.get(section.id);
      if (!position) return;

      const virtualElement = document.createElement('div');
      virtualElement.id = section.id;
      virtualElement.className = 'virtual-section';
      virtualElement.dataset.section = section.id;
      virtualElement.style.position = 'absolute';
      virtualElement.style.top = `${position.start}px`;
      virtualElement.style.height = `${position.height}px`;
      virtualElement.style.width = '100%';
      virtualElement.style.pointerEvents = 'none';
      virtualElement.style.visibility = 'hidden';
      virtualElement.style.zIndex = '-1';

      document.body.appendChild(virtualElement);
    });

    // Ajustar la altura del body para permitir scroll
    document.body.style.minHeight = `${totalHeight}px`;
  }, [sections, sectionPositions, totalHeight]);
  /**
   * Detectar cambios de sección basados en scroll
   */
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const currentScrollY = window.scrollY;
        const detectedSection = getSectionAtPosition(currentScrollY);
        
        if (detectedSection !== currentSection) {
          console.log(`🔄 Sección virtual detectada: ${currentSection} → ${detectedSection}`);
          
          // Navegar usando el contexto pero sin scroll automático
          navigateToSection(detectedSection, undefined, false);
        }
      }, 150);
    };

    // Solo agregar listener si estamos usando el sistema virtual
    console.log('🚀 Sistema de secciones virtuales activado');
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      console.log('🛑 Sistema de secciones virtuales desactivado');
    };
  }, [currentSection, getSectionAtPosition, navigateToSection]);

  /**
   * Crear elementos virtuales cuando el hook se inicializa
   */
  useEffect(() => {
    createVirtualSectionElements();

    return () => {
      // Limpiar al desmontar
      document.querySelectorAll('.virtual-section').forEach(el => el.remove());
      document.body.style.minHeight = '';
    };
  }, [createVirtualSectionElements]);

  return {
    sections,
    sectionPositions,
    totalHeight,
    currentSection,
    getSectionAtPosition,
    getScrollPositionForSection,
    scrollToSection,
    createVirtualSectionElements
  };
};

export default useVirtualSections;
