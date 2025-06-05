// src/contexts/NavigationContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationContextType {
  currentSection: string;
  currentSubPath: string | null;
  navigateToSection: (section: string, subPath?: string, useScrolling?: boolean) => void;
  getCurrentPath: () => string;
  setPathFromUrl: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

// Helper function para navegar a una sección con offset correcto
const navigateToSectionElement = (sectionId: string): void => {
  const sectionElement = document.getElementById(sectionId);
  if (!sectionElement) {
    return;
  }

  // Buscar el header sticky
  const navElement = document.querySelector('.header-portfolio-nav') as HTMLElement;
  
  let totalOffset = 80; // Offset por defecto
  
  if (navElement) {
    const navStyle = window.getComputedStyle(navElement);
    if (navStyle.position === 'sticky' || navStyle.position === 'fixed') {
      totalOffset = navElement.offsetHeight + 20; // Añadir un pequeño margen
    }
  }
  
  // Obtener posición de la sección
  const sectionRect = sectionElement.getBoundingClientRect();
  const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  const targetPosition = Math.max(0, currentScrollPosition + sectionRect.top - totalOffset);
  
  // Verificar si realmente necesitamos hacer scroll
  if (Math.abs(currentScrollPosition - targetPosition) < 10) {
    return;
  }
  
  // Hacer scroll suave
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
};

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentSection, setCurrentSection] = useState('about');
  const [currentSubPath, setCurrentSubPath] = useState<string | null>(null);
  
  // Inicializar el atributo data-active-section
  useEffect(() => {
    document.body.setAttribute('data-active-section', currentSection);
  }, []);

  // Sistema de detección de scroll para actualizar sección activa
  useEffect(() => {
    const sections = ['about', 'experience', 'articles', 'skills', 'certifications', 'testimonials', 'contact'];
    
    const detectActiveSection = () => {
      const navElement = document.querySelector('.header-portfolio-nav') as HTMLElement;
      const navHeight = navElement?.offsetHeight || 80;
      
      // Detectar qué sección está visible en el viewport
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          
          // Una sección está activa si está en el área visible
          if (rect.top <= navHeight + 100 && rect.bottom > navHeight + 200) {
            if (currentSection !== sectionId) {
              setCurrentSection(sectionId);
              
              // Actualizar URL sin hacer scroll
              let newPath = '/';
              if (sectionId !== 'about') {
                newPath = `/${sectionId}`;
              }
              
              // Actualizar el atributo data-active-section en el body
              document.body.setAttribute('data-active-section', sectionId);
              
              // Añadir clases específicas para cada sección en el body
              document.body.className = document.body.className
                .replace(/section-active-\w+/g, '')
                .trim();
              document.body.classList.add(`section-active-${sectionId}`);
              
              // Para la sección de testimonios, añadir una clase específica
              if (sectionId === 'testimonials') {
                document.body.classList.add('testimonials-section-active');
              } else {
                document.body.classList.remove('testimonials-section-active');
              }
              
              // Log en desarrollo
              if (import.meta.env.DEV) {
                console.log(`Navegación: Sección activa cambiada a "${sectionId}"`);
              }
              
              window.history.replaceState({}, '', newPath);
            }
            break;
          }
        }
      }
    };

    const handleScroll = () => {
      requestAnimationFrame(detectActiveSection);
    };

    // Detectar sección inicial
    detectActiveSection();

    // Agregar listener de scroll
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentSection]);

  // Función para navegar a una sección y actualizar la URL
  const navigateToSection = (section: string, subPath?: string, useScrolling?: boolean) => {
    setCurrentSection(section);
    setCurrentSubPath(subPath || null);
    
    // Construir la nueva ruta
    let newPath = '/';
    if (section !== 'about') {
      newPath = `/${section}`;
      if (subPath) {
        newPath += `/${subPath}`;
      }
    }
    
    // Actualizar la URL
    window.history.pushState({}, '', newPath);
    
    // Hacer scroll si está habilitado (por defecto true)
    if (useScrolling !== false) {
      setTimeout(() => {
        navigateToSectionElement(section);
      }, 100);
    }
  };

  // Función para obtener la ruta actual
  const getCurrentPath = () => {
    return window.location.pathname;
  };

  // Función para establecer la sección desde la URL
  const setPathFromUrl = () => {
    const path = window.location.pathname;
    
    if (path === '/' || path === '') {
      setCurrentSection('about');
      setCurrentSubPath(null);
    } else {
      const pathParts = path.substring(1).split('/');
      const section = pathParts[0];
      const subPath = pathParts[1] || null;
      
      setCurrentSection(section);
      setCurrentSubPath(subPath);
      
      // Scroll automático a la sección cuando se carga desde URL
      setTimeout(() => {
        navigateToSectionElement(section);
      }, 300);
    }
  };

  // Configurar el listener para el botón atrás del navegador
  useEffect(() => {
    const handlePopState = () => {
      setPathFromUrl();
    };

    // Establecer la sección inicial desde la URL
    setPathFromUrl();

    // Escuchar cambios en el historial del navegador
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  const value = {
    currentSection,
    currentSubPath,
    navigateToSection,
    getCurrentPath,
    setPathFromUrl
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
