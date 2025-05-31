// src/components/sections/skills/hooks/useSkills.ts

import { useState, useEffect } from 'react';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../../../../services/api';
import type { Skill } from '../../../../services/api';
import type { SkillFormData } from '../types/skills';
import { getSkillSvg } from '../utils/skillUtils';

const defaultNewSkill: SkillFormData = {
  name: "",
  category: "Frontend",
  icon_class: "",
  level: 50,
};

export const useSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newSkill, setNewSkill] = useState<SkillFormData>(defaultNewSkill);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draggedSkillId, setDraggedSkillId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Cargar skills iniciales
  useEffect(() => {
    getSkills()
      .then((data) => {
        setSkills(data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudieron cargar las habilidades.");
        setLoading(false);
      });
  }, []);

  // Handlers para el modal
  const handleOpenModal = () => {
    setNewSkill(defaultNewSkill);
    setEditingId(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  // Handlers para formulario
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Si cambia la categoría, resetear campos relacionados
    if (name === 'category') {
      setNewSkill((prev) => ({
        ...prev,
        [name]: value,
        name: '', // Limpiar nombre
        level: 50 // Resetear nivel
      }));
    } else {
      setNewSkill((prev) => ({
        ...prev,
        [name]: name === "level" ? Number(value) : value,
      }));
    }
  };

  // Handler para añadir/editar skill
  const handleAddSkill = async (e: React.FormEvent, skillsIcons: any[]) => {
    e.preventDefault();

    // Determinar SVG usando la función utilitaria
    const svg_path = getSkillSvg(
      newSkill.name,
      newSkill.icon_class,
      skillsIcons
    );

    try {
      if (editingId) {
        const updated = await updateSkill(editingId, {
          ...newSkill,
          icon_class: svg_path,
        });
        setSkills((prev) =>
          prev.map((s) => (s.id === editingId ? updated : s))
        );
      } else {
        const created = await createSkill({
          ...newSkill,
          icon_class: svg_path,
          user_id: 1,
          order_index: skills.length + 1,
        });
        setSkills((prev) => [...prev, created]);
      }
      setShowModal(false);
      setEditingId(null);
    } catch {
      alert("Error al guardar la habilidad");
    }
  };

  // Handler para editar skill
  const handleEditSkill = (skill: Skill) => {
    setNewSkill({
      name: skill.name,
      category: skill.category,
      icon_class: skill.icon_class || "",
      level: skill.level ?? 50,
    });
    setEditingId(skill.id);
    setShowModal(true);
  };

  // Handler para eliminar skill
  const handleDeleteSkill = async (id: number) => {
    if (window.confirm("¿Seguro que quieres eliminar esta habilidad?")) {
      try {
        await deleteSkill(id);
        setSkills((prev) => prev.filter((s) => s.id !== id));
      } catch {
        alert("Error al eliminar la habilidad");
      }
    }
  };

  // Funciones drag & drop
  const handleDragStart = (id: number) => setDraggedSkillId(id);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();
  
  const handleDrop = async (targetId: number) => {
    if (draggedSkillId === null || draggedSkillId === targetId) return;
    
    const draggedIdx = skills.findIndex((s) => s.id === draggedSkillId);
    const targetIdx = skills.findIndex((s) => s.id === targetId);
    
    if (draggedIdx === -1 || targetIdx === -1) return;
    
    // Reordenar array localmente
    const reordered = [...skills];
    const [removed] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, removed);
    
    // Actualizar order_index en backend
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].order_index !== i + 1) {
        await updateSkill(reordered[i].id, {
          ...reordered[i],
          order_index: i + 1,
        });
      }
    }
    
    setSkills(reordered);
    setDraggedSkillId(null);
  };

  // Funciones para agrupar y filtrar skills
  const getGroupedSkills = () => {
    return skills.reduce<Record<string, Skill[]>>((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {});
  };

  const getFilteredGrouped = () => {
    const grouped = getGroupedSkills();
    return selectedCategory === "All"
      ? grouped
      : Object.keys(grouped).reduce<Record<string, Skill[]>>(
          (acc, category) => {
            if (category === selectedCategory) {
              acc[category] = grouped[category];
            }
            return acc;
          },
          {}
        );
  };

  const getAllCategories = () => {
    const grouped = getGroupedSkills();
    return ["All", ...Object.keys(grouped)];
  };

  return {
    // State
    skills,
    loading,
    error,
    showModal,
    newSkill,
    editingId,
    draggedSkillId,
    selectedCategory,
    
    // Setters
    setSelectedCategory,
    setSkills,
    
    // Handlers
    handleOpenModal,
    handleCloseModal,
    handleFormChange,
    handleAddSkill,
    handleEditSkill,
    handleDeleteSkill,
    handleDragStart,
    handleDragOver,
    handleDrop,
    
    // Computed values
    getGroupedSkills,
    getFilteredGrouped,
    getAllCategories,
  };
};