import { useState, useEffect, useCallback } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';
import { useNotificationContext } from '../contexts/NotificationContext';

// Interfaces para el estado y las opciones del header
interface HeaderState {
  isScrolled: boolean;
  isCompact: boolean;
  isVisible: boolean;
  scrollProgress: number;
}

interface HeaderOptions {
  profileName?: string;
  darkMode: boolean;
  onToggleDarkMode?: () => void;
  exportToPDF?: (containerId: string, filename: string) => Promise<boolean>;
}

interface HeaderActions {
  handleShare: () => Promise<void>;
  handleDownloadPDF: () => Promise<void>;
  handleToggleTheme: () => void;
}

/**
 * Hook personalizado para manejar la lógica del header
 * @param options Opciones de configuración del header
 */
export const useHeader = (options: HeaderOptions) => {
  const { profileName, darkMode, onToggleDarkMode, exportToPDF } = options;
  const { showSuccess, showError } = useNotificationContext();
  
  // Estado del header con valores iniciales
  const [state, setState] = useState<HeaderState>({
    isScrolled: false,
    isCompact: false,
    isVisible: true,
    scrollProgress: 0
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

    setState(prev => ({
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
  const handleShare = useCallback(async () => {
    const shareData = {
      title: `CV de ${profileName || 'Desarrollador'}`,
      text: `Descubre el perfil profesional de ${profileName || 'este desarrollador'}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        showSuccess("Compartido", "El enlace se ha compartido correctamente");
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          await fallbackShare();
        }
      }
    } else {
      await fallbackShare();
    }
  }, [profileName, showSuccess]);

  // Función de respaldo para compartir
  const fallbackShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccess("Enlace copiado", "El enlace se ha copiado al portapapeles");
    } catch {
      showError("Error", "No se pudo copiar el enlace");
    }
  };

  // Callback optimizado para descarga de PDF
  const handleDownloadPDF = useCallback(async () => {
    if (!exportToPDF) {
      showError("Error", "Función de exportación no disponible");
      return;
    }

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

  const actions: HeaderActions = {
    handleShare,
    handleDownloadPDF,
    handleToggleTheme
  };

  return {
    state,
    actions,
    elementRef
  };
};