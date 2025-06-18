// Hook temporal para auto-autenticación en desarrollo
import { useEffect } from 'react';
import { useAuth } from '@cv-maker/shared';
import { debugLog } from '../utils/debugConfig';

// Bandera global para deshabilitar auto-auth (útil para testing de logout)
let AUTO_AUTH_DISABLED = false;
let MANUAL_LOGOUT_FLAG = false;

// Verificar si auto-auth está deshabilitado en localStorage
const checkStoredDisableFlag = () => {
  const storedFlag = localStorage.getItem('auto_auth_disabled');
  const storedLogoutFlag = localStorage.getItem('manual_logout_flag');
  
  if (storedFlag === 'true') {
    AUTO_AUTH_DISABLED = true;
  }
  if (storedLogoutFlag === 'true') {
    MANUAL_LOGOUT_FLAG = true;
  }
};

// Inicializar flags desde localStorage
checkStoredDisableFlag();

export const disableAutoAuth = () => {
  AUTO_AUTH_DISABLED = true;
  MANUAL_LOGOUT_FLAG = true; // Marcar que se hizo logout manual
  
  // Persistir en localStorage
  localStorage.setItem('auto_auth_disabled', 'true');
  localStorage.setItem('manual_logout_flag', 'true');
  
  debugLog.auth('🚫 Auto-autenticación deshabilitada permanentemente (logout manual)');
};

export const softLogout = () => {
  // Limpiar tokens pero no establecer flags permanentes
  localStorage.removeItem('portfolio_auth_token');
  sessionStorage.removeItem('portfolio_auth_token');
  sessionStorage.removeItem('user_session');
  
  // Limpiar cookies
  document.cookie = 'portfolio_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'auth_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  
  // Solo deshabilitar auto-auth temporalmente
  AUTO_AUTH_DISABLED = true;
  MANUAL_LOGOUT_FLAG = true;
  
  // Pero permitir que se borre automáticamente al hacer login manual
  debugLog.auth('🔄 Soft logout ejecutado - permite login manual posterior');
};

export const enableAutoAuth = () => {
  AUTO_AUTH_DISABLED = false;
  MANUAL_LOGOUT_FLAG = false; // Limpiar flag de logout manual
  
  // Limpiar localStorage
  localStorage.removeItem('auto_auth_disabled');
  localStorage.removeItem('manual_logout_flag');
  
  debugLog.auth('✅ Auto-autenticación habilitada');
};

export const clearManualLogoutFlag = () => {
  MANUAL_LOGOUT_FLAG = false;
  localStorage.removeItem('manual_logout_flag');
  debugLog.auth('🧹 Flag de logout manual limpiado');
};

// Función de logout de emergencia
export const emergencyLogout = () => {
  debugLog.auth('🚨 Ejecutando logout de emergencia...');
  
  // Limpiar todos los tokens
  localStorage.removeItem('portfolio_auth_token');
  sessionStorage.removeItem('portfolio_auth_token');
  sessionStorage.removeItem('user_session');
  
  // Limpiar cookies
  document.cookie = 'portfolio_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'auth_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  
  // Deshabilitar auto-auth
  AUTO_AUTH_DISABLED = true;
  MANUAL_LOGOUT_FLAG = true;
  
  debugLog.auth('✅ Logout de emergencia completado, recargando página...');
  
  // Forzar recarga
  setTimeout(() => {
    window.location.reload();
  }, 100);
};

// Eliminada la exposición de funciones de autenticación en window por seguridad

export const useAutoAuthInDev = () => {
  const { isAuthenticated, loading, user } = useAuth();
  // Auto-autenticación automática eliminada por seguridad
  // Solo retorna el estado de autenticación
  return { isAuthenticated, loading };
};

export default useAutoAuthInDev;
