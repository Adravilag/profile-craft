// Application constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  PROFILE: '/profile',
  EXPERIENCES: '/experiences',
  EDUCATION: '/education',
  SKILLS: '/skills',
  PROJECTS: '/projects',
  CERTIFICATIONS: '/certifications',
  TESTIMONIALS: '/testimonials',
  MEDIA: '/media',
  HEALTH: '/health',
} as const;

export const SKILL_LEVELS = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  expert: 'Experto',
} as const;

export const USER_ROLES = {
  user: 'Usuario',
  admin: 'Administrador',
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
  maxLimit: 100,
} as const;

export const CV_SECTIONS = {
  personal: 'Información Personal',
  experience: 'Experiencia',
  education: 'Educación',
  skills: 'Habilidades',
  projects: 'Proyectos',
  certifications: 'Certificaciones',
  testimonials: 'Referencias',
} as const;

export const VALIDATION_RULES = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  email: {
    maxLength: 255,
  },
  name: {
    minLength: 2,
    maxLength: 50,
  },
  description: {
    maxLength: 1000,
  },
} as const;
