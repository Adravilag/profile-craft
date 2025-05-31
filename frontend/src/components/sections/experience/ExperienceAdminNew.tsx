// src/components/sections/experience/ExperienceAdminNew.tsx

import React, { useState, useEffect } from "react";
import {
  getExperiences,
  deleteExperience,
  type Experience,
} from "../../../services/api";
import { useNotification } from "../../../hooks/useNotification";
import AdminModal, { type TabConfig } from "../../ui/AdminModal";

interface Education {
  id: number;
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
}

interface ExperienceAdminNewProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExperienceAdminNew: React.FC<ExperienceAdminNewProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"experience" | "education">("experience");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useNotification();

  // Mock data para educación
  const mockEducation: Education[] = [
    {
      id: 1,
      title: "Grado en Ingeniería Informática",
      institution: "Universidad Tecnológica",
      start_date: "2018",
      end_date: "2022",
      description: "Especialización en Desarrollo de Software y Sistemas Distribuidos.",
      grade: "Sobresaliente",
    },
    {
      id: 2,
      title: "Máster en Desarrollo Web Full Stack",
      institution: "Escuela de Programación Avanzada",
      start_date: "2022",
      end_date: "2023",
      description: "Especialización en tecnologías modernas de desarrollo web.",
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
    setEducation(mockEducation);
  };
  useEffect(() => {
    if (isOpen) {
      loadExperiences();
      loadEducation();
    }
  }, [isOpen]);

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
    showSuccess("Educación eliminada", "La educación se ha eliminado correctamente (simulado)");
  };
  const handleNewItem = (type: "experience" | "education") => {
    // TODO: Implementar formulario para nuevos elementos
    console.log(`Crear nuevo elemento de tipo: ${type}`);
  };
  const renderExperiencesList = () => {
    if (loading) {
      return (
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando experiencias...</p>
        </div>
      );
    }

    if (experiences.length === 0) {
      return (
        <div className="admin-empty">
          <i className="fas fa-briefcase"></i>
          <h3>No hay experiencias</h3>
          <p>Añade la primera experiencia laboral usando el botón de arriba.</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {experiences.map((experience) => (
          <div 
            key={experience.id}
            style={{
              background: 'linear-gradient(135deg, var(--md-sys-color-surface-container-low) 0%, var(--md-sys-color-surface-container) 100%)',
              border: '1px solid var(--md-sys-color-outline-variant)',
              borderRadius: '20px',
              padding: '28px',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '600', color: 'var(--md-sys-color-on-surface)' }}>
                {experience.title}
              </h3>
              <p style={{ margin: '0 0 8px 0', color: 'var(--md-sys-color-primary)', fontWeight: '500' }}>
                {experience.company}
              </p>
              <p style={{ margin: '0 0 12px 0', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fas fa-calendar-alt"></i>
                {experience.start_date} - {experience.end_date}
              </p>
              {experience.technologies && experience.technologies.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  {experience.technologies.map((tech, index) => (
                    <span 
                      key={index}
                      style={{
                        background: 'linear-gradient(135deg, var(--md-sys-color-secondary-container) 0%, var(--md-sys-color-tertiary-container) 100%)',
                        color: 'var(--md-sys-color-on-secondary-container)',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="admin-btn-secondary">
                <i className="fas fa-edit"></i>
                Editar
              </button>
              <button 
                className="admin-btn-danger"
                onClick={() => handleDeleteExperience(experience.id, experience.title)}
              >
                <i className="fas fa-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  const renderEducationList = () => {
    if (loading) {
      return (
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando formación académica...</p>
        </div>
      );
    }

    if (education.length === 0) {
      return (
        <div className="admin-empty">
          <i className="fas fa-graduation-cap"></i>
          <h3>No hay formación académica</h3>
          <p>Añade la primera formación académica usando el botón de arriba.</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {education.map((edu) => (
          <div 
            key={edu.id}
            style={{
              background: 'linear-gradient(135deg, var(--md-sys-color-surface-container-low) 0%, var(--md-sys-color-surface-container) 100%)',
              border: '1px solid var(--md-sys-color-outline-variant)',
              borderRadius: '20px',
              padding: '28px',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '600', color: 'var(--md-sys-color-on-surface)' }}>
                {edu.title}
              </h3>
              <p style={{ margin: '0 0 8px 0', color: 'var(--md-sys-color-primary)', fontWeight: '500' }}>
                {edu.institution}
              </p>
              <p style={{ margin: '0 0 12px 0', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fas fa-calendar-alt"></i>
                {edu.start_date} - {edu.end_date}
              </p>
              {edu.grade && (
                <p style={{ margin: '0 0 12px 0', color: 'var(--md-sys-color-tertiary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                  <i className="fas fa-medal"></i>
                  {edu.grade}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="admin-btn-secondary">
                <i className="fas fa-edit"></i>
                Editar
              </button>
              <button 
                className="admin-btn-danger"
                onClick={() => handleDeleteEducation(edu.title)}
              >
                <i className="fas fa-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs: TabConfig[] = [
    {
      id: 'experience',
      label: 'Experiencia Laboral',
      icon: 'fas fa-briefcase',
      content: renderExperiencesList()
    },
    {
      id: 'education',
      label: 'Formación Académica',
      icon: 'fas fa-graduation-cap',
      content: renderEducationList()
    }
  ];

  const toolbarActions = (
    <button 
      className="admin-btn-primary"
      onClick={() => handleNewItem(activeTab as "experience" | "education")}
    >
      <i className="fas fa-plus"></i>
      Nueva {activeTab === "experience" ? "Experiencia" : "Educación"}
    </button>
  );
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Administración de Trayectoria"
      icon="fas fa-route"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as "experience" | "education")}
      toolbarActions={toolbarActions}
      maxWidth="1300px"
      height="88vh"
    />
  );
};

export default ExperienceAdminNew;
