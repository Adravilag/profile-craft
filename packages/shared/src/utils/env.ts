/**
 * Utilidad para acceder a variables de entorno de forma universal
 * Funciona tanto en frontend (Vite con import.meta.env) como en backend (Node.js con process.env)
 */

/**
 * Obtiene una variable de entorno de forma segura
 * @param key - Clave de la variable de entorno
 * @param defaultValue - Valor por defecto si no existe
 * @returns El valor de la variable o el valor por defecto
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  // En el frontend (Vite)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key] || defaultValue;
  }
  
  // En el backend (Node.js)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  return defaultValue;
}

/**
 * Verifica si estamos en modo desarrollo
 * @returns true si estamos en desarrollo
 */
export function isDevelopment(): boolean {
  return getEnvVar('NODE_ENV', 'development') !== 'production';
}

/**
 * Verifica si estamos en modo producción
 * @returns true si estamos en producción
 */
export function isProduction(): boolean {
  return getEnvVar('NODE_ENV', 'development') === 'production';
}
