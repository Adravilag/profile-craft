// types/skills.ts

// Extensión para CSS custom properties
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

export type SortOption = 'alphabetical' | 'alphabetical_desc' | 'difficulty' | 'difficulty_desc' | 'level' | 'level_desc';

export interface SkillIconData {
  name: string;
  svg_path: string;
  type?: string;
  category?: string;
  color?: string;
  docs_url?: string;
  official_repo?: string;
  difficulty_level?: string;
}

export interface ExternalSkillData {
  popularity?: string;
  difficulty?: string;
  description?: string;
  links?: Array<{
    title: string;
    url: string;
    type?: string;
  }>;
  first_appeared?: string;
  paradigm?: string;
  license?: string;
  last_updated?: string;
}

export interface SkillFormData {
  name: string;
  category: string;
  icon_class: string;
  level: number;
  demo_url?: string;
}

export interface SkillCardProps {
  skill: any; // Usar el tipo Skill de api.ts
  skillsIcons: SkillIconData[];
  onEdit: (skill: any) => void;
  onDelete: (id: number) => void;
  onPreview: (skill: any) => void;
  onDragStart: (id: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (id: number) => void;
  isDragging: boolean;
  isAdmin?: boolean;
}

export interface CategoryFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  skillsGrouped: Record<string, any[]>;
}

export interface SkillsGridProps {
  filteredGrouped: Record<string, any[]>;
  skillsIcons: SkillIconData[];
  draggedSkillId: number | null;
  onEdit: (skill: any) => void;
  onDelete: (id: number) => void;
  onPreview: (skill: any) => void;
  onDragStart: (id: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (id: number) => void;
  selectedSort?: Record<string, SortOption>; // Ordenamiento por categoría
  sortingClass?: string;
  onSortToggle?: (category: string, sortType?: SortOption) => void;
  isAdmin?: boolean;
}

export interface SkillModalProps {
  isOpen: boolean;
  editingId: number | null;
  formData: SkillFormData;
  skillNames: string[];
  skillsIcons: SkillIconData[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export interface SkillPreviewModalProps {
  isOpen: boolean;
  skill: any | null;
  skillsIcons: SkillIconData[];
  externalData: Record<string, ExternalSkillData>;
  loadingExternalData: Record<string, boolean>;
  onClose: () => void;
}
