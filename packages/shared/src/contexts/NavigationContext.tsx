// src/contexts/NavigationContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { debugLog } from '../utils/debugConfig';

interface NavigationContextType {
  currentSection: string;
  currentSubPath: string | null;
  navigateToSection: (section: string, subPath?: string, useScrolling?: boolean) => void;
  navigateFromArticleToSection: (section: string) => void;
  getCurrentPath: () => string;
  setPathFromUrl: () => void;
  isNavigating: boolean;
  targetSection: string | null;
  scrollDuration: number; // Nueva propiedad para la duración del scroll
  isScrolling: boolean; // Estado para detectar si el usuario está haciendo scroll
  showScrollOverlay: boolean; // Estado para mostrar/ocultar el overlay de scroll
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

// Función para calcular duración de scroll basada en distancia de manera más suave
const calculateScrollDuration = (distance: number): number => {
  // Velocidad más rápida para mejor UX
  const baseSpeed = 2.5; // px por ms (más rápido)
  const maxDuration = 800; // máximo 800ms
  const minDuration = 200; // mínimo 200ms
  
  // Cálculo más simple y rápido
  let duration = distance / baseSpeed;
  
  // Aplicar límites más estrictos
  return Math.min(Math.max(duration, minDuration), maxDuration);
};

// Helper function para navegar a una sección con offset correcto y scroll optimizado
const navigateToSectionElement = async (sectionId: string, onScrollComplete?: () => void): Promise<void> => {
  // Si la sección es "home", ir al inicio de la página
  if (sectionId === 'home') {
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    if (Math.abs(currentScrollPosition - 0) < 10) {
      // Ya estamos en la posición, ejecutar callback inmediatamente
      if (onScrollComplete) {
        onScrollComplete();
      }
      return;
    }
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Callback más rápido para el home
    if (onScrollComplete) {
      setTimeout(onScrollComplete, 300);
    }
    return;
  }

  const sectionElement = document.getElementById(sectionId);
  if (!sectionElement) {
    debugLog.warn(`No se encontró la sección: ${sectionId}`);
    if (onScrollComplete) {
      onScrollComplete();
    }
    return;
  }

  // Buscar el header sticky
  const navElement = document.querySelector('.header-portfolio-nav') as HTMLElement;
  let totalOffset = 80; // Offset por defecto
  
  if (navElement) {
    const navStyle = window.getComputedStyle(navElement);
    if (navStyle.position === 'sticky' || navStyle.position === 'fixed') {
      totalOffset = navElement.offsetHeight + 20;
    }
  }
  
  // Obtener posición de la sección
  const sectionRect = sectionElement.getBoundingClientRect();
  const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  const targetPosition = Math.max(0, currentScrollPosition + sectionRect.top - totalOffset);
  
  // Verificar si realmente necesitamos hacer scroll
  if (Math.abs(currentScrollPosition - targetPosition) < 10) {
    if (onScrollComplete) {
      onScrollComplete();
    }
    return;
  }
  
  // Usar scroll nativo del navegador
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
  
  // Callback más rápido basado en distancia
  if (onScrollComplete) {
    const distance = Math.abs(targetPosition - currentScrollPosition);
    const callbackDelay = Math.min(Math.max(distance / 3, 200), 600); // Más rápido
    setTimeout(onScrollComplete, callbackDelay);
  }
};

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentSection, setCurrentSection] = useState('');
  const [currentSubPath, setCurrentSubPath] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetSection, setTargetSection] = useState<string | null>(null);
  const [scrollDuration, setScrollDuration] = useState(500); // Estado para la duración del scroll
  const [isScrolling, setIsScrolling] = useState(false); // Estado para detectar scroll del usuario
  const [showScrollOverlay, setShowScrollOverlay] = useState(false); // Estado para mostrar overlay
  
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
      const isMainPage = sectionPath === '/' || sectionPath === '';
      
      if (!isMainPage) {
        return; // No ejecutar detección de scroll en páginas de artículos o admin
      }
      
      const scrollY = window.scrollY;
      const headerElement = document.querySelector('.header-curriculum') as HTMLElement;
      const headerHeight = headerElement?.offsetHeight || 400;
      
      // PRIORIDAD 1: Si estamos en la zona del header, establecer sección como 'home'
      if (scrollY < headerHeight * 0.5) {
        if (currentSection !== 'home') {
          setCurrentSection('home');
          
          // Actualizar el atributo data-active-section en el body
          document.body.setAttribute('data-active-section', 'home');
          
          // Limpiar clases de secciones específicas
          document.body.className = document.body.className
            .replace(/section-active-\w+/g, '')
            .trim();
          document.body.classList.remove('testimonials-section-active');
          document.body.classList.add('section-active-home');
          
          // Actualizar URL
          window.history.replaceState({}, '', '/profile-craft/');
          
          // Log en desarrollo
          if (process.env.NODE_ENV === 'development') {
            debugLog.navigation('Navegación: En zona del header, sección establecida como "home"');
          }
        }
        return;
      }
      
      const navElement = document.querySelector('.header-portfolio-nav') as HTMLElement;
      const navHeight = navElement?.offsetHeight || 80;
      
      // PRIORIDAD 2: Detectar qué sección está visible en el viewport
      let activeSectionId = '';
      let bestMatch = { sectionId: '', score: -Infinity };
        for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          
          // Calcular un "score" basado en qué tanto de la sección está visible
          const visibleTop = Math.max(rect.top, navHeight);
          const visibleBottom = Math.min(rect.bottom, window.innerHeight);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const totalHeight = rect.height;
          const visibilityRatio = visibleHeight / totalHeight;
          
          // Dar prioridad a secciones que están más centradas en el viewport
          const centerDistance = Math.abs((rect.top + rect.bottom) / 2 - window.innerHeight / 2);
          const centerScore = 1 / (1 + centerDistance / window.innerHeight);
            // Score combinado: visibilidad + posición central
          const score = visibilityRatio * 0.7 + centerScore * 0.3;
          
          // DEBUG: Log específico para articles y secciones cercanas
          if (process.env.NODE_ENV === 'development' && (sectionId === 'articles' || sectionId === 'skills' || sectionId === 'certifications')) {
            debugLog.navigation(`${sectionId}: top=${rect.top.toFixed(1)}, bottom=${rect.bottom.toFixed(1)}, score=${score.toFixed(3)}, visible=${(visibilityRatio * 100).toFixed(1)}%`);
          }
          
          // Solo considerar secciones que están al menos parcialmente visibles
          if (rect.bottom > navHeight && rect.top < window.innerHeight && score > bestMatch.score) {
            // NUEVA LÓGICA: Si la sección actual es 'articles' y hay otra sección con score > 0.4, cambiar
            if (currentSection === 'articles' && sectionId !== 'articles' && score > 0.4) {
              bestMatch = { sectionId, score };
            } else if (currentSection !== 'articles' || sectionId === 'articles') {
              bestMatch = { sectionId, score };
            }
          }
        }
      }
        // Si encontramos una sección con buen score, activarla
      // Usar umbral más alto si estamos saliendo de articles para evitar que se quede atascado
      const threshold = currentSection === 'articles' ? 0.3 : 0.1;
      if (bestMatch.sectionId && bestMatch.score > threshold) {
        activeSectionId = bestMatch.sectionId;
      }
        // Actualizar sección activa si cambió
      if (activeSectionId && currentSection !== activeSectionId) {
        // DEBUG: Log específico para detectar cuando se queda atascado
        if (process.env.NODE_ENV === 'development') {
          debugLog.navigation(`Navegación: Intentando cambiar de "${currentSection}" a "${activeSectionId}"`);
          debugLog.navigation(`Score de la mejor sección: ${bestMatch.score}`);
          
          // Log adicional si es la sección articles
          if (activeSectionId === 'articles' || currentSection === 'articles') {
            const articlesElement = document.getElementById('articles');
            if (articlesElement) {
              const rect = articlesElement.getBoundingClientRect();
              debugLog.navigation(`Articles debug - rect: top=${rect.top}, bottom=${rect.bottom}, height=${rect.height}`);
              debugLog.navigation(`Viewport height: ${window.innerHeight}, Nav height: ${navHeight}`);
            }
          }
        }
        
        setCurrentSection(activeSectionId);
        
        // Actualizar URL con hash fragment
        const newPath = `#${activeSectionId}`;
        window.history.replaceState({}, '', newPath);
        
        // Actualizar el atributo data-active-section en el body
        document.body.setAttribute('data-active-section', activeSectionId);
        
        // Añadir clases específicas para cada sección en el body
        document.body.className = document.body.className
          .replace(/section-active-\w+/g, '')
          .trim();
        document.body.classList.add(`section-active-${activeSectionId}`);
        
        // Para la sección de testimonios, añadir una clase específica
        if (activeSectionId === 'testimonials') {
          document.body.classList.add('testimonials-section-active');
        } else {
          document.body.classList.remove('testimonials-section-active');
        }
        
        // Log en desarrollo
        if (process.env.NODE_ENV === 'development') {
          debugLog.navigation(`Navegación: Sección activa cambiada a "${activeSectionId}" por detección de scroll`);
        }
      } else if (process.env.NODE_ENV === 'development' && activeSectionId === currentSection) {
        // DEBUG: Log cuando no hay cambio pero hay una sección activa
        debugLog.navigation(`Navegación: Sección "${activeSectionId}" sigue activa (score: ${bestMatch.score})`);
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
    // Activar overlay de navegación
    setIsNavigating(true);
    setTargetSection(section);
    setIsScrolling(true);
    setShowScrollOverlay(true);
    
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
      // Calcular duración para el overlay
      const targetElement = document.getElementById(section);
      let distance = 0;
      if (targetElement || section === 'home') {
        const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = section === 'home' ? 0 : targetElement?.getBoundingClientRect().top || 0;
        distance = Math.abs(targetPosition - currentScrollPosition);
      }
      const duration = calculateScrollDuration(distance);
      setScrollDuration(duration);

      // Iniciar scroll con callback para ocultar overlay
      (async () => {
        await navigateToSectionElement(section, () => {
          // Ocultar overlay cuando termine la navegación
          setIsNavigating(false);
          setTargetSection(null);
          setIsScrolling(false);
          setShowScrollOverlay(false);
        });
      })();
      
      // Timeout de seguridad para ocultar overlay si algo falla
      setTimeout(() => {
        setIsNavigating(false);
        setTargetSection(null);
        setIsScrolling(false);
        setShowScrollOverlay(false);
      }, duration + 100); // Añadir solo 100ms extra
    } else {
      // Si no hay scroll, ocultar overlay rápidamente
      setTimeout(() => {
        setIsNavigating(false);
        setTargetSection(null);
        setIsScrolling(false);
        setShowScrollOverlay(false);
      }, 150); // Reducido de 100ms a 150ms
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

  // Función para obtener la ruta current
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
        
        // Actualizar inmediatamente los atributos del body para la sección del hash
        document.body.setAttribute('data-active-section', section);
        document.body.className = document.body.className
          .replace(/section-active-\w+/g, '')
          .trim();
        document.body.classList.add(`section-active-${section}`);
        
        if (section === 'testimonials') {
          document.body.classList.add('testimonials-section-active');
        } else {
          document.body.classList.remove('testimonials-section-active');
        }
        
        // Scroll automático a la sección cuando se carga desde URL - sin delay
        (async () => {
          await navigateToSectionElement(section);
        })();
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
      
      // Scroll automático a la sección cuando se carga desde URL - sin delay
      (async () => {
        await navigateToSectionElement(section);
      })();
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
    targetSection,
    scrollDuration,
    isScrolling,
    showScrollOverlay
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
