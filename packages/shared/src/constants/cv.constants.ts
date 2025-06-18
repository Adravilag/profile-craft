// CV-specific constants

export const CV_SECTIONS = {
  PERSONAL: 'personal',
  EXPERIENCE: 'experience',
  EDUCATION: 'education',
  SKILLS: 'skills',
  PROJECTS: 'projects',
  CERTIFICATIONS: 'certifications',
  TESTIMONIALS: 'testimonials',
} as const;

export const CV_SECTION_LABELS = {
  [CV_SECTIONS.PERSONAL]: 'Información Personal',
  [CV_SECTIONS.EXPERIENCE]: 'Experiencia',
  [CV_SECTIONS.EDUCATION]: 'Educación',
  [CV_SECTIONS.SKILLS]: 'Habilidades',
  [CV_SECTIONS.PROJECTS]: 'Proyectos',
  [CV_SECTIONS.CERTIFICATIONS]: 'Certificaciones',
  [CV_SECTIONS.TESTIMONIALS]: 'Referencias',
} as const;

export const SKILL_CATEGORIES = {
  TECHNICAL: 'technical',
  SOFT: 'soft',
  LANGUAGE: 'language',
  TOOL: 'tool',
  FRAMEWORK: 'framework',
} as const;

export const SKILL_CATEGORY_LABELS = {
  [SKILL_CATEGORIES.TECHNICAL]: 'Habilidades Técnicas',
  [SKILL_CATEGORIES.SOFT]: 'Habilidades Blandas',
  [SKILL_CATEGORIES.LANGUAGE]: 'Idiomas',
  [SKILL_CATEGORIES.TOOL]: 'Herramientas',
  [SKILL_CATEGORIES.FRAMEWORK]: 'Frameworks',
} as const;

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
} as const;

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.ACTIVE]: 'Activo',
  [PROJECT_STATUS.COMPLETED]: 'Completado',
  [PROJECT_STATUS.ON_HOLD]: 'En Pausa',
  [PROJECT_STATUS.CANCELLED]: 'Cancelado',
} as const;
