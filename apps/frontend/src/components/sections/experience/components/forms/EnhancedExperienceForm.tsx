// src/components/sections/experience/EnhancedExperienceForm.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNotificationContext } from '@cv-maker/shared';
import styles from "./EnhancedExperienceForm.module.css";

interface FormData {
  title: string;
  company?: string;
  institution?: string;
  start_date: string;
  end_date: string;
  description: string;
  technologies?: string;
  grade?: string;
  order_index: number;
  is_current?: boolean;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

interface EnhancedExperienceFormProps {
  isOpen: boolean;
  onClose: () => void;
  formType: "experience" | "education";
  initialData?: Partial<FormData>;
  isEditing: boolean;
  onSubmit: (data: FormData) => Promise<void>;
}

// Sugerencias de tecnologías
const TECHNOLOGY_SUGGESTIONS = [
  "React", "Vue.js", "Angular", "JavaScript", "TypeScript", "Node.js", "Express.js",
  "Python", "Django", "Flask", "Java", "Spring Boot", "C#", ".NET", "PHP", "Laravel",
  "HTML5", "CSS3", "SASS", "SCSS", "Tailwind CSS", "Bootstrap", "Material-UI",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "Docker", "Kubernetes", "AWS", "Azure",
  "Git", "GitHub", "GitLab", "Jenkins", "Jest", "Cypress", "Webpack", "Vite"
];

const EnhancedExperienceForm: React.FC<EnhancedExperienceFormProps> = ({
  isOpen,
  onClose,
  formType,
  initialData = {},
  isEditing,
  onSubmit
}) => {
  const { showError, showSuccess } = useNotificationContext();
  
  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({
    title: "",
    company: "",
    institution: "",
    start_date: "",
    end_date: "",
    description: "",
    technologies: "",
    grade: "",
    order_index: 0,
    is_current: false,
    ...initialData
  });
  // Estados de validación y UX
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<{[key: string]: boolean}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technologyInput, setTechnologyInput] = useState("");
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [showTechSuggestions, setShowTechSuggestions] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  // Referencias
  const formRef = useRef<HTMLFormElement>(null);
  const techInputRef = useRef<HTMLInputElement>(null);

  // Calcular progreso del formulario
  useEffect(() => {
    const requiredFields = formType === "experience" 
      ? ['title', 'company', 'start_date']
      : ['title', 'institution', 'start_date'];
    
    const filledRequiredFields = requiredFields.filter(field => 
      formData[field as keyof FormData]?.toString().trim()
    ).length;
    
    const optionalFieldsCount = formData.description ? 1 : 0;
    const totalFields = requiredFields.length + 1; // +1 para descripción
    const progress = Math.round(((filledRequiredFields + optionalFieldsCount) / totalFields) * 100);
    
    setFormProgress(progress);
  }, [formData, formType]);

  // Inicializar tecnologías seleccionadas
  useEffect(() => {
    if (formData.technologies) {
      setSelectedTechnologies(
        formData.technologies.split(',').map(tech => tech.trim()).filter(Boolean)
      );
    }
  }, [formData.technologies]);

  // Validación de campos
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'El título es obligatorio';
        if (value.length < 2) return 'El título debe tener al menos 2 caracteres';
        break;
      case 'company':
      case 'institution':
        if (!value.trim()) return `${formType === 'experience' ? 'La empresa' : 'La institución'} es obligatoria`;
        if (value.length < 2) return 'Debe tener al menos 2 caracteres';
        break;
      case 'start_date':
        if (!value) return 'La fecha de inicio es obligatoria';
        break;
      case 'end_date':
        if (!value && !formData.is_current) return 'La fecha de fin es obligatoria';
        if (value && formData.start_date && value < formData.start_date) {
          return 'La fecha de fin debe ser posterior a la de inicio';
        }
        break;
      case 'description':
        if (value.length > 500) return 'La descripción no puede exceder 500 caracteres';
        break;
    }
    return null;
  };

  // Manejar cambios en campos
  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));
      // Validar campo
    const error = validateField(name, value);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name]; // Eliminar la clave si no hay error
      }
      return newErrors;
    });
  };

  // Manejar checkbox "Actualmente"
  const handleCurrentToggle = () => {
    const newCurrentState = !formData.is_current;
    setFormData(prev => ({
      ...prev,
      is_current: newCurrentState,
      end_date: newCurrentState ? "" : prev.end_date
    }));
      if (newCurrentState) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.end_date; // Eliminar error de fecha de fin si está actualmente
        return newErrors;
      });
    }
  };

  // Manejar tecnologías
  const handleTechnologyAdd = (tech: string) => {
    if (tech.trim() && !selectedTechnologies.includes(tech.trim())) {
      const newTechnologies = [...selectedTechnologies, tech.trim()];
      setSelectedTechnologies(newTechnologies);
      setFormData(prev => ({ ...prev, technologies: newTechnologies.join(', ') }));
      setTechnologyInput("");
      setShowTechSuggestions(false);
    }
  };

  const handleTechnologyRemove = (index: number) => {
    const newTechnologies = selectedTechnologies.filter((_, i) => i !== index);
    setSelectedTechnologies(newTechnologies);
    setFormData(prev => ({ ...prev, technologies: newTechnologies.join(', ') }));
  };

  const handleTechnologyInputChange = (value: string) => {
    setTechnologyInput(value);
    setShowTechSuggestions(value.length > 0);
  };

  const handleTechnologyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && technologyInput.trim()) {
      e.preventDefault();
      handleTechnologyAdd(technologyInput);
    }
  };

  // Filtrar sugerencias
  const getFilteredSuggestions = () => {
    return TECHNOLOGY_SUGGESTIONS.filter(tech =>
      tech.toLowerCase().includes(technologyInput.toLowerCase()) &&
      !selectedTechnologies.includes(tech)
    ).slice(0, 8);
  };

  // Validar todo el formulario
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    const requiredFields = formType === "experience" 
      ? [
          { name: 'title', value: formData.title },
          { name: 'company', value: formData.company || '' },
          { name: 'start_date', value: formData.start_date }
        ]
      : [
          { name: 'title', value: formData.title },
          { name: 'institution', value: formData.institution || '' },
          { name: 'start_date', value: formData.start_date }
        ];

    // Validar campos obligatorios
    requiredFields.forEach(({ name, value }) => {
      const error = validateField(name, value);
      if (error) errors[name] = error;
    });

    // Validar fecha de fin si no es actual
    if (!formData.is_current) {
      const endDateError = validateField('end_date', formData.end_date);
      if (endDateError) errors.end_date = endDateError;
    }

    // Validar descripción
    const descError = validateField('description', formData.description);
    if (descError) errors.description = descError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError("Errores de Validación", "Por favor corrige los errores antes de continuar");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      showSuccess(
        `${formType === 'experience' ? 'Experiencia' : 'Educación'} ${isEditing ? 'Actualizada' : 'Creada'}`,
        `Se ha ${isEditing ? 'actualizado' : 'creado'} "${formData.title}" correctamente`
      );
      onClose();
    } catch (error) {
      showError("Error al Guardar", error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.ctrlKey && e.key === 'Enter') {
        handleSubmit(e as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const isExperience = formType === "experience";
  const formTitle = isEditing 
    ? `Editar ${isExperience ? 'Experiencia' : 'Educación'}` 
    : `Nueva ${isExperience ? 'Experiencia' : 'Educación'}`;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* Header con progreso */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTop}>
            <button 
              type="button"
              className={styles.backButton}
              onClick={onClose}
              aria-label="Cerrar formulario"
            >
              <i className="fas fa-times"></i>
            </button>
            <h2 className={styles.modalTitle}>
              <i className={`fas ${isExperience ? 'fa-briefcase' : 'fa-graduation-cap'}`}></i>
              {formTitle}
            </h2>
          </div>
          
          {/* Indicador de progreso */}
          <div className={styles.progressIndicator}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
            <span className={styles.progressText}>
              Completado: {formProgress}%
            </span>
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className={styles.modalContent}>
          <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
            {/* Información Básica */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <i className="fas fa-info-circle"></i>
                Información Básica
              </h3>
              
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.label}>
                    <i className={`fas ${isExperience ? 'fa-briefcase' : 'fa-graduation-cap'}`}></i>
                    {isExperience ? 'Título del puesto' : 'Título o grado'} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className={`${styles.input} ${
                      touchedFields.title && validationErrors.title ? styles.inputError : 
                      touchedFields.title && !validationErrors.title ? styles.inputValid : ''
                    }`}
                    placeholder={isExperience ? "Ej: Desarrollador Full Stack Senior" : "Ej: Grado en Ingeniería Informática"}
                  />
                  <div className={styles.helperText}>
                    {isExperience ? "Especifica tu rol o cargo principal" : "Indica el nombre completo del título"}
                  </div>
                  {touchedFields.title && validationErrors.title && (
                    <div className={styles.errorText}>
                      <i className="fas fa-exclamation-triangle"></i>
                      {validationErrors.title}
                    </div>
                  )}
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>
                    <i className={`fas ${isExperience ? 'fa-building' : 'fa-university'}`}></i>
                    {isExperience ? 'Empresa' : 'Institución'} *
                  </label>
                  <input
                    type="text"
                    value={isExperience ? (formData.company || '') : (formData.institution || '')}
                    onChange={(e) => handleFieldChange(isExperience ? 'company' : 'institution', e.target.value)}
                    className={`${styles.input} ${
                      touchedFields[isExperience ? 'company' : 'institution'] && 
                      validationErrors[isExperience ? 'company' : 'institution'] ? styles.inputError : 
                      touchedFields[isExperience ? 'company' : 'institution'] && 
                      !validationErrors[isExperience ? 'company' : 'institution'] ? styles.inputValid : ''
                    }`}
                    placeholder={isExperience ? "Ej: TechCorp Solutions" : "Ej: Universidad Tecnológica"}
                  />
                  <div className={styles.helperText}>
                    {isExperience ? "Nombre de la empresa u organización" : "Nombre de la universidad o centro educativo"}
                  </div>
                  {touchedFields[isExperience ? 'company' : 'institution'] && 
                   validationErrors[isExperience ? 'company' : 'institution'] && (
                    <div className={styles.errorText}>
                      <i className="fas fa-exclamation-triangle"></i>
                      {validationErrors[isExperience ? 'company' : 'institution']}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Período de Tiempo */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <i className="fas fa-calendar-alt"></i>
                Período de Tiempo
              </h3>
              
              <div className={styles.dateRangeContainer}>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.label}>
                      <i className="fas fa-play"></i>
                      Fecha de inicio *
                    </label>
                    <input
                      type="month"
                      value={formData.start_date}
                      onChange={(e) => handleFieldChange('start_date', e.target.value)}
                      className={`${styles.input} ${
                        touchedFields.start_date && validationErrors.start_date ? styles.inputError : 
                        touchedFields.start_date && !validationErrors.start_date ? styles.inputValid : ''
                      }`}
                    />
                    {touchedFields.start_date && validationErrors.start_date && (
                      <div className={styles.errorText}>
                        <i className="fas fa-exclamation-triangle"></i>
                        {validationErrors.start_date}
                      </div>
                    )}
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.label}>
                      <i className="fas fa-stop"></i>
                      Fecha de fin {!formData.is_current && '*'}
                    </label>
                    <input
                      type="month"
                      value={formData.end_date}
                      onChange={(e) => handleFieldChange('end_date', e.target.value)}
                      disabled={formData.is_current}
                      className={`${styles.input} ${
                        formData.is_current ? styles.inputDisabled :
                        touchedFields.end_date && validationErrors.end_date ? styles.inputError : 
                        touchedFields.end_date && !validationErrors.end_date ? styles.inputValid : ''
                      }`}
                      placeholder={formData.is_current ? "Actualidad" : ""}
                    />
                    {touchedFields.end_date && validationErrors.end_date && (
                      <div className={styles.errorText}>
                        <i className="fas fa-exclamation-triangle"></i>
                        {validationErrors.end_date}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.currentToggle}>
                  <input
                    type="checkbox"
                    id="current-toggle"
                    checked={formData.is_current}
                    onChange={handleCurrentToggle}
                    className={styles.checkbox}
                  />
                  <label htmlFor="current-toggle" className={styles.checkboxLabel}>
                    {isExperience ? 'Trabajo actual' : 'Estudios en curso'}
                  </label>
                </div>
              </div>
            </div>

            {/* Tecnologías (solo para experiencia) */}
            {isExperience && (
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <i className="fas fa-code"></i>
                  Tecnologías y Herramientas
                </h3>
                
                <div className={styles.formField}>
                  <label className={styles.label}>
                    <i className="fas fa-tools"></i>
                    Tecnologías utilizadas
                  </label>
                  
                  <div className={styles.technologyContainer}>
                    <input
                      ref={techInputRef}
                      type="text"
                      value={technologyInput}
                      onChange={(e) => handleTechnologyInputChange(e.target.value)}
                      onKeyDown={handleTechnologyKeyDown}
                      onFocus={() => setShowTechSuggestions(technologyInput.length > 0)}
                      onBlur={() => setTimeout(() => setShowTechSuggestions(false), 200)}
                      className={styles.technologyInput}
                      placeholder="Escribe y presiona Enter para agregar..."
                    />
                    
                    {/* Sugerencias */}
                    {showTechSuggestions && getFilteredSuggestions().length > 0 && (
                      <div className={styles.suggestions}>
                        {getFilteredSuggestions().map((suggestion) => (
                          <div
                            key={suggestion}
                            className={styles.suggestionItem}
                            onClick={() => handleTechnologyAdd(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chips de tecnologías seleccionadas */}
                  {selectedTechnologies.length > 0 && (
                    <div className={styles.technologyChips}>
                      {selectedTechnologies.map((tech, index) => (
                        <span key={index} className={styles.chip}>
                          {tech}
                          <button
                            type="button"
                            onClick={() => handleTechnologyRemove(index)}
                            className={styles.chipRemove}
                            aria-label={`Eliminar ${tech}`}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className={styles.helperText}>
                    Agrega las tecnologías más relevantes de este puesto
                  </div>
                </div>
              </div>
            )}

            {/* Calificación (solo para educación) */}
            {!isExperience && (
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <i className="fas fa-medal"></i>
                  Detalles Académicos
                </h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.label}>
                      <i className="fas fa-star"></i>
                      Calificación
                    </label>
                    <input
                      type="text"
                      value={formData.grade || ''}
                      onChange={(e) => handleFieldChange('grade', e.target.value)}
                      className={styles.input}
                      placeholder="Ej: Sobresaliente, 8.5/10, Matrícula de Honor"
                    />
                    <div className={styles.helperText}>
                      Nota media, mención o reconocimiento obtenido
                    </div>
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.label}>
                      <i className="fas fa-sort-numeric-up"></i>
                      Orden de visualización
                    </label>
                    <input
                      type="number"
                      value={formData.order_index || 0}
                      onChange={(e) => handleFieldChange('order_index', e.target.value)}
                      className={styles.input}
                      min="0"
                      placeholder="0"
                    />
                    <div className={styles.helperText}>
                      Número para ordenar la visualización
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Descripción */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <i className="fas fa-align-left"></i>
                Descripción y Detalles
              </h3>
              
              <div className={styles.formField}>
                <label className={styles.label}>
                  <i className="fas fa-file-text"></i>
                  Descripción
                </label>
                <div className={styles.textareaContainer}>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className={`${styles.textarea} ${
                      touchedFields.description && validationErrors.description ? styles.textareaError : ''
                    }`}
                    rows={5}
                    maxLength={500}
                    placeholder={isExperience 
                      ? "Describe tus responsabilidades, logros y proyectos destacados..."
                      : "Describe la especialización, proyectos destacados, etc..."
                    }
                  />
                  <div className={`${styles.characterCounter} ${
                    formData.description.length > 450 ? styles.warning : 
                    formData.description.length > 480 ? styles.error : ''
                  }`}>
                    {formData.description.length}/500 caracteres
                  </div>
                </div>
                {touchedFields.description && validationErrors.description && (
                  <div className={styles.errorText}>
                    <i className="fas fa-exclamation-triangle"></i>
                    {validationErrors.description}
                  </div>
                )}
                <div className={styles.helperText}>
                  Máximo 500 caracteres. Enfócate en logros y responsabilidades clave
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer sticky con acciones */}
        <div className={styles.stickyFooter}>
          <div className={styles.footerContent}>
            <div className={styles.saveIndicator}>
              {isSubmitting && (
                <>
                  <i className={`fas fa-spinner ${styles.spinning}`}></i>
                  Guardando cambios...
                </>
              )}
            </div>
            
            <div className={styles.actions}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                <i className="fas fa-times"></i>
                Cancelar
              </button>
                <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(validationErrors).length > 0}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                {isSubmitting ? (
                  <>
                    <i className={`fas fa-spinner ${styles.spinning}`}></i>
                    Guardando...
                  </>                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    {isEditing ? 'Guardar Cambios' : `Crear ${isExperience ? 'Experiencia' : 'Educación'}`}
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Indicadores de atajos */}
          <div className={styles.shortcuts}>
            <span><kbd>Esc</kbd> Cerrar</span>
            <span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> Guardar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedExperienceForm;




