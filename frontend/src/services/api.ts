import axios from "axios";

// If using Vite, use import.meta.env; if using Create React App, ensure @types/node is installed and add a declaration for process.env if needed.
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000/api";
console.log('🔧 API Base URL configurada:', API_BASE_URL);

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar el token de autorización automáticamente
API.interceptors.request.use(
  (config) => {
    console.log('📡 Haciendo petición a:', (config.baseURL || '') + (config.url || ''));
    const token = localStorage.getItem('portfolio_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para log de respuestas
API.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa de:', response.config.url || 'unknown', response.data);
    return response;
  },
  (error) => {
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
  status: string;
  order_index: number;
  technologies: string[];
}
// etc.

export const getUserProfile = () =>
  API.get<UserProfile>(`/profile/1`).then((r) => r.data);

export const getExperiences = () =>
  API.get<Experience[]>(`/experiences?userId=1`).then((r) => r.data);

export const createExperience = (experience: Omit<Experience, "id">) =>
  API.post<Experience>(`/admin/experiences`, experience).then((r) => r.data);

export const updateExperience = (id: number, experience: Partial<Experience>) =>
  API.put<Experience>(`/admin/experiences/${id}`, experience).then((r) => r.data);

export const deleteExperience = (id: number) =>
  API.delete(`/admin/experiences/${id}`);

export const getProjects = () =>
  API.get<Project[]>(`/projects?userId=1`).then((r) => r.data);

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
  API.get<Skill[]>(`/skills?userId=1`).then((r) => r.data);

export const createSkill = (skill: Omit<Skill, "id">) =>
  API.post<Skill>(`/skills`, skill).then((r) => r.data);

export const updateSkill = (id: number, skill: Partial<Skill>) =>
  API.put<Skill>(`/skills/${id}`, skill).then((r) => r.data);

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
  status: string;
  order_index: number;
  technologies?: string[];
  summary?: string; // Para el modo resumen
  meta_data?: string; // JSON string para metadatos SEO
}

// Funciones públicas (solo testimonios aprobados)
export const getTestimonials = () =>
  API.get<Testimonial[]>(`/testimonials?userId=1`).then((r) => r.data);

export const createTestimonial = (testimonial: Omit<Testimonial, "id" | "status" | "created_at">) =>
  API.post<Testimonial>(`/testimonials`, testimonial).then((r) => r.data);

// Funciones de artículos - Públicas
export const getArticles = () =>
  API.get<Article[]>(`/articles?userId=1`).then((r) => r.data);

export const getArticleById = (id: number) =>
  API.get<Article>(`/articles/${id}`).then((r) => r.data);

// Funciones de administración para testimonios
export const getAdminTestimonials = (status?: string) =>
  API.get<Testimonial[]>(`/admin/testimonials?userId=1${status ? `&status=${status}` : ''}`).then((r) => r.data);

export const approveTestimonial = (id: number, order_index: number = 0) =>
  API.patch<Testimonial>(`/admin/testimonials/${id}/approve`, { order_index }).then((r) => r.data);

export const rejectTestimonial = (id: number) =>
  API.patch<Testimonial>(`/admin/testimonials/${id}/reject`).then((r) => r.data);

export const updateAdminTestimonial = (id: number, testimonial: Partial<Testimonial>) =>
  API.put<Testimonial>(`/admin/testimonials/${id}`, testimonial).then((r) => r.data);

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
  return API.get<Certification[]>(`/certifications?userId=1`).then((r) => {
    console.log("Respuesta de certificaciones:", r.data);
    return r.data;
  });
};

export const createCertification = (certification: Omit<Certification, "id">) =>
  API.post<Certification>(`/certifications`, certification).then((r) => r.data);

export const updateCertification = (id: number, certification: Partial<Certification>) =>
  API.put<Certification>(`/certifications/${id}`, certification).then((r) => r.data);

export const deleteCertification = (id: number) =>
  API.delete(`/certifications/${id}`);

// Funciones de administración para artículos
export const getAdminArticles = () =>
  API.get<Article[]>(`/admin/articles?userId=1`).then((r) => r.data);

export const createArticle = (article: Omit<Article, "id">) =>
  API.post<Article>(`/admin/articles`, article).then((r) => r.data);

export const updateArticle = (id: number, article: Partial<Article>) =>
  API.put<Article>(`/admin/articles/${id}`, article).then((r) => r.data);

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
  return API.get<Education[]>(`/education?userId=1`).then((r) => {
    console.log("Respuesta de educación:", r.data);
    return r.data;
  });
};

export const createEducation = (education: Omit<Education, "id" | "created_at">) =>
  API.post<Education>(`/admin/education`, education).then((r) => r.data);

export const updateEducation = (id: number, education: Partial<Education>) =>
  API.put<Education>(`/admin/education/${id}`, education).then((r) => r.data);

export const deleteEducation = (id: number) =>
  API.delete(`/admin/education/${id}`);
