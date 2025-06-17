import { getOptimizedImageUrl } from './cloudinary';
import { debugLog } from './debugConfig';

// Configuración centralizada de imágenes del proyecto
export const imageAssets = {  // Imágenes de perfil
  profilePhoto: {
    cloudinary: 'perfil/perfil/foto-perfil-adrian', // ✅ Actualizado para coincidir con Cloudinary
    local: '/assets/images/foto-perfil.jpg',
    variant: 'avatar' as const
  },
  
  // Logos de proyectos
  pixihamaLogo: {
    cloudinary: 'proyectos/pixihama',
    local: '/assets/images/pixihama.png',
    variant: 'projectThumbnail' as const
  },
  
  airpixelLogo: {
    cloudinary: 'proyectos/airpixel-logo',
    local: '/assets/images/airpixel_logo.png',
    variant: 'projectThumbnail' as const
  },
  
  // Certificaciones
  sololearCert: {
    cloudinary: 'certificaciones/sololearn',
    local: '/assets/images/certification-logos/sololearn.png',
    variant: 'certificationLogo' as const
  },
  
  // Placeholders
  projectPlaceholder: {
    cloudinary: 'placeholders/project',
    local: '/assets/images/project-placeholder.svg',
    variant: 'projectThumbnail' as const
  }
};

export type ImageAssetKey = keyof typeof imageAssets;

/**
 * Obtiene la URL optimizada de una imagen, con fallback automático
 */
export const getImageUrl = (
  assetKey: ImageAssetKey, 
  useCloudinary: boolean = true
): string => {
  const asset = imageAssets[assetKey];
    if (useCloudinary && asset.cloudinary) {
    try {
      return getOptimizedImageUrl(asset.cloudinary, asset.variant);
    } catch (error) {
      debugLog.images(`Error generando URL de Cloudinary para ${assetKey}, usando local`);
      return asset.local;
    }
  }
  
  return asset.local;
};

/**
 * Hook para obtener URLs de imágenes con manejo de errores
 */
export const useImageWithFallback = (assetKey: ImageAssetKey) => {
  const cloudinaryUrl = getImageUrl(assetKey, true);
  const localUrl = getImageUrl(assetKey, false);
    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    debugLog.images(`Error cargando imagen de Cloudinary: ${assetKey}, usando fallback local`);
    e.currentTarget.src = localUrl;
  };
  
  return {
    src: cloudinaryUrl,
    fallbackSrc: localUrl,
    onError: handleError
  };
};
