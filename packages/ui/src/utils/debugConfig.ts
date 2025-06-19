/**
 * Configuración centralizada de debug para el package shared
 */

export const DEBUG_CONFIG = {
  // Debug global - controla todos los logs
  ENABLED: process.env.NODE_ENV !== 'production',
  
  // Debug específico por categorías
  API: process.env.NODE_ENV !== 'production' && true,
  AUTH: process.env.NODE_ENV !== 'production' && false,
  NAVIGATION: process.env.NODE_ENV !== 'production' && false,
  PERFORMANCE: process.env.NODE_ENV !== 'production' && false,
  IMAGES: process.env.NODE_ENV !== 'production' && false,
  SCROLL: process.env.NODE_ENV !== 'production' && false,
  BACKEND_STATUS: process.env.NODE_ENV !== 'production' && false,
  DATA_LOADING: process.env.NODE_ENV !== 'production' && false,
  ADMIN: process.env.NODE_ENV !== 'production' && false,
};

// Helper functions para logging condicional
export const debugLog = {
  api: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.API) {
      // Solo log en desarrollo
      if (process.env.NODE_ENV !== 'production') console.log(...args);
    }
  },
  
  auth: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.AUTH) {
      if (process.env.NODE_ENV !== 'production') console.log(...args);
    }
  },
  
  navigation: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.NAVIGATION) {
      if (process.env.NODE_ENV !== 'production') console.log(...args);
    }
  },
  
  performance: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.PERFORMANCE) {
      if (process.env.NODE_ENV !== 'production') console.log(...args);
    }
  },
  
  images: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.IMAGES) {
      if (process.env.NODE_ENV !== 'production') console.log(...args);
    }
  },
  
  scroll: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.SCROLL) {
      if (process.env.NODE_ENV !== 'production') console.log(...args);
    }
  },
  
  backendStatus: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.BACKEND_STATUS) {
      if (process.env.NODE_ENV !== 'production') console.log(...args);
    }
  },
    dataLoading: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.DATA_LOADING) {
      if (process.env.NODE_ENV !== 'production') console.log(...args);
    }
  },
  
  admin: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.ADMIN) {
      if (process.env.NODE_ENV !== 'production') console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && process.env.NODE_ENV !== 'production') {
      console.warn(...args);
    }
  },
  
  // Los errores siempre se muestran (importantes para debugging en producción)
  error: (...args: any[]) => {
    console.error(...args);
  }
};
