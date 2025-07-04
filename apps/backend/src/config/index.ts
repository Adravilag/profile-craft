export const config = {
  // JWT Secret (IMPORTANTE: usar variable de entorno en producción)
  JWT_SECRET: process.env.JWT_SECRET || "profilecraft-secret-key-change-in-production",
  
  // Puerto del servidor
  PORT: parseInt(process.env.PORT || "3000"),
  
  // Base de datos
  DATABASE_PATH: process.env.DATABASE_PATH || "./data/profilecraft-database.db",
  
  // Configuración de archivos
  FILE_UPLOAD: {
    MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB por defecto
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads'
  },
  
  // Límites de la API
  API_LIMITS: {
    JSON_LIMIT: '50mb',
    URL_ENCODED_LIMIT: '50mb'
  },
  
  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3000",  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "https://adravilag.github.io",
    "https://adravilag.github.io/profile-craft",
    "https://adravilag.github.io/ProfileCraft"
  ],
  
  // Configuración de desarrollo
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production'
};
