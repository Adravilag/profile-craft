// src/components/sections/skills/components/SkillModal.tsx

import React, { useRef, useEffect, useState } from 'react';
import ModalPortal from '../../../common/ModalPortal';
import type { SkillModalProps } from '../types/skills';
import { getDifficultyStars } from '../utils/skillUtils';

const SkillModal: React.FC<SkillModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  editingId,
  skillsIcons,
  skillNames
}) => {
  const [nameDropdownOpen, setNameDropdownOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  // Función para filtrar nombres con información adicional
  const getFilteredNames = () => {
    let filteredNames = skillNames;
    
    // Filtrar por categoría seleccionada si no es "All" o "Todas"
    if (formData.category && formData.category !== "All" && formData.category !== "Todas") {
      filteredNames = skillNames.filter((name) => {
        const skillInfo = skillsIcons.find(
          s => s.name.toLowerCase() === name.toLowerCase()
        );
        return skillInfo?.category === formData.category;
      });
    }
    
    // Filtrar por texto de búsqueda si hay alguno
    if (formData.name) {
      filteredNames = filteredNames.filter((n) =>
        n.toLowerCase().includes(formData.name.toLowerCase())
      );
    }
    
    // Limitar a 4 items para mejor visualización
    return filteredNames.slice(0, 4);
  };

  // Función para obtener información de un item del dropdown
  const getDropdownItemInfo = (name: string) => {
    return skillsIcons.find(
      s => s.name.toLowerCase() === name.toLowerCase()
    );
  };

  // Obtener información de la skill seleccionada del CSV
  const getSelectedSkillInfo = () => {
    return skillsIcons.find(
      s => s.name.toLowerCase() === formData.name.toLowerCase()
    );
  };

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        nameInputRef.current && 
        dropdownRef.current && 
        dropdownButtonRef.current &&
        !nameInputRef.current.contains(target) &&
        !dropdownRef.current.contains(target) &&
        !dropdownButtonRef.current.contains(target)
      ) {
        setNameDropdownOpen(false);
      }
    };

    if (nameDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [nameDropdownOpen]);

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormChange(e);
    if (e.target.value.trim() === '') {
      setNameDropdownOpen(false);
    } else {
      setNameDropdownOpen(true);
    }
  };

  const handleNameSelect = (name: string) => {
    // Crear un evento sintético para el cambio de nombre
    const syntheticEvent = {
      target: { name: 'name', value: name }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onFormChange(syntheticEvent);
    setNameDropdownOpen(false);
    nameInputRef.current?.focus();
  };

  const handleNameBlur = () => {
    // Retrasar el cierre para permitir la selección con el mouse
    setTimeout(() => {
      setNameDropdownOpen(false);
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="modal-overlay skill-modal-overlay" onClick={onClose}>
        <div className="modal-content skill-form-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header mejorado con visual dinámico */}
          <div className="skill-form-header">
            <div className="header-main">
              <div className="header-icon">
                <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus-circle'}`}></i>
              </div>
              <div className="header-info">
                <h2 className="modal-title">
                  {editingId ? "Editar Habilidad" : "Nueva Habilidad"}
                </h2>
                <p className="modal-subtitle">
                  {editingId 
                    ? "Actualiza la información de tu habilidad"
                    : "Añade una nueva habilidad a tu perfil profesional"
                  }
                </p>
              </div>
            </div>
            <button className="skill-modal-close" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={onSubmit} className="skill-form" autoComplete="off">
            <div className="skill-form-body">
              {/* Campos principales */}
              <div className="form-section-skills">
              <h3 className="section-title-skills">
                <i className="fas fa-info-circle"></i>
                Información básica
              </h3>
              
              <div className="form-grid">
                {/* Category Select */}
                <div className="form-field">
                  <label htmlFor="skill-category" className="field-label">
                    <i className="fas fa-folder"></i>
                    Categoría
                  </label>
                  <div className="select-wrapper">
                    <select
                      id="skill-category"
                      name="category"
                      value={formData.category}
                      onChange={onFormChange}
                      className="form-select"
                    >
                      {["Todas", "Frontend", "Backend", "DevOps & Tools", "Data Science", "Mobile", "Cloud", "Testing", "UI/UX", "Security", "AI", "Other"]
                        .filter(category => {
                          // Siempre mostrar "Todas" y la categoría actualmente seleccionada
                          if (category === "Todas" || category === formData.category) return true;
                          
                          // Mostrar categorías que tienen skills en el CSV
                          return skillsIcons.some(skill => skill.category === category);
                        })
                        .map(category => (
                          <option key={category} value={category}>
                            {category === "Todas" ? "🔍 Todas las categorías" : category}
                          </option>
                        ))
                      }
                    </select>
                    <i className="fas fa-chevron-down select-arrow"></i>
                  </div>
                </div>

                {/* Skill Name Input */}
                <div className="form-field">
                  <label htmlFor="skill-name" className="field-label">
                    <i className="fas fa-code"></i>
                    Nombre de la habilidad
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="skill-name"
                      name="name"
                      value={formData.name}
                      onChange={handleNameInput}
                      onFocus={() => setNameDropdownOpen(true)}
                      onBlur={handleNameBlur}
                      ref={nameInputRef}
                      autoComplete="off"
                      placeholder="Ej: React, TypeScript, Node.js..."
                      className="form-input"
                      required
                    />
                    <button
                      type="button"
                      ref={dropdownButtonRef}
                      className={`input-dropdown-btn ${nameDropdownOpen ? 'active' : ''}`}
                      tabIndex={-1}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNameDropdownOpen((v) => !v);
                      }}
                    >
                      <i className={`fas ${nameDropdownOpen ? 'fa-caret-up' : 'fa-caret-down'}`}></i>
                    </button>
                    
                    {nameDropdownOpen && getFilteredNames().length > 0 && (
                      <div className="dropdown-list">
                        {getFilteredNames().map((n) => {
                          const itemInfo = getDropdownItemInfo(n);
                          const svgPath = itemInfo?.svg_path || '/assets/svg/generic-code.svg';
                          return (
                            <div
                              key={n}
                              className={`dropdown-item ${n === formData.name ? "selected" : ""}`}
                              onMouseDown={() => handleNameSelect(n)}
                            >
                              <div className="item-icon">
                                <img 
                                  src={svgPath} 
                                  alt={`${n} icon`}
                                />
                              </div>
                              <div className="item-info">
                                <span className="item-name">{n}</span>
                                {itemInfo?.category && (
                                  <span className="item-category">{itemInfo.category}</span>
                                )}
                              </div>
                              {itemInfo?.difficulty_level && (
                                <div className="item-difficulty">
                                  {Array.from({ length: getDifficultyStars(itemInfo.difficulty_level) }).map((_, i) => (
                                    <i key={i}></i>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview de skill seleccionada (si existe) */}
            {formData.name && getSelectedSkillInfo() && (
              <div className="skill-form-preview">
                <div className="preview-header">
                  <div className="skill-preview-icon">
                    <img 
                      src={getSelectedSkillInfo()?.svg_path || '/assets/svg/generic-code.svg'} 
                      alt={`${formData.name} icon`}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/svg/generic-code.svg';
                      }}
                    />
                  </div>
                  <div className="preview-meta">
                    <h4 className="preview-skill-name">{formData.name}</h4>
                    <span className="preview-category">{getSelectedSkillInfo()?.category}</span>
                  </div>
                  {getSelectedSkillInfo()?.difficulty_level && (
                    <div className="preview-difficulty">
                      <div className="difficulty-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i 
                            key={i}
                            className={
                              i < getDifficultyStars(getSelectedSkillInfo()?.difficulty_level || '') 
                                ? "fas fa-star filled" 
                                : "fas fa-star empty"
                            }
                          ></i>
                        ))}
                      </div>
                      <span className="difficulty-label">{getSelectedSkillInfo()?.difficulty_level}</span>
                    </div>
                  )}
                </div>
                
                {(getSelectedSkillInfo()?.docs_url || getSelectedSkillInfo()?.official_repo) && (
                  <div className="preview-links">
                    {getSelectedSkillInfo()?.docs_url && (
                      <a 
                        href={getSelectedSkillInfo()?.docs_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="preview-link docs"
                      >
                        <i className="fas fa-book"></i>
                        <span>Documentación</span>
                      </a>
                    )}
                    {getSelectedSkillInfo()?.official_repo && (
                      <a 
                        href={getSelectedSkillInfo()?.official_repo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="preview-link repo"
                      >
                        <i className="fa-brands fa-github"></i>
                        <span>Repositorio</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Nivel de habilidad */}
            {formData.name && (
              <div className="form-section-skills">
                <h3 className="section-title-skills">
                  <i className="fas fa-chart-line"></i>
                  Nivel de dominio
                </h3>
                
                <div className="level-section">
                  <div className="level-header">
                    <span className="level-label">Tu nivel en {formData.name}</span>
                    <div className="level-value">
                      <span className="level-percentage">{formData.level ?? 50}%</span>
                      <span className="level-text">
                        {formData.level === undefined || formData.level < 25 ? 'Básico' :
                         formData.level < 50 ? 'Intermedio' :
                         formData.level < 75 ? 'Avanzado' : 'Experto'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="level-slider-container">
                    <input
                      id="skill-level"
                      name="level"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formData.level ?? 50}
                      onChange={onFormChange}
                      className="level-slider"
                    />
                    <div className="slider-track"></div>
                    <div className="level-markers">
                      <span className="marker">Básico</span>
                      <span className="marker">Intermedio</span>
                      <span className="marker">Avanzado</span>
                      <span className="marker">Experto</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
            
            {/* Botones de acción */}
            <div className="skill-form-footer">
              <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                <i className="fas fa-times"></i>
                <span>Cancelar</span>
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={!formData.name.trim() && !editingId}
              >
                <i className={editingId ? "fas fa-save" : "fas fa-plus"}></i>
                <span>{editingId ? "Guardar Cambios" : "Añadir Habilidad"}</span>
              </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default SkillModal;