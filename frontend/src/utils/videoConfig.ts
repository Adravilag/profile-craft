/**
 * Configuración para la optimización de videos en la aplicación
 */

// Opciones para la reproducción optimizada de videos
export const VIDEO_CONFIG = {
  // Calidades disponibles para optimizar según el ancho de banda
  qualities: {
    low: {
      maxWidth: 480,
      maxBitrate: 800 // kbps
    },
    medium: {
      maxWidth: 720,
      maxBitrate: 1500 // kbps
    },
    high: {
      maxWidth: 1080,
      maxBitrate: 3000 // kbps
    }
  },
  
  // Configuración de precarga
  preload: {
    default: 'metadata', // 'none', 'metadata', 'auto'
    mobileDefault: 'none',
    desktopDefault: 'metadata'
  },
  
  // Configuración de formato
  format: {
    preferred: 'mp4', // formato preferido para compatibilidad
    alternates: ['webm', 'ogv'] // formatos alternativos para mejor compresión
  },
  
  // Configuración de reproductor
  player: {
    autoPlayOnVisible: false, // No reproducir automáticamente cuando está visible
    muteByDefault: true, // Silenciar por defecto (permite autoplay en la mayoría de navegadores)
    controlsTimeout: 2000, // ms antes de ocultar controles cuando no hay interacción
    bufferingStrategy: 'aggressive', // 'conservative', 'moderate', 'aggressive'
  },
  
  // Opciones de accesibilidad
  accessibility: {
    enableKeyboardShortcuts: true,
    showCaptions: 'auto', // 'always', 'never', 'auto' (según preferencias del usuario)
  }
};

// Función para detectar si el dispositivo es de gama baja
export const isLowEndDevice = (): boolean => {
  // Detectar dispositivos de bajo rendimiento
  // (dispositivos móviles antiguos, conexiones lentas, etc.)
  const lowMemory = (navigator as any).deviceMemory < 4; // < 4GB RAM si está disponible
  const lowCores = navigator.hardwareConcurrency < 4; // < 4 núcleos
  const lowBandwidth = (navigator as any).connection?.downlink < 1; // < 1Mbps
  const batterySaving = (navigator as any).getBattery && (navigator as any).getBattery().then((b: any) => b.level < 0.2);
  
  return !!(lowMemory || lowCores || lowBandwidth || batterySaving);
};

// Función para seleccionar la calidad de video adecuada según las condiciones
export const getOptimalVideoQuality = (): 'low' | 'medium' | 'high' => {
  if (isLowEndDevice()) {
    return 'low';
  }
  
  // Verificar si la conexión es lenta
  const connection = (navigator as any).connection;
  if (connection) {
    if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
      return 'low';
    }
    
    if (connection.effectiveType === '3g') {
      return 'medium';
    }
  }
  
  // Por defecto, usar alta calidad
  return 'high';
};

// Función para obtener el preload adecuado según el dispositivo
export const getOptimalPreloadStrategy = (): string => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    return VIDEO_CONFIG.preload.mobileDefault;
  }
  
  return VIDEO_CONFIG.preload.desktopDefault;
};
