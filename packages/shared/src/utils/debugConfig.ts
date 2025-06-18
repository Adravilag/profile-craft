/**
 * Configuración centralizada de debug para el package shared
 */
import { isDevelopment } from './env';

export const DEBUG_CONFIG = {
  // Debug global - controla todos los logs
  ENABLED: isDevelopment(),
  
  // Debug específico por categorías
  API: isDevelopment() && true,
  AUTH: isDevelopment() && false,
  NAVIGATION: isDevelopment() && false,
  PERFORMANCE: isDevelopment() && false,
  IMAGES: isDevelopment() && false,
  SCROLL: isDevelopment() && false,
  BACKEND_STATUS: isDevelopment() && false,
  DATA_LOADING: isDevelopment() && false,
  ADMIN: isDevelopment() && false,
};

// Helper functions para logging condicional
export const debugLog = {
  api: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.API) {
      console.log(...args);
    }
  },
  
  auth: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.AUTH) {
      console.log(...args);
    }
  },
  
  navigation: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.NAVIGATION) {
      console.log(...args);
    }
  },
  
  performance: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.PERFORMANCE) {
      console.log(...args);
    }
  },
  
  images: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.IMAGES) {
      console.log(...args);
    }
  },
  
  scroll: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.SCROLL) {
      console.log(...args);
    }
  },
  
  backendStatus: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.BACKEND_STATUS) {
      console.log(...args);
    }
  },
    dataLoading: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.DATA_LOADING) {
      console.log(...args);
    }
  },
  
  admin: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.ADMIN) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED) {
      console.warn(...args);
    }  },
  
  // Los errores siempre se muestran (importantes para debugging en producción)
  error: (...args: any[]) => {
    console.error(...args);
  }
};
