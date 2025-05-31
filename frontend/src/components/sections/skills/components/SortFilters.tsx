// src/components/sections/skills/components/SortFilters.tsx

import React from 'react';
import type { SortOption } from '../types/skills';

export type SortDirection = 'asc' | 'desc';

export interface SortOptionConfig {
  key: string;
  direction?: SortDirection;
}

interface SortFiltersProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SortFilters: React.FC<SortFiltersProps> = ({
  selectedSort,
  onSortChange
}) => {
  const sortOptions = [
    {
      key: 'alphabetical' as SortOption,
      label: 'Alfabético',
      icon: 'fas fa-sort-alpha-down',
      description: 'Ordenar alfabéticamente'
    },
    {
      key: 'difficulty' as SortOption,
      label: 'Dificultad',
      icon: 'fas fa-signal',
      description: 'Ordenar por dificultad'
    },
    {
      key: 'level' as SortOption,
      label: 'Nivel',
      icon: 'fas fa-star',
      description: 'Ordenar por nivel de dominio'
    },
    {
      key: 'popularity' as SortOption,
      label: 'Popularidad',
      icon: 'fas fa-fire',
      description: 'Ordenar por popularidad'
    }
  ];

  const handleSortChange = (newSort: SortOption) => {
    console.log('🎯 Cambiando ordenamiento de', selectedSort, 'a', newSort);
    onSortChange(newSort);
  };

  // Función para determinar si una opción está activa (incluyendo sus variantes desc)
  const isOptionActive = (optionKey: SortOption) => {
    if (optionKey === 'alphabetical') {
      return selectedSort === 'alphabetical' || selectedSort === 'alphabetical_desc';
    }
    if (optionKey === 'difficulty') {
      return selectedSort === 'difficulty' || selectedSort === 'difficulty_desc';
    }
    if (optionKey === 'level') {
      return selectedSort === 'level' || selectedSort === 'level_desc';
    }
    if (optionKey === 'popularity') {
      return selectedSort === 'popularity' || selectedSort === 'popularity_desc';
    }
    return false;
  };

  return (
    <div className="sort-filters">
      <div className="sort-label">
        <i className="fas fa-sort"></i>
        Ordenar por:
      </div>
      <div className="sort-buttons">
        {sortOptions.map((option) => {
          const isActive = isOptionActive(option.key);
          
          return (
            <button
              key={option.key}
              className={`sort-btn ${isActive ? "active" : ""}`}
              onClick={() => handleSortChange(option.key)}
              title={option.description}
            >
              <i className={option.icon}></i>
              <span className="sort-text">{option.label}</span>
              {isActive && (
                <i className="fas fa-check sort-check"></i>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SortFilters;
