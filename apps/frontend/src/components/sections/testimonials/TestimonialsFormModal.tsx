// src/components/sections/testimonials/TestimonialsFormModal.tsx

import React, { useState, useEffect } from "react";
import { ModalPortal } from "@cv-maker/ui";
import { useNotification } from "../../../hooks/useNotification";
import styles from "./TestimonialsFormModal.module.css";

export interface TestimonialFormData {
  name: string;
  position: string;
  text: string;
  email: string;
  company: string;
  website: string;
  avatar?: string;
  linkedin?: string;
  phone?: string;
  rating?: number;
}

interface TestimonialsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TestimonialFormData) => void;
  editingData?: TestimonialFormData | null;
  isLoading?: boolean;
}

const emptyForm: TestimonialFormData = {
  name: "",
  position: "",
  text: "",
  email: "",
  company: "",
  website: "",
  avatar: "",
  linkedin: "",
  phone: "",
  rating: 5,
};

const TestimonialsFormModal: React.FC<TestimonialsFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingData,
  isLoading = false,
}) => {
  const [form, setForm] = useState<TestimonialFormData>(emptyForm);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showError } = useNotification();

  // Efecto para cargar datos de edición
  useEffect(() => {
    if (editingData) {
      setForm(editingData);
      // Mostrar campos avanzados si hay datos opcionales
      const hasOptionalData = editingData.company || editingData.website || 
                               editingData.linkedin || editingData.phone;
      setShowAdvancedFields(!!hasOptionalData);
    } else {
      setForm(emptyForm);
      setShowAdvancedFields(false);
    }
    setErrors({});
  }, [editingData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!form.position.trim()) {
      newErrors.position = "El puesto es obligatorio";
    }

    if (!form.text.trim()) {
      newErrors.text = "El testimonio es obligatorio";
    } else if (form.text.length < 20) {
      newErrors.text = "El testimonio debe tener al menos 20 caracteres";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "El formato del email no es válido";
    }

    if (form.website && !form.website.match(/^https?:\/\/.+/)) {
      if (!form.website.includes('.')) {
        newErrors.website = "Introduce una URL válida";
      } else {
        // Agregar https:// automáticamente
        setForm(prev => ({ ...prev, website: `https://${form.website}` }));
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError("Por favor, corrige los errores en el formulario");
      return;
    }

    onSubmit(form);
  };

  const handleClose = () => {
    setForm(emptyForm);
    setShowAdvancedFields(false);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className={styles.modalOverlay} onClick={handleClose}>
        <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerIcon}>
                <i className="fas fa-quote-left"></i>
              </div>
              <div className={styles.headerText}>
                <h2 className={styles.modalTitle}>
                  {editingData ? "Editar Testimonio" : "Nuevo Testimonio"}
                </h2>
                <p className={styles.modalSubtitle}>
                  {editingData 
                    ? "Modifica los datos del testimonio" 
                    : "Comparte tu experiencia y ayuda a otros"
                  }
                </p>
              </div>
            </div>
            <button 
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Cerrar modal"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Form */}
          <div className={styles.modalBody}>
            <form onSubmit={handleSubmit} className={styles.testimonialForm}>
              {/* Campos básicos */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <i className="fas fa-user"></i>
                  Información Básica
                </h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.formLabel}>
                      Nombre completo *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                      placeholder="Tu nombre completo"
                      required
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="position" className={styles.formLabel}>
                      Puesto / Cargo *
                    </label>
                    <input
                      id="position"
                      name="position"
                      type="text"
                      value={form.position}
                      onChange={handleChange}
                      className={`${styles.formInput} ${errors.position ? styles.inputError : ''}`}
                      placeholder="ej. Desarrollador Frontend, CEO"
                      required
                    />
                    {errors.position && <span className={styles.errorText}>{errors.position}</span>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="text" className={styles.formLabel}>
                    Tu testimonio *
                  </label>
                  <textarea
                    id="text"
                    name="text"
                    value={form.text}
                    onChange={handleChange}
                    className={`${styles.formTextarea} ${errors.text ? styles.inputError : ''}`}
                    placeholder="Comparte tu experiencia trabajando conmigo..."
                    rows={4}
                    required
                  />
                  <div className={styles.charCount}>
                    {form.text.length}/500 caracteres
                  </div>
                  {errors.text && <span className={styles.errorText}>{errors.text}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="rating" className={styles.formLabel}>
                    Calificación
                  </label>
                  <div className={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`${styles.starButton} ${star <= (form.rating || 0) ? styles.starActive : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                      >
                        <i className="fas fa-star"></i>
                      </button>
                    ))}
                    <span className={styles.ratingText}>
                      {form.rating}/5 estrellas
                    </span>
                  </div>
                </div>
              </div>

              {/* Toggle para campos avanzados */}
              <div className={styles.toggleSection}>
                <button
                  type="button"
                  className={styles.toggleButton}
                  onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                >
                  <i className={`fas ${showAdvancedFields ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  {showAdvancedFields ? 'Ocultar' : 'Mostrar'} campos opcionales
                </button>
              </div>

              {/* Campos avanzados */}
              {showAdvancedFields && (
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>
                    <i className="fas fa-building"></i>
                    Información Adicional (Opcional)
                  </h3>
                  
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="company" className={styles.formLabel}>
                        Empresa
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        value={form.company}
                        onChange={handleChange}
                        className={styles.formInput}
                        placeholder="Nombre de la empresa"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.formLabel}>
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                        placeholder="tu@email.com"
                      />
                      {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="website" className={styles.formLabel}>
                        Sitio web
                      </label>
                      <input
                        id="website"
                        name="website"
                        type="url"
                        value={form.website}
                        onChange={handleChange}
                        className={`${styles.formInput} ${errors.website ? styles.inputError : ''}`}
                        placeholder="https://tuempresa.com"
                      />
                      {errors.website && <span className={styles.errorText}>{errors.website}</span>}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="linkedin" className={styles.formLabel}>
                        LinkedIn
                      </label>
                      <input
                        id="linkedin"
                        name="linkedin"
                        type="url"
                        value={form.linkedin}
                        onChange={handleChange}
                        className={styles.formInput}
                        placeholder="https://linkedin.com/in/tuperfil"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  <i className="fas fa-times"></i>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                  {editingData ? 'Actualizar' : 'Enviar'} Testimonio
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default TestimonialsFormModal;




