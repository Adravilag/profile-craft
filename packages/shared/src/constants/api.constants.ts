// API-related constants

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  USER: {
    PROFILE: '/user/profile',
    AVATAR: '/user/avatar',
  },
  CV: {
    BASE: '/cv',
    PERSONAL: '/cv/personal',
    EXPERIENCES: '/cv/experiences',
    EDUCATION: '/cv/education',
    SKILLS: '/cv/skills',
    PROJECTS: '/cv/projects',
    CERTIFICATIONS: '/cv/certifications',
    TESTIMONIALS: '/cv/testimonials',
  },
  MEDIA: {
    UPLOAD: '/media/upload',
    DELETE: '/media/delete',
  },
  ADMIN: {
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics',
  },
  HEALTH: '/health',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const API_ERRORS = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
