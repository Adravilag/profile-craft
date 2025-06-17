// src/components/sections/skills/components/SkillCard.tsx

import React, { useState, useRef, useEffect } from 'react';
import type { SkillCardProps } from '../types/skills';
import { getSkillSvg, getSkillCssClass, getDifficultyStars } from '../utils/skillUtils';
import styles from '../SkillsCard.module.css';

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  skillsIcons,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isAdmin = false,
}) => {
  // Estado para controlar el menú contextual mejorado
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuTimeoutId, setMenuTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Buscar información adicional del CSV
  const skillInfo = skillsIcons.find(
    (s: any) => s.name.toLowerCase() === skill.name.toLowerCase()
  );
  
  // Determinar SVG usando la función utilitaria
  const svgPath = getSkillSvg(
    skill.name,
    skill.icon_class,
    skillsIcons
  );
  
  // Debug: Logs para verificar la carga de iconos
  console.log(`🎨 SkillCard [${skill.name}]:`, {
    skillInfo: skillInfo ? 'found' : 'not found',
    svgPath,
    skillsIconsLength: skillsIcons.length,
    icon_class: skill.icon_class
  });
  
  // Determinar color desde CSV o usar predeterminado
  const skillColor = skillInfo?.color || '#007acc';
  
  // Determinar nivel de dificultad para mostrar estrellas
  const difficultyStars = skillInfo?.difficulty_level ? getDifficultyStars(skillInfo.difficulty_level) : 0;
  
  // Obtener clase CSS específica para esta tecnología
  const skillCssClass = getSkillCssClass(skill.name);
  
  // Manejo del menú contextual mejorado
  const handleMenuEnter = () => {
    if (menuTimeoutId) {
      clearTimeout(menuTimeoutId);
      setMenuTimeoutId(null);
    }
    setIsMenuOpen(true);
  };

  const handleMenuLeave = () => {
    const timeoutId = setTimeout(() => {
      setIsMenuOpen(false);
    }, 300); // Delay de 300ms antes de cerrar
    setMenuTimeoutId(timeoutId);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (menuTimeoutId) {
        clearTimeout(menuTimeoutId);
      }
    };
  }, [menuTimeoutId]);  return (
    <article
      className={`${styles.skillCard} ${skillCssClass}${
        isDragging ? ` ${styles.dragging}` : ""
      }`}
      draggable
      onDragStart={() => onDragStart(skill.id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(skill.id)}
      style={{
        '--skill-color': skillColor,
        '--skill-background-image': `url(${svgPath})`
      } as React.CSSProperties}
    >
      {/* Header con icono, nombre y menú */}
      <header className={styles.skillCardHeader}>
        <div className={styles.skillIconWrapper}>
          <img 
            src={svgPath} 
            alt={`Icono de ${skill.name}`}
            className={styles.skillIcon}
            onError={(e) => {
              console.warn(`Error al cargar icono para ${skill.name}:`, svgPath);
              // Ajustar la ruta del icono genérico según el entorno
              e.currentTarget.src = import.meta.env.DEV 
                ? '/profile-craft/assets/svg/generic-code.svg' 
                : './assets/svg/generic-code.svg';
            }}
            loading="eager" // Cambiar a eager para priorizar la carga
          />
        </div>
        
        <h3 className={styles.skillName}>{skill.name}</h3>
        
        {/* Menú de tres puntos - solo visible para administradores */}
        {isAdmin && (
          <div className={styles.skillActions}>
            <div 
              className={styles.dropdown}
              ref={menuRef}
              onMouseEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
              data-menu-open={isMenuOpen}
            >
              <button
                type="button"
                className={`${styles.menuBtn} ${isMenuOpen ? styles.menuBtnActive : ''}`}
                aria-label="Opciones"
                onClick={handleMenuClick}
              >
                <i className="fas fa-ellipsis-v"></i>
              </button>
              <div className={`${styles.dropdownContent} ${isMenuOpen ? styles.dropdownContentOpen : ''}`}>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => {
                    onEdit(skill);
                    setIsMenuOpen(false);
                  }}
                >
                  <i className="fas fa-edit"></i>
                  Editar
                </button>
                <button
                  type="button"
                  className={`${styles.dropdownItem} ${styles.delete}`}
                  onClick={() => {
                    onDelete(skill.id);
                    setIsMenuOpen(false);
                  }}
                >
                  <i className="fas fa-trash"></i>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Cuerpo principal */}
      <div className={styles.skillCardContent}>
        {/* Sección de nivel */}
        {typeof skill.level === "number" && (
          <div className={`${styles.skillLevel} ${styles.levelSection}`}>
            <div className={styles.levelHeader}>
              <span className={styles.levelLabel} title="Porcentaje de dominio de la tecnología">
                Nivel
                <span className={styles.tooltipHint}>Porcentaje de dominio</span>
              </span>
              <span className={styles.levelValue} aria-live="polite">{skill.level}%</span>
            </div>
            <div 
              className={styles.levelBar}
              role="progressbar"
              aria-valuenow={skill.level}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Nivel de dominio: ${skill.level}%`}
            >
              <div
                className={styles.levelProgress}
                style={{
                  width: `${skill.level}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Sección de dificultad */}
        {skillInfo && skillInfo.difficulty_level && difficultyStars > 0 && (
          <div className={`${styles.skillDifficulty} ${styles.difficultySection}`}>
            <span className={styles.difficultyLabel} title="Percepción personal de complejidad">
              Dificultad
              <span className={styles.tooltipHint}>Percepción de complejidad</span>
            </span>
            <div 
              className={styles.difficultyStars}
              role="img"
              aria-label={`Dificultad: ${difficultyStars} de 5 estrellas`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <i 
                  key={i}
                  className={`${styles.star} ${i < difficultyStars ? styles.filled : styles.empty} ${i < difficultyStars ? 'fas fa-star' : 'far fa-star'}`}
                  aria-hidden="true"
                ></i>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default SkillCard;
