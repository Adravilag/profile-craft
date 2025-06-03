// src/components/sections/skills/components/SkillModal.tsx

import React, { useRef, useEffect, useState } from 'react';
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
      'hard': 'Difícil',
      'very_hard': 'Muy Difícil'
    };
    return translations[difficulty.toLowerCase()] || difficulty;
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
                </div>

                {/* Skill Name Input */}
                <div className={styles.formField}>
                  <label htmlFor="skill-name" className={styles.fieldLabel}>
                    <i className="fas fa-code"></i>
                    Nombre de la habilidad <span className={styles.requiredField}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      id="skill-name"
                      name="name"
                      value={formData.name}
                      onChange={handleNameInput}
                      onFocus={() => formData.category && setNameDropdownOpen(true)}
                      onBlur={handleNameBlur}
                      ref={nameInputRef}
                      autoComplete="off"
                      placeholder={formData.category ? "Selecciona una habilidad..." : "Primero selecciona una categoría"}
                      className={`${styles.formInput} ${!formData.category ? styles.disabled : ''}`}
                      disabled={!formData.category}
                      required
                    />
                    <button
                      type="button"
                      ref={dropdownButtonRef}
                      className={`${styles.inputDropdownBtn} ${nameDropdownOpen ? styles.active : ''} ${!formData.category ? styles.disabled : ''}`}
                      tabIndex={-1}
                      disabled={!formData.category}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (formData.category) {
                          setNameDropdownOpen((v) => !v);
                        }
                      }}
                    >
                      <i className={`fas ${nameDropdownOpen ? 'fa-caret-up' : 'fa-caret-down'}`}></i>
                    </button>
                    
                    {nameDropdownOpen && getFilteredNames().length > 0 && (
                      <div className={styles.dropdownList}>
                        {getFilteredNames().map((n) => {
                          const itemInfo = getDropdownItemInfo(n);
                          const svgPath = itemInfo?.svg_path || '/assets/svg/generic-code.svg';
                          return (
                            <div
                              key={n}
                              className={`${styles.dropdownItem} ${n === formData.name ? styles.dropdownItemSelected : ""}`}
                              onMouseDown={() => handleNameSelect(n)}
                            >
                              <div className={styles.itemIcon}>
                                <img 
                                  src={svgPath} 
                                  alt={`${n} icon`}
                                />
                              </div>
                              <div className={styles.itemInfo}>
                                <span className={styles.itemName}>{n}</span>
                                {itemInfo?.category && (
                                  <span className={styles.itemCategory}>{itemInfo.category}</span>
                                )}
                              </div>
                              {itemInfo?.difficulty_level && (
                                <div className={styles.itemDifficulty}>
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <i 
                                      key={i}
                                      className={i < getDifficultyStars(itemInfo.difficulty_level) ? "fas fa-star filled" : "far fa-star empty"}
                                    ></i>
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
            )}

            {/* Nivel de habilidad */}
            {formData.name && (
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
            )}

            {/* Repositorio de demostración */}
            {formData.name && (
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
              </button>
              <button 
                type="submit" 
                className={`${styles.btn} ${styles.btnPrimary}`}
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