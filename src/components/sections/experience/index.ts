// Exportaciones del módulo Experience
export { default as ExperienceSection } from './ExperienceSection.fixed';
export { default as ExperienceCard } from './ExperienceCard';
export { default as EducationCard } from './EducationCard';
export { default as ChronologicalItem } from './ChronologicalItem';

// Importar tipos de la API
import type { Experience as ApiExperience, Education as ApiEducation } from '../../../services/api';
export type { ApiExperience as Experience, ApiEducation as Education };

// Interfaces locales - Las extendemos para mantener compatibilidad
export interface EducationLocal extends Partial<ApiEducation> {
  id?: number;  // Propiedad para compatibilidad con código anterior
  _id: string;
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
}

export interface CombinedItem {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  description?: string;
  type: "experience" | "education";
  company?: string;
  institution?: string;
  technologies?: string[];
  grade?: string;
}
