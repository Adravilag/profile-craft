import React, { useEffect, useState, useCallback } from "react";
import { getExperiences, createExperience, updateExperience, deleteExperience, getEducation, createEducation, updateEducation, deleteEducation } from "../../../services/api";
import type { Experience, Education } from "../../../services/api";
import { useTimelineAnimation } from "../../../hooks/useTimelineAnimation";
import { useNotificationContext } from '@cv-maker/shared';
import { convertSpanishDateToISO, formatDateRange } from "../../../utils/dateUtils";
import HeaderSection from "../header/HeaderSection";
import ExperienceCard from "./components/cards/ExperienceCard";
import EducationCard from "./components/cards/EducationCard";
import ChronologicalItem from "./components/items/ChronologicalItem";
import { FloatingActionButton, AdminModal } from "@cv-maker/ui";
import EnhancedExperienceForm from "./components/forms/EnhancedExperienceForm";
import "./ExperienceSection.css";

// Hook para detectar móvil
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

interface CombinedItem {
  _id: string; // ID de MongoDB
  id?: number; // Para compatibilidad con código antiguo
  title: string;
  start_date: string;
  end_date: string;
  description?: string;
  type: "experience" | "education";
  company?: string;
  institution?: string;
  technologies?: string[];
  grade?: string;
}

interface ExperienceSectionProps {
  className?: string;
  showAdminFAB?: boolean;
  onAdminClick?: () => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ 
  className,
  showAdminFAB = false,
  onAdminClick
}) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar hook para detectar móvil
  const isMobile = useIsMobile();
  
  const [viewMode, setViewMode] = useState<"traditional" | "chronological">(
    "traditional"
  );
  
  // Establecer vista por defecto basada en el tamaño de pantalla
  useEffect(() => {
    if (isMobile) {
      setViewMode("chronological");
    } else {
      setViewMode("traditional");
    }
  }, [isMobile]);
  
  const [retryCount, setRetryCount] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeAdminSection, setActiveAdminSection] = useState<"experience" | "education">("experience");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<"experience" | "education" | null>(null);
    // Estados para formularios
  const [experienceForm, setExperienceForm] = useState({
    title: "",
    company: "",
    start_date: "",
    end_date: "",
    description: "",
    technologies: "",
    order_index: 0
  });

  const [educationForm, setEducationForm] = useState({
    title: "",
    institution: "",
    start_date: "",
    end_date: "",
    description: "",
    grade: "",
    order_index: 0
  });
  const { showSuccess, showError } = useNotificationContext();
  const timelineRef = useTimelineAnimation();

  // Función para cargar educación
  const loadEducation = useCallback(async () => {
    try {
      const data = await getEducation();
      setEducation(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading education:", err);
      // En caso de error, establecer array vacío para evitar errores de renderizado
      setEducation([]);
      showError("Error", "No se pudo cargar la información de educación");
    }
  }, [showError]);

  // Función para reintentar la carga de experiencias
  const retryLoadExperiences = useCallback(async () => {
    if (retryCount >= 3) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getExperiences();
      setExperiences(data);
      setLoading(false);
      setRetryCount(0);
    } catch (err) {
      setRetryCount(prev => prev + 1);
      setError(`Error al cargar experiencias (Intento ${retryCount + 1}/3)`);
      setLoading(false);
      
      // Auto-retry después de 2 segundos si no hemos alcanzado el límite
      if (retryCount < 2) {
        setTimeout(() => retryLoadExperiences(), 2000);
      }
    }
  }, [retryCount]);

  // Efecto mejorado para cargar experiencias y educación
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar experiencias y educación en paralelo
        const [experiencesData, educationData] = await Promise.allSettled([
          getExperiences(),
          getEducation()
        ]);

        // Procesar experiencias
        if (experiencesData.status === 'fulfilled') {
          setExperiences(Array.isArray(experiencesData.value) ? experiencesData.value : []);
        } else {
          console.error("Error loading experiences:", experiencesData.reason);
          setExperiences([]); // Asegurar que siempre sea un array
          setError("Usando datos de ejemplo para experiencias (API no disponible)");
        }

        // Procesar educación
        if (educationData.status === 'fulfilled') {
          setEducation(Array.isArray(educationData.value) ? educationData.value : []);
        } else {
          console.error("Error loading education:", educationData.reason);
          setEducation([]); // Asegurar que siempre sea un array
          // Llamar a loadEducation que maneja los datos mock
          await loadEducation();
          if (!error) {
            setError("Usando datos de ejemplo para educación (API no disponible)");
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar datos");
        setLoading(false);
      }
    };

    loadData();
  }, [loadEducation]);  // Función para cambiar modo de vista
  const handleViewModeChange = useCallback((mode: "traditional" | "chronological") => {
    setViewMode(mode);
  }, []);
  // Funciones de manejo para administración
  const handleEditExperience = (experience: Experience) => {
    setExperienceForm({
      title: experience.position,
      company: experience.company,
      start_date: experience.start_date, // Mantener formato original de la API
      end_date: experience.end_date,     // Mantener formato original de la API
      description: experience.description || "",
      technologies: experience.technologies?.join(", ") || "",
      order_index: experience.order_index
    });
    setEditingId(experience._id);
    setEditingType("experience");
    setShowForm(true);
  };

  const handleEditEducation = (edu: Education) => {
    setEducationForm({
      title: edu.title,
      institution: edu.institution,
      start_date: edu.start_date,  // Mantener formato original de la API
      end_date: edu.end_date,      // Mantener formato original de la API
      description: edu.description || "",
      grade: edu.grade || "",
      order_index: edu.order_index || 0
    });
    setEditingId(edu.id?.toString() || "");
    setEditingType("education");
    setShowForm(true);
  };

  const handleDeleteExperience = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la experiencia "${title}"?`)) {
      return;
    }
    
    try {
      await deleteExperience(id);
      
      // Actualizar el estado local eliminando el elemento
      setExperiences(prev => Array.isArray(prev) ? prev.filter(exp => exp._id !== id) : []);
      
      showSuccess(
        "Experiencia Eliminada", 
        `Se ha eliminado "${title}" correctamente`
      );
    } catch (error) {
      console.error("Error eliminando experiencia:", error);
      showError("Error", "No se pudo eliminar la experiencia laboral");
    }
  };

  const handleDeleteEducation = async (id: number | string, title: string) => {
    if (!id) {
      showError("Error", "ID de educación no válido");
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la formación "${title}"?`)) {
      return;
    }
    
    try {
      // Convertir ID a string para la API
      await deleteEducation(String(id));
      
      // Actualizar el estado local eliminando el elemento
      setEducation(prev => Array.isArray(prev) ? prev.filter(edu => 
        edu.id !== id && edu._id !== String(id)
      ) : []);
      
      showSuccess(
        "Formación Eliminada", 
        `Se ha eliminado "${title}" correctamente`
      );
    } catch (error) {
      console.error("Error eliminando educación:", error);
      showError("Error", "No se pudo eliminar la formación académica");
    }
  };
  const handleNewItem = () => {
    clearForms(); // Limpiar formularios antes de crear nuevo
    setEditingId(null);
    setEditingType(activeAdminSection);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setEditingType(null);
    clearForms(); // Limpiar formularios al cerrar
  };

  // Funciones de administración para el modal común
  const renderExperienceList = () => {
    if (!Array.isArray(experiences) || experiences.length === 0) {
      return (
        <div className="admin-empty">
          <i className="fas fa-briefcase"></i>
          <h3>No hay experiencias</h3>
          <p>Añade la primera experiencia laboral usando el botón flotante.</p>
        </div>
      );
    }

    return (
      <div className="admin-items-list">
        {experiences
          .sort((a, b) => {
            const dateA = parseDate(a.end_date);
            const dateB = parseDate(b.end_date);
            return dateB - dateA; // Ordenamiento descendente por fecha de fin (más reciente primero)
          })
          .map((experience) => (
          <div key={experience._id} className="admin-item-card">
            <div className="admin-item-header">
              <div className="admin-item-image">
                <div className="admin-item-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
              </div>
              <div className="admin-item-info">
                <h3 className="admin-item-title">{experience.position}</h3>
                <p className="admin-item-subtitle">{experience.company}</p>                <div className="admin-exp-metadata">
                  <div className="admin-item-date">
                    <i className="fas fa-calendar-alt"></i>
                    <span>{formatDateRange(experience.start_date, experience.end_date)}</span>
                  </div>
                </div>
                {experience.description && (
                  <div className="admin-item-description">
                    <p>{experience.description.length > 100 ? 
                        `${experience.description.substring(0, 100)}...` : 
                        experience.description}
                    </p>
                  </div>
                )}
                {experience.technologies && experience.technologies.length > 0 && (                  <div className="admin-item-technologies">
                    <div className="admin-tech-list">
                      {experience.technologies.map((tech, index) => (
                        <span key={index} className="admin-tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="admin-item-actions">
              <button 
                className="admin-btn-secondary"
                onClick={() => handleEditExperience(experience)}
              >
                <i className="fas fa-edit"></i>
                Editar
              </button>
              <button 
                className="admin-btn-danger"
                onClick={() => handleDeleteExperience(experience._id, experience.position)}
              >
                <i className="fas fa-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };  const renderEducationList = () => {
    if (!Array.isArray(education) || education.length === 0) {
      return (
        <div className="admin-empty">
          <i className="fas fa-graduation-cap"></i>
          <h3>No hay formación académica</h3>
          <p>Añade la primera formación académica usando el botón flotante.</p>
        </div>
      );
    }

    return (
      <div className="admin-items-list">
        {education
          .sort((a, b) => {
            const dateA = parseDate(a.end_date);
            const dateB = parseDate(b.end_date);
            return dateB - dateA; // Ordenamiento descendente por fecha de fin (más reciente primero)
          })
          .map((edu) => (
          <div key={edu._id || edu.id} className="admin-item-card">
            <div className="admin-item-header">
              <div className="admin-item-image">
                <div className="admin-item-icon">
                  <i className="fas fa-graduation-cap"></i>
                </div>
              </div>
              <div className="admin-item-info">
                <h3 className="admin-item-title">{edu.title}</h3>
                <p className="admin-item-subtitle">{edu.institution}</p>
                <div className="admin-edu-metadata">
                  <div className="admin-item-date">
                    <i className="fas fa-calendar-alt"></i>
                    <span>{formatDateRange(edu.start_date, edu.end_date)}</span>
                  </div>
                  {edu.grade && (                    <div className="admin-item-grade">
                      <i className="fas fa-medal"></i>
                      <span>{edu.grade}</span>
                    </div>
                  )}
                </div>
                {edu.description && (
                  <div className="admin-item-description">
                    <p>{edu.description.length > 100 ? 
                        `${edu.description.substring(0, 100)}...` : 
                        edu.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="admin-item-actions">
              <button 
                className="admin-btn-secondary"
                onClick={() => handleEditEducation(edu)}
              >
                <i className="fas fa-edit"></i>
                Editar
              </button>
              <button 
                className="admin-btn-danger"
                onClick={() => {
                  const eduId = edu._id || edu.id;
                  if (eduId) {
                    handleDeleteEducation(eduId, edu.title);
                  }
                }}
              >
                <i className="fas fa-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };  // Función para convertir fecha "Mes Año" a número para ordenamiento
  const parseDate = (dateString: string | null | undefined): number => {
    // Validar que dateString no sea null, undefined o vacío
    if (!dateString || dateString.trim() === "") {
      return 0; // Valor por defecto para fechas inválidas
    }
    
    if (dateString === "Presente") {
      return new Date().getFullYear() * 12 + new Date().getMonth();
    }
    
    // Si es solo año (formato legacy)
    if (/^\d{4}$/.test(dateString)) {
      return parseInt(dateString) * 12;
    }
    
    // Si es formato "Mes Año"
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const parts = dateString.split(' ');
    if (parts.length >= 2) {
      const [monthStr, yearStr] = parts;
      const monthIndex = months.indexOf(monthStr);
      const year = parseInt(yearStr);
      
      if (monthIndex !== -1 && !isNaN(year)) {
        return year * 12 + monthIndex;
      }
    }
    
    // Fallback: intentar parsear como año
    const fallbackYear = parseInt(dateString);
    return !isNaN(fallbackYear) ? fallbackYear * 12 : 0;
  };

  // Función para manejar el envío del formulario mejorado
  const handleEnhancedFormSubmit = async (formData: any) => {
    try {
      const isExperience = editingType === "experience";
      
      if (isExperience) {
        const experienceData = {
          position: formData.title, // La API espera 'position' no 'title'
          company: formData.company,
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description,
          technologies: formData.technologies ? formData.technologies.split(",").map((tech: string) => tech.trim()).filter((tech: string) => tech) : [],
          is_current: formData.end_date === "" || formData.end_date === "Presente",
          order_index: formData.order_index,
          user_id: "1" // Por ahora fijo, se debe obtener del contexto de auth cuando esté implementado
        };

        if (editingId) {
          // Actualizar experiencia existente usando API
          const updatedExperience = await updateExperience(editingId, experienceData);
          const updatedExperiences = experiences.map(exp => 
            exp._id === editingId 
              ? { ...exp, ...updatedExperience }
              : exp
          );
          setExperiences(updatedExperiences);
          showSuccess("Experiencia Actualizada", `Se ha actualizado "${experienceData.position}" correctamente`);
        } else {
          // Crear nueva experiencia usando API
          const newExperience = await createExperience(experienceData as any);
          setExperiences([...experiences, newExperience]);
          showSuccess("Nueva Experiencia Creada", `Se ha creado "${newExperience.position}" correctamente`);
        }
      } else {
        // Manejar educación
        const educationData = {
          title: formData.title,
          institution: formData.institution,
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description,
          grade: formData.grade,
          order_index: formData.order_index,
          user_id: 1 // Por ahora fijo, se debe obtener del contexto de auth cuando esté implementado
        };

        if (editingId) {
          // Actualizar educación existente
          const updatedEducation = await updateEducation(parseInt(editingId), educationData);
          const updatedEducationList = (Array.isArray(education) ? education : []).map(edu => {
            const eduId = (edu._id || edu.id)?.toString();
            return eduId === editingId ? { ...edu, ...updatedEducation } : edu;
          });
          setEducation(updatedEducationList);
          showSuccess("Educación Actualizada", `Se ha actualizado "${educationData.title}" correctamente`);
        } else {
          // Crear nueva educación
          const newEducation = await createEducation(educationData);
          setEducation([...(Array.isArray(education) ? education : []), newEducation]);
          showSuccess("Nueva Formación Académica Creada", `Se ha creado "${newEducation.title}" correctamente`);
        }
      }

      // Limpiar formulario y cerrar
      handleCloseForm();
      
    } catch (error) {
      console.error("Error al guardar:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      const isExperience = editingType === "experience";
      showError("Error al Guardar", `No se pudo guardar ${isExperience ? 'la experiencia' : 'la educación'}: ${errorMessage}`);
    }
  };

  // Función para limpiar formularios
  const clearForms = () => {
    setExperienceForm({
      title: "",
      company: "",
      start_date: "",
      end_date: "",
      description: "",
      technologies: "",
      order_index: 0
    });
    
    setEducationForm({
      title: "",
      institution: "",
      start_date: "",
      end_date: "",
      description: "",
      grade: "",
      order_index: 0
    });
  };

  // Función para renderizar formulario usando el formulario mejorado
  const renderForm = () => {
    const isExperience = editingType === "experience";
    const formData = isExperience ? experienceForm : educationForm;

    // Preparar datos iniciales para el formulario mejorado
    // Solo convertir si las fechas están en formato español, si ya están en ISO las mantenemos
    const processDateForForm = (dateStr: string) => {
      if (!dateStr) return '';
      // Si ya está en formato ISO simple (YYYY-MM o YYYY-MM-DD), no convertir
      if (/^\d{4}-\d{2}(-\d{2})?$/.test(dateStr)) {
        return dateStr;
      }
      // Si está en formato ISO completo (con timestamp), convertir a formato simple para formularios
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(dateStr)) {
        return convertSpanishDateToISO(dateStr);
      }
      // Si está en formato español, convertir a ISO
      return convertSpanishDateToISO(dateStr);
    };

    const initialData = {
      title: formData.title,
      company: isExperience ? experienceForm.company : undefined,
      institution: !isExperience ? educationForm.institution : undefined,
      start_date: processDateForForm(formData.start_date),
      end_date: processDateForForm(formData.end_date),
      description: formData.description,
      technologies: isExperience ? experienceForm.technologies : undefined,
      grade: !isExperience ? educationForm.grade : undefined,
      order_index: formData.order_index,
      is_current: formData.end_date === "Actualmente" || formData.end_date === "Presente"
    };

    return (
      <EnhancedExperienceForm
        isOpen={true}
        onClose={handleCloseForm}
        formType={editingType as "experience" | "education"}
        initialData={initialData}
        isEditing={!!editingId}
        onSubmit={handleEnhancedFormSubmit}
      />
    );
  };

  // Función para renderizar el contenido de administración
  const renderAdminContent = () => {
    if (showForm) {
      return renderForm();
    }

    if (activeAdminSection === "experience") {
      return loading ? (
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando experiencias...</p>
        </div>
      ) : renderExperienceList();
    } else {
      return renderEducationList();
    }
  };

  // Estados de carga y error mejorados
  if (loading) {
    return (
      <div className={`cv-section ${className || ''}`}>
        <div className="experience-loading">
          <div className="loading-spinner"></div>
          <p>Cargando experiencia y formación...</p>
          <div className="loading-details">
            <small>Obteniendo datos del servidor...</small>
          </div>
        </div>
      </div>
    );
  }

  if (error && experiences.length === 0) {
    return (
      <div className={`cv-section ${className || ''}`}>
        <div className="experience-error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={retryLoadExperiences}
            disabled={retryCount >= 3}
          >
            <i className="fas fa-redo"></i>
            {retryCount >= 3 ? 'Límite de reintentos alcanzado' : 'Reintentar'}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={`section-cv ${className || ''}`} id="experience">
      <HeaderSection
        icon="fas fa-route"
        title="Trayectoria Profesional"
        subtitle="Un recorrido por mi experiencia laboral y formación académica, mostrando las tecnologías y logros más relevantes."
        className="experience"
        showNotification={!!(error && experiences.length > 0)}
        notificationMessage={error || undefined}
        notificationIcon="fas fa-info-circle"
      />
      
      <div className="section-container" ref={timelineRef}>
        {/* Botones de Vista mejorados */}
        <div className="view-toggle-container">
          <button
            className={`view-toggle-btn ${
              viewMode === "traditional" ? "active" : ""
            }`}
            onClick={() => handleViewModeChange("traditional")}
            aria-label="Vista por categorías"
          >
            <i className="fas fa-columns"></i>
            <span>Vista por Categorías</span>
          </button>
          <button
            className={`view-toggle-btn ${
              viewMode === "chronological" ? "active" : ""
            }`}
            onClick={() => handleViewModeChange("chronological")}
            aria-label="Vista cronológica"
          >
            <i className="fas fa-clock"></i>
            <span>Vista Cronológica</span>
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="experience-stats">
          <div className="stat-item">
            <span className="stat-number">{experiences.length}</span>
            <span className="stat-label">Experiencias</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{Array.isArray(education) ? education.length : 0}</span>
            <span className="stat-label">Certificaciones</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {Array.isArray(experiences) ? experiences.reduce((acc, exp) => acc + (exp.technologies?.length || 0), 0) : 0}
            </span>
            <span className="stat-label">Tecnologías</span>
          </div>
        </div>        {/* Vista Tradicional - 2 Columnas con Componentes Modulares */}
        {viewMode === "traditional" && (
          <div className="experience-grid traditional-view">
            {/* Columna de Experiencia Laboral */}
            <div className="experience-column">
              <div className="column-header">
                <div className="column-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
                <h3 className="column-title strong-contrast">
                  Experiencia Laboral
                </h3>
              </div>              <div className="timeline-container">
                {Array.isArray(experiences) ? experiences
                  .sort((a, b) => {
                    // Validar que las fechas existan antes de intentar parsearlas
                    const dateA = a.end_date ? parseDate(a.end_date) : 0;
                    const dateB = b.end_date ? parseDate(b.end_date) : 0;
                    return dateB - dateA; // Ordenamiento descendente por fecha de fin (más reciente primero)
                  })
                  .map((exp, index) => (
                    <ExperienceCard
                      key={exp._id}
                      experience={exp}
                      index={index}
                    />
                  )) : <div>Cargando experiencias...</div>}
              </div>
            </div>

            {/* Columna de Educación */}
            <div className="education-column">
              <div className="column-header">
                <div className="column-icon">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h3 className="column-title strong-contrast">
                  Formación Académica
                </h3>
              </div>              <div className="timeline-container">
                {(Array.isArray(education) ? education : [])
                  .sort((a, b) => {
                    const dateA = parseDate(a.end_date);
                    const dateB = parseDate(b.end_date);
                    return dateB - dateA; // Ordenamiento descendente por fecha de fin (más reciente primero)
                  })
                  .map((edu, index) => (
                    <EducationCard
                      key={edu._id || edu.id || index}
                      education={edu}
                      index={index + (Array.isArray(experiences) ? experiences.length : 0)}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}        {/* Vista Cronológica - Timeline Unificado */}
        {viewMode === "chronological" && (
          <div className="chronological-view">
            <div className="chronological-timeline">
              <div className="timeline-line"></div>
              
              {/* Timeline unificado con todas las experiencias y educación */}
              {(() => {
                // Combinar experiencias y educación
                const combinedItems: CombinedItem[] = [
                  ...(Array.isArray(experiences) ? experiences : []).map((exp): CombinedItem => ({
                    _id: exp._id,
                    title: exp.position, // En experiencias, el título es 'position'
                    start_date: exp.start_date,
                    end_date: exp.end_date,
                    description: exp.description,
                    type: "experience" as const,
                    company: exp.company,
                    technologies: exp.technologies,
                  })),
                  ...(Array.isArray(education) ? education : []).map((edu): CombinedItem => ({
                    _id: (edu._id || edu.id)?.toString() || "", // Convertir ID a string
                    id: typeof edu.id === 'number' ? edu.id : undefined,
                    title: edu.title,
                    start_date: edu.start_date,
                    end_date: edu.end_date,
                    description: edu.description,
                    type: "education" as const,
                    institution: edu.institution,
                    grade: edu.grade,
                  }))
                ];

                // Ordenar por fecha de fin (de mayor a menor - más reciente primero)
                const sortedItems = combinedItems.sort((a, b) => {
                  // Validar que las fechas existan antes de intentar parsearlas
                  const dateA = a.end_date ? parseDate(a.end_date) : 0;
                  const dateB = b.end_date ? parseDate(b.end_date) : 0;
                  return dateB - dateA; // Ordenamiento descendente (más reciente primero)
                });

                return sortedItems.map((item, index) => (
                  <ChronologicalItem
                    key={`${item.type}-${item._id || String(item.id)}`}
                    item={item}
                    index={index}
                    position={index % 2 === 0 ? "left" : "right"}
                  />
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Botón flotante para administración */}
      {showAdminFAB && (
        <FloatingActionButton
          onClick={() => {
            setShowAdminModal(true);
            onAdminClick?.();
          }}
          icon="fas fa-cog"
          label="Administrar Experiencia"
          position="bottom-right"
          color="primary"
          ariaLabel="Administrar experiencia laboral"
        />
      )}      {/* Modal de administración */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title="Administración de Trayectoria"
        icon="fas fa-route"
        maxWidth="1300px"
        height="88vh"
        tabs={[
          {
            id: "experience",
            label: "Experiencia Laboral",
            icon: "fas fa-briefcase",
            content: null
          },
          {
            id: "education",
            label: "Formación Académica",
            icon: "fas fa-graduation-cap",
            content: null
          }
        ]}
        activeTab={activeAdminSection}
        onTabChange={(tabId: string) => setActiveAdminSection(tabId as "experience" | "education")}
        showTabs={true}
        floatingActions={showForm ? [
          {
            id: "cancel-form",
            label: "Cancelar",
            icon: "fas fa-times",
            onClick: handleCloseForm,
            variant: "secondary"
          },
          {
            id: "save-form",
            label: editingId ? "Guardar Cambios" : `Crear ${activeAdminSection === "experience" ? "Experiencia" : "Educación"}`,
            icon: "fas fa-save",
            onClick: () => {
              const form = document.querySelector('.admin-form') as HTMLFormElement;
              if (form) {
                form.requestSubmit();
              }
            },
            variant: "primary"
          }
        ] : [
          {
            id: "new-item",
            label: `Nueva ${activeAdminSection === "experience" ? "Experiencia" : "Educación"}`,
            icon: "fas fa-plus",
            onClick: handleNewItem,
            variant: "primary"
          }
        ]}
      >
        <div className="admin-content-wrapper">          {/* Contenido principal */}
          <div className="admin-main-content">
            {renderAdminContent()}
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default ExperienceSection;




