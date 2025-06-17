import axios from "axios";
import type { ProjectState } from "../constants/projectStates";
import { getUserId, getFirstAdminUserId, API_CONFIG } from "../config/constants";

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
  _id: string;
  user_id: string;
  company: string;
  position: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  location?: string;
  order_index: number;
  technologies: string[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
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
  views: number;
  project_start_date?: string;
  project_end_date?: string;
  created_at: string;
  updated_at: string;
}
// etc.

// Función helper para obtener el ID de usuario dinámicamente
const getDynamicUserId = async (): Promise<string> => {
  try {
    if (API_CONFIG.IS_MONGODB) {
      return await getFirstAdminUserId();
    } else {
      return getUserId();
    }
  } catch (error) {
    console.error('❌ Error obteniendo ID de usuario:', error);
    // En caso de error, intentar crear un usuario admin por defecto
    if (API_CONFIG.IS_MONGODB) {
      throw new Error('No se pudo obtener el ID del usuario. Asegúrate de que existe al menos un usuario en la base de datos.');
    }
    return getUserId(); // Fallback para SQLite
  }
};

export const getUserProfile = async () => {
  const userId = await getDynamicUserId();
  console.log('🔄 Obteniendo perfil para usuario:', userId);
  return API.get<UserProfile>(`/profile/${userId}`).then((r) => r.data);
};

// Nueva función para obtener el perfil del usuario autenticado
export const getAuthenticatedUserProfile = async () => {
  console.log('📡 getAuthenticatedUserProfile: Iniciando petición...');
  const token = localStorage.getItem('portfolio_auth_token');
  console.log('🔑 Token disponible:', token ? 'Sí' : 'No');
  console.log('🔗 URL de petición:', `${API_BASE_URL}/profile/auth/profile`);
  
  try {
    const response = await API.get<UserProfile>(`/profile/auth/profile`);
    console.log('✅ getAuthenticatedUserProfile: Respuesta exitosa:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ getAuthenticatedUserProfile: Error en petición:', error);
    console.error('❌ Error details:', {
      status: (error as any)?.response?.status,
      statusText: (error as any)?.response?.statusText,
      data: (error as any)?.response?.data,
      message: (error as any)?.message
    });
    throw error;
  }
};

export const updateProfile = (profileData: Partial<UserProfile>) => {
  console.log('🔄 Actualizando perfil con datos:', profileData);
  console.log('🔍 Datos enviados:', JSON.stringify(profileData, null, 2));
  
  // Validar que tengamos los campos mínimos
  if (!profileData.name || !profileData.email || !profileData.role_title || !profileData.about_me) {
    console.warn('⚠️ Faltan campos obligatorios:', {
      name: !!profileData.name,
      email: !!profileData.email,
      role_title: !!profileData.role_title,
      about_me: !!profileData.about_me
    });
  }
  
  return API.put<UserProfile>(`/profile/auth/profile`, profileData)
    .then((response) => {
      console.log('✅ Perfil actualizado exitosamente:', response.data);
      return response.data;
    })
    .catch((error) => {
      console.error('❌ Error actualizando perfil:', error);
      console.error('📊 Status:', error.response?.status);
      console.error('📋 Data:', error.response?.data);
      console.error('🔍 Headers:', error.response?.headers);
      throw error;
    });
};

export const getExperiences = async () => {
  const userId = await getDynamicUserId();
  console.log('🔄 Obteniendo experiencias para usuario:', userId);
  return API.get<Experience[]>(`/experiences?userId=${userId}`).then((r) => r.data);
};

export const createExperience = async (experience: Omit<Experience, "id">) => {
  const userId = await getDynamicUserId();
  const experienceWithUserId = { ...experience, user_id: userId };
  console.log('🔄 Creando experiencia para usuario:', userId);
  return API.post<Experience>(`/admin/experiences`, experienceWithUserId).then((r) => r.data);
};

export const updateExperience = (id: string, experience: Partial<Experience>) =>
  API.put<Experience>(`/admin/experiences/${id}`, experience).then((r) => r.data);

export const deleteExperience = (id: string) =>
  API.delete(`/admin/experiences/${id}`);

export const getProjects = async () => {
  const userId = await getDynamicUserId();
  console.log('🔄 Obteniendo proyectos para usuario:', userId);
  return API.get<Project[]>(`/projects?userId=${userId}`).then((r) => r.data);
};

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
  years_experience?: number; // Años de experiencia con esta tecnología
  certification_url?: string; // URL del certificado obtenido
  notes?: string;           // Notas personales sobre esta skill
}

export const getSkills = async () => {
  const userId = await getDynamicUserId();
  console.log('🔄 Obteniendo habilidades para usuario:', userId);
  return API.get<Skill[]>(`/skills?userId=${userId}`).then((r) => r.data);
};

export const createSkill = async (skill: Omit<Skill, "id">) => {
  const userId = await getDynamicUserId();
  
  // IMPORTANTE: Validar campos obligatorios antes de enviar la solicitud
  if (!skill.name || skill.name.trim() === '') {
    console.error('❌ Error: El nombre de la habilidad es obligatorio');
    throw new Error('El nombre de la habilidad es obligatorio');
  }

  if (!skill.category || skill.category.trim() === '') {
    console.error('❌ Error: La categoría de la habilidad es obligatoria');
    throw new Error('La categoría de la habilidad es obligatoria');
  }
  
  const skillWithUserId = { ...skill, user_id: userId };
  console.log('🔄 Creando habilidad para usuario:', userId, 'con datos:', skillWithUserId);
  return API.post<Skill>(`/skills`, skillWithUserId).then((r) => r.data);
};

export const updateSkill = (id: number, skill: Partial<Skill>) => {
  // Validar que al menos uno de los campos obligatorios esté presente si se está actualizando
  if (skill.name !== undefined && (!skill.name || skill.name.trim() === '')) {
    console.error('❌ Error: El nombre de la habilidad no puede estar vacío');
    throw new Error('El nombre de la habilidad no puede estar vacío');
  }
  
  if (skill.category !== undefined && (!skill.category || skill.category.trim() === '')) {
    console.error('❌ Error: La categoría de la habilidad no puede estar vacía');
    throw new Error('La categoría de la habilidad no puede estar vacía');
  }
  
  console.log('🔄 Actualizando habilidad ID:', id, 'con datos:', skill);
  return API.put<Skill>(`/skills/${id}`, skill).then((r) => r.data);
};

export const deleteSkill = (id: number) =>
  API.delete(`/skills/${id}`);

export interface Testimonial {
  _id?: string; // ID de MongoDB
  id?: number; // ID legacy para compatibilidad
  user_id: number;
  name: string;
  position: string;
  avatar?: string; // Campo usado en BD
  avatar_url?: string; // Campo legacy
  text: string;
  rating?: number;
  order_index: number;
  status?: 'pending' | 'approved' | 'rejected';
  email?: string;
  company?: string;
  website?: string;
  created_at?: string;
  approved_at?: string;
  rejected_at?: string;
}

export interface Article {
  id: string;
  user_id: string;
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
  type?: 'proyecto' | 'articulo'; // Nuevo campo type
  technologies?: string[];
  summary?: string; // Para el modo resumen
  meta_data?: string; // JSON string para metadatos SEO
  views?: number; // Número de visitas del artículo
  created_at?: string; // Fecha de creación
  updated_at?: string; // Fecha de última actualización
  project_start_date?: string; // Fecha de inicio del proyecto (opcional)
  project_end_date?: string; // Fecha de fin del proyecto (opcional)
  last_read_at?: string; // Fecha de última lectura (opcional)
}

// Funciones públicas (solo testimonios aprobados)
export const getTestimonials = async () => {
  const userId = await getDynamicUserId();
  console.log('🔄 Obteniendo testimonios para usuario:', userId);
  return API.get<Testimonial[]>(`/testimonials?userId=${userId}`).then((r) => r.data);
};

export const createTestimonial = async (testimonial: Omit<Testimonial, "id" | "status" | "created_at">) => {
  const userId = await getDynamicUserId();
  const testimonialWithUserId = { ...testimonial, user_id: userId };
  console.log('🔄 Creando testimonio para usuario:', userId);
  return API.post<Testimonial>(`/testimonials`, testimonialWithUserId).then((r) => r.data);
};

// Funciones de artículos - Públicas
export const getArticles = async () => {
  const userId = await getDynamicUserId();
  console.log('🔄 Obteniendo artículos para usuario:', userId);
  return API.get<Article[]>(`/projects/articles?userId=${userId}`).then((r) => r.data);
};

export const getArticleById = (id: string) =>
  API.get<Article>(`/projects/articles/${id}`).then((r) => r.data);

// Funciones de administración para testimonios
export const getAdminTestimonials = async (status?: string) => {
  const userId = await getDynamicUserId();
  console.log('🔄 Obteniendo testimonios admin para usuario:', userId);
  return API.get<Testimonial[]>(`/testimonials/admin?userId=${userId}${status ? `&status=${status}` : ''}`).then((r) => r.data);
};

export const approveTestimonial = (id: string, order_index: number = 0) =>
  API.put<Testimonial>(`/testimonials/${id}/approve`, { order_index }).then((r) => r.data);

export const rejectTestimonial = (id: string) =>
  API.put<Testimonial>(`/testimonials/${id}/reject`).then((r) => r.data);

export const updateAdminTestimonial = (id: string, testimonial: Partial<Testimonial>) =>
  API.put<Testimonial>(`/testimonials/${id}`, testimonial).then((r) => r.data);

export const deleteTestimonial = (id: string) =>
  API.delete(`/testimonials/${id}`);

// Funciones para certificaciones
export interface Certification {
  _id?: string; // ID de MongoDB
  id?: number | string; // Para compatibilidad con código antiguo
  user_id: number | string;
  title: string;
  issuer: string;
  date: string;
  credential_id?: string;
  image_url?: string;
  verify_url?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export const getCertifications = () => {
  const userId = getUserId();
  console.log("🔄 Llamando a API de certificaciones para usuario:", userId);
  return API.get<Certification[]>(`/certifications?userId=${userId}`).then((r) => {
    console.log("Respuesta de certificaciones:", r.data);
    return r.data;
  });
};

export const createCertification = (certification: Omit<Certification, "id">) => {
  const userId = getUserId();
  const certificationWithUserId = { ...certification, user_id: userId };
  console.log('🔄 Creando certificación para usuario:', userId);
  return API.post<Certification>(`/certifications`, certificationWithUserId).then((r) => r.data);
};

export const updateCertification = (id: number | string, certification: Partial<Certification>) =>
  API.put<Certification>(`/certifications/${id}`, certification).then((r) => r.data);

export const deleteCertification = (id: string | number) =>
  API.delete(`/certifications/${id}`);

// Funciones de administración para artículos
export const getAdminArticles = () => {
  const userId = getUserId();
  console.log('🔄 Obteniendo artículos admin para usuario:', userId);
  return API.get<Article[]>(`/projects/admin/articles?userId=${userId}`).then((r) => r.data);
};

export const createArticle = (article: Omit<Article, "id">) => {
  const userId = getUserId();
  const articleWithUserId = { ...article, user_id: userId };
  console.log('🔄 Creando artículo para usuario:', userId);
  return API.post<Article>(`/projects/admin/articles`, articleWithUserId).then((r) => r.data);
};

export const updateArticle = (id: string, article: Partial<Article>) =>
  API.put<Article>(`/projects/admin/articles/${id}`, article).then((r) => r.data);

export const deleteArticle = (id: string) =>
  API.delete(`/projects/admin/articles/${id}`);

// Funciones para educación académica
export interface Education {
  _id?: string; // ID de MongoDB
  id?: number | string; // Para compatibilidad con código antiguo  
  user_id: number | string;
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export const getEducation = () => {
  const userId = getUserId();
  console.log("🔄 Llamando a API de educación para usuario:", userId);
  return API.get<Education[]>(`/education?userId=${userId}`).then((r) => {
    console.log("Respuesta de educación:", r.data);
    return r.data;
  });
};

export const createEducation = (education: Omit<Education, "id" | "created_at">) => {
  const userId = getUserId();
  const educationWithUserId = { ...education, user_id: userId };
  console.log('🔄 Creando educación para usuario:', userId);
  return API.post<Education>(`/admin/education`, educationWithUserId).then((r) => r.data);
};

export const updateEducation = (id: number, education: Partial<Education>) =>
  API.put<Education>(`/admin/education/${id}`, education).then((r) => r.data);

export const deleteEducation = (id: string) =>
  API.delete(`/admin/education/${id}`);

// Función temporal para desarrollo - establecer token de autenticación
export const setDevelopmentToken = async () => {
  try {
    // Intentar hacer login con credenciales de desarrollo
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin',
        password: 'admin123'
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('portfolio_auth_token', data.token);
        console.log('🔑 Token de desarrollo establecido exitosamente');
        console.log('ℹ️ Ahora puedes usar las funciones de administración');
        return true;
      }
    }
    
    // Si el login falla, usar token hardcodeado de fallback
    const fallbackToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZGF2aWxhZy5jb250YWN0QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzMzNjgyNjUzLCJleHAiOjE3MzM3NjkwNTN9.QYhP8XHdGZrN6Z8pOBW7KQmGJ3FvGD2L8XfZ6YmN5Qc';
    localStorage.setItem('portfolio_auth_token', fallbackToken);
    console.log('🔑 Token de fallback establecido para testing');
    return true;
  } catch (error) {
    console.error('❌ Error obteniendo token:', error);
    return false;
  }
};

// Función para obtener token de desarrollo (solo en desarrollo)
export const getDevToken = async () => {
  try {
    const response = await API.get('/auth/dev-token');
    const { token, user } = response.data;
    
    // Guardar token en localStorage
    localStorage.setItem('portfolio_auth_token', token);
    
    console.log('🔑 Token de desarrollo obtenido y guardado:', user);
    return { token, user };
  } catch (error) {
    console.error('❌ Error obteniendo token de desarrollo:', error);
    throw error;
  }
};

// Función para limpiar token de localStorage
export const clearAuthToken = () => {
  localStorage.removeItem('portfolio_auth_token');
  console.log('🧹 Token de autenticación eliminado');
};

// ===== FUNCIONES DE MEDIA LIBRARY =====

export interface MediaItem {
  id: number;
  url: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size?: number;
  thumbnail?: string;
  filename?: string;
  created?: Date;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file: MediaItem;
}

// Subir archivo de imagen
// Subir imagen con tipo especificado
export const uploadImage = async (file: File, imageType: 'profile' | 'project' | 'avatar' = 'project'): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('imageType', imageType);
  
  const response = await API.post<UploadResponse>('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Obtener lista de archivos de media
export const getMediaFiles = (): Promise<MediaItem[]> => 
  API.get<MediaItem[]>('/media').then((r) => r.data);

// Eliminar archivo de media
export const deleteMediaFile = (filename: string): Promise<{ success: boolean; message: string }> =>
  API.delete(`/media/${filename}`).then((r) => r.data);

// Eliminar imagen de Cloudinary
export const deleteCloudinaryImage = async (publicId: string): Promise<{ success: boolean; message: string }> => {
  return API.delete('/media/cloudinary/delete', {
    data: { publicId }
  }).then((r) => r.data);
};

// Función para verificar si existe al menos un usuario registrado
export const hasRegisteredUser = async (): Promise<boolean> => {
  try {
    console.log('🔍 Verificando si existe usuario registrado...');
    console.log('🌐 API_BASE_URL:', API_BASE_URL);
    
    // Hacer la petición directamente con fetch para mayor control
    const url = `${API_BASE_URL}/auth/has-user`;
    console.log('📡 URL completa:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Respuesta completa has-user:', data);
    console.log('📋 data.exists:', data.exists);
    console.log('🔍 Tipo de data.exists:', typeof data.exists);
    
    const result = data.exists;
    console.log('🎯 Resultado final:', result);
    return result;
  } catch (error) {
    console.error('❌ Error verificando usuario registrado:', error);
    console.error('📋 Error completo:', error);
    return false; // En caso de error, asumir que no hay usuario para permitir registro
  }
};

// Función para obtener estadísticas de vistas de un artículo (admin)
export const getArticleStats = async (articleId: string) => {
  return API.get(`/projects/admin/articles/${articleId}/stats`).then((r) => r.data);
};
