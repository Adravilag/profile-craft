// src/components/sections/skills/components/SkillsAdmin.tsx

import React, { useState, useEffect } from "react";
import { useSkills } from "../hooks/useSkills";
import { useSkillsIcons } from "../hooks/useSkillsIcons";
import styles from "./SkillsAdmin.module.css";
import { adminStyles } from "../../../ui/AdminModal";
import type { Skill } from "../../../../services/api";

interface SkillsAdminProps {
  onClose?: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const SkillsAdmin: React.FC<SkillsAdminProps> = ({
  activeTab,
  onTabChange,
}) => {
  // Hooks de skills
  const {
    skills,
    loading: skillsLoading,
    error: skillsError,
    handleAddSkill: addSkill,
    handleDeleteSkill: deleteSkillFromAPI,
  } = useSkills();

  const { skillsIcons } = useSkillsIcons();

  // Estados
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [skillNames, setSkillNames] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Formulario de nueva habilidad
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: "",
    category: "",
    icon_class: "",
    level: 50,
    demo_url: "",
    user_id: 1,
    order_index: 0,
  });

  // Categorías disponibles
  const categoryFilters = [
    "Frontend",
    "Backend",
    "Database",
    "Tools",
    "Design",
    "Other",
  ];
  // Obtener nombres únicos de habilidades del CSV
  useEffect(() => {
    if (skillsIcons.length > 0) {
      // Extraer nombres únicos del CSV de iconos
      const uniqueNames = Array.from(
        new Set(skillsIcons.map((skill) => skill.name))
      ).sort();
      setSkillNames(uniqueNames);
    }
  }, [skillsIcons]);

  // Filtrar habilidades por categoría y búsqueda
  useEffect(() => {
    let filtered = [...skills];

    // Filtrar por categoría si no es "all"
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (skill) => skill.category === selectedCategory
      );
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (skill) =>
          skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (skill.category &&
            skill.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Ordenar alfabéticamente por defecto
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredSkills(filtered);
  }, [skills, selectedCategory, searchTerm]);

  // Handlers
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setNewSkill((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === "level") {
      setNewSkill((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else if (name === "order_index") {
      setNewSkill((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setNewSkill((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingId(skill.id);
    setNewSkill(skill);
    onTabChange("form");
  };

  const handleDeleteSkill = async (id: number) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta habilidad?")
    ) {
      try {
        await deleteSkillFromAPI(id);
      } catch (error) {
        console.error("Error al eliminar habilidad:", error);
      }
    }
  };

  const handleNewSkill = () => {
    setEditingId(null);
    setNewSkill({
      name: "",
      category: selectedCategory !== "all" ? selectedCategory : "",
      icon_class: "",
      level: 50,
      demo_url: "",
      user_id: 1,
      order_index: 0,
    });
    onTabChange("form");
  };
  // Función para manejar la adición/edición de habilidad
  const handleSubmitSkill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Buscar un ícono que coincida
      const matchingIcon = skillsIcons.find(
        (icon) =>
          icon.name.toLowerCase() === (newSkill.name || "").toLowerCase()
      );
      // Configurar el ícono
      const updatedSkill = {
        ...newSkill,
        icon_class: matchingIcon?.svg_path || "fas fa-code",
      };

      if (editingId) {
        // Para editar, necesitamos usar la función de actualización del hook
        console.log("Editando skill:", updatedSkill);
      } else {
        await addSkill(updatedSkill as Skill, skillsIcons);
        // Limpiar formulario después de añadir
        setNewSkill({
          name: "",
          category: "",
          icon_class: "",
          level: 50,
          demo_url: "",
          user_id: 1,
          order_index: 0,
        });
      }

      // Volver a la pestaña de listado después de guardar
      onTabChange("list");
      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar habilidad:", error);
    }
  };
  // Renderizar la pestaña de formulario
  const renderFormTab = () => {
    return (
      <div className={styles.formContainer}>
        <form onSubmit={handleAddSkill} className="admin-form">
          <div className={styles.formGrid}>
            {/* Columna 1 */}
            <div className={styles.formColumn}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Nombre*</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={newSkill.name || ""}
                  onChange={handleFormChange}
                  placeholder="Nombre de la habilidad"
                  className={styles.formInput}
                  list="skill-suggestions"
                  required
                />
                <datalist id="skill-suggestions">
                  {skillNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <small>
                  El nombre debería coincidir con la base de datos de iconos
                </small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="category">Categoría*</label>
                <select
                  id="category"
                  name="category"
                  value={newSkill.category || ""}
                  onChange={handleFormChange}
                  className={styles.formInput}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categoryFilters.map((category: string) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="level">Nivel (0-100)</label>
                <input
                  id="level"
                  name="level"
                  type="number"
                  min="0"
                  max="100"
                  value={newSkill.level || 50}
                  onChange={handleFormChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="years_experience">Años de experiencia</label>
                <input
                  id="years_experience"
                  name="years_experience"
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={newSkill.years_experience || 0}
                  onChange={handleFormChange}
                  className={styles.formInput}
                />
              </div>
            </div>

            {/* Columna 2 */}
            <div className={styles.formColumn}>
              <div className={styles.formGroup}>
                <label htmlFor="demo_url">URL de Demo</label>
                <input
                  id="demo_url"
                  name="demo_url"
                  type="url"
                  value={newSkill.demo_url || ""}
                  onChange={handleFormChange}
                  placeholder="URL de demostración"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="personal_repo">Repositorio Personal</label>
                <input
                  id="personal_repo"
                  name="personal_repo"
                  type="url"
                  value={newSkill.personal_repo || ""}
                  onChange={handleFormChange}
                  placeholder="URL del repositorio"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="notes">Notas</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newSkill.notes || ""}
                  onChange={handleFormChange}
                  placeholder="Notas adicionales..."
                  className={styles.formTextarea}
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => onTabChange("list")}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              {editingId ? "Actualizar" : "Crear"} Habilidad
            </button>
          </div>
        </form>
      </div>
    );
  };
  // Renderizar contenido según la pestaña activa
  const renderContent = () => {
    if (skillsLoading) {
      return (
        <div className={adminStyles.loadingContainer}>
          <div className={adminStyles.spinner}></div>
          <p>Cargando habilidades...</p>
        </div>
      );
    }

    if (skillsError) {
      return (
        <div className={adminStyles.errorContainer}>
          <i className="fas fa-exclamation-circle"></i>
          <p>Error al cargar habilidades: {skillsError}</p>
          <button
            className={adminStyles.retryButton}
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (activeTab === "list") {
      return renderSkillsList();
    } else if (activeTab === "categories") {
      return renderCategoriesView();
    } else if (activeTab === "form") {
      return renderFormTab();
    }
  };  // Renderizar lista de habilidades
  const renderSkillsList = () => {
    return (
      <div className={styles.skillsAdminList}>
        <div className={styles.adminContainer}>
          {/* Sidebar con filtros de categorías */}
          <aside className={styles.categorySidebar}>
            <div className={styles.sidebarHeader}>
              <h3>Categorías</h3>
            </div>
            <div className={styles.categoryFilters}>
              <button 
                className={`${styles.categoryFilter} ${selectedCategory === 'all' ? styles.active : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                <span>Todas las categorías</span>
                <span className={styles.skillCount}>{skills.length}</span>
              </button>
              
              {categoryFilters.map((category: string) => {
                const categoryCount = skills.filter(skill => skill.category === category).length;
                return (
                  <button 
                    key={category} 
                    className={`${styles.categoryFilter} ${selectedCategory === category ? styles.active : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    <span>{category}</span>
                    <span className={styles.skillCount}>{categoryCount}</span>
                  </button>
                );
              })}
            </div>
            
            <div className={styles.sidebarActions}>
              <button className={styles.addButton} onClick={handleNewSkill}>
                <i className="fas fa-plus"></i> Nueva habilidad
              </button>
            </div>
          </aside>
          
          {/* Contenido principal con búsqueda y grid */}
          <main className={styles.adminMainContent}>
            <div className={styles.searchControls}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Buscar habilidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <i className="fas fa-search"></i>
              </div>
              
              <div className={styles.viewControls}>
                <button className={styles.viewButton} title="Vista en grid">
                  <i className="fas fa-th"></i>
                </button>
                <button className={styles.viewButton} title="Vista en lista">
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>

            {filteredSkills.length === 0 ? (
              <div className={styles.noSkills}>
                <i className="fas fa-info-circle"></i>
                <p>
                  No hay habilidades que coincidan con los criterios de búsqueda.
                </p>
                <button className={styles.addFirstButton} onClick={handleNewSkill}>
                  Añadir primera habilidad
                </button>
              </div>
            ) : (
              <div className={styles.skillsGrid}>
                {filteredSkills.map((skill) => (
                  <div key={skill.id} className={styles.skillCard}>
                    <div className={styles.skillCardHeader}>
                      <div className={styles.skillIcon}>
                        <i className={skill.icon_class || "fas fa-code"}></i>
                      </div>
                      <div className={styles.skillInfo}>
                        <h3>{skill.name}</h3>
                        <span className={styles.categoryTag}>{skill.category}</span>
                      </div>
                      <div className={styles.skillActions}>
                        <button
                          onClick={() => handleEditSkill(skill)}
                          className={styles.editButton}
                          title="Editar habilidad"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className={styles.deleteButton}
                          title="Eliminar habilidad"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>

                    <div className={styles.skillCardBody}>
                      <div className={styles.skillAttributes}>
                        <div className={styles.levelBar}>
                          <span>Nivel: {skill.level || 0}%</span>
                          <div className={styles.levelProgress}>
                            <div
                              className={styles.levelFill}
                              style={{ width: `${skill.level || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        {skill.years_experience && (
                          <div className={styles.experienceYears}>
                            <i className="fas fa-clock"></i>
                            <span>
                              {skill.years_experience}{" "}
                              {skill.years_experience === 1 ? "año" : "años"}
                            </span>
                          </div>
                        )}

                        {skill.demo_url && (
                          <div className={styles.demoLink}>
                            <a
                              href={skill.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fas fa-external-link-alt"></i> Ver demo
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    );
  };
  // Renderizar vista de categorías
  const renderCategoriesView = () => {
    // Agrupamos las habilidades por categoría
    const categorizedSkills: Record<string, Skill[]> = {};

    categoryFilters.forEach((category: string) => {
      categorizedSkills[category] = skills.filter(
        (skill) => skill.category === category
      );
    });

    return (
      <div className={styles.categoriesView}>
        <div className={styles.categoriesHeader}>
          <h3>Administración de Categorías</h3>
          <p>Visualiza y gestiona las habilidades agrupadas por categoría</p>
        </div>

        <div className={styles.categoriesGrid}>
          {categoryFilters.map((category: string) => (
            <div key={category} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>
                <h4>{category}</h4>
                <span className={styles.categoryCount}>
                  {categorizedSkills[category].length}{" "}
                  {categorizedSkills[category].length === 1
                    ? "habilidad"
                    : "habilidades"}
                </span>
              </div>

              <div className={styles.categorySkills}>
                {categorizedSkills[category].length > 0 ? (
                  <ul>
                    {categorizedSkills[category].map((skill) => (
                      <li key={skill.id}>
                        <span className={styles.skillName}>{skill.name}</span>
                        <div className={styles.skillItemActions}>
                          <button
                            onClick={() => handleEditSkill(skill)}
                            title="Editar"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(skill.id)}
                            title="Eliminar"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.emptyCategory}>
                    <p>No hay habilidades en esta categoría</p>
                    <button
                      onClick={() => {
                        setNewSkill((prev) => ({ ...prev, category }));
                        onTabChange("form");
                      }}
                    >
                      <i className="fas fa-plus"></i> Añadir habilidad
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.categoryFooter}>
                <button
                  className={styles.addToCategoryButton}
                  onClick={() => {
                    setNewSkill((prev) => ({ ...prev, category }));
                    onTabChange("form");
                  }}
                >
                  <i className="fas fa-plus"></i> Añadir a {category}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return <>{renderContent()}</>;
};

export default SkillsAdmin;
