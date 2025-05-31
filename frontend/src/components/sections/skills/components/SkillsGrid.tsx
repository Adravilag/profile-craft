// src/components/sections/skills/components/SkillsGrid.tsx

import React from 'react';
import SkillCard from './SkillCard';
import type { SkillsGridProps } from '../types/skills';

const SkillsGrid: React.FC<SkillsGridProps> = ({
  filteredGrouped,
  skillsIcons,
  onEdit,
  onDelete,
  onPreview,
  onDragStart,
  onDragOver,
  onDrop,
  draggedSkillId,
  selectedSort = 'alphabetical',
  sortingClass = '',
  onSortToggle
}) => {
  // Función para obtener el texto del ordenamiento
  const getSortText = () => {
    switch(selectedSort) {
      case 'alphabetical': return 'Alfabético (A-Z)';
      case 'alphabetical_desc': return 'Alfabético (Z-A)';
      case 'difficulty': return 'Dificultad (Mayor a menor)';
      case 'difficulty_desc': return 'Dificultad (Menor a mayor)';
      case 'level': return 'Nivel (Mayor a menor)';
      case 'level_desc': return 'Nivel (Menor a mayor)';
      case 'popularity': return 'Popularidad (Mayor a menor)';
      case 'popularity_desc': return 'Popularidad (Menor a mayor)';
      default: return 'Personalizado';
    }
  };

  // Función para obtener el icono del ordenamiento
  const getSortIcon = () => {
    switch(selectedSort) {
      case 'alphabetical': return 'fa-sort-alpha-down';
      case 'alphabetical_desc': return 'fa-sort-alpha-up';
      case 'difficulty': return 'fa-signal';
      case 'difficulty_desc': return 'fa-signal';
      case 'level': return 'fa-star';
      case 'level_desc': return 'fa-star';
      case 'popularity': return 'fa-fire';
      case 'popularity_desc': return 'fa-fire';
      default: return 'fa-sort';
    }
  };

  // Función para obtener el tooltip del toggle
  const getToggleTooltip = () => {
    switch(selectedSort) {
      case 'alphabetical': return 'Click para cambiar a orden descendente (Z-A)';
      case 'alphabetical_desc': return 'Click para cambiar a orden ascendente (A-Z)';
      case 'difficulty': return 'Click para cambiar a menor a mayor dificultad';
      case 'difficulty_desc': return 'Click para cambiar a mayor a menor dificultad';
      case 'level': return 'Click para cambiar a menor a mayor nivel';
      case 'level_desc': return 'Click para cambiar a mayor a menor nivel';
      case 'popularity': return 'Click para cambiar a menor a mayor popularidad';
      case 'popularity_desc': return 'Click para cambiar a mayor a menor popularidad';
      default: return undefined;
    }
  };
  const categoryIcons: Record<string, string> = {
    All: "fas fa-th",
    Frontend: "fas fa-paint-brush",
    Backend: "fas fa-server",
    "DevOps & Tools": "fas fa-tools",
    "Data Science": "fas fa-chart-line",
    Mobile: "fas fa-mobile-alt",
    Cloud: "fas fa-cloud",
    Testing: "fas fa-vial",
    "UI/UX": "fas fa-pencil-ruler",
    Security: "fas fa-shield-alt",
    AI: "fas fa-robot",
    Other: "fas fa-cogs",
  };

  if (Object.entries(filteredGrouped).length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-code empty-icon"></i>
        <h3>No hay habilidades registradas</h3>
        <p>Comienza añadiendo tus primeras habilidades técnicas</p>
      </div>
    );
  }

  return (
    <div className="skills-categories">
      {Object.entries(filteredGrouped).map(([category, skills]) => (
        <div key={category} className="skills-category">
          <div className="category-header">
            <h3 className="category-title">
              {categoryIcons[category] && (
                <i
                  className={`category-icon ${categoryIcons[category]}`}
              ></i>
              )}
              <span className="category-name">{category}</span>
              <span className="category-count">{skills.length}</span>
            </h3>
            <div 
              className={`category-sort-indicator ${onSortToggle ? 'clickable' : ''}`}
              onClick={onSortToggle}
              title={getToggleTooltip()}
            >
              <i className={`fas ${getSortIcon()}`}></i> 
              <span className="sort-text">Ordenados por: {getSortText()}</span>
              {onSortToggle && (
                <i className="fas fa-exchange-alt toggle-hint" title="Clickeable"></i>
              )}
            </div>
          </div>
          <div className={`skills-grid ${sortingClass}`}>
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                skillsIcons={skillsIcons}
                onEdit={onEdit}
                onDelete={onDelete}
                onPreview={onPreview}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                isDragging={draggedSkillId === skill.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillsGrid;