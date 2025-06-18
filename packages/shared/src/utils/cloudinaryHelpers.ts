// src/utils/cloudinaryHelpers.ts

/**
 * Extrae el public_id de una URL de Cloudinary
 * @param cloudinaryUrl - URL completa de Cloudinary
 * @returns public_id o null si no es una URL válida de Cloudinary
 */
export const extractPublicIdFromUrl = (cloudinaryUrl: string): string | null => {
  if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string') {
    return null;
  }

  try {
    // Patrones comunes de URLs de Cloudinary:
    // https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
    // https://res.cloudinary.com/cloud_name/image/upload/folder/public_id.ext
    // https://res.cloudinary.com/cloud_name/image/upload/transformations/folder/public_id.ext
    
    const cloudinaryPattern = /\/image\/upload\/(?:v\d+\/)?(?:[^\/]+\/)*(.+?)(?:\.[^.]+)?$/;
    const match = cloudinaryUrl.match(cloudinaryPattern);
    
    if (match && match[1]) {
      // Remover la extensión del archivo si existe
      const publicId = match[1].replace(/\.[^.]+$/, '');
      console.log('🔍 Public ID extraído:', publicId, 'de URL:', cloudinaryUrl);
      return publicId;
    }
    
    console.warn('⚠️ No se pudo extraer public_id de la URL:', cloudinaryUrl);
    return null;
  } catch (error) {
    console.error('❌ Error extrayendo public_id:', error);
    return null;
  }
};

/**
 * Verifica si una URL es de Cloudinary
 * @param url - URL a verificar
 * @returns true si es una URL de Cloudinary
 */
export const isCloudinaryUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
};

/**
 * Verifica si una URL es una URL local temporal (blob:)
 * @param url - URL a verificar
 * @returns true si es una URL local temporal
 */
export const isBlobUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  return url.startsWith('blob:');
};
