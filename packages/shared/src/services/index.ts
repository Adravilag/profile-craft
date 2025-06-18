// Shared services exports - only export functions that exist
export { 
  getUserProfile,
  getAuthenticatedUserProfile,
  updateProfile,
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  getProjects,
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getTestimonials,
  createTestimonial,
  deleteTestimonial,
  getArticles,
  getArticleById,
  getAdminTestimonials,
  approveTestimonial,
  rejectTestimonial,  updateAdminTestimonial,
  uploadImage,
  deleteCloudinaryImage,
  getMediaFiles,
  deleteMediaFile
} from './api';

// Export necessary types that are not already in types package
export type { 
  Article,
  MediaItem,
  UserProfile as ApiUserProfile  // Rename to avoid conflict with types/UserProfile
} from './api';
