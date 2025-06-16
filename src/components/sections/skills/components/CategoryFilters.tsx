// src/components/sections/skills/components/CategoryFilters.tsx

import React, { useState } from 'react';
import type { CategoryFiltersProps } from '../types/skills';
import { useResponsive } from '../hooks/useResponsive';
import styles from './CategoryFilters.module.css';

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  skillsGrouped
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isMobile } = useResponsive();

  // Iconos por categoría
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

  // En móvil, mostrar solo las categorías más importantes por defecto
  const priorityCategories = ['All', 'Frontend', 'Backend', 'DevOps & Tools', 'Mobile'];
  const categoriesToShow = isMobile && !isExpanded 
    ? categories.filter(cat => priorityCategories.includes(cat))
    : categories;

  return (
    <div className={styles.categoryFilters}>
      <div className={styles.filterHeader}>
        <div className={styles.filterLabel}>
          <i className="fas fa-filter"></i>
          Filtrar por categoría:
        </div>
        {isMobile && categories.length > priorityCategories.length && (
          <button 
            className={styles.expandButton}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Mostrar menos categorías' : 'Mostrar más categorías'}
          >
            <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
          </button>
        )}
      </div>
      
      <div className={`${styles.filterButtons} ${isExpanded ? styles.expanded : ''}`}>
        {categoriesToShow.map((category) => (
          <button
            key={category}
            className={`${styles.filterBtn} ${
              selectedCategory === category ? styles.active : ""
            }`}
            onClick={() => onCategoryChange(category)}
            title={`Filtrar por ${category}`}
          >
            <i className={categoryIcons[category]}></i>
            <span className={styles.categoryName}>{category}</span>
            {category !== "All" && skillsGrouped[category] && (
              <span className={styles.filterCount}>
                ({skillsGrouped[category].length})
              </span>
            )}
            {category === "All" && (
              <span className={styles.filterCount}>
                ({Object.values(skillsGrouped).reduce((total, skills) => total + skills.length, 0)})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilters;