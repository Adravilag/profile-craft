// src/components/sections/experience/ExperienceAdmin.tsx

import React, { useState, useEffect } from "react";
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  type Experience,
} from "../../../services/api";
import { useNotification } from "../../../hooks/useNotification";
import ModalPortal from "../../common/ModalPortal";
import "./ExperienceAdmin.css";
import "../../styles/modal.css";

interface Education {
  id: number;
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
}

interface ExperienceAdminProps {
  onClose: () => void;
}

const ExperienceAdmin: React.FC<ExperienceAdminProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<"experience" | "education">("experience");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<"experience" | "education">("experience");
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Estados del formulario para experiencia
  const [experienceForm, setExperienceForm] = useState({
    title: "",
    company: "",
    start_date: "",
    end_date: "",
    description: "",
    technologies: [] as string[],
    order_index: 0,
  });

  // Estados del formulario para educación
  const [educationForm, setEducationForm] = useState({
    title: "",
    institution: "",
    start_date: "",
    end_date: "",
    description: "",
    grade: "",
    order_index: 0,
  });

  const emptyExperienceForm = {
    title: "",
    company: "",
    start_date: "",
    end_date: "",
    description: "",
    technologies: [] as string[],
    order_index: 0,
  };

  const emptyEducationForm = {
    title: "",
    institution: "",
    start_date: "",
    end_date: "",
    description: "",
    grade: "",
    order_index: 0,
  };

  // Mock data para educación (temporal hasta implementar API)
  const mockEducation: Education[] = [
    {
      id: 1,
      title: "Grado en Ingeniería Informática",
      institution: "Universidad Tecnológica",
      start_date: "2018",
      end_date: "2022",
      description: "Especialización en Desarrollo de Software y Sistemas Distribuidos. Enfoque en arquitecturas modernas, bases de datos y metodologías ágiles.",
      grade: "Sobresaliente",
    },
    {
      id: 2,
      title: "Máster en Desarrollo Web Full Stack",
      institution: "Escuela de Programación Avanzada",
      start_date: "2022",
      end_date: "2023",
      description: "Especialización en tecnologías modernas de desarrollo web, incluyendo React, Node.js, bases de datos NoSQL y despliegue en la nube.",
      grade: "Excelente",
    },
  ];

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const data = await getExperiences();
      setExperiences(data);
    } catch (error) {
      console.error("Error cargando experiencias:", error);
      showError("Error", "No se pudieron cargar las experiencias");
    } finally {
      setLoading(false);
    }
  };

  const loadEducation = async () => {
    // Por ahora usamos datos mock, después implementar API
    setEducation(mockEducation);
  };

  useEffect(() => {
    loadExperiences();
    loadEducation();
  }, []);

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExperienceForm(prev => ({ 
      ...prev, 
      [name]: name === "order_index" ? parseInt(value) || 0 : value 
    }));
  };

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEducationForm(prev => ({ 
      ...prev, 
      [name]: name === "order_index" ? parseInt(value) || 0 : value 
    }));
  };

  const handleTechnologyAdd = (tech: string) => {
    if (tech.trim() && !experienceForm.technologies.includes(tech.trim())) {
      setExperienceForm(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech.trim()]
      }));
    }
  };

  const handleTechnologyRemove = (index: number) => {
    setExperienceForm(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingType === "experience") {
      await handleExperienceSubmit();
    } else {
      await handleEducationSubmit();
    }
  };

  const handleExperienceSubmit = async () => {
    if (!experienceForm.title.trim() || !experienceForm.company.trim() || !experienceForm.start_date.trim()) {
      showError("Error de validación", "Título, empresa y fecha de inicio son obligatorios");
      return;
    }

    try {
      setSaving(true);
      
      const experienceData = {
        ...experienceForm,
        user_id: 1,
        order_index: experienceForm.order_index || experiences.length,
      };

      if (editingId) {
        await updateExperience(editingId, experienceData);
        showSuccess("Experiencia actualizada", "Los cambios se han guardado correctamente");
      } else {
        await createExperience(experienceData);
        showSuccess("Experiencia creada", "La nueva experiencia se ha añadido correctamente");
      }

      await loadExperiences();
      handleCloseForm();
    } catch (error) {
      console.error("Error guardando experiencia:", error);
      showError("Error", "No se pudo guardar la experiencia");
    } finally {
      setSaving(false);
    }
  };

  const handleEducationSubmit = async () => {
    if (!educationForm.title.trim() || !educationForm.institution.trim() || !educationForm.start_date.trim()) {
      showError("Error de validación", "Título, institución y fecha de inicio son obligatorios");
      return;
    }

    try {
      setSaving(true);
      
      // Por ahora solo simulamos el guardado de educación
      // TODO: Implementar API para educación
      
      showSuccess("Educación guardada", "Los cambios se han guardado correctamente (simulado)");
      handleCloseForm();
    } catch (error) {
      console.error("Error guardando educación:", error);
      showError("Error", "No se pudo guardar la educación");
    } finally {
      setSaving(false);
    }
  };

  const handleEditExperience = (experience: Experience) => {
    setExperienceForm({
      title: experience.title,
      company: experience.company,
      start_date: experience.start_date,
      end_date: experience.end_date,
      description: experience.description || "",
      technologies: experience.technologies || [],
      order_index: experience.order_index,
    });
    setEditingId(experience.id);
    setEditingType("experience");
    setShowForm(true);
  };

  const handleEditEducation = (edu: Education) => {
    setEducationForm({
      title: edu.title,
      institution: edu.institution,
      start_date: edu.start_date,
      end_date: edu.end_date,
      description: edu.description || "",
      grade: edu.grade || "",
      order_index: edu.id, // Usando id temporal
    });
    setEditingId(edu.id);
    setEditingType("education");
    setShowForm(true);
  };

  const handleDeleteExperience = async (id: number, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la experiencia "${title}"?`)) {
      return;
    }

    try {
      await deleteExperience(id);
      showSuccess("Experiencia eliminada", "La experiencia se ha eliminado correctamente");
      await loadExperiences();
    } catch (error) {
      console.error("Error eliminando experiencia:", error);
      showError("Error", "No se pudo eliminar la experiencia");
    }
  };
  const handleDeleteEducation = async (title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la educación "${title}"?`)) {
      return;
    }

    // TODO: Implementar API para eliminar educación
    showSuccess("Educación eliminada", "La educación se ha eliminado correctamente (simulado)");
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setExperienceForm(emptyExperienceForm);
    setEducationForm(emptyEducationForm);
    setEditingId(null);
  };

  const handleNewItem = (type: "experience" | "education") => {
    if (type === "experience") {
      setExperienceForm({
        ...emptyExperienceForm,
        order_index: experiences.length,
      });
    } else {
      setEducationForm({
        ...emptyEducationForm,
        order_index: education.length,
      });
    }
    setEditingId(null);
    setEditingType(type);
    setShowForm(true);
  };

  return (
    <ModalPortal>
      <div className="experience-admin-overlay">
        <div className="experience-admin-modal">
          <div className="admin-header">
            <h2>
              <i className="fas fa-route"></i>
              Administración de Trayectoria
            </h2>
            <button className="close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Tabs para experiencia y educación */}
          <div className="admin-tabs">
            <button 
              className={`tab-btn ${activeTab === "experience" ? "active" : ""}`}
              onClick={() => setActiveTab("experience")}
            >
              <i className="fas fa-briefcase"></i>
              Experiencia Laboral
            </button>
            <button 
              className={`tab-btn ${activeTab === "education" ? "active" : ""}`}
              onClick={() => setActiveTab("education")}
            >
              <i className="fas fa-graduation-cap"></i>
              Formación Académica
            </button>
          </div>

          <div className="admin-toolbar">
            <button 
              className="new-item-btn"
              onClick={() => handleNewItem(activeTab)}
            >
              <i className="fas fa-plus"></i>
              Nueva {activeTab === "experience" ? "Experiencia" : "Educación"}
            </button>
          </div>

          <div className="admin-content">
            {loading ? (
              <div className="loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Cargando datos...</p>
              </div>
            ) : (
              <>
                {/* Panel de Experiencia */}
                {activeTab === "experience" && (
                  <>
                    {experiences.length === 0 ? (
                      <div className="empty-state">
                        <i className="fas fa-briefcase"></i>
                        <h3>No hay experiencias</h3>
                        <p>Añade la primera experiencia laboral usando el botón de arriba.</p>
                      </div>
                    ) : (
                      <div className="items-list">
                        {experiences.map((experience) => (
                          <div key={experience.id} className="admin-item-card">
                            <div className="item-header">
                              <div className="item-info">
                                <h3>{experience.title}</h3>
                                <p className="company">{experience.company}</p>
                                <p className="date">
                                  <i className="fas fa-calendar-alt"></i>
                                  {experience.start_date} - {experience.end_date}
                                </p>
                                {experience.technologies && experience.technologies.length > 0 && (
                                  <div className="technologies">
                                    {experience.technologies.map((tech, index) => (
                                      <span key={index} className="tech-tag">{tech}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="item-actions">
                              <button
                                className="action-btn edit-btn"
                                onClick={() => handleEditExperience(experience)}
                              >
                                <i className="fas fa-edit"></i>
                                Editar
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteExperience(experience.id, experience.title)}
                              >
                                <i className="fas fa-trash"></i>
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Panel de Educación */}
                {activeTab === "education" && (
                  <>
                    {education.length === 0 ? (
                      <div className="empty-state">
                        <i className="fas fa-graduation-cap"></i>
                        <h3>No hay formación académica</h3>
                        <p>Añade la primera formación académica usando el botón de arriba.</p>
                      </div>
                    ) : (
                      <div className="items-list">
                        {education.map((edu) => (
                          <div key={edu.id} className="admin-item-card">
                            <div className="item-header">
                              <div className="item-info">
                                <h3>{edu.title}</h3>
                                <p className="institution">{edu.institution}</p>
                                <p className="date">
                                  <i className="fas fa-calendar-alt"></i>
                                  {edu.start_date} - {edu.end_date}
                                </p>
                                {edu.grade && (
                                  <p className="grade">
                                    <i className="fas fa-medal"></i>
                                    {edu.grade}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="item-actions">
                              <button
                                className="action-btn edit-btn"
                                onClick={() => handleEditEducation(edu)}
                              >
                                <i className="fas fa-edit"></i>
                                Editar
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteEducation(edu.title)}
                              >
                                <i className="fas fa-trash"></i>
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Modal de formulario */}
          {showForm && (
            <div className="form-modal-overlay">
              <div className="form-modal">
                <div className="form-header">
                  <h3>
                    <i className={`fas fa-${editingType === "experience" ? "briefcase" : "graduation-cap"}`}></i>
                    {editingId ? 
                      `Editar ${editingType === "experience" ? "Experiencia" : "Educación"}` : 
                      `Nueva ${editingType === "experience" ? "Experiencia" : "Educación"}`
                    }
                  </h3>
                  <button className="close-btn" onClick={handleCloseForm}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="item-form">
                  {editingType === "experience" ? (
                    <>
                      {/* Formulario de Experiencia */}
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="exp-title">Título del puesto *</label>
                          <input
                            type="text"
                            id="exp-title"
                            name="title"
                            value={experienceForm.title}
                            onChange={handleExperienceChange}
                            required
                            placeholder="Ej: Desarrollador Full Stack Senior"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="exp-company">Empresa *</label>
                          <input
                            type="text"
                            id="exp-company"
                            name="company"
                            value={experienceForm.company}
                            onChange={handleExperienceChange}
                            required
                            placeholder="Ej: TechCorp Solutions"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="exp-start">Fecha de inicio *</label>
                          <input
                            type="text"
                            id="exp-start"
                            name="start_date"
                            value={experienceForm.start_date}
                            onChange={handleExperienceChange}
                            required
                            placeholder="Ej: 2023, Enero 2023"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="exp-end">Fecha de fin</label>
                          <input
                            type="text"
                            id="exp-end"
                            name="end_date"
                            value={experienceForm.end_date}
                            onChange={handleExperienceChange}
                            placeholder="Ej: Presente, Diciembre 2024"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group full-width">
                          <label htmlFor="exp-description">Descripción</label>
                          <textarea
                            id="exp-description"
                            name="description"
                            value={experienceForm.description}
                            onChange={handleExperienceChange}
                            rows={4}
                            placeholder="Describe tus responsabilidades y logros en este puesto..."
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group full-width">
                          <label>Tecnologías</label>
                          <div className="technologies-input">
                            <input
                              type="text"
                              placeholder="Añadir tecnología..."
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleTechnologyAdd((e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                            />
                            <div className="technologies-list">
                              {experienceForm.technologies.map((tech, index) => (
                                <span key={index} className="tech-tag">
                                  {tech}
                                  <button
                                    type="button"
                                    onClick={() => handleTechnologyRemove(index)}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Formulario de Educación */}
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="edu-title">Título *</label>
                          <input
                            type="text"
                            id="edu-title"
                            name="title"
                            value={educationForm.title}
                            onChange={handleEducationChange}
                            required
                            placeholder="Ej: Grado en Ingeniería Informática"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="edu-institution">Institución *</label>
                          <input
                            type="text"
                            id="edu-institution"
                            name="institution"
                            value={educationForm.institution}
                            onChange={handleEducationChange}
                            required
                            placeholder="Ej: Universidad Tecnológica"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="edu-start">Fecha de inicio *</label>
                          <input
                            type="text"
                            id="edu-start"
                            name="start_date"
                            value={educationForm.start_date}
                            onChange={handleEducationChange}
                            required
                            placeholder="Ej: 2018"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="edu-end">Fecha de fin</label>
                          <input
                            type="text"
                            id="edu-end"
                            name="end_date"
                            value={educationForm.end_date}
                            onChange={handleEducationChange}
                            placeholder="Ej: 2022, En curso"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="edu-grade">Calificación</label>
                          <input
                            type="text"
                            id="edu-grade"
                            name="grade"
                            value={educationForm.grade}
                            onChange={handleEducationChange}
                            placeholder="Ej: Sobresaliente, 8.5/10"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group full-width">
                          <label htmlFor="edu-description">Descripción</label>
                          <textarea
                            id="edu-description"
                            name="description"
                            value={educationForm.description}
                            onChange={handleEducationChange}
                            rows={4}
                            placeholder="Describe la especialización, proyectos destacados, etc..."
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={handleCloseForm}
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
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
                          {editingId ? "Guardar Cambios" : `Crear ${editingType === "experience" ? "Experiencia" : "Educación"}`}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
};

export default ExperienceAdmin;
