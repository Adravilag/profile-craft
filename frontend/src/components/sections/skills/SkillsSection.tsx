// src/components/sections/skills/SkillsSection.tsx

import React, { useEffect, useState } from "react";
import FloatingActionButton from "../../common/FloatingActionButton";
import CategoryFilters from "./components/CategoryFilters";
import SortFilters from "./components/SortFilters";
import type { SortOption } from "./types/skills";
import SkillsGrid from "./components/SkillsGrid";
import SkillModal from "./components/SkillModal";
import SkillPreviewModal from "./components/SkillPreviewModal";
import { useSkills } from "./hooks/useSkills";
import { useSkillsIcons } from "./hooks/useSkillsIcons";
import { useSkillPreview } from "./hooks/useSkillPreview";
import "./SkillsSection.css";

const SkillsSection: React.FC = () => {
  // Estado para ordenamiento
  const [selectedSort, setSelectedSort] = useState<SortOption>('alphabetical');

  // Función para alternar entre orden ascendente/descendente al hacer click en el indicador
  const handleSortToggle = () => {
    let newSort: SortOption;
    
    switch(selectedSort) {
      case 'alphabetical':
        newSort = 'alphabetical_desc';
        break;
      case 'alphabetical_desc':
        newSort = 'alphabetical';
        break;
      case 'difficulty':
        newSort = 'difficulty_desc';
        break;
      case 'difficulty_desc':
        newSort = 'difficulty';
        break;
      case 'level':
        newSort = 'level_desc';
        break;
      case 'level_desc':
        newSort = 'level';
        break;
      case 'popularity':
        newSort = 'popularity_desc';
        break;
      case 'popularity_desc':
        newSort = 'popularity';
        break;
      default:
        return; // No hacer nada si es un tipo no soportado
    }
    
    setSelectedSort(newSort);
    setSortingClass('sortChange');
  };

  // Hooks personalizados
  const {
    skills,
    loading,
    error,
    showModal,
    newSkill,
    editingId,
    draggedSkillId,
    selectedCategory,
    setSelectedCategory,
    setSkills,
    handleOpenModal,
    handleCloseModal,
    handleFormChange,
    handleAddSkill,
    handleEditSkill,
    handleDeleteSkill,
    handleDragStart,
    handleDragOver,
    handleDrop,
    getFilteredGrouped,
    getAllCategories,
    getGroupedSkills,
  } = useSkills();

  const {
    skillsIcons,
    skillNames,
    externalData,
    loadingExternalData,
    enrichSkillWithExternalData,
    enrichExistingSkills,
  } = useSkillsIcons();

  const {
    showPreviewModal,
    previewSkill,
    handlePreviewSkill,
    handleClosePreviewModal,
  } = useSkillPreview(enrichSkillWithExternalData);

  // Enriquecer skills existentes cuando se cargan los iconos
  useEffect(() => {
    enrichExistingSkills(skills, setSkills);
  }, [skillsIcons, skills]);

  // Estado para controlar la animación de ordenamiento
  const [sortingClass, setSortingClass] = useState<string>('');
  
  // Efecto para aplicar la clase de animación cuando cambia el ordenamiento
  useEffect(() => {
    console.log('🔄 Ordenamiento cambiado a:', selectedSort);
    setSortingClass('sort-change');
    
    // Eliminar la clase después de la animación
    const timer = setTimeout(() => {
      setSortingClass('');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [selectedSort]);

  // Función de ordenamiento robusta y mejorada
  const sortSkills = (skills: any[], sortOption: SortOption) => {
    try {
      // Crear una copia segura del array para evitar mutaciones
      const skillsCopy = Array.isArray(skills) ? [...skills] : [];
      
      return skillsCopy.sort((a, b) => {
        if (!a || !b) return 0; // Protección contra elementos nulos o indefinidos
        
        switch (sortOption) {
          case 'alphabetical':
            const nameA = ((a.name || a.skill_name || '') + '').toLowerCase();
            const nameB = ((b.name || b.skill_name || '') + '').toLowerCase();
            return nameA.localeCompare(nameB);
            
          case 'alphabetical_desc':
            const nameDescA = ((a.name || a.skill_name || '') + '').toLowerCase();
            const nameDescB = ((b.name || b.skill_name || '') + '').toLowerCase();
            return nameDescB.localeCompare(nameDescA); // Invertir el orden para Z-A
            
          case 'difficulty':
            const diffA = parseFloat(a.difficulty || 0);
            const diffB = parseFloat(b.difficulty || 0);
            // Ordenar de mayor a menor dificultad
            return isNaN(diffB - diffA) ? 0 : diffB - diffA;
            
          case 'level':
            const levelA = parseFloat(a.level || 0);
            const levelB = parseFloat(b.level || 0);
            // Ordenar de mayor a menor nivel
            return isNaN(levelB - levelA) ? 0 : levelB - levelA;
            
          case 'popularity':
            // Calcular popularidad basada en nivel y años de experiencia
            const expA = parseFloat(a.years_experience || a.experience || 0);
            const expB = parseFloat(b.years_experience || b.experience || 0);
            const levA = parseFloat(a.level || 0);
            const levB = parseFloat(b.level || 0);
            
            const popularityA = (expA * 0.6) + (levA * 0.4); // Peso mayor a experiencia
            const popularityB = (expB * 0.6) + (levB * 0.4);
            
            // Ordenar de mayor a menor popularidad
            return isNaN(popularityB - popularityA) ? 0 : popularityB - popularityA;

          case 'difficulty_desc':
            const diffDescA = parseFloat(a.difficulty || 0);
            const diffDescB = parseFloat(b.difficulty || 0);
            // Ordenar de menor a mayor dificultad
            return isNaN(diffDescA - diffDescB) ? 0 : diffDescA - diffDescB;
            
          case 'level_desc':
            const levelDescA = parseFloat(a.level || 0);
            const levelDescB = parseFloat(b.level || 0);
            // Ordenar de menor a mayor nivel
            return isNaN(levelDescA - levelDescB) ? 0 : levelDescA - levelDescB;
            
          case 'popularity_desc':
            // Calcular popularidad basada en nivel y años de experiencia
            const expDescA = parseFloat(a.years_experience || a.experience || 0);
            const expDescB = parseFloat(b.years_experience || b.experience || 0);
            const levDescA = parseFloat(a.level || 0);
            const levDescB = parseFloat(b.level || 0);
            
            const popularityDescA = (expDescA * 0.6) + (levDescA * 0.4);
            const popularityDescB = (expDescB * 0.6) + (levDescB * 0.4);
            
            // Ordenar de menor a mayor popularidad
            return isNaN(popularityDescA - popularityDescB) ? 0 : popularityDescA - popularityDescB;
            
          default:
            return 0;
        }
      });
    } catch (error) {
      console.error('Error al ordenar skills:', error);
      return Array.isArray(skills) ? [...skills] : [];
    }
  };

  // Aplicar ordenamiento a skills filtradas con validación mejorada
  const getSortedFilteredGrouped = () => {
    const filtered = getFilteredGrouped();
    const sorted: Record<string, any[]> = {};
    
    Object.keys(filtered).forEach(category => {
      // Comprobación de seguridad para verificar que el array existe antes de ordenarlo
      if (Array.isArray(filtered[category])) {
        sorted[category] = sortSkills(filtered[category], selectedSort);
        // Registro de depuración para verificar ordenamiento
        console.log(`✅ Categoría ${category}: ${filtered[category].length} skills ordenadas por ${selectedSort}`);
      } else {
        console.warn(`⚠️ No se pudo ordenar la categoría ${category}: no es un array`);
        sorted[category] = filtered[category] || [];
      }
    });
    
    return sorted;
  };

  if (loading)
    return (
      <section className="cv-section animate-in">
        <p>Cargando habilidades...</p>
      </section>
    );
  if (error)
    return (
      <section className="cv-section animate-in">
        <p>{error}</p>
      </section>
    );

  // Obtener datos agrupados y filtrados usando los hooks
  const groupedSkills = getGroupedSkills();
  const filteredGrouped = getSortedFilteredGrouped(); // Usar la versión ordenada
  const allCategories = getAllCategories();

  return (
    <section className="cv-section">
      {/* Header moderno */}
      <div className="section-header">
        <div className="section-title">
          <div className="title-icon">
            <i className="fas fa-cogs"></i>
          </div>
          <span className="title-text">Habilidades Técnicas</span>
        </div>
        <p className="section-subtitle">
          Tecnologías y herramientas que domino
        </p>
      </div>

      {/* Contenido principal */}
      <div className="section-container">
        {/* Filtros de categoría usando componente modular */}
        {Object.keys(groupedSkills).length > 0 && (
          <>
            <CategoryFilters
              categories={allCategories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              skillsGrouped={groupedSkills}
            />
            
            {/* Filtros de ordenamiento */}
            <SortFilters
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
            />
          </>
        )}

        <div className="skills-content">
          {/* Grid de skills o estado vacío usando componente modular */}
          <SkillsGrid
            filteredGrouped={filteredGrouped}
            skillsIcons={skillsIcons}
            onEdit={handleEditSkill}
            onDelete={handleDeleteSkill}
            onPreview={handlePreviewSkill}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            draggedSkillId={draggedSkillId}
            selectedSort={selectedSort}
            sortingClass={sortingClass}
            onSortToggle={handleSortToggle}
          />
        </div>
      </div>

      {/* Modal para añadir/editar skills usando componente modular */}
      <SkillModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={(e) => handleAddSkill(e, skillsIcons)}
        formData={newSkill}
        onFormChange={handleFormChange}
        editingId={editingId}
        skillsIcons={skillsIcons}
        skillNames={skillNames}
      />

      {/* Modal de vista previa usando componente modular */}
      <SkillPreviewModal
        isOpen={showPreviewModal}
        onClose={handleClosePreviewModal}
        skill={previewSkill}
        skillsIcons={skillsIcons}
        externalData={externalData}
        loadingExternalData={loadingExternalData}
      />

      {/* Floating Action Button para añadir habilidades */}
      <FloatingActionButton
        onClick={handleOpenModal}
        icon="fas fa-plus"
        label="Añadir Habilidad"
        color="success"
        position="bottom-right"
      />
    </section>
  );
};

export default SkillsSection;
