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

// Helper function para normalizar el path - ya no necesaria con router basename
// const normalizePathFromBasePath = (path: string): string => {
//   const basePath = '/ProfileCraft';
//   return path.startsWith(basePath) ? path.substring(basePath.length) : path;
// };

// Helper function para navegar a una sección con offset correcto y scroll optimizado
const navigateToSectionElement = async (sectionId: string, onScrollComplete?: () => void): Promise<void> => {
  // Si la sección es "home", ir al inicio de la página
  if (sectionId === 'home') {
    smoothScrollTo(0, 800, onScrollComplete); // 800ms de duración
    return;
  }

  const sectionElement = document.getElementById(sectionId);
  if (!sectionElement) {
    // Si no encuentra la sección, ejecutar callback inmediatamente
    if (onScrollComplete) {
      onScrollComplete();
    }
    return;
  }

  // Precarga: Disparar eventos para que las secciones se preparen
  const preloadEvent = new CustomEvent('sectionPreload', { detail: { sectionId } });
  document.dispatchEvent(preloadEvent);

  // Buscar el header sticky inmediatamente, sin delay
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
    // No necesitamos scroll, ejecutar callback inmediatamente
    if (onScrollComplete) {
      onScrollComplete();
    }
    return;
  }
  
  // Calcular duración basada en distancia (mínimo 600ms para dar tiempo a la carga, máximo 1400ms)
  const distance = Math.abs(targetPosition - currentScrollPosition);
  const duration = Math.min(Math.max(distance * 1.0, 600), 1400);
  
  // Hacer scroll suave personalizado con callback
  smoothScrollTo(targetPosition, duration, onScrollComplete);
};

// Función de scroll suave personalizada para mejor control
const smoothScrollTo = (target: number, duration: number, onComplete?: () => void): void => {
  const start = window.pageYOffset || document.documentElement.scrollTop;
  const change = target - start;
  const startTime = performance.now();

  const animateScroll = (currentTime: number): void => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Función de easing para un scroll más natural
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };
    
    const easedProgress = easeInOutCubic(progress);
    const newScrollTop = start + change * easedProgress;
    
    window.scrollTo(0, newScrollTop);
    
    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    } else {
      // Scroll completado, ejecutar callback si existe
      if (onComplete) {
        onComplete();
      }
    }
  };

  requestAnimationFrame(animateScroll);
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
      // Solo ejecutar la lógica de detección de scroll en la página principal
      const currentPath = window.location.pathname;
      
      // Usar /profile-craft como base path tanto en desarrollo como en producción
      const basePath = '/profile-craft';
      
      // Verificar si estamos en la página principal
      const sectionPath = basePath && currentPath.startsWith(basePath) ? currentPath.substring(basePath.length) : currentPath;
      const isMainPage = sectionPath === '/' || sectionPath === '' || sections.includes(sectionPath.substring(1));
      
      if (!isMainPage) {
        return; // No ejecutar detección de scroll en páginas de artículos o admin
      }
      
      const scrollY = window.scrollY;
      const headerElement = document.querySelector('.header-curriculum') as HTMLElement;
      const headerHeight = headerElement?.offsetHeight || 400;
      
      // NUEVA LÓGICA: Si estamos en la zona del header, establecer sección como 'home'
      if (scrollY < headerHeight * 0.5) {
        if (currentSection !== 'home') {
          setCurrentSection('home');
          
          // NO actualizar URL aquí para evitar bucles de redirección
          // El router ya maneja la URL correctamente
          
          // Actualizar el atributo data-active-section en el body
          document.body.setAttribute('data-active-section', 'home');
          
          // Limpiar clases de secciones específicas
          document.body.className = document.body.className
            .replace(/section-active-\w+/g, '')
            .trim();
          document.body.classList.remove('testimonials-section-active');
          document.body.classList.add('section-active-home');
          
          // Log en desarrollo
          if (process.env.NODE_ENV === 'development') {
            console.log('Navegación: En zona del header, sección establecida como "home"');
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
              
              // Actualizar URL sin hacer scroll usando hash fragments
              const newPath = `#${sectionId}`;
              
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
    
    // Construir la nueva ruta con hash fragment
    let newPath = section === 'home' ? '' : `#${section}`;
    if (subPath) {
      newPath += `/${subPath}`;
    }
    
    // Actualizar la URL
    window.history.pushState({}, '', newPath);
    
    // Hacer scroll si está habilitado (por defecto true)
    if (useScrolling !== false) {
      // Iniciar scroll inmediatamente, sin delay
      (async () => {
        // Pasar callback para ocultar overlay cuando termine el scroll
        await navigateToSectionElement(section, () => {
          // Ocultar overlay inmediatamente al completar el scroll
          setIsNavigating(false);
          setTargetSection(null);
        });
      })();
    } else {
      // Si no hay scroll, desactivar inmediatamente
      setIsNavigating(false);
      setTargetSection(null);
    }
  };

  // Función para navegar desde un artículo directamente a una sección
  const navigateFromArticleToSection = (section: string) => {
    // Usar /profile-craft como base path tanto en desarrollo como en producción
    const basePath = '/profile-craft';
    
    // Si la sección es "home", navegar a la página principal
    if (section === 'home') {
      const homePath = `${basePath}/`;
      window.location.assign(homePath);
      return;
    }
    
    // Construir la ruta base hacia la sección en la página principal con hash fragment
    const newPath = `${basePath}/#${section}`;

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
    const hash = window.location.hash;
    
    // Usar /profile-craft como base path tanto en desarrollo como en producción
    const basePath = '/profile-craft';
    
    // Extraer la parte relevante del path
    const sectionPath = basePath && path.startsWith(basePath) ? path.substring(basePath.length) : path;
    
    if (sectionPath === '/' || sectionPath === '') {
      // Si hay un hash, usarlo para determinar la sección
      if (hash && hash.startsWith('#')) {
        const hashSection = hash.substring(1);
        const hashParts = hashSection.split('/');
        const section = hashParts[0];
        const subPath = hashParts[1] || null;
        
        setCurrentSection(section);
        setCurrentSubPath(subPath);
        
        // Scroll automático a la sección cuando se carga desde URL
        setTimeout(async () => {
          await navigateToSectionElement(section);
        }, 300);
      } else {
        // Cuando estamos en la raíz sin hash, establecer la sección como 'home'
        setCurrentSection('home');
        setCurrentSubPath(null);
        
        // Scroll to top para asegurar que estamos en la zona del header
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      const pathParts = sectionPath.substring(1).split('/');
      const section = pathParts[0];
      const subPath = pathParts[1] || null;
      
      setCurrentSection(section);
      setCurrentSubPath(subPath);
      
      // Scroll automático a la sección cuando se carga desde URL
      setTimeout(async () => {
        await navigateToSectionElement(section);
      }, 300);
    }
  };

  // Configurar el listener para el botón atrás del navegador
  useEffect(() => {
    const handlePopState = () => {
      setPathFromUrl();
    };

    // Verificar y redirigir si la URL no tiene la barra final
    const checkAndRedirectUrl = () => {
      const currentUrl = window.location.href;
      const profileCraftWithoutSlash = window.location.origin + '/profile-craft';
      
      if (currentUrl === profileCraftWithoutSlash) {
        window.location.replace(profileCraftWithoutSlash + '/');
        return;
      }
    };

    // Verificar URL inicial
    checkAndRedirectUrl();

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
