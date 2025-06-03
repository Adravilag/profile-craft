// src/components/sections/skills/components/SkillsGrid.tsx

import React from 'react';
import SkillCard from './SkillCard';
import type { SkillsGridProps } from '../types/skills';
import styles from './SkillsGrid.module.css';

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
  selectedSort = {},
  sortingClass = '',
  onSortToggle,
  isAdmin = false
}) => {
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

  // Función para obtener el sort actual de una categoría
  const getCategorySort = (category: string) => {
    return selectedSort[category] || 'alphabetical';
  };

  // Función para determinar si un botón está activo
  const isButtonActive = (category: string, sortType: string) => {
    const currentSort = getCategorySort(category);
    return currentSort.startsWith(sortType);
  };

  // Función para obtener el icono de dirección
  const getDirectionIcon = (category: string, sortType: string) => {
    const currentSort = getCategorySort(category);
    const isDesc = currentSort.endsWith('_desc');
    
    if (isButtonActive(category, sortType)) {
      return isDesc ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    }
    
    return null;
  };

  if (Object.entries(filteredGrouped).length === 0) {
    return (
      <div className={styles.emptyState}>
        <i className={`fas fa-code ${styles.emptyIcon}`}></i>
        <h3>No hay habilidades registradas</h3>
        <p>Comienza añadiendo tus primeras habilidades técnicas</p>
      </div>
    );
  }

  return (
    <div className={styles.skillsCategories}>
      {Object.entries(filteredGrouped).map(([category, skills]) => (
        <div key={category} className={styles.skillsCategory}>
          <div className={styles.categoryHeader}>
            <h3 className={styles.categoryTitle}>
              {categoryIcons[category] && (
                <i
                  className={`${styles.categoryIcon} ${categoryIcons[category]}`}
              ></i>
              )}
              <span className={styles.categoryName}>{category}</span>
              <span className={styles.categoryCount}>{skills.length}</span>
            </h3>
            <div className={styles.sortControls}>
              <span className={styles.sortLabel}>Ordenar por:</span>
              <div className={styles.sortButtons}>
                <button 
                  className={`${styles.sortButton} ${isButtonActive(category, 'alphabetical') ? styles.active : ''}`}
                  onClick={() => onSortToggle?.(category, 'alphabetical')}
                  title="Ordenar alfabéticamente"
                >
                  <i className="fas fa-sort-alpha-down"></i>
                  Alfabético
                  {getDirectionIcon(category, 'alphabetical') && (
                    <i className={getDirectionIcon(category, 'alphabetical')!}></i>
                  )}
                </button>
                <button 
                  className={`${styles.sortButton} ${isButtonActive(category, 'difficulty') ? styles.active : ''}`}
                  onClick={() => onSortToggle?.(category, 'difficulty')}
                  title="Ordenar por dificultad"
                >
                  <i className="fas fa-signal"></i>
                  Dificultad
                  {getDirectionIcon(category, 'difficulty') && (
                    <i className={getDirectionIcon(category, 'difficulty')!}></i>
                  )}
                </button>
                <button 
                  className={`${styles.sortButton} ${isButtonActive(category, 'level') ? styles.active : ''}`}
                  onClick={() => onSortToggle?.(category, 'level')}
                  title="Ordenar por nivel"
                >
                  <i className="fas fa-star"></i>
                  Nivel
                  {getDirectionIcon(category, 'level') && (
                    <i className={getDirectionIcon(category, 'level')!}></i>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className={`${styles.skillsGrid} ${sortingClass === 'sortChange' ? styles.sortChange : ''}`}>
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
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillsGrid;