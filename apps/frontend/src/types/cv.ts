// Types for CV data structures

export interface Skill {
  id?: string;
  name: string;
  category: string;
  level?: string;
  proficiency?: number;
  description?: string;
  tags?: string[];
  yearsOfExperience?: number;
  lastUsed?: Date | string;
  certifications?: string[];
  projects?: string[];
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  technologies?: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: 'completed' | 'in-progress' | 'planned';
  category?: string;
  highlights?: string[];
  challenges?: string[];
  learnings?: string[];
  teamSize?: number;
  role?: string;
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  field?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  gpa?: number;
  description?: string;
  achievements?: string[];
  coursework?: string[];
  thesis?: string;
  location?: string;
  honors?: string[];
}

export interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: Date | string;
  endDate?: Date | string;
  current?: boolean;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'volunteer';
  industry?: string;
  teamSize?: number;
  reportingTo?: string;
  keyProjects?: string[];
}

export interface PersonalInfo {
  id?: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  bio?: string;
  avatar?: string;
  summary?: string;
  specializations?: string[];
  languages?: Array<{
    name: string;
    proficiency: string;
  }>;
  interests?: string[];
  availability?: string;
  preferredWorkStyle?: string[];
  careerGoals?: string[];
}

export interface ContactInfo {
  id?: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  socialMedia?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
    blog?: string;
  };
  preferredContactMethod?: 'email' | 'phone' | 'linkedin';
  timezone?: string;
  availability?: {
    hours?: string;
    days?: string[];
    schedule?: string;
  };
}

export interface Certification {
  id?: string;
  name: string;
  issuer: string;
  issueDate: Date | string;
  expiryDate?: Date | string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  skills?: string[];
}

export interface Testimonial {
  id?: string;
  name: string;
  position?: string;
  company?: string;
  content: string;
  rating?: number;
  date?: Date | string;
  relationship?: string;
  avatar?: string;
  linkedinUrl?: string;
}

// Terminal-specific types
export interface TerminalData {
  skills: Skill[];
  projects: Project[];
  education: Education[];
  experience: Experience[];
  personalInfo: PersonalInfo | null;
  contactInfo: ContactInfo | null;
  certifications?: Certification[];
  testimonials?: Testimonial[];
  loading: boolean;
  error: string | null;
}

export interface CommandResult {
  output: string[];
  clearScreen?: boolean;
  specialEffect?: 'normal' | 'hack' | 'glitch' | 'undertale';
  playSound?: string;
  changeTheme?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CVSummary {
  totalSkills: number;
  totalProjects: number;
  totalExperience: number; // in years
  totalEducation: number;
  lastUpdated: Date | string;
  completionPercentage: number;
}

// Filter and search types
export interface SkillFilter {
  category?: string;
  level?: string;
  minProficiency?: number;
  tags?: string[];
  recentlyUsed?: boolean;
}

export interface ProjectFilter {
  status?: string;
  category?: string;
  technologies?: string[];
  dateRange?: {
    start: Date | string;
    end: Date | string;
  };
}

export interface ExperienceFilter {
  type?: string;
  industry?: string;
  current?: boolean;
  dateRange?: {
    start: Date | string;
    end: Date | string;
  };
}

export interface SearchQuery {
  term: string;
  filters?: {
    skills?: SkillFilter;
    projects?: ProjectFilter;
    experience?: ExperienceFilter;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
