// src/components/sections/skills/components/CategoryFilters.tsx

import React from 'react';
import type { CategoryFiltersProps } from '../types/skills';

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  skillsGrouped
}) => {
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

  return (
    <div className="category-filters">
      <div className="filter-label">
        <i className="fas fa-filter"></i>
        Filtrar por categoría:
      </div>
      <div className="filter-buttons">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-btn ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => onCategoryChange(category)}
          >
            <i className={categoryIcons[category]}></i>
            {category}
            {category !== "All" && skillsGrouped[category] && (
              <span className="filter-count">
                ({skillsGrouped[category].length})
              </span>
            )}
            {category === "All" && (
              <span className="filter-count">
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