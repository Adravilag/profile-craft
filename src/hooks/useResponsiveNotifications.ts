// src/hooks/useResponsiveNotifications.ts

import { useState, useEffect, useCallback } from 'react';
import { useNotificationContext } from '../contexts/NotificationContext';

interface ResponsiveNotificationOptions {
  maxMobile?: number;
  maxTablet?: number;
  maxDesktop?: number;
  durationMultiplierMobile?: number;
}

interface ScreenSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
}

export const useResponsiveNotifications = (options: ResponsiveNotificationOptions = {}) => {
  const {
    maxMobile = 3,
    maxTablet = 4,
    maxDesktop = 5,
    durationMultiplierMobile = 1.2
  } = options;

  const { setMaxNotifications, showNotification: baseShowNotification } = useNotificationContext();
  
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLandscape: true,
    isPortrait: false
  });

  // Actualizar tamaño de pantalla
  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    const isLandscape = width > height;
    const isPortrait = height > width;

    setScreenSize({
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      isLandscape,
      isPortrait
    });

    // Ajustar límite máximo de notificaciones según el tamaño de pantalla
    if (isMobile) {
      setMaxNotifications(maxMobile);
    } else if (isTablet) {
      setMaxNotifications(maxTablet);
    } else {
      setMaxNotifications(maxDesktop);
    }
  }, [maxMobile, maxTablet, maxDesktop, setMaxNotifications]);

  useEffect(() => {
    updateScreenSize();
    
    const handleResize = () => {
      // Debounce para evitar demasiadas actualizaciones
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(updateScreenSize, 150);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', updateScreenSize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateScreenSize);
      clearTimeout(window.resizeTimeout);
    };
  }, [updateScreenSize]);

  // Wrapper para notificaciones que ajusta duración en móviles
  const showNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string,
    duration?: number,
    options?: any
  ) => {
    let adjustedDuration = duration;
    
    // En móviles, aumentar duración para dar tiempo a leer
    if (screenSize.isMobile && duration && duration > 0) {
      adjustedDuration = Math.round(duration * durationMultiplierMobile);
    }

    // En pantallas pequeñas con texto largo, aumentar duración
    if (screenSize.isMobile && message && message.length > 50) {
      adjustedDuration = adjustedDuration ? adjustedDuration + 2000 : 7000;
    }

    return baseShowNotification(type, title, message, adjustedDuration, options);
  }, [screenSize.isMobile, durationMultiplierMobile, baseShowNotification]);

  // Métodos de conveniencia con ajustes responsivos
  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    return showNotification('success', title, message, duration);
  }, [showNotification]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    // Errores en móviles necesitan más tiempo
    const defaultDuration = screenSize.isMobile ? 9000 : 8000;
    return showNotification('error', title, message, duration || defaultDuration, { priority: 'high' });
  }, [showNotification, screenSize.isMobile]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    const defaultDuration = screenSize.isMobile ? 7000 : 6000;
    return showNotification('warning', title, message, duration || defaultDuration, { priority: 'high' });
  }, [showNotification, screenSize.isMobile]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    return showNotification('info', title, message, duration);
  }, [showNotification]);

  // Función para mostrar notificaciones adaptadas al contexto
  const showAdaptiveNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string,
    options?: {
      urgent?: boolean;
      compact?: boolean;
      persistent?: boolean;
    }
  ) => {
    const { urgent = false, compact = false, persistent = false } = options || {};
    
    let adaptedTitle = title;
    let adaptedMessage = message;
    let duration = persistent ? 0 : 5000;

    // En móviles, acortar títulos largos y mover información al mensaje
    if (screenSize.isMobile && title.length > 30) {
      adaptedTitle = title.substring(0, 27) + '...';
      if (!message) {
        adaptedMessage = title;
      }
    }

    // Si es compacto, reducir información
    if (compact && screenSize.isMobile) {
      adaptedMessage = undefined;
      duration = 3000;
    }

    // Si es urgente, aumentar duración y prioridad
    if (urgent) {
      duration = persistent ? 0 : (screenSize.isMobile ? 10000 : 8000);
    }

    return showNotification(
      type, 
      adaptedTitle, 
      adaptedMessage, 
      duration,
      { 
        priority: urgent ? 'high' : 'normal',
        persistent,
        category: compact ? 'compact' : 'normal'
      }
    );
  }, [screenSize.isMobile, showNotification]);

  return {
    screenSize,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAdaptiveNotification
  };
};

// Declaración global para TypeScript
declare global {
  interface Window {
    resizeTimeout: any;
  }
}

export default useResponsiveNotifications;
