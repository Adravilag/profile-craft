// src/components/sections/skills/components/SkillCard.tsx

import React from 'react';
import type { SkillCardProps } from '../types/skills';
import { getSkillSvg, getSkillCssClass, getDifficultyStars } from '../utils/skillUtils';
import SkillLikes from './SkillLikes';

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  skillsIcons,
  onEdit,
  onDelete,
  onPreview,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}) => {  // Buscar información adicional del CSV
  const skillInfo = skillsIcons.find(
    (s: any) => s.name.toLowerCase() === skill.name.toLowerCase()
  );
  
  // Determinar SVG usando la función utilitaria
  const svgPath = getSkillSvg(
    skill.name,
    skill.icon_class,
    skillsIcons
  );
  
  // Determinar color desde CSV o usar predeterminado
  const skillColor = skillInfo?.color || '#007acc';
  
  // Determinar nivel de dificultad para mostrar estrellas
  const difficultyStars = skillInfo?.difficulty_level ? getDifficultyStars(skillInfo.difficulty_level) : 0;
  
  // Obtener clase CSS específica para esta tecnología
  const skillCssClass = getSkillCssClass(skill.name);  return (
    <article
      className={`skill-card ${skillCssClass}${
        isDragging ? " dragging" : ""
      }`}
      draggable
      onDragStart={() => onDragStart(skill.id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(skill.id)}
      style={{
        '--skill-color': skillColor
      } as React.CSSProperties}
    >
      {/* Header con icono, nombre y menú */}
      <header className="skill-card-header">
        <div className="skill-icon-wrapper">
          <img 
            src={svgPath} 
            alt={`Icono de ${skill.name}`}
            className="skill-icon"
            onError={(e) => {
              e.currentTarget.src = '/assets/svg/generic-code.svg';
            }}
          />
        </div>
        
        <h3 className="skill-name">{skill.name}</h3>
        
        {/* Menú de tres puntos */}
        <div className="skill-actions">
          <div className="dropdown">
            <button
              type="button"
              className="menu-btn"
              aria-label="Opciones"
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
            <div className="dropdown-content">
              <button
                type="button"
                className="dropdown-item"
                onClick={() => onPreview(skill)}
              >
                <i className="fas fa-eye"></i>
                Vista previa
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => onEdit(skill)}
              >
                <i className="fas fa-edit"></i>
                Editar
              </button>
              <button
                type="button"
                className="dropdown-item delete"
                onClick={() => onDelete(skill.id)}
              >
                <i className="fas fa-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cuerpo principal */}
      <div className="skill-card-body">
        {/* Nivel con barra de progreso sutil */}
        {typeof skill.level === "number" && (
          <div className="skill-level">
            <div className="level-header">
              <span className="level-label">Nivel</span>
              <span className="level-value">{skill.level}%</span>
            </div>
            <div className="level-bar">
              <div
                className="level-progress"
                style={{
                  width: `${skill.level}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Dificultad con estrellas */}
        {skillInfo && skillInfo.difficulty_level && difficultyStars > 0 && (
          <div className="skill-difficulty">
            <span className="difficulty-label">Dificultad</span>
            <div className="difficulty-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <i 
                  key={i}
                  className={`star ${i < difficultyStars ? 'filled' : 'empty'}`}
                ></i>
              ))}
            </div>
          </div>
        )}
      </div>
        {/* Footer con enlaces */}
      {(skillInfo?.docs_url || skillInfo?.official_repo) && (
        <footer className="skill-card-footer">
          <div className="skill-links">
            {skillInfo.docs_url && (              <a 
                href={skillInfo.docs_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="link-btn docs"
                title="Ver documentación oficial"
              >
                <i className="fas fa-book"></i>
                Documentación
              </a>
            )}
            {skillInfo.official_repo && (              <a 
                href={skillInfo.official_repo} 
                target="_blank" 
                rel="noopener noreferrer"
                className="link-btn repo"
                title="Ver repositorio oficial en GitHub"
              >
                <i className="fa-brands fa-github"></i>
                Repositorio
              </a>
            )}
          </div>
          
          {/* Componente para likes */}
          <SkillLikes skillId={skill.id} initialLikes={0} />
        </footer>
      )}
      
      {/* Mostrar likes incluso cuando no hay enlaces */}
      {!(skillInfo?.docs_url || skillInfo?.official_repo) && (
        <footer className="skill-card-footer">
          <SkillLikes skillId={skill.id} initialLikes={0} />
        </footer>
      )}
    </article>
  );
};

export default SkillCard;
