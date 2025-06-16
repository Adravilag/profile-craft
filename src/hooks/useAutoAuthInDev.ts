// Hook temporal para auto-autenticación en desarrollo
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Bandera global para deshabilitar auto-auth (útil para testing de logout)
let AUTO_AUTH_DISABLED = false;

export const disableAutoAuth = () => {
  AUTO_AUTH_DISABLED = true;
  console.log('🚫 Auto-autenticación deshabilitada');
};

export const enableAutoAuth = () => {
  AUTO_AUTH_DISABLED = false;
  console.log('✅ Auto-autenticación habilitada');
};

// Exponer funciones globalmente en desarrollo
if (process.env.NODE_ENV === 'development') {
  (window as any).disableAutoAuth = disableAutoAuth;
  (window as any).enableAutoAuth = enableAutoAuth;
}

export const useAutoAuthInDev = () => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Solo en desarrollo y si no está autenticado y si no está deshabilitado
    if (process.env.NODE_ENV === 'development' && !loading && !isAuthenticated && !AUTO_AUTH_DISABLED) {
      console.log('🔧 Dev Mode: Intentando auto-autenticación...');
      
      // Verificar si ya existe un token
      const existingToken = localStorage.getItem('portfolio_auth_token');
      
      if (!existingToken) {        // Intentar obtener un token de desarrollo
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
        console.log('🔑 Token ya existe en localStorage');
      }
    } else if (AUTO_AUTH_DISABLED && !isAuthenticated) {
      console.log('🚫 Auto-auth deshabilitado, no intentando auto-autenticación');
    }
  }, [isAuthenticated, loading]);

  return { isAuthenticated, loading };
};

export default useAutoAuthInDev;
