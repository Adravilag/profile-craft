// Configuración de constantes para el frontend
export const API_CONFIG = {
  // ID de usuario por defecto para desarrollo y producción
  DEFAULT_USER_ID: import.meta.env.VITE_DEFAULT_USER_ID || '1',
  
  // URL base de la API
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Si estamos usando MongoDB (producción) o SQLite (desarrollo)
  IS_MONGODB: import.meta.env.VITE_API_URL?.includes('onrender.com') || false
};

// ID de usuario por defecto para MongoDB en producción
// Este es el ObjectId real del usuario admin que existe en la base de datos
export const PRODUCTION_USER_ID = import.meta.env.VITE_PRODUCTION_USER_ID;

// Función para obtener el ID de usuario correcto según el entorno
export const getUserId = (): string => {
  // Si estamos apuntando a producción (Render), usar ObjectId de MongoDB
  if (API_CONFIG.IS_MONGODB) {
    return PRODUCTION_USER_ID;
  }
  
  // Si estamos en desarrollo local, usar ID numérico para SQLite
  return API_CONFIG.DEFAULT_USER_ID;
};

console.log('🔧 Configuración de API cargada:', {
  baseUrl: API_CONFIG.BASE_URL,
  isMongoDB: API_CONFIG.IS_MONGODB,
  userId: getUserId()
});
