// Hook temporal para auto-autenticación en desarrollo
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
  
  console.log('🚫 Auto-autenticación deshabilitada permanentemente (logout manual)');
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
  console.log('🔄 Soft logout ejecutado - permite login manual posterior');
};

export const enableAutoAuth = () => {
  AUTO_AUTH_DISABLED = false;
  MANUAL_LOGOUT_FLAG = false; // Limpiar flag de logout manual
  
  // Limpiar localStorage
  localStorage.removeItem('auto_auth_disabled');
  localStorage.removeItem('manual_logout_flag');
  
  console.log('✅ Auto-autenticación habilitada');
};

export const clearManualLogoutFlag = () => {
  MANUAL_LOGOUT_FLAG = false;
  localStorage.removeItem('manual_logout_flag');
  console.log('🧹 Flag de logout manual limpiado');
};

// Función de logout de emergencia
export const emergencyLogout = () => {
  console.log('🚨 Ejecutando logout de emergencia...');
  
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
  
  console.log('✅ Logout de emergencia completado, recargando página...');
  
  // Forzar recarga
  setTimeout(() => {
    window.location.reload();
  }, 100);
};

// Exponer funciones globalmente en desarrollo
if (process.env.NODE_ENV === 'development') {
  (window as any).disableAutoAuth = disableAutoAuth;
  (window as any).softLogout = softLogout;
  (window as any).enableAutoAuth = enableAutoAuth;
  (window as any).clearManualLogoutFlag = clearManualLogoutFlag;
  (window as any).emergencyLogout = emergencyLogout; // Función de logout de emergencia
  
  console.log('🔧 Funciones de debug disponibles:', [
    'disableAutoAuth()', 
    'softLogout()',
    'enableAutoAuth()', 
    'clearManualLogoutFlag()', 
    'emergencyLogout()'
  ]);
}

export const useAutoAuthInDev = () => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Verificar flags almacenados al inicio
    checkStoredDisableFlag();
    
    // Verificar si hay token en localStorage
    const hasToken = !!localStorage.getItem('portfolio_auth_token');
    
    console.log('🔧 useAutoAuthInDev - Estado completo:', {
      NODE_ENV: process.env.NODE_ENV,
      loading,
      isAuthenticated,
      hasToken,
      AUTO_AUTH_DISABLED,
      MANUAL_LOGOUT_FLAG,
      storedDisableFlag: localStorage.getItem('auto_auth_disabled'),
      storedLogoutFlag: localStorage.getItem('manual_logout_flag')
    });
    
    // Si hay flag de logout manual Y usuario no está autenticado, limpiar tokens residuales
    // PERO si el usuario está autenticado, respetar su sesión manual
    if (MANUAL_LOGOUT_FLAG && !isAuthenticated) {
      console.log('🛑 Logout manual detectado y usuario no autenticado, evitando auto-autenticación');
      
      if (hasToken) {
        console.log('🧹 Limpiando token residual después de logout manual...');
        localStorage.removeItem('portfolio_auth_token');
        sessionStorage.removeItem('portfolio_auth_token');
      }
      return;
    }
    
    // Si el usuario está autenticado manualmente tras un logout, limpiar el flag
    if (MANUAL_LOGOUT_FLAG && isAuthenticated && hasToken) {
      console.log('✅ Usuario se autenticó manualmente tras logout, limpiando flag de logout manual');
      MANUAL_LOGOUT_FLAG = false;
      localStorage.removeItem('manual_logout_flag');
    }
    
    // Si auto-auth está deshabilitado pero hay una sesión manual válida, permitirla
    if (AUTO_AUTH_DISABLED && !isAuthenticated) {
      console.log('🚫 Auto-auth deshabilitado y no hay sesión manual, no intentando auto-autenticación');
      return;
    }
    
    // Solo en desarrollo y si no está autenticado (y no hay flag de logout manual)
    if (process.env.NODE_ENV === 'development' && !loading && !isAuthenticated && !MANUAL_LOGOUT_FLAG) {
      console.log('🔧 Dev Mode: Intentando auto-autenticación...');
      
      // Si no hay token, intentar obtener uno
      if (!hasToken) {
        console.log('🔧 No hay token, obteniendo token de desarrollo...');
        
        // Intentar obtener un token de desarrollo
        fetch('http://localhost:3000/api/auth/dev-token')
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('No se pudo obtener token de desarrollo');
          })
          .then(data => {
            console.log('✅ Token de desarrollo obtenido:', data.user.name);
            localStorage.setItem('portfolio_auth_token', data.token);
            
            // Recargar la página para que el contexto de auth se actualice
            window.location.reload();
          })
          .catch(error => {
            console.warn('⚠️ No se pudo obtener token de desarrollo:', error.message);
          });
      } else {
        console.log('🔑 Token ya existe en localStorage, pero usuario no autenticado');
        // Si hay token pero no está autenticado, forzar verificación
        setTimeout(() => {
          if (!isAuthenticated && !MANUAL_LOGOUT_FLAG && !AUTO_AUTH_DISABLED) {
            console.log('🔄 Forzando recarga para verificar token existente...');
            window.location.reload();
          }
        }, 1000);
      }
    }
  }, [isAuthenticated, loading]);

  return { isAuthenticated, loading };
};

export default useAutoAuthInDev;
