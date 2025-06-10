// Exportaciones del módulo Experience
export { default as ExperienceSection } from './ExperienceSection';
export { default as ExperienceCard } from './ExperienceCard';
export { default as EducationCard } from './EducationCard';
export { default as ChronologicalItem } from './ChronologicalItem';

// Types
export type { Experience } from '../../../services/api';

// Interfaces locales
export interface Education {
  id: number;
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
