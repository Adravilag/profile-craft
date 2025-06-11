import React, { useState } from 'react';
import { useInitialSetup } from '../../contexts/InitialSetupContext';
import { useNotificationContext } from '../../contexts/NotificationContext';
import styles from './InitialSetupForm.module.css';

interface FormData {
  name: string;
  email: string;
  role_title: string;
  role_subtitle: string;
  about_me: string;
  phone: string;
  location: string;
  linkedin_url: string;
  github_url: string;
}

interface FormErrors {
  [key: string]: string;
}

const InitialSetupForm: React.FC = () => {
  const { saveInitialSetup, isLoading } = useInitialSetup();
  const { showSuccess, showError } = useNotificationContext();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role_title: '',
    role_subtitle: '',
    about_me: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar campos del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Campos obligatorios
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    if (!formData.role_title.trim()) {
      newErrors.role_title = 'El título profesional es obligatorio';
    }

    if (!formData.about_me.trim()) {
      newErrors.about_me = 'La descripción personal es obligatoria';
    } else if (formData.about_me.length < 50) {
      newErrors.about_me = 'La descripción debe tener al menos 50 caracteres';
    }

    // Validaciones opcionales
    if (formData.linkedin_url && !formData.linkedin_url.includes('linkedin.com')) {
      newErrors.linkedin_url = 'URL de LinkedIn no válida';
    }

    if (formData.github_url && !formData.github_url.includes('github.com')) {
      newErrors.github_url = 'URL de GitHub no válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo si está siendo editado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Error de validación', 'Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveInitialSetup(formData);
      showSuccess(
        '¡Configuración completada!', 
        'Tu perfil ha sido configurado exitosamente'
      );
    } catch (error) {
      console.error('Error guardando configuración:', error);
      showError(
        'Error al guardar', 
        'No se pudo guardar la configuración. Inténtalo de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.setupContainer}>
      <div className={styles.setupBackground}>
        <div className={styles.backgroundPattern}></div>
      </div>
      
      <div className={styles.setupContent}>
        <div className={styles.setupHeader}>
          <div className={styles.logoContainer}>
            <i className="fas fa-user-cog" aria-hidden="true"></i>
          </div>
          <h1 className={styles.title}>¡Bienvenido a ProfileCraft!</h1>
          <p className={styles.subtitle}>
            Configuremos tu perfil profesional en unos simples pasos
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.setupForm}>
          {/* Información básica */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <i className="fas fa-user" aria-hidden="true"></i>
              Información Personal
            </h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Nombre completo *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder="Tu nombre completo"
                disabled={isSubmitting || isLoading}
              />
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email profesional *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="tu.email@ejemplo.com"
                disabled={isSubmitting || isLoading}
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>
          </div>

          {/* Información profesional */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <i className="fas fa-briefcase" aria-hidden="true"></i>
              Información Profesional
            </h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="role_title" className={styles.label}>
                Título profesional *
              </label>
              <input
                type="text"
                id="role_title"
                name="role_title"
                value={formData.role_title}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.role_title ? styles.inputError : ''}`}
                placeholder="ej. Full Stack Developer"
                disabled={isSubmitting || isLoading}
              />
              {errors.role_title && <span className={styles.errorText}>{errors.role_title}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="role_subtitle" className={styles.label}>
                Especialidad
              </label>
              <input
                type="text"
                id="role_subtitle"
                name="role_subtitle"
                value={formData.role_subtitle}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="ej. Especialista en React y Node.js"
                disabled={isSubmitting || isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="about_me" className={styles.label}>
                Descripción profesional *
              </label>
              <textarea
                id="about_me"
                name="about_me"
                value={formData.about_me}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.about_me ? styles.inputError : ''}`}
                placeholder="Describe tu experiencia, habilidades y objetivos profesionales..."
                rows={4}
                disabled={isSubmitting || isLoading}
              />
              <div className={styles.charCounter}>
                {formData.about_me.length}/50 mínimo
              </div>
              {errors.about_me && <span className={styles.errorText}>{errors.about_me}</span>}
            </div>
          </div>

          {/* Información de contacto */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <i className="fas fa-address-book" aria-hidden="true"></i>
              Información de Contacto
            </h2>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="+34 123 456 789"
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="location" className={styles.label}>
                  Ubicación
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Madrid, España"
                  disabled={isSubmitting || isLoading}
                />
              </div>
            </div>
          </div>

          {/* Redes sociales */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <i className="fab fa-linkedin" aria-hidden="true"></i>
              Redes Profesionales
            </h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="linkedin_url" className={styles.label}>
                LinkedIn
              </label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.linkedin_url ? styles.inputError : ''}`}
                placeholder="https://linkedin.com/in/tu-perfil"
                disabled={isSubmitting || isLoading}
              />
              {errors.linkedin_url && <span className={styles.errorText}>{errors.linkedin_url}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="github_url" className={styles.label}>
                GitHub
              </label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.github_url ? styles.inputError : ''}`}
                placeholder="https://github.com/tu-usuario"
                disabled={isSubmitting || isLoading}
              />
              {errors.github_url && <span className={styles.errorText}>{errors.github_url}</span>}
            </div>
          </div>

          {/* Botón de envío */}
          <div className={styles.submitSection}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinner}></span>
                  Guardando configuración...
                </>
              ) : (
                <>
                  <i className="fas fa-rocket" aria-hidden="true"></i>
                  Completar Configuración
                </>
              )}
            </button>
            
            <p className={styles.note}>
              * Campos obligatorios. Podrás modificar toda esta información más tarde.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InitialSetupForm;
