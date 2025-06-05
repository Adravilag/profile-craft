// src/components/sections/skills/components/SkillModal.tsx

import React, { useEffect, useRef, useMemo, useState } from 'react';
import ModalPortal from '../../../common/ModalPortal';
import type { SkillModalProps } from '../types/skills';
import { getDifficultyStars } from '../utils/skillUtils';
import styles from './SkillModal.module.css';

const SkillModal: React.FC<SkillModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  editingId,
  skillsIcons
}) => {// Limpiar estado al cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      // Reset form si es necesario
    }
  }, [isOpen]);  // Ref para el input
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Estado para el dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');  // Filtrar skills disponibles basado en la categoría seleccionada y texto de búsqueda
  const filteredSkills = useMemo(() => {
    if (!formData.category) return [];
    
    let skills = [];
    
    // Si es "Todas", mostrar todas las habilidades
    if (formData.category === "Todas") {
      skills = skillsIcons.slice(0, 100);
    } else {
      skills = skillsIcons.filter(skill => skill.category === formData.category).slice(0, 50);
    }
    
    // Filtrar por texto de búsqueda si existe
    if (searchText) {
      skills = skills.filter(skill => 
        skill.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return skills;
  }, [skillsIcons, formData.category, searchText]);

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    // Actualizar el formData
    onFormChange(e);
    
    // Mostrar dropdown si hay texto y categoría seleccionada
    if (value && formData.category && filteredSkills.length > 0) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  // Manejar focus en el input
  const handleInputFocus = () => {
    if (formData.category && filteredSkills.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  // Manejar selección de skill
  const handleSkillSelect = (skill: any) => {
    const event = {
      target: { name: 'name', value: skill.name }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onFormChange(event);
    setSearchText(skill.name);
    setIsDropdownOpen(false);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sincronizar searchText con formData.name
  useEffect(() => {
    setSearchText(formData.name);
  }, [formData.name]);
  // Resetear y limpiar el nombre cuando cambia la categoría (solo si realmente cambia)
  useEffect(() => {
    // Solo limpiar si no estamos editando Y hay una categoría válida seleccionada
    // Y el nombre actual no pertenece a la nueva categoría
    if (formData.category && formData.category !== "Todas" && !editingId && formData.name) {
      const currentSkillInfo = skillsIcons.find(
        s => s.name.toLowerCase() === formData.name.toLowerCase()
      );
      
      // Solo limpiar si la skill actual no pertenece a la categoría seleccionada
      if (currentSkillInfo && currentSkillInfo.category !== formData.category) {
        const clearEvent = {
          target: { name: 'name', value: '' }
        } as React.ChangeEvent<HTMLInputElement>;
        onFormChange(clearEvent);
      }
    }
  }, [formData.category, editingId]); // Removidas dependencias que pueden causar loops  // Función para obtener información de la skill seleccionada
  const getSelectedSkillInfo = () => {
    if (!formData.name) return null;
    
    // Búsqueda exacta primero
    let skillInfo = skillsIcons.find(
      s => s.name.toLowerCase() === formData.name.toLowerCase()
    );
    
    // Si no encuentra exacta, buscar la más similar
    if (!skillInfo) {
      skillInfo = skillsIcons.find(
        s => s.name.toLowerCase().includes(formData.name.toLowerCase()) ||
             formData.name.toLowerCase().includes(s.name.toLowerCase())
      );
    }
      return skillInfo;
  };
  // Verificar si debemos mostrar el preview y otros elementos
  const shouldShowSkillElements = () => {
    return formData.name && 
           formData.name !== "__custom__" && 
           formData.name.trim().length > 0;
  };

  // Verificar si debemos mostrar elementos que requieren datos de la skill
  const shouldShowSkillDataElements = () => {
    return shouldShowSkillElements() && getSelectedSkillInfo();
  };

  // Función para traducir niveles de dificultad
  const translateDifficultyLevel = (difficulty: string) => {
    const translations: { [key: string]: string } = {
      'beginner': 'Principiante',
      'intermediate': 'Intermedio',
      'advanced': 'Avanzado',
      'expert': 'Experto',
      'basic': 'Básico',
      'easy': 'Fácil',
      'medium': 'Intermedio',
      'hard': 'Avanzado'
    };
    return translations[difficulty.toLowerCase()] || difficulty;
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className={`${styles.modalOverlay} ${styles.skillModalOverlay}`} onClick={onClose}>
        <div className={styles.skillFormModal} onClick={(e) => e.stopPropagation()}>
          {/* Header mejorado con visual dinámico */}
          <div className={styles.skillFormHeader}>
            <div className={styles.headerMain}>
              <div className={styles.headerIcon}>
                <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus-circle'}`}></i>
              </div>
              <div className={styles.headerInfo}>
                <h2 className={styles.formTitle}>
                  {editingId ? "Editar Habilidad" : "Nueva Habilidad"}
                </h2>
                <p className={styles.modalSubtitle}>
                  {editingId 
                    ? "Actualiza la información de tu habilidad"
                    : "Añade una nueva habilidad a tu perfil profesional"
                  }
                </p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={onSubmit} className={styles.skillForm} autoComplete="off">
            <div className={styles.skillFormBody}>
              {/* Campos principales */}
              <div className={styles.formSectionSkills}>
                <h3 className={styles.sectionTitleSkills}>
                  <i className="fas fa-info-circle"></i>
                  Información básica
                </h3>
                
                <div className={styles.formGrid}>
                  {/* Category Select */}
                  <div className={styles.formField}>
                    <label htmlFor="skill-category" className={styles.fieldLabel}>
                      <i className="fas fa-folder"></i>
                      Categoría <span className={styles.requiredField}>*</span>
                    </label>
                    <div className={styles.selectWrapper}>
                      <select
                        id="skill-category"
                        name="category"
                        value={formData.category}
                        onChange={onFormChange}
                        className={styles.formSelect}
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
                      <i className={`fas fa-chevron-down ${styles.selectArrow}`}></i>
                    </div>
                  </div>                  {/* Skill Name - Input con datalist */}
                  <div className={styles.formField}>
                    <label htmlFor="skill-name" className={styles.fieldLabel}>
                      <i className="fas fa-code"></i>
                      Nombre de la habilidad <span className={styles.requiredField}>*</span>
                    </label>
                      <div className={styles.inputWrapper} ref={dropdownRef}>
                      <input
                        ref={inputRef}
                        id="skill-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        placeholder={!formData.category 
                          ? "Primero selecciona una categoría" 
                          : "Escribe o selecciona una habilidad..."
                        }
                        className={styles.formInput}
                        disabled={!formData.category}
                        required
                        autoComplete="off"
                      />
                      <i className="fas fa-search" style={{ 
                        position: 'absolute', 
                        right: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        color: '#666', 
                        pointerEvents: 'none' 
                      }}></i>
                      
                      {/* Dropdown con resultados */}
                      {isDropdownOpen && filteredSkills.length > 0 && (
                        <div className={styles.skillDropdown}>
                          {filteredSkills.slice(0, 20).map((skill) => (
                            <div
                              key={skill.name}
                              className={styles.skillOption}
                              onClick={() => handleSkillSelect(skill)}
                            >
                              <div className={styles.skillOptionIcon}>
                                <img 
                                  src={skill.svg_path || '/assets/svg/generic-code.svg'} 
                                  alt=""
                                  onError={(e) => {
                                    e.currentTarget.src = '/assets/svg/generic-code.svg';
                                  }}
                                />
                              </div>
                              <div className={styles.skillOptionInfo}>
                                <span className={styles.skillOptionName}>{skill.name}</span>
                                <span className={styles.skillOptionCategory}>{skill.category}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                      {formData.category && (
                      <div className={styles.fieldHint}>
                        <i className="fas fa-info-circle"></i>
                        <span>
                          {filteredSkills.length > 0 
                            ? `${filteredSkills.length} habilidades disponibles${formData.category !== "Todas" ? ` en ${formData.category}` : ""}`
                            : "Puedes escribir una habilidad personalizada"
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>              {/* Preview de skill seleccionada (solo si encontramos datos de la skill) */}
              {shouldShowSkillDataElements() && (
                <div className={styles.skillFormPreview}>
                  <div className={styles.previewHeader}>
                    <div className={styles.skillPreviewIcon}>
                      <img 
                        src={getSelectedSkillInfo()?.svg_path || '/assets/svg/generic-code.svg'} 
                        alt={`${formData.name} icon`}
                        onError={(e) => {
                          e.currentTarget.src = '/assets/svg/generic-code.svg';
                        }}
                      />
                    </div>
                    <div className={styles.previewMeta}>
                      <h4 className={styles.previewSkillName}>{formData.name}</h4>
                      <span className={styles.previewCategory}>{getSelectedSkillInfo()?.category}</span>
                    </div>
                    {getSelectedSkillInfo()?.difficulty_level && (
                      <div className={styles.previewDifficulty}>
                        <div className={styles.difficultyStars}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i 
                              key={i}
                              className={`
                                ${styles.star}
                                ${i < getDifficultyStars(getSelectedSkillInfo()?.difficulty_level || '') ? styles.filled : styles.empty}
                                ${i < getDifficultyStars(getSelectedSkillInfo()?.difficulty_level || '') ? "fas fa-star" : "far fa-star"}
                              `}
                            ></i>
                          ))}
                        </div>
                        <span className={styles.difficultyLabel}>{translateDifficultyLevel(getSelectedSkillInfo()?.difficulty_level || '')}</span>
                      </div>
                    )}
                  </div>
                  
                  {(getSelectedSkillInfo()?.docs_url || getSelectedSkillInfo()?.official_repo || formData.demo_url) && (
                    <div className={styles.previewLinks}>
                      {getSelectedSkillInfo()?.docs_url && (
                        <a 
                          href={getSelectedSkillInfo()?.docs_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`${styles.previewLink} ${styles.docs}`}
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
                          className={`${styles.previewLink} ${styles.repo}`}
                        >
                          <i className="fa-brands fa-github"></i>
                          <span>Repositorio Oficial</span>
                        </a>
                      )}
                      {formData.demo_url && (
                        <a 
                          href={formData.demo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`${styles.previewLink} ${styles.demo}`}
                        >
                          <i className="fas fa-external-link-alt"></i>
                          <span>Mi Proyecto</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}              {/* Nivel de habilidad */}
              {shouldShowSkillElements() && (
                <div className={styles.formSectionSkills}>
                  <h3 className={styles.sectionTitleSkills}>
                    <i className="fas fa-chart-line"></i>
                    Nivel de dominio
                  </h3>
                  
                  <div className={styles.levelSection}>
                    <div className={styles.levelHeader}>
                      <span className={styles.levelLabel}>Tu nivel en {formData.name}</span>
                      <div className={styles.levelValue}>
                        <span className={styles.levelPercentage}>{formData.level ?? 50}%</span>
                        <span 
                          className={styles.levelText}
                          data-level={
                            formData.level === undefined || formData.level <= 25 ? 'basic' :
                            formData.level <= 50 ? 'intermediate' :
                            formData.level <= 75 ? 'advanced' : 'expert'
                          }
                        >
                          {formData.level === undefined || formData.level <= 25 ? 'Básico' :
                           formData.level <= 50 ? 'Intermedio' :
                           formData.level <= 75 ? 'Avanzado' : 'Experto'}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.sliderContainer}>
                      <input
                        id="skill-level"
                        name="level"
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={formData.level ?? 50}
                        onChange={onFormChange}
                        className={styles.slider}
                      />
                      <div className={styles.levelMarkers}>
                        <span className={styles.marker}>Básico</span>
                        <span className={styles.marker}>Intermedio</span>
                        <span className={styles.marker}>Avanzado</span>
                        <span className={styles.marker}>Experto</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}              {/* Repositorio de demostración */}
              {shouldShowSkillElements() && (
                <div className={styles.formSectionSkills}>
                  <h3 className={styles.sectionTitleSkills}>
                    <i className="fa-brands fa-github"></i>
                    Repositorio de demostración
                  </h3>
                  
                  <div className={styles.formField}>
                    <label htmlFor="demo-url" className={styles.fieldLabel}>
                      <i className="fas fa-link"></i>
                      URL del repositorio (opcional)
                    </label>
                    <input
                      id="demo-url"
                      name="demo_url"
                      type="url"
                      value={formData.demo_url || ''}
                      onChange={onFormChange}
                      className={styles.formInput}
                      placeholder="https://github.com/tu-usuario/tu-repositorio"
                    />
                    <div className={styles.fieldHint}>
                      <i className="fas fa-info-circle"></i>
                      <span>Enlace a un proyecto donde demuestres el uso de esta tecnología</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Botones de acción */}
            <div className={styles.skillFormFooter}>
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={onClose}
                >
                  <i className="fas fa-times"></i>
                  <span>Cancelar</span>
                </button>                <button 
                  type="submit" 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={!formData.name.trim()}
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
