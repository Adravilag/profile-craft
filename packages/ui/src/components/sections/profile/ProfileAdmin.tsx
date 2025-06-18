// src/components/sections/profile/ProfileAdmin.tsx

import React, { useState, useEffect, useRef } from "react";
import { getAuthenticatedUserProfile, updateProfile, uploadImage, deleteCloudinaryImage } from "@cv-maker/shared";
import { useNotification } from "@cv-maker/shared";
import { ModalPortal } from "../../common";
import { OptimizedImage } from "../../common";
import { extractPublicIdFromUrl, isCloudinaryUrl, isBlobUrl } from "../../../utils/cloudinaryHelpers";
import styles from "./ProfileAdmin.module.css";

interface ProfileAdminProps {
  onClose: () => void;
}

const ProfileAdmin: React.FC<ProfileAdminProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>(""); // Para guardar la URL original
  const [newImageFile, setNewImageFile] = useState<File | null>(null); // Archivo seleccionado
  const [previewImageUrl, setPreviewImageUrl] = useState<string>(""); // URL de vista previa
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role_title: "",
    role_subtitle: "",
    about_me: "",
    phone: "",
    location: "",
    linkedin_url: "",
    github_url: "",
    status: "",
    profile_image: ""
  });
  
  const { showSuccess, showError } = useNotification();

  // Log para debuggear re-renders
  console.log('🔄 ProfileAdmin render - Estado actual:', {
    loading,
    saving,
    formDataName: formData.name,
    formDataEmail: formData.email,
    formDataRole: formData.role_title,
    formDataFilled: Object.values(formData).some(val => val !== "")
  });

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log('🔄 ProfileAdmin - Iniciando carga de perfil...');
        setLoading(true);
        
        // Verificar que tenemos token
        const token = localStorage.getItem('portfolio_auth_token');
        console.log('🔑 Token disponible:', token ? 'Sí' : 'No');
        
        if (token) {
          console.log('🔍 Token details:', {
            length: token.length,
            starts: token.substring(0, 20),
            isJWT: token.includes('.')
          });
          
          // Intentar decodificar el token para ver si es válido
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('🔍 Token payload:', {
              userId: payload.userId,
              role: payload.role,
              exp: payload.exp,
              isExpired: payload.exp ? Date.now() / 1000 > payload.exp : 'no exp'
            });
          } catch (decodeError) {
            console.error('❌ Error decodificando token:', decodeError);
          }
        }
        
        if (!token) {
          console.error('❌ No hay token de autenticación disponible');
          showError("No hay sesión activa. Por favor, inicia sesión nuevamente.");
          // No cerrar automáticamente, permitir que el usuario vea el error
          setLoading(false);
          return;
        }
        
        console.log('📡 Llamando a getAuthenticatedUserProfile...');
        const profileData = await getAuthenticatedUserProfile();
        console.log('🔍 ProfileAdmin - Datos cargados:', {
          name: profileData.name,
          email: profileData.email,
          role_title: profileData.role_title,
          about_me: profileData.about_me,
          profile_image: profileData.profile_image,
          hasImage: !!profileData.profile_image,
          fullData: profileData
        });
        
        if (!profileData || !profileData.name) {
          console.error('❌ Los datos del perfil están vacíos o incompletos');
          showError("Error: No se pudieron cargar los datos del perfil");
          // No retornar aquí, seguir con formulario vacío para que el usuario pueda ver el modal
          console.log('⚠️ Continuando con formulario vacío...');
        } else {
          const imageUrl = profileData.profile_image || "";
          setOriginalImageUrl(imageUrl);
          setPreviewImageUrl(imageUrl);
          
          const newFormData = {
            name: profileData.name || "",
            email: profileData.email || "",
            role_title: profileData.role_title || "",
            role_subtitle: profileData.role_subtitle || "",
            about_me: profileData.about_me || "",
            phone: profileData.phone || "",
            location: profileData.location || "",
            linkedin_url: profileData.linkedin_url || "",
            github_url: profileData.github_url || "",
            status: profileData.status || "",
            profile_image: imageUrl
          };
          
          console.log('📝 Estableciendo FormData:', newFormData);
          setFormData(newFormData);
          
          console.log('✅ ProfileAdmin - FormData establecido exitosamente');
        }
        
      } catch (error) {
        console.error("❌ ProfileAdmin - Error loading profile:", error);
        console.error("❌ Error details:", {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack',
          response: (error as any)?.response?.data || 'No response data'
        });
        
        if ((error as any)?.response?.status === 401) {
          showError("Sesión expirada. Por favor, inicia sesión nuevamente.");
          // No cerrar automáticamente para que el usuario vea el error
        } else {
          showError("Error al cargar el perfil. Verifica tu conexión e intenta nuevamente.");
        }
      } finally {
        setLoading(false);
        console.log('🏁 ProfileAdmin - Carga completada, loading = false');
      }
    };
      loadProfile();
  }, []); // ✅ Sin dependencias, solo se ejecuta una vez al montar

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showError("Solo se permiten archivos de imagen");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("La imagen debe ser menor a 5MB");
      return;
    }

    try {
      // Crear URL de vista previa del archivo local
      const previewUrl = URL.createObjectURL(file);
      setNewImageFile(file);
      setPreviewImageUrl(previewUrl);
      setFormData(prev => ({
        ...prev,
        profile_image: previewUrl // Temporalmente usar la URL de vista previa
      }));
      
      showSuccess("Imagen seleccionada. Guarda los cambios para subirla a Cloudinary.");
    } catch (error) {
      console.error("Error procesando imagen:", error);
      showError("Error al procesar la imagen");
    }
  };

  const handleRemoveImage = () => {
    setNewImageFile(null);
    setPreviewImageUrl("");
    setFormData(prev => ({
      ...prev,
      profile_image: ""
    }));
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      let finalImageUrl = formData.profile_image;
      
      // Si hay una nueva imagen seleccionada, subirla a Cloudinary
      if (newImageFile) {
        console.log('📤 Subiendo nueva imagen a Cloudinary...');
        
        try {
          // Subir la nueva imagen como imagen de perfil
          const uploadResponse = await uploadImage(newImageFile, 'profile');
          
          if (uploadResponse.success && uploadResponse.file.url) {
            finalImageUrl = uploadResponse.file.url;
            console.log('✅ Nueva imagen subida exitosamente:', finalImageUrl);
            
            // Si había una imagen anterior de Cloudinary, eliminarla
            if (originalImageUrl && isCloudinaryUrl(originalImageUrl)) {
              const oldPublicId = extractPublicIdFromUrl(originalImageUrl);
              if (oldPublicId) {
                console.log('🗑️ Eliminando imagen anterior de Cloudinary:', oldPublicId);
                try {
                  await deleteCloudinaryImage(oldPublicId);
                  console.log('✅ Imagen anterior eliminada exitosamente');
                } catch (deleteError) {
                  console.warn('⚠️ Error al eliminar imagen anterior:', deleteError);
                  // No fallar por esto, continuar con la actualización
                }
              }
            }
            
            // Limpiar la URL de vista previa si existe
            if (previewImageUrl && isBlobUrl(previewImageUrl)) {
              URL.revokeObjectURL(previewImageUrl);
            }
          } else {
            throw new Error('Error al subir la imagen a Cloudinary');
          }
        } catch (uploadError) {
          console.error('❌ Error subiendo imagen:', uploadError);
          showError('Error al subir la imagen. Guardando perfil sin cambiar la imagen.');
          // Usar la imagen original si falla la subida
          finalImageUrl = originalImageUrl;
        }
      }
      
      // Actualizar el perfil con la URL final de la imagen
      const profileData = {
        ...formData,
        profile_image: finalImageUrl
      };
      
      console.log('💾 Actualizando perfil con datos:', {
        ...profileData,
        profile_image: finalImageUrl ? '✓ Con imagen' : '✗ Sin imagen'
      });
      
      await updateProfile(profileData);
      
      // Limpiar estados
      setNewImageFile(null);
      setOriginalImageUrl(finalImageUrl);
      setPreviewImageUrl(finalImageUrl);
      
      showSuccess("Perfil actualizado correctamente");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      showError("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (loading) {
    return (
      <ModalPortal>
        <div className={styles.profileAdminOverlay}>
          <div className={styles.profileAdminModal}>
            <div className={styles.loadingContainer}>
              <i className="fas fa-spinner fa-spin"></i>
              <p>Cargando perfil...</p>
            </div>
          </div>
        </div>
      </ModalPortal>
    );
  }

  return (
    <ModalPortal>
      <div className={styles.profileAdminOverlay}>
        <div className={styles.profileAdminModal}>
          <div className={styles.modalHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon}>
                <i className="fas fa-user-edit"></i>
              </div>
              <div>
                <h2>Editar Perfil</h2>
                <p className={styles.headerSubtitle}>
                  Actualiza tu información personal y profesional
                </p>
              </div>
            </div>
            <button
              className={styles.closeButton}
              onClick={handleCancel}
              type="button"
              title="Cerrar"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className={styles.modalContent}>
            <form onSubmit={handleSubmit} className={styles.profileForm}>
              {/* Foto de Perfil */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <i className="fas fa-camera"></i>
                  Foto de Perfil
                </h3>
                
                <div className={styles.profileImageSection}>
                  <div className={styles.profileImageContainer}>                    {formData.profile_image ? (
                      <div className={styles.profileImageWrapper}>
                        <OptimizedImage
                          src={formData.profile_image}
                          alt="Foto de perfil"
                          className={styles.profileImage}
                          width={400}
                          height={400}
                          quality={90}
                          fallback="/assets/images/foto-perfil.jpg"
                        />
                        <div className={styles.imageOverlay}>
                          <button
                            type="button"
                            className={styles.changeImageButton}
                            onClick={triggerImageUpload}
                            disabled={saving}
                            title="Cambiar imagen"
                          >
                            <i className="fas fa-camera"></i>
                          </button>
                          <button
                            type="button"
                            className={styles.removeImageButton}
                            onClick={handleRemoveImage}
                            disabled={saving}
                            title="Eliminar imagen"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.profileImagePlaceholder}>
                        <div className={styles.placeholderIcon}>
                          <i className="fas fa-user"></i>
                        </div>
                        <button
                          type="button"
                          className={styles.uploadImageButton}
                          onClick={triggerImageUpload}
                          disabled={saving}
                        >
                          <i className="fas fa-camera"></i>
                          Subir Foto
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.hiddenFileInput}
                  />
                  
                  <div className={styles.imageInstructions}>
                    <p>
                      <i className="fas fa-info-circle"></i>
                      Formatos soportados: JPG, PNG, GIF (máx. 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Personal */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <i className="fas fa-user"></i>
                  Información Personal
                </h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Nombre Completo *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Teléfono</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 234 567 890"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="location">Ubicación</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Ciudad, País"
                    />
                  </div>
                </div>
              </div>

              {/* Información Profesional */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <i className="fas fa-briefcase"></i>
                  Información Profesional
                </h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="role_title">Título Profesional *</label>
                    <input
                      type="text"
                      id="role_title"
                      name="role_title"
                      value={formData.role_title}
                      onChange={handleInputChange}
                      required
                      placeholder="Full Stack Developer"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="role_subtitle">Subtítulo</label>
                    <input
                      type="text"
                      id="role_subtitle"
                      name="role_subtitle"
                      value={formData.role_subtitle}
                      onChange={handleInputChange}
                      placeholder="Especialista en JavaScript y Node.js"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="status">Estado</label>
                    <input
                      type="text"
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      placeholder="Disponible para nuevos proyectos"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="about_me">Acerca de mí *</label>
                  <textarea
                    id="about_me"
                    name="about_me"
                    value={formData.about_me}
                    onChange={handleInputChange}
                    required
                    placeholder="Describe tu experiencia, habilidades y objetivos profesionales..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Enlaces Sociales */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <i className="fas fa-link"></i>
                  Enlaces Sociales
                </h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="linkedin_url">LinkedIn</label>
                    <input
                      type="url"
                      id="linkedin_url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/tu-perfil"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="github_url">GitHub</label>
                    <input
                      type="url"
                      id="github_url"
                      name="github_url"
                      value={formData.github_url}
                      onChange={handleInputChange}
                      placeholder="https://github.com/tu-usuario"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <i className="fas fa-times"></i>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ProfileAdmin;
