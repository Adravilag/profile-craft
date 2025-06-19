// Application-wide constants

export const APP_CONFIG = {
  NAME: 'CV Maker',
  VERSION: '1.0.0',
  DESCRIPTION: 'Generador de CVs profesionales',
  AUTHOR: 'Adrian Davila Guerra',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'] as const,
} as const;

export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },
  EMAIL: {
    MAX_LENGTH: 255,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  DESCRIPTION: {
    MAX_LENGTH: 1000,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },
} as const;

export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const;

export const SKILL_LEVEL_LABELS = {
  [SKILL_LEVELS.BEGINNER]: 'Principiante',
  [SKILL_LEVELS.INTERMEDIATE]: 'Intermedio',
  [SKILL_LEVELS.ADVANCED]: 'Avanzado',
  [SKILL_LEVELS.EXPERT]: 'Experto',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.USER]: 'Usuario',
  [USER_ROLES.ADMIN]: 'Administrador',
} as const;
