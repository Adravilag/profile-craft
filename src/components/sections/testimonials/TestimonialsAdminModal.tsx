// src/components/sections/testimonials/TestimonialsAdminModal.tsx

import React, { useState, useEffect, useMemo } from "react";
import {
  getAdminTestimonials,
  approveTestimonial,
  rejectTestimonial,
  deleteTestimonial,
  type Testimonial,
} from "../../../services/api";
import { useNotification } from "../../../hooks/useNotification";
import AdminModal, { type TabConfig, type ActionButton } from "../../ui/AdminModal";
import TestimonialsFormModal, { type TestimonialFormData } from "./TestimonialsFormModal";
import styles from "./TestimonialsAdmin.module.css";

interface TestimonialsAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";
type SortOption = "newest" | "oldest" | "name";

const TestimonialsAdminModal: React.FC<TestimonialsAdminModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  // Estados principales
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterStatus>("pending");
  
  // Estados para funcionalidades básicas
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  
  const { showError } = useNotification();

  // Función para cargar testimonios
  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await getAdminTestimonials(
        activeTab === "all" ? undefined : activeTab
      );
      setTestimonials(data);
      
      // Cargar todos los testimonios para los conteos si no los tenemos
      if (allTestimonials.length === 0 || activeTab === "all") {
        const allData = await getAdminTestimonials();
        setAllTestimonials(allData);
      }
    } catch (error) {
      showError("Error al cargar testimonios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTestimonials();
    }
  }, [isOpen, activeTab]);

  // Funciones de gestión de testimonios
  const handleApprove = async (id: number) => {
    try {
      await approveTestimonial(id, testimonials.length);
      await loadTestimonials();
      const allData = await getAdminTestimonials();
      setAllTestimonials(allData);
    } catch (error) {
      showError("Error al aprobar testimonio");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectTestimonial(id);
      await loadTestimonials();
      const allData = await getAdminTestimonials();
      setAllTestimonials(allData);
    } catch (error) {
      showError("Error al rechazar testimonio");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este testimonio?")) {
      try {
        await deleteTestimonial(id);
        await loadTestimonials();
        const allData = await getAdminTestimonials();
        setAllTestimonials(allData);
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } catch (error) {
        showError("Error al eliminar testimonio");
      }
    }
  };

  // Funciones de selección
  const handleSelectAll = () => {
    if (selectedIds.size === filteredTestimonials.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTestimonials.map(t => t.id)));
    }
  };

  const handleSelectTestimonial = (id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Función para obtener avatar usando solo avatar_url
  const getAvatar = (testimonial: Testimonial): string => {
    if (testimonial.avatar_url) return testimonial.avatar_url;
    return "/assets/images/foto-perfil.jpg";
  };

  // Función de filtrado y ordenamiento
  const filteredTestimonials = useMemo(() => {
    let filtered = testimonials.filter(testimonial => {
      const matchesSearch = searchTerm === "" || 
        testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (testimonial.company && testimonial.company.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
        case "oldest":
          return new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime();
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [testimonials, searchTerm, sortBy]);
  // Configuración de tabs
  const tabs: TabConfig[] = [
    { 
      id: "pending", 
      label: "Pendientes", 
      icon: "fas fa-clock",
      content: null,
      badge: allTestimonials.filter(t => t.status === "pending").length 
    },
    { 
      id: "approved", 
      label: "Aprobados", 
      icon: "fas fa-check",
      content: null,
      badge: allTestimonials.filter(t => t.status === "approved").length 
    },
    { 
      id: "rejected", 
      label: "Rechazados", 
      icon: "fas fa-times",
      content: null,
      badge: allTestimonials.filter(t => t.status === "rejected").length 
    },
    { 
      id: "all", 
      label: "Todos", 
      icon: "fas fa-list",
      content: null,
      badge: allTestimonials.length 
    }
  ];
  // Floating actions básicas
  const floatingActions: ActionButton[] = [
    {
      id: "add",
      label: "Añadir Testimonio",
      icon: "fas fa-plus",
      onClick: () => {
        setEditingTestimonial(null);
        setShowFormModal(true);
      },
      variant: "primary"
    }
  ];  const handleFormSubmit = async (_data: TestimonialFormData) => {
    try {
      setShowFormModal(false);
      setEditingTestimonial(null);
      await loadTestimonials();
      const allData = await getAdminTestimonials();
      setAllTestimonials(allData);
    } catch (error) {
      showError("Error al guardar testimonio");
    }
  };

  return (
    <>      <AdminModal
        isOpen={isOpen}
        onClose={onClose}
        title="Gestión de Testimonios"
        subtitle="Administra los testimonios de tu sitio web"
        icon="fas fa-comments"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as FilterStatus)}
        floatingActions={floatingActions}
        showSearch={true}
      >
        {loading ? (
          <div className={styles.adminLoading}>
            <div className="spinner"></div>
            <p>Cargando testimonios...</p>
          </div>
        ) : (
          <div className={styles.adminContent}>
            <div className={styles.adminToolbar}>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Buscar testimonios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className={styles.sortSelect}
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="name">Por nombre</option>
              </select>

              {filteredTestimonials.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className={styles.selectAllBtn}
                >
                  {selectedIds.size === filteredTestimonials.length ? "Deseleccionar todos" : "Seleccionar todos"}
                </button>
              )}
            </div>

            {filteredTestimonials.length === 0 ? (
              <div className={styles.adminEmpty}>
                <i className="fas fa-comments fa-3x"></i>
                <h3>No hay testimonios</h3>
                <p>No se encontraron testimonios que coincidan con los filtros aplicados.</p>
              </div>
            ) : (
              <div className={styles.adminItemsList}>
                {filteredTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className={styles.adminItemCard}>
                    <div className={styles.adminCardRow}>
                      <div className={styles.adminItemHeader}>
                        <div className={styles.adminItemCheckbox}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(testimonial.id)}
                            onChange={() => handleSelectTestimonial(testimonial.id)}
                          />
                        </div>
                        <div className={styles.adminItemImage}>
                          <img
                            src={getAvatar(testimonial)}
                            alt={testimonial.name}
                            className={styles.testimonialAvatar}
                            onError={(e) => {
                              e.currentTarget.src = "/assets/images/foto-perfil.jpg";
                            }}
                          />
                        </div>
                        <div className={styles.adminItemInfo}>
                          <h4>{testimonial.name}</h4>
                          <p className={styles.adminItemSubtitle}>{testimonial.position}</p>
                          {testimonial.company && (
                            <p className={styles.adminItemContact}>
                              <i className="fas fa-building"></i> {testimonial.company}
                            </p>
                          )}
                          {testimonial.email && (
                            <p className={styles.adminItemContact}>
                              <i className="fas fa-envelope"></i> {testimonial.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className={styles.adminItemStatus}>
                        <span
                          className={styles.statusBadge}
                          data-status={testimonial.status || "pending"}
                        >
                          {testimonial.status === "approved" ? "Aprobado" : 
                           testimonial.status === "rejected" ? "Rechazado" : "Pendiente"}
                        </span>
                        {testimonial.created_at && (
                          <span className={styles.adminItemDate}>
                            {new Date(testimonial.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.adminCardRow}>
                      <div className={styles.adminItemContent}>
                        <p className={styles.testimonialText}>
                          {testimonial.text}
                        </p>
                      </div>
                      
                      <div className={styles.adminItemActions}>
                        {testimonial.status !== "approved" && (
                          <button
                            onClick={() => handleApprove(testimonial.id)}
                            className={`${styles.actionBtn} ${styles.approveBtn}`}
                            title="Aprobar"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                        
                        {testimonial.status !== "rejected" && (
                          <button
                            onClick={() => handleReject(testimonial.id)}
                            className={`${styles.actionBtn} ${styles.rejectBtn}`}
                            title="Rechazar"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setEditingTestimonial(testimonial);
                            setShowFormModal(true);
                          }}
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        
                        <button
                          onClick={() => handleDelete(testimonial.id)}
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Eliminar"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </AdminModal>

      <TestimonialsFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingTestimonial(null);
        }}
        onSubmit={handleFormSubmit}
        editingData={editingTestimonial ? {
          name: editingTestimonial.name,
          position: editingTestimonial.position,
          text: editingTestimonial.text,
          email: editingTestimonial.email || "",
          company: editingTestimonial.company || "",
          website: editingTestimonial.website || "",
        } : null}
        isLoading={loading}
      />
    </>
  );
};

export default TestimonialsAdminModal;
