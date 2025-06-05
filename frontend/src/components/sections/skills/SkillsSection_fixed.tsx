// src/components/sections/skills/SkillsSection.tsx

import React, { useState } from "react";
import HeaderSection from "../header/HeaderSection";
import FloatingActionButton from "../../common/FloatingActionButton";
import CategoryFilters from "./components/CategoryFilters";
import type { SortOption, SkillFormData } from "./types/skills";
import SkillsGrid from "./components/SkillsGrid";
import SkillModal from "./components/SkillModal";
import SkillPreviewModal from "./components/SkillPreviewModal";
import SkillsAdmin from "./components/SkillsAdmin";
import { useSkills } from "./hooks/useSkills";
import { useSkillsIcons } from "./hooks/useSkillsIcons";
import { useSkillPreview } from "./hooks/useSkillPreview";
import { useAuth } from "../../../contexts/AuthContext";
import AdminModal from "../../ui/AdminModal";
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
  
  // Estado para modal de administración
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<string>("list");

  // Estado para ordenamiento por categoría
  const [selectedSort, setSelectedSort] = useState<Record<string, SortOption>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [draggedSkillId, setDraggedSkillId] = useState<number | null>(null);
  const [sortingClass, setSortingClass] = useState<string>('');

  // Hooks
  const { 
    skills, 
    loading: skillsLoading, 
    getAllCategories,
    getGroupedSkills,
    handleEditSkill,
    handleDeleteSkill,
    handleAddSkill
  } = useSkills();
  
  const { skillsIcons, skillNames, enrichSkillWithExternalData } = useSkillsIcons();
  
  // Hook para vista previa (con función de enriquecimiento)
  const { showPreviewModal, previewSkill, handlePreviewSkill, handleClosePreviewModal } = useSkillPreview(enrichSkillWithExternalData);
  
  // Estados para modal de skills
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newSkill, setNewSkill] = useState<SkillFormData>({
    name: '',
    category: '',
    icon_class: '',
    level: 50,
    demo_url: '',
  });

  // Obtener datos
  const groupedSkills = getGroupedSkills();
  const categories = ['all', ...getAllCategories()];

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

  // Función para filtrar skills por categoría
  const getFilteredGrouped = () => {
    if (selectedCategory === 'all') return groupedSkills;

    const filtered: Record<string, any[]> = {
      [selectedCategory]: groupedSkills[selectedCategory] || []
    };

    return filtered;
  };

  // Función para ordenar skills
  const sortSkills = (skills: any[], sortOption: SortOption = 'alphabetical') => {
    try {
      if (!Array.isArray(skills)) return [];
      
      return [...skills].sort((a, b) => {
        if (!a || !b) return 0;
        
        switch (sortOption) {
          case 'alphabetical':
            const nameA = ((a.name || a.skill_name || '') + '').toLowerCase();
            const nameB = ((b.name || b.skill_name || '') + '').toLowerCase();
            return nameA.localeCompare(nameB);
            
          case 'alphabetical_desc':
            const nameDescA = ((a.name || a.skill_name || '') + '').toLowerCase();
            const nameDescB = ((b.name || b.skill_name || '') + '').toLowerCase();
            return nameDescB.localeCompare(nameDescA);
            
          case 'difficulty':
            const diffA = parseFloat(a.difficulty || 0);
            const diffB = parseFloat(b.difficulty || 0);
            return isNaN(diffB - diffA) ? 0 : diffB - diffA;
            
          case 'level':
            const levelA = parseFloat(a.level || 0);
            const levelB = parseFloat(b.level || 0);
            return isNaN(levelB - levelA) ? 0 : levelB - levelA;

          case 'difficulty_desc':
            const diffDescA = parseFloat(a.difficulty || 0);
            const diffDescB = parseFloat(b.difficulty || 0);
            return isNaN(diffDescA - diffDescB) ? 0 : diffDescA - diffDescB;
            
          case 'level_desc':
            const levelDescA = parseFloat(a.level || 0);
            const levelDescB = parseFloat(b.level || 0);
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

  // Aplicar ordenamiento a skills filtradas
  const getSortedFilteredGrouped = () => {
    const filtered = getFilteredGrouped();
    const sorted: Record<string, any[]> = {};
    
    Object.keys(filtered).forEach(category => {
      const skills = filtered[category] || [];
      const sortType = selectedSort[category] || selectedSort['default'] || 'alphabetical';
      sorted[category] = sortSkills(skills, sortType);
    });
    
    return sorted;
  };

  const filteredGrouped = getSortedFilteredGrouped();

  // Manejadores para formulario
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewSkill(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'level') {
      setNewSkill(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setNewSkill(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setNewSkill({
      name: '',
      category: selectedCategory !== "all" ? selectedCategory : '',
      icon_class: '',
      level: 50,
      demo_url: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSkillEdit = (skill: any) => {
    setEditingId(skill.id);
    setNewSkill({
      name: skill.name || '',
      category: skill.category || '',
      icon_class: skill.icon_class || '',
      level: skill.level || 50,
      demo_url: skill.demo_url || '',
    });
    setShowModal(true);
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
    e.preventDefault();
    
    try {
      if (editingId) {
        await handleEditSkill(editingId, newSkill);
      } else {
        await handleAddSkill(newSkill);
      }
      
      setShowModal(false);
      setEditingId(null);
      setNewSkill({
        name: '',
        category: selectedCategory !== "all" ? selectedCategory : '',
        icon_class: '',
        level: 50,
        demo_url: '',
      });
    } catch (error) {
      console.error('Error al guardar habilidad:', error);
    }
  };

  // Manejo de drag & drop
  const handleDragStart = (id: number) => {
    setDraggedSkillId(id);
    setSortingClass('dragging');
  };

  const handleDragOver = () => {
    // Permitir drop
  };

  const handleDrop = (id: number) => {
    if (draggedSkillId === null) return;
    
    console.log(`Reordenar: moviendo ${draggedSkillId} hacia ${id}`);
    
    setSortingClass('');
    setDraggedSkillId(null);
  };

  return (
    <section className="section-cv">
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
          <main className={styles.skillsMainContent}>
            <SkillsGrid
              filteredGrouped={filteredGrouped}
              skillsIcons={skillsIcons}
              onEdit={handleSkillEdit}
              onDelete={handleSkillDelete}
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

      {/* Modal para añadir/editar skills */}
      <SkillModal
        isOpen={showModal && !showAdminModal}
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

      {/* AdminModal para gestión completa de habilidades con tabs */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title="Administración de Habilidades"
        icon="fas fa-code"
        maxWidth="95vw"
        height="90vh"
        tabs={[
          { id: "list", label: "Listado", icon: "fas fa-th-list", content: null },
          { id: "categories", label: "Categorías", icon: "fas fa-tag", content: null },
          { id: "form", label: "Nueva Habilidad", icon: "fas fa-plus", content: null }
        ]}
        activeTab={activeAdminTab}
        onTabChange={(tabId: string) => setActiveAdminTab(tabId)}
        showTabs={true}
      >
        <SkillsAdmin 
          onClose={() => setShowAdminModal(false)}
          activeTab={activeAdminTab}
          onTabChange={setActiveAdminTab}
        />
      </AdminModal>

      {/* Floating Action Button para administrar habilidades */}
      {showAdminFAB && isAdmin && (
        <FloatingActionButton
          onClick={() => {
            setShowAdminModal(true);
            onAdminClick?.();
          }}
          icon="fas fa-cogs"
          label="Administrar Habilidades"
          color="primary"
          position="bottom-right"
          ariaLabel="Administrar habilidades"
        />
      )}
    </section>
  );
};

export default SkillsSection;
