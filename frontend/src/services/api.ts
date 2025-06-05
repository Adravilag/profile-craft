import axios from "axios";
import type { ProjectState } from "../constants/projectStates";

// If using Vite, use import.meta.env; if using Create React App, ensure @types/node is installed and add a declaration for process.env if needed.
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000/api";
console.log('🔧 API Base URL configurada:', API_BASE_URL);

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar el token de autorización automáticamente
API.interceptors.request.use(
  (config: any) => {
    console.log('📡 Haciendo petición a:', (config.baseURL || '') + (config.url || ''));
    const token = localStorage.getItem('portfolio_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para log de respuestas
API.interceptors.response.use(
  (response: any) => {
    console.log('✅ Respuesta exitosa de:', response.config.url || 'unknown', response.data);
    return response;
  },
  (error: any) => {
    console.error('❌ Error en respuesta de:', error.config?.url || 'unknown', error);
    return Promise.reject(error);
  }
);

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  about_me?: string;
  status?: string;
  role_title?: string;
  role_subtitle?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  profile_image?: string;
}

export interface Experience {
  id: number;
  user_id: number;
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
  order_index: number;
  technologies: string[];
}
export interface Project {
  id: number;
  user_id: number;
  title: string;
  description: string;
  image_url?: string;
  github_url?: string;
  live_url?: string;
  article_url?: string;
  article_content?: string;
  video_demo_url?: string;
  status: ProjectState;
  order_index: number;
  technologies: string[];
}
// etc.

export const getUserProfile = () =>
  API.get(`/profile/1`).then((r: any) => r.data as UserProfile);

export const getExperiences = () =>
  API.get(`/experiences?userId=1`).then((r: any) => r.data as Experience[]);

export const createExperience = (experience: Omit<Experience, "id">) =>
  API.post(`/admin/experiences`, experience).then((r: any) => r.data as Experience);

export const updateExperience = (id: number, experience: Partial<Experience>) =>
  API.put(`/admin/experiences/${id}`, experience).then((r: any) => r.data as Experience);

export const deleteExperience = (id: number) =>
  API.delete(`/admin/experiences/${id}`);

export const getProjects = () =>
  API.get(`/projects?userId=1`).then((r: any) => r.data as Project[]);

export interface Skill {
  id: number;
  user_id: number;
  category: string;
  name: string;
  icon_class?: string;
  level?: number;
  order_index: number;
  // Campos personales del usuario
  personal_repo?: string;    // Repositorio personal del usuario
  demo_url?: string;         // URL de demo del proyecto
  years_experience?: number; // Años de experiencia con esta tecnología
  certification_url?: string; // URL del certificado obtenido
  notes?: string;           // Notas personales sobre esta skill
}

export const getSkills = () =>
  API.get(`/skills?userId=1`).then((r: any) => r.data as Skill[]);

export const createSkill = (skill: Omit<Skill, "id">) =>
  API.post(`/skills`, skill).then((r: any) => r.data as Skill);

export const updateSkill = (id: number, skill: Partial<Skill>) =>
  API.put(`/skills/${id}`, skill).then((r: any) => r.data as Skill);

export const deleteSkill = (id: number) =>
  API.delete(`/skills/${id}`);

export interface Testimonial {
  id: number;
  user_id: number;
  name: string;
  position: string;
  avatar_url?: string;
  text: string;
  order_index: number;
  status?: 'pending' | 'approved' | 'rejected';
  email?: string;
  company?: string;
  website?: string;
  created_at?: string;
}

export interface Article {
  id: number;
  user_id: number;
  title: string;
  description: string;
  image_url?: string;
  github_url?: string;
  live_url?: string;
  article_url?: string;
  article_content?: string;
  video_demo_url?: string;
  status: ProjectState;
  order_index: number;
  technologies?: string[];
  summary?: string; // Para el modo resumen
  meta_data?: string; // JSON string para metadatos SEO
  views?: number; // Número de visitas del artículo
  created_at?: string; // Fecha de creación
  updated_at?: string; // Fecha de última actualización
  project_start_date?: string; // Fecha de inicio del proyecto (opcional)
  project_end_date?: string; // Fecha de fin del proyecto (opcional)
}

// Funciones públicas (solo testimonios aprobados)
export const getTestimonials = () =>
  API.get(`/testimonials?userId=1`).then((r: any) => r.data as Testimonial[]);

export const createTestimonial = (
  testimonial: Omit<Testimonial, "id" | "status" | "created_at">
) => API.post(`/testimonials`, testimonial).then((r: any) => r.data as Testimonial);

// Funciones de artículos - Públicas
export const getArticles = () =>
  API.get(`/articles?userId=1`).then((r: any) => r.data as Article[]);

export const getArticleById = (id: number) =>
  API.get(`/articles/${id}`).then((r: any) => r.data as Article);

// Funciones de administración para testimonios
export const getAdminTestimonials = (status?: string) =>
  API.get(`/admin/testimonials?userId=1${status ? `&status=${status}` : ''}`).then((r: any) => r.data as Testimonial[]);

export const approveTestimonial = (id: number, order_index: number = 0) =>
  API.patch(`/admin/testimonials/${id}/approve`, { order_index }).then((r: any) => r.data as Testimonial);

export const rejectTestimonial = (id: number) =>
  API.patch(`/admin/testimonials/${id}/reject`).then((r: any) => r.data as Testimonial);

export const updateAdminTestimonial = (id: number, testimonial: Partial<Testimonial>) =>
  API.put(`/admin/testimonials/${id}`, testimonial).then((r: any) => r.data as Testimonial);

export const deleteTestimonial = (id: number) =>
  API.delete(`/testimonials/${id}`);

// Funciones para certificaciones
export interface Certification {
  id: number;
  user_id: number;
  title: string;
  issuer: string;
  date: string;
  credential_id?: string;
  image_url?: string;
  order_index: number;
}

export const getCertifications = () => {
  console.log("Llamando a API de certificaciones...");
  return API.get(`/certifications?userId=1`).then((r: any) => {
    console.log("Respuesta de certificaciones:", r.data);
    return r.data;
  });
};

export const createCertification = (certification: Omit<Certification, "id">) =>
  API.post(`/certifications`, certification).then((r: any) => r.data as Certification);

export const updateCertification = (
  id: number,
  certification: Partial<Certification>
) =>
  API.put(`/certifications/${id}`, certification).then((r: any) => r.data as Certification);

export const deleteCertification = (id: number) =>
  API.delete(`/certifications/${id}`);

// Funciones de administración para artículos
export const getAdminArticles = () =>
  API.get(`/admin/articles?userId=1`).then((r: any) => r.data as Article[]);

export const createArticle = (article: Omit<Article, "id">) =>
  API.post(`/admin/articles`, article).then((r: any) => r.data as Article);

export const updateArticle = (id: number, article: Partial<Article>) =>
  API.put(`/admin/articles/${id}`, article).then((r: any) => r.data as Article);

export const deleteArticle = (id: number) =>
  API.delete(`/admin/articles/${id}`);

// Funciones para educación académica
export interface Education {
  id: number;
  user_id: number;
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
  order_index: number;
  created_at?: string;
}

export const getEducation = () => {
  console.log("Llamando a API de educación...");
  return API.get(`/education?userId=1`).then((r: any) => {
    console.log("Respuesta de educación:", r.data);
    return r.data;
  });
};

export const createEducation = (
  education: Omit<Education, "id" | "created_at">
) => API.post(`/admin/education`, education).then((r: any) => r.data as Education);

export const updateEducation = (id: number, education: Partial<Education>) =>
  API.put(`/admin/education/${id}`, education).then((r: any) => r.data as Education);

export const deleteEducation = (id: number) =>
  API.delete(`/admin/education/${id}`);
