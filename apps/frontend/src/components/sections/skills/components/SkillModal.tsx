// src/components/sections/skills/components/SkillModal.tsx

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ModalPortal } from '@cv-maker/ui';
import type { SkillModalProps } from '../types/skills';
import { getSkillSvg } from '../utils/skillUtils';

import styles from './SkillModal.module.css';

const SkillModal: React.FC<SkillModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  editingId,
  skillsIcons
}) => {
  // Ref para el input
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownPortalRef = useRef<HTMLDivElement>(null);
  
  // Estado para el dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Establecer "Todas" como categoría por defecto al abrir el modal
  useEffect(() => {
    if (isOpen && !formData.category && !editingId) {
      const defaultCategoryEvent = {
        target: { name: 'category', value: 'Todas' }
      } as React.ChangeEvent<HTMLSelectElement>;
      onFormChange(defaultCategoryEvent);
    }
  }, [isOpen, editingId, formData.category, onFormChange]);

  // Limpiar estado al cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      setIsDropdownOpen(false);
      setSearchText('');
    }
  }, [isOpen]);

  // Filtrar skills disponibles basado en la categoría seleccionada y texto de búsqueda
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

  // Calcular posición del dropdown
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  };

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    console.log('Input change - valor:', value);
    
    // Actualizar el formData
    onFormChange(e);
    
    // Mostrar dropdown si hay texto y categoría seleccionada
    if (value && formData.category && filteredSkills.length > 0) {
      updateDropdownPosition();
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
    
    // Verificación adicional para asegurarse de que el valor no sea vacío
    if (!value.trim()) {
      console.warn('Se detectó un valor vacío en el input');
    }
  };

  // Manejar focus en el input
  const handleInputFocus = () => {
    if (formData.category && filteredSkills.length > 0) {
      updateDropdownPosition();
      setIsDropdownOpen(true);
    }
  };
  // Manejar selección de skill
  const handleSkillSelect = (skill: any, e?: React.MouseEvent) => {
    // Detener la propagación del evento para evitar que llegue al overlay del modal
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Validar que el skill tenga un nombre no vacío
    if (!skill || !skill.name || skill.name.trim() === '') {
      console.error('Se intentó seleccionar una habilidad sin nombre');
      return;
    }
    
    console.log('🎯 handleSkillSelect ejecutándose con skill:', skill);
    console.log('🎯 formData actual antes de la selección:', formData);
    
    // Para asegurar que tanto el state interno como el formData se actualicen
    const event = {
      target: { 
        name: 'name', 
        value: skill.name,
        id: 'skill-name',
        type: 'text'
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    console.log('🎯 Llamando onFormChange con evento:', event);
    
    // Actualiza el formData del padre
    onFormChange(event);
    
    // Actualiza el estado interno
    setSearchText(skill.name);
    
    // Cierra el dropdown
    setIsDropdownOpen(false);
    
    // Asegurarse de que el input refleje el cambio
    if (inputRef.current) {
      inputRef.current.value = skill.name;
    }
    
    console.log('🎯 Skill seleccionada:', skill.name);
  };

  // Cerrar dropdown al hacer click fuera y manejar redimensionamiento
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideInput = dropdownRef.current && dropdownRef.current.contains(target);
      const isInsideDropdown = dropdownPortalRef.current && dropdownPortalRef.current.contains(target);
      
      if (!isInsideInput && !isInsideDropdown) {
        setIsDropdownOpen(false);
      }
    };

    const handleResize = () => {
      if (isDropdownOpen) {
        updateDropdownPosition();
      }
    };

    const handleScroll = () => {
      if (isDropdownOpen) {
        updateDropdownPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isDropdownOpen]);

  // Sincronizar searchText con formData.name y actualizar el input
  useEffect(() => {
    setSearchText(formData.name);
    
    // También actualizar el valor del input directamente
    if (inputRef.current && formData.name) {
      inputRef.current.value = formData.name;
    }
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
  }, [formData.category, editingId, formData.name, skillsIcons, onFormChange]);

  // Función para obtener información de la skill seleccionada
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


  // Manejar clic en el overlay para cerrar el modal, pero evitando cerrar cuando el clic viene del dropdown
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Si el dropdown está abierto, verificar si el clic proviene del dropdown
    if (isDropdownOpen && dropdownPortalRef.current) {
      // Si el clic proviene del dropdown o sus hijos, ignorarlo
      if (dropdownPortalRef.current.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalPortal>
        <div className={`${styles.modalOverlay} ${styles.skillModalOverlay}`} onClick={handleOverlayClick}>
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
            </div>            <form 
              onSubmit={(e) => {
                e.preventDefault();
                // Debug info
                console.log('📋 Formulario enviado desde SkillModal');
                console.log('📋 formData completo:', formData);
                console.log('📋 formData.name:', `"${formData.name}"`);
                
                // Validar que el nombre no esté vacío antes de enviar
                if (formData.name && formData.name.trim() !== '') {
                  console.log('✅ Formulario válido, llamando onSubmit...');
                  onSubmit(e);
                } else {
                  console.log('❌ Error: Nombre vacío en el modal, no se puede enviar el formulario');
                  console.log('❌ formData.name es:', formData.name);
                  // Mostrar indicación visual de error (el campo ya tiene required, pero reforzamos)
                  if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.classList.add(styles.inputError);
                    setTimeout(() => {
                      if (inputRef.current) {
                        inputRef.current.classList.remove(styles.inputError);
                      }
                    }, 2000);
                  }
                }
              }}
              className={styles.skillForm} 
              autoComplete="off"
            >
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

                    {/* Skill Name - Input con dropdown */}
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
                </div>

                {/* Preview de skill seleccionada (solo si encontramos datos de la skill) */}
                {shouldShowSkillDataElements() && (
                  <div className={styles.skillFormPreview}>
                    <div className={styles.previewHeader}>                      <div className={styles.skillPreviewIcon}>
                        <img 
                          src={getSkillSvg(
                            formData.name,
                            null,
                            skillsIcons
                          )} 
                          alt={`${formData.name} icon`}
                          onError={(e) => {
                            e.currentTarget.src = import.meta.env.DEV 
                              ? '/profile-craft/assets/svg/generic-code.svg' 
                              : './assets/svg/generic-code.svg';
                          }}
                        />
                      </div>
                      <div className={styles.previewMeta}>
                        <h4 className={styles.previewSkillName}>{formData.name}</h4>                        <div className={styles.previewBadges}>
                          <span className={styles.categoryBadge}>{getSelectedSkillInfo()?.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campo de nivel con slider mejorado */}
                {shouldShowSkillElements() && (
                  <div className={styles.formSectionSkills}>
                    <h3 className={styles.sectionTitleSkills}>
                      <i className="fas fa-chart-line"></i>
                      Nivel de experiencia
                    </h3>
                    
                    <div className={styles.levelSection}>
                      <div className={styles.levelHeader}>
                        <span className={styles.levelLabel}>Nivel actual:</span>
                        <span className={styles.levelValue}>{formData.level || 50}%</span>
                      </div>
                      <input
                        type="range"
                        name="level"
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
      
      {/* Dropdown Portal fuera del modal */}
      {isDropdownOpen && filteredSkills.length > 0 && createPortal(
        <div 
          ref={dropdownPortalRef}
          className={styles.skillDropdown}
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: Math.max(dropdownPosition.width, 300)
          }}
        >
          {filteredSkills.slice(0, 20).map((skill) => (
            <div
              key={skill.name}
              className={styles.skillOption}
              onClick={(e) => handleSkillSelect(skill, e)}
            >              <div className={styles.skillOptionIcon}>
                <img 
                  src={getSkillSvg(
                    skill.name,
                    skill.svg_path,
                    skillsIcons
                  )} 
                  alt=""
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = import.meta.env.DEV 
                      ? '/profile-craft/assets/svg/generic-code.svg' 
                      : './assets/svg/generic-code.svg';
                  }}
                />
              </div>
              <div className={styles.skillOptionInfo}>
                <span className={styles.skillOptionName}>{skill.name}</span>
                <span className={styles.skillOptionCategory}>{skill.category}</span>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

export default SkillModal;




