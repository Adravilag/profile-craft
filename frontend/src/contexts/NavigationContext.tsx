// src/contexts/NavigationContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationContextType {
  currentSection: string;
  currentSubPath: string | null;
  navigateToSection: (section: string, subPath?: string, useScrolling?: boolean) => void;
  navigateFromArticleToSection: (section: string) => void;
  getCurrentPath: () => string;
  setPathFromUrl: () => void;
  isNavigating: boolean;
  targetSection: string | null;
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
  const [currentSection, setCurrentSection] = useState('');
  const [currentSubPath, setCurrentSubPath] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetSection, setTargetSection] = useState<string | null>(null);
  
  // Inicializar el atributo data-active-section
  useEffect(() => {
    document.body.setAttribute('data-active-section', currentSection);
  }, []);

  // Sistema de detección de scroll para actualizar sección activa
  useEffect(() => {
    const sections = ['about', 'experience', 'articles', 'skills', 'certifications', 'testimonials', 'contact'];
    
    const detectActiveSection = () => {
      const scrollY = window.scrollY;
      const headerElement = document.querySelector('.header-curriculum') as HTMLElement;
      const headerHeight = headerElement?.offsetHeight || 400;
      
      // NUEVA LÓGICA: Si estamos en la zona del header, establecer ruta como '/'
      if (scrollY < headerHeight * 0.5) {
        if (currentSection !== '') {
          setCurrentSection('');
          
          // Actualizar URL a la raíz
          window.history.replaceState({}, '', '/');
          
          // Actualizar el atributo data-active-section en el body
          document.body.setAttribute('data-active-section', 'header');
          
          // Limpiar clases de secciones específicas
          document.body.className = document.body.className
            .replace(/section-active-\w+/g, '')
            .trim();
          document.body.classList.remove('testimonials-section-active');
          document.body.classList.add('section-active-header');
          
          // Log en desarrollo
          if (process.env.NODE_ENV === 'development') {
            console.log('Navegación: En zona del header, ruta establecida como "/"');
          }
        }
        return;
      }
      
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
              const newPath = `/${sectionId}`;
              
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
              if (process.env.NODE_ENV === 'development') {
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
    // Activar estado de navegación
    setIsNavigating(true);
    setTargetSection(section);
    
    setCurrentSection(section);
    setCurrentSubPath(subPath || null);
    
    // Construir la nueva ruta
    let newPath = `/${section}`;
    if (subPath) {
      newPath += `/${subPath}`;
    }
    
    // Actualizar la URL
    window.history.pushState({}, '', newPath);
    
    // Hacer scroll si está habilitado (por defecto true)
    if (useScrolling !== false) {
      setTimeout(() => {
        navigateToSectionElement(section);
        // Desactivar estado de navegación después del scroll
        setTimeout(() => {
          setIsNavigating(false);
          setTargetSection(null);
        }, 1500); // Duración del overlay
      }, 100);
    } else {
      // Si no hay scroll, desactivar inmediatamente
      setIsNavigating(false);
      setTargetSection(null);
    }
  };

  // Función para navegar desde un artículo directamente a una sección
  const navigateFromArticleToSection = (section: string) => {
    // Construir la ruta base hacia la sección en la página principal con barra inicial
    const newPath = `/${section}`;

    // Cargar la página principal en la sección solicitada
    window.location.assign(newPath);
  };


  // Función para obtener la ruta actual
  const getCurrentPath = () => {
    return window.location.pathname;
  };

  // Función para establecer la sección desde la URL
  const setPathFromUrl = () => {
    const path = window.location.pathname;
    
    if (path === '/' || path === '') {
      // Cuando estamos en la raíz, no establecer ninguna sección específica
      // Permitir que la detección de scroll determine si estamos en header o primera sección
      setCurrentSection('');
      setCurrentSubPath(null);
      
      // Scroll to top para asegurar que estamos en la zona del header
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    navigateFromArticleToSection,
    getCurrentPath,
    setPathFromUrl,
    isNavigating,
    targetSection
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
