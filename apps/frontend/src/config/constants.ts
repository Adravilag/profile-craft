// Configuración de constantes para el frontend
export const API_CONFIG = {
  // ID de usuario por defecto para SQLite (desarrollo legacy)
  DEFAULT_USER_ID: import.meta.env.VITE_DEFAULT_USER_ID || '1',
  
  // URL base de la API
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Si estamos usando MongoDB (ahora por defecto tanto local como producción)
  IS_MONGODB: import.meta.env.VITE_USE_SQLITE !== 'true'
};

// Cache para el ID del primer usuario admin
let cachedAdminUserId: string | null = null;

// Función para obtener el primer usuario admin dinámicamente
export const getFirstAdminUserId = async (): Promise<string> => {  // Si ya tenemos el ID en cache, devolverlo
  if (cachedAdminUserId !== null) {
    return cachedAdminUserId!; // Sabemos que no es null por la verificación anterior
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/first-admin-user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
      if (data.success && data.user && data.user.id) {
      cachedAdminUserId = data.user.id;
      return cachedAdminUserId!; // Sabemos que no es null aquí
    } else {
      throw new Error('No admin user found');
    }  } catch (error) {
    console.error('❌ Error obteniendo primer usuario admin:', error);
    // Para MongoDB, lanzar el error en lugar de devolver un ID inválido
    if (API_CONFIG.IS_MONGODB) {
      throw new Error('No se pudo obtener el ID del usuario administrador');
    }
    // Fallback solo para SQLite
    return API_CONFIG.DEFAULT_USER_ID;
  }
};

// Función para obtener el ID de usuario correcto según el entorno
export const getUserId = (): string => {
  // Para SQLite usar ID por defecto
  if (!API_CONFIG.IS_MONGODB) {
    return API_CONFIG.DEFAULT_USER_ID;
  }
  
  // Para MongoDB, necesitamos obtener el ID dinámicamente
  // Esta función devuelve un placeholder que será resuelto por getFirstAdminUserId()
  return 'dynamic-admin-id';
};

// Solo mostrar logs en desarrollo si están explícitamente habilitados
// Para activar estos logs: debugConfig.enable('API') en la consola del navegador
if (false) { // Deshabilitado por defecto
  console.log('🔧 Configuración de API cargada:', {
    baseUrl: API_CONFIG.BASE_URL,
    isMongoDB: API_CONFIG.IS_MONGODB,
    userId: getUserId()
  });
}
