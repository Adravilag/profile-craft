// src/components/sections/skills/SkillsSection.tsx

import React, { useEffect, useState } from "react";
import HeaderSection from "../header/HeaderSection";
import FloatingActionButton from "../../common/FloatingActionButton";
import CategoryFilters from "./components/CategoryFilters";
import type { SortOption } from "./types/skills";
import SkillsGrid from "./components/SkillsGrid";
import SkillModal from "./components/SkillModal";
import SkillPreviewModal from "./components/SkillPreviewModal";
import { useSkills } from "./hooks/useSkills";
import { useSkillsIcons } from "./hooks/useSkillsIcons";
import { useSkillPreview } from "./hooks/useSkillPreview";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./SkillsSection.module.css";

interface SkillsSectionProps {
  showAdminFAB?: boolean;
  onAdminClick?: () => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ 
  showAdminFAB = false,
  onAdminClick 
}) => {
  // Hook de autenticación
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Estado para ordenamiento por categoría (cada categoría tiene su propio ordenamiento)
  const [selectedSort, setSelectedSort] = useState<Record<string, SortOption>>({});

  // Función para alternar entre orden ascendente/descendente o cambiar tipo de ordenamiento
  const handleSortToggle = (category: string, sortType?: SortOption) => {
    // Si se especifica un tipo de ordenamiento, cambiamos a ese tipo
    if (sortType) {
      const currentSort = selectedSort[category] || 'alphabetical';
      
      // Si ya estamos en ese tipo, alternamos la dirección
      if (currentSort.startsWith(sortType)) {
        let newSort: SortOption;
        
        switch(currentSort) {
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
          default:
            newSort = sortType;
        }
        
        setSelectedSort(prev => ({ ...prev, [category]: newSort }));
      } else {
        // Si no estamos en ese tipo, cambiamos a la versión ascendente
        setSelectedSort(prev => ({ ...prev, [category]: sortType }));
      }
    }
    
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
  }, [enrichExistingSkills]);

  // Estado para controlar la animación de ordenamiento
  const [sortingClass, setSortingClass] = useState<string>('');
  
  // Efecto para aplicar la clase de animación cuando cambia el ordenamiento
  useEffect(() => {
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
        const categorySort = selectedSort[category] || 'alphabetical';
        sorted[category] = sortSkills(filtered[category], categorySort);
      } else {
        sorted[category] = filtered[category] || [];
      }
    });
    
    return sorted;
  };

  if (loading)
    return (
      <section className={styles.skillsSection}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando habilidades...</p>
        </div>
      </section>
    );
  if (error)
    return (
      <section className={styles.skillsSection}>
        <div className={styles.skillsError}>
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      </section>
    );

  // Obtener datos agrupados y filtrados usando los hooks
  const groupedSkills = getGroupedSkills();
  const filteredGrouped = getSortedFilteredGrouped(); // Usar la versión ordenada
  const allCategories = getAllCategories();

  return (
    <section className={styles.sectionCv}>
      <HeaderSection 
        icon="fas fa-cogs" 
        title="Habilidades Técnicas" 
        subtitle="Tecnologías y herramientas que domino"
        className="skills"
      />
      <div className={styles.sectionContainer}>
        <div className={styles.skillsContentLayout}>
          {/* Sidebar con filtros de categoría */}
          {Object.keys(groupedSkills).length > 0 && (
            <aside className={styles.skillsSidebar}>
              <div className={styles.sidebarContent}>
                <CategoryFilters
                  categories={allCategories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  skillsGrouped={groupedSkills}
                />
              </div>
            </aside>
          )}

          {/* Contenido principal con grid de skills */}
          <main className={styles.skillsMainContent}>
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
              isAdmin={isAdmin}
            />
          </main>
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

      {/* Floating Action Button para añadir habilidades - solo visible para admin */}
      {showAdminFAB && isAdmin && (
        <FloatingActionButton
          onClick={() => {
            handleOpenModal();
            onAdminClick?.();
          }}
          icon="fas fa-plus"
          label="Añadir Habilidad"
          color="primary"
          position="bottom-right"
          ariaLabel="Añadir nueva habilidad"
        />
      )}
    </section>
  );
};

export default SkillsSection;
