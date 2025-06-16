// src/components/sections/skills/SkillsSection.tsx

import React, { useState } from "react";
import HeaderSection from "../header/HeaderSection";
import FloatingActionButtonGroup from "../../common/FloatingActionButtonGroup";
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
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ 
  showAdminFAB = false
}) => {
  // Hook de autenticación
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Estados locales (solo los que no maneja el hook)
  const [selectedSort, setSelectedSort] = useState<Record<string, SortOption>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [draggedSkillId, setDraggedSkillId] = useState<number | null>(null);
  const [sortingClass, setSortingClass] = useState<string>('');

  // Hook de habilidades - aquí están todos los estados y funciones del formulario
  const { 
    showModal,
    newSkill,
    editingId,
    handleOpenModal,
    handleCloseModal,
    handleFormChange,
    handleAddSkill,
    handleEditSkill,
    handleDeleteSkill,
    getAllCategories,
    getGroupedSkills
  } = useSkills();
  
  const { skillsIcons, skillNames, enrichSkillWithExternalData } = useSkillsIcons();

  // Hook para vista previa (con función de enriquecimiento)
  const { showPreviewModal, previewSkill, handleClosePreviewModal } = useSkillPreview(enrichSkillWithExternalData);

  // Obtener datos
  const groupedSkills = getGroupedSkills();
  const categories = getAllCategories();

  // Función para alternar ordenamiento
  const handleSortToggle = (category: string, sortType?: SortOption) => {
    if (sortType) {
      const currentSort = selectedSort[category] || 'alphabetical';
      
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
            newSort = 'alphabetical';
        }
        
        setSelectedSort(prev => ({
          ...prev,
          [category]: newSort
        }));
      } else {
        setSelectedSort(prev => ({
          ...prev,
          [category]: sortType
        }));
      }
    }
  };

  // Función de utilidad para ordenar skills
  const sortSkills = (skills: any[], sortType: SortOption) => {
    const sorted = [...skills];
    
    switch (sortType) {
      case 'alphabetical':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'alphabetical_desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'level':
        return sorted.sort((a, b) => a.level - b.level);
      case 'level_desc':
        return sorted.sort((a, b) => b.level - a.level);
      default:
        return sorted;
    }
  };

  // Funciones de Drag & Drop
  const handleDragStart = (skillId: number) => {
    setDraggedSkillId(skillId);
    setSortingClass('sorting-active');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (id: number) => {
    setSortingClass('');
    
    if (draggedSkillId !== null) {
      console.log(`Moviendo skill ${draggedSkillId} a la posición de skill ${id}`);
      setDraggedSkillId(null);
    }
  };

  // Procesar y ordenar skills por categoría
  const getSortedFilteredGrouped = () => {
    const sorted: Record<string, any[]> = {};
    
    Object.keys(groupedSkills).forEach(category => {
      // Filtrar por categoría seleccionada
      if (selectedCategory === 'All' || category === selectedCategory) {
        const skills = groupedSkills[category] || [];
        const sortType = selectedSort[category] || selectedSort['default'] || 'alphabetical';
        sorted[category] = sortSkills(skills, sortType);
      }
    });
    
    return sorted;
  };

  const filteredGrouped = getSortedFilteredGrouped();

  const handleSkillEdit = (skill: any) => {
    handleEditSkill(skill);
  };

  const handleSkillDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta habilidad?')) {
      try {
        await handleDeleteSkill(id);
      } catch (error) {
        console.error('Error al eliminar habilidad:', error);
      }
    }
  };

  const handleSkillSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('📋 SkillsSection: Enviando formulario...');
    console.log('📋 Estado actual de newSkill:', newSkill);
    
    // Llamar directamente al handleAddSkill del hook, que ya tiene toda la lógica
    await handleAddSkill(e, skillsIcons);
  };

  const handleOpenAddModal = () => {
    handleOpenModal();
  };

  return (
    <section id="skills" className="section">
      <HeaderSection
        icon="fas fa-layer-group"
        title="Habilidades"
        subtitle="Competencias técnicas y conocimientos"
        className="skills"
      />

      <div className="section-container">
        <div className={styles.skillsContainer}>
          {/* Sidebar con filtros de categorías */}
          <aside className={styles.skillsSidebar}>
            <div className={styles.categoriesWrapper}>
              <CategoryFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                skillsGrouped={groupedSkills}
              />
            </div>
          </aside>

          {/* Contenido principal con grid de skills */}
          <main className={styles.skillsMainContent}>            <SkillsGrid
              filteredGrouped={filteredGrouped}
              skillsIcons={skillsIcons}
              onEdit={handleSkillEdit}
              onDelete={handleSkillDelete}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onSortToggle={handleSortToggle}
              selectedSort={selectedSort}
              sortingClass={sortingClass}
              draggedSkillId={draggedSkillId}
              isAdmin={isAdmin}
            />
          </main>
        </div>
      </div>

      {/* Modal para añadir/editar skills */}
      <SkillModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSkillSubmit}
        formData={newSkill}
        onFormChange={handleFormChange}
        editingId={editingId}
        skillsIcons={skillsIcons}
        skillNames={skillNames}
      />

      {/* Modal de vista previa */}
      <SkillPreviewModal
        isOpen={showPreviewModal}
        onClose={handleClosePreviewModal}
        skill={previewSkill}
        skillsIcons={skillsIcons}
        externalData={{}}
        loadingExternalData={{}}
      />

      {/* Floating Action Buttons para habilidades */}
      {showAdminFAB && isAdmin && (
        <FloatingActionButtonGroup
          actions={[
            {
              id: "add-skill",
              onClick: handleOpenAddModal,
              icon: "fas fa-plus",
              label: "Añadir Habilidad",
              color: "success"
            }
          ]}
          position="bottom-right"
        />
      )}
    </section>
  );
};

export default SkillsSection;
