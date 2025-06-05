import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';
import { useNotificationContext } from '../contexts/NotificationContext';

// Interfaces para el estado y las opciones del header
interface HeaderState {
  isScrolled: boolean;
  isCompact: boolean;
  isVisible: boolean;
  scrollProgress: number;
  shareMenuOpen: boolean;
  isLoading: boolean;
}

interface ShareOption {
  name: string;
  icon: string;
  action: () => void;
  color: string;
}

interface HeaderOptions {
  profileName?: string;
  darkMode: boolean;
  onToggleDarkMode?: () => void;
  exportToPDF?: (containerId: string, filename: string) => Promise<boolean>;
}

interface HeaderActions {
  handleShare: () => void;
  handleDownloadPDF: () => Promise<void>;
  handleToggleTheme: () => void;
  toggleShareMenu: () => void;
  closeShareMenu: () => void;
  getShareOptions: () => ShareOption[];
  handleNativeShare: () => Promise<void>;
}

/**
 * Hook personalizado para manejar la lógica del header
 * @param options Opciones de configuración del header
 */
export const useHeader = (options: HeaderOptions) => {
  const { profileName, darkMode, onToggleDarkMode, exportToPDF } = options;
  const { showSuccess, showError } = useNotificationContext();
  const shareMenuRef = useRef(null as any);
  
  // Estado del header con valores iniciales
  const [state, setState] = useState({
    isScrolled: false,
    isCompact: false,
    isVisible: true,
    scrollProgress: 0,
    shareMenuOpen: false,
    isLoading: false
  });

  // Detectar visibilidad del elemento usando IntersectionObserver
  const { isIntersecting, elementRef } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Callback optimizado para manejar scroll con métricas de rendimiento
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollProgress = Math.min(scrollY / (documentHeight - windowHeight), 1);

    setState((prev: any) => ({
      ...prev,
      isScrolled: scrollY > 50,
      isCompact: scrollY > 200,
      isVisible: scrollY < window.innerHeight || isIntersecting,
      scrollProgress: scrollProgress * 100
    }));
  }, [isIntersecting]);

  // Efecto para manejar el scroll
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Ejecutar una vez al montar
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  // Callback optimizado para compartir CV
  const handleShare = useCallback(() => {
    setState((prev: any) => ({ ...prev, shareMenuOpen: !prev.shareMenuOpen }));
  }, []);

  // Toggle del menú de compartir
  const toggleShareMenu = useCallback(() => {
    setState((prev: any) => ({ ...prev, shareMenuOpen: !prev.shareMenuOpen }));
  }, []);

  // Cerrar menú de compartir
  const closeShareMenu = useCallback(() => {
    setState((prev: any) => ({ ...prev, shareMenuOpen: false }));
  }, []);

  // Compartir nativo usando PWA Share API
  const handleNativeShare = useCallback(async () => {
    const shareData = {
      title: `CV de ${profileName || 'Desarrollador'}`,
      text: `Descubre el perfil profesional de ${profileName || 'este desarrollador'}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        closeShareMenu();
        showSuccess("Compartido", "El enlace se ha compartido correctamente");
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          // Si el usuario cancela, no mostramos error
          console.log('Compartir cancelado por el usuario');
        }
      }
    } else {
      // Fallback: abrir menú de opciones de compartir
      toggleShareMenu();
    }
  }, [profileName, closeShareMenu, toggleShareMenu, showSuccess]);

  // Opciones de compartir
  const getShareOptions = useCallback((): ShareOption[] => {
    const currentUrl = window.location.href;
    const title = `CV de ${profileName || 'Desarrollador'}`;

    return [
      {
        name: 'LinkedIn',
        icon: 'fa-brands fa-linkedin',
        color: '#0077B5',
        action: () => {
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank');
          closeShareMenu();
          showSuccess("Compartido", "Enlace compartido en LinkedIn");
        }
      },
      {
        name: 'Twitter',
        icon: 'fa-brands fa-twitter',
        color: '#1DA1F2',
        action: () => {
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`, '_blank');
          closeShareMenu();
          showSuccess("Compartido", "Enlace compartido en Twitter");
        }
      },
      {
        name: 'WhatsApp',
        icon: 'fa-brands fa-whatsapp',
        color: '#25D366',
        action: () => {
          window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${currentUrl}`)}`, '_blank');
          closeShareMenu();
          showSuccess("Compartido", "Enlace compartido en WhatsApp");
        }
      },
      {
        name: 'Copiar enlace',
        icon: 'fas fa-copy',
        color: '#6C757D',
        action: async () => {
          try {
            await navigator.clipboard.writeText(currentUrl);
            closeShareMenu();
            showSuccess("Enlace copiado", "El enlace se ha copiado al portapapeles");
          } catch {
            showError("Error", "No se pudo copiar el enlace");
          }
        }
      }
    ];  }, [profileName, closeShareMenu, showSuccess, showError]);

  // Callback optimizado para descarga de PDF
  const handleDownloadPDF = useCallback(async () => {
    if (!exportToPDF) {
      showError("Error", "Función de exportación no disponible");
      return;
    }

    setState((prev: any) => ({ ...prev, isLoading: true }));

    try {
      const success = await exportToPDF(
        "curriculum-container",
        `${profileName?.replace(/\s+/g, '-').toLowerCase() || 'cv'}-portfolio`
      );
      
      if (success) {
        showSuccess("PDF Generado", "Tu portfolio se ha descargado correctamente");
      } else {
        showError("Error al generar PDF", "Hubo un problema al crear el archivo.");
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      showError("Error inesperado", "Ocurrió un error al procesar tu solicitud");
    } finally {
      setState((prev: any) => ({ ...prev, isLoading: false }));
    }
  }, [exportToPDF, profileName, showSuccess, showError]);

  // Callback optimizado para toggle de tema
  const handleToggleTheme = useCallback(() => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
      showSuccess(
        darkMode ? "Tema claro activado" : "Tema oscuro activado",
        "El tema se ha cambiado correctamente"
      );
    }
  }, [onToggleDarkMode, darkMode, showSuccess]);

  // Efecto para cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        closeShareMenu();
      }
    };

    if (state.shareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [state.shareMenuOpen, closeShareMenu]);

  // Efecto para cerrar el menú con la tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.shareMenuOpen) {
        closeShareMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [state.shareMenuOpen, closeShareMenu]);

  // Optimización de rendimiento: memoizar las acciones
  const actions = useMemo((): HeaderActions => ({
    handleShare,
    handleDownloadPDF,
    handleToggleTheme,
    toggleShareMenu,
    closeShareMenu,
    getShareOptions,
    handleNativeShare
  }), [handleShare, handleDownloadPDF, handleToggleTheme, toggleShareMenu, closeShareMenu, getShareOptions, handleNativeShare]);

  return {
    state,
    actions,
    elementRef,
    shareMenuRef
  };
};