// src/components/sections/profile/ProfileAdmin.tsx

import React, { useState, useEffect, useRef } from "react";
import { getAuthenticatedUserProfile, updateProfile, uploadImage } from "../../../services/api";
import { useNotification } from "../../../hooks/useNotification";
import ModalPortal from "../../common/ModalPortal";
import styles from "./ProfileAdmin.module.css";

interface ProfileAdminProps {
  onClose: () => void;
}

const ProfileAdmin: React.FC<ProfileAdminProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getAuthenticatedUserProfile();
        setFormData({
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
          profile_image: profileData.profile_image || ""
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        showError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [showError]);

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
      setUploadingImage(true);
      const response = await uploadImage(file);
      setFormData(prev => ({
        ...prev,
        profile_image: response.file.url
      }));
      showSuccess("Imagen subida correctamente");
    } catch (error) {
      console.error("Error uploading image:", error);
      showError("Error al subir la imagen");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
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
      await updateProfile(formData);
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
                  <div className={styles.profileImageContainer}>
                    {formData.profile_image ? (
                      <div className={styles.profileImageWrapper}>
                        <img 
                          src={formData.profile_image} 
                          alt="Foto de perfil" 
                          className={styles.profileImage}
                        />
                        <div className={styles.imageOverlay}>
                          <button
                            type="button"
                            className={styles.changeImageButton}
                            onClick={triggerImageUpload}
                            disabled={uploadingImage}
                            title="Cambiar imagen"
                          >
                            <i className="fas fa-camera"></i>
                          </button>
                          <button
                            type="button"
                            className={styles.removeImageButton}
                            onClick={handleRemoveImage}
                            disabled={uploadingImage}
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
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-camera"></i>
                              Subir Foto
                            </>
                          )}
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
