// src/utils/cloudinary.ts
export const cloudinaryUrl = (publicId: string, transforms = '') => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dtdnfd2ku';
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  return transforms ? `${baseUrl}/${transforms}/${publicId}` : `${baseUrl}/${publicId}`;
};

// Transformaciones predefinidas para diferentes usos
export const cloudinaryTransforms = {
  // Para fotos de perfil
  avatar: 'w_300,h_300,c_fill,q_auto,f_auto,g_face',
  
  // Para capturas de proyecto (responsive)
  projectImage: 'w_800,h_600,c_fill,q_auto,f_auto',
  projectThumbnail: 'w_400,h_300,c_fill,q_auto,f_auto',
  
  // Para logos de certificaciones
  certificationLogo: 'w_150,h_150,c_fit,q_auto,f_auto',
  
  // Para imágenes de hero/banner
  hero: 'w_1200,h_800,c_fill,q_auto,f_auto',
  
  // Para thumbnails pequeños
  thumbnail: 'w_200,h_150,c_fill,q_auto,f_auto'
};

// Helper para generar URLs con transformaciones predefinidas
export const getOptimizedImageUrl = (
  publicId: string, 
  variant: keyof typeof cloudinaryTransforms = 'projectImage'
) => {
  return cloudinaryUrl(publicId, cloudinaryTransforms[variant]);
};
