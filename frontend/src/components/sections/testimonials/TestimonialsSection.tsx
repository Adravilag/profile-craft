// src/components/sections/testimonials/TestimonialsSection.tsx

import React from "react";
import {
  getAdminTestimonials,
  approveTestimonial,
  rejectTestimonial,
  deleteTestimonial,
  type Testimonial as APITestimonial,
} from "../../../services/api";
import { useNotification } from "../../../hooks/useNotification";
import FloatingActionButtonGroup from "../../common/FloatingActionButtonGroup";
import ModalPortal from "../../common/ModalPortal";
import AdminModal, { type TabConfig, adminStyles } from "../../ui/AdminModal";
import HeaderSection from "../header/HeaderSection";
import md5 from "blueimp-md5";
import styles from "./TestimonialsSection.module.css";
import "../../styles/modal.css";

export interface Testimonial {
  id: number;
  name: string;
  position: string;
  text: string;
  rating?: number;
  created_at?: string; // Agregamos la fecha de creación
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

interface TestimonialsSectionProps {
  testimonials: Array<{
    id: number;
    name: string;
    position: string;
    avatar: string;
    text: string;
    company?: string;
    website?: string;
    rating?: number;
    created_at?: string; // Agregamos la fecha de creación
  }>;
  onAdd: (t: {
    name: string;
    position: string;
    text: string;
    email?: string;
    company?: string;
    website?: string;
    user_id: number;
    order_index: number;
  }) => void;
  onEdit: (id: number, t: Partial<Testimonial>) => void;
  onDelete: (id: number) => void;
  isAdminMode?: boolean;
  showAdminFAB?: boolean;
  onAdminClick?: () => void;
}

const emptyForm = {
  name: "",
  position: "",
  text: "",
  email: "",
  company: "",
  website: "",
};

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  onAdd,
  onEdit,
  onDelete,
  isAdminMode = false,
  showAdminFAB = false,
  onAdminClick,
}) => {
  // Estados para el modal público
  const [form, setForm] = React.useState<typeof emptyForm>(emptyForm);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [animatingId, setAnimatingId] = React.useState<number | null>(null);
  const [showOptionalFields, setShowOptionalFields] =
    React.useState<boolean>(false);
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [isSectionActive, setIsSectionActive] = React.useState<boolean>(false);

  // Estados para administración
  const [showAdminModal, setShowAdminModal] = React.useState<boolean>(false);
  const [adminTestimonials, setAdminTestimonials] = React.useState<
    APITestimonial[]
  >([]);
  const [allAdminTestimonials, setAllAdminTestimonials] = React.useState<
    APITestimonial[]
  >([]);
  const [adminLoading, setAdminLoading] = React.useState<boolean>(false);
  const [filter, setFilter] = React.useState<FilterStatus>("pending");
  const { showSuccess, showError } = useNotification();
  const sectionRef = React.useRef<HTMLElement>(null);
  // Estado para funcionalidad "Leer más"
  const [expandedTestimonials, setExpandedTestimonials] = React.useState<
    Set<number>
  >(new Set());
  // Funciones helper para "Leer más"
  const needsReadMore = (text: string): boolean => text.length > 300;

  const getTruncatedText = (text: string, isExpanded: boolean): string => {
    if (!needsReadMore(text) || isExpanded) return text;
    return text.substring(0, 300) + "...";
  };  // Función mejorada para expandir/contraer testimonios con efectos premium
  const toggleExpanded = (id: number): void => {
    setExpandedTestimonials((prev) => {
      const newSet = new Set(prev);
      const isExpanding = !newSet.has(id);
      
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      
      // Manejar expansión con efectos mejorados
      if (isExpanding) {
        setTimeout(() => {
          const testimonialElement = document.getElementById(`testimonial-text-${id}`);
          const testimonialCard = testimonialElement?.closest(`.${styles["testimonial-card"]}`);
          const textContainer = testimonialElement?.closest(`.${styles["testimonial-text-container"]}`);
          
          if (testimonialCard && testimonialElement && textContainer) {
            // Añadir clase de animación de expansión
            testimonialElement.classList.add(styles["expanding"]);
            
            // Scroll suave hacia el testimonio
            testimonialCard.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest'
            });
            
            // Agregar clase temporal para animación de enfoque
            testimonialCard.classList.add(styles["testimonial-animate"]);
            
            // Verificar scroll y añadir indicadores
            setTimeout(() => {
              if (testimonialElement) {
                const needsScroll = testimonialElement.scrollHeight > testimonialElement.clientHeight;
                
                if (needsScroll) {
                  testimonialElement.classList.add("has-scroll");
                  textContainer.classList.add("has-scroll");
                  
                  // Añadir listener para scroll events
                  const handleScroll = () => {
                    const scrollTop = testimonialElement.scrollTop;
                    const scrollHeight = testimonialElement.scrollHeight;
                    const clientHeight = testimonialElement.clientHeight;
                    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
                    
                    // Actualizar posición del indicador de scroll
                    (textContainer as HTMLElement).style.setProperty('--scroll-percentage', `${scrollPercentage}%`);
                    
                    // Manejar fade del indicador cuando llega al final
                    if (scrollPercentage > 95) {
                      textContainer.classList.add('scroll-end-reached');
                    } else {
                      textContainer.classList.remove('scroll-end-reached');
                    }
                  };
                  
                  testimonialElement.addEventListener('scroll', handleScroll);
                  
                  // Cleanup function para remover el listener
                  setTimeout(() => {
                    testimonialElement.removeEventListener('scroll', handleScroll);
                  }, 30000); // Limpiar después de 30 segundos
                } else {
                  testimonialElement.classList.remove("has-scroll");
                  textContainer.classList.remove("has-scroll");
                }
                
                // Remover clase de expansión después de la animación
                setTimeout(() => {
                  testimonialElement.classList.remove(styles["expanding"]);
                }, 600);
              }
              
              // Remover clase de animación de enfoque
              testimonialCard.classList.remove(styles["testimonial-animate"]);
            }, 200);
          }
        }, 100);
      } else {
        // Manejar contracción
        const testimonialElement = document.getElementById(`testimonial-text-${id}`);
        const textContainer = testimonialElement?.closest(`.${styles["testimonial-text-container"]}`);
        
        if (testimonialElement && textContainer) {
          testimonialElement.classList.remove("has-scroll");
          textContainer.classList.remove("has-scroll");
          textContainer.classList.remove('scroll-end-reached');
          (textContainer as HTMLElement).style.removeProperty('--scroll-percentage');
        }
      }
      
      return newSet;
    });
  };

  // Función para formatear fecha
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Efecto para detectar cuando la sección es visible en el viewport
  React.useEffect(() => {
    const checkVisibility = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const isVisible =
        rect.top <=
          (window.innerHeight || document.documentElement.clientHeight) / 2 &&
        rect.bottom >= 100;

      if (isVisible) {        document.body.classList.add("testimonials-section-active");
        setIsSectionActive(true);
      } else {
        document.body.classList.remove("testimonials-section-active");
        setIsSectionActive(false);
      }
    };

    checkVisibility();
    window.addEventListener("scroll", checkVisibility);
    return () => window.removeEventListener("scroll", checkVisibility);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onEdit(editingId, form);
      setAnimatingId(editingId);
    } else {
      onAdd({ ...form, user_id: 1, order_index: testimonials.length });
      setAnimatingId(-1);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowOptionalFields(false);
    setShowModal(false);
    setTimeout(() => setAnimatingId(null), 800);
  };

  const handleEdit = (t: {
    id: number;
    name: string;
    position: string;
    text: string;
    company?: string;
    website?: string;
  }) => {
    setForm({
      name: t.name,
      position: t.position,
      text: t.text,
      email: "",
      company: t.company || "",
      website: t.website || "",
    });
    setEditingId(t.id);
    setShowModal(true);
    if (t.company || t.website) {
      setShowOptionalFields(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
    setShowOptionalFields(false);
  };

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/assets/images/foto-perfil.jpg";
  };

  // Función para renderizar estrellas de valoración
  const renderStars = (rating: number = 5) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(        <span
          key={i}
          className={`${styles.star} ${i <= rating ? styles["star-filled"] : styles["star-empty"]}`}
          aria-hidden="true"
        >
          ★
        </span>
      );
    }
    return <div className={styles["rating-stars"]}>{stars}</div>;
  };

  // Funciones de administración
  const loadAdminTestimonials = async () => {
    try {
      setAdminLoading(true);
      const data = await getAdminTestimonials(
        filter === "all" ? undefined : filter
      );
      setAdminTestimonials(data);

      if (allAdminTestimonials.length === 0) {
        const allData = await getAdminTestimonials();
        setAllAdminTestimonials(allData);
      }
    } catch (error) {
      console.error("Error loading admin testimonials:", error);
      showError("Error al cargar testimonios");
    } finally {
      setAdminLoading(false);
    }
  };

  React.useEffect(() => {
    if (showAdminModal) {
      loadAdminTestimonials();
    }
  }, [filter, showAdminModal]);

  const handleApprove = async (id: number) => {
    try {
      await approveTestimonial(id, adminTestimonials.length);
      showSuccess("Testimonio aprobado");
      const allData = await getAdminTestimonials();
      setAllAdminTestimonials(allData);
      loadAdminTestimonials();
    } catch (error) {
      showError("Error al aprobar testimonio");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectTestimonial(id);
      showSuccess("Testimonio rechazado");
      const allData = await getAdminTestimonials();
      setAllAdminTestimonials(allData);
      loadAdminTestimonials();
    } catch (error) {
      showError("Error al rechazar testimonio");
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este testimonio?")) {
      try {
        await deleteTestimonial(id);
        showSuccess("Testimonio eliminado");
        const allData = await getAdminTestimonials();
        setAllAdminTestimonials(allData);
        loadAdminTestimonials();
      } catch (error) {
        showError("Error al eliminar testimonio");
      }
    }
  };

  const getAvatar = (testimonial: APITestimonial) => {
    if (testimonial.email && testimonial.email.includes("@")) {
      const hash = md5(testimonial.email.toLowerCase().trim());
      return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=150`;
    }
    return "/assets/images/foto-perfil.jpg";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#4caf50";
      case "rejected":
        return "#f44336";
      case "pending":
        return "#ff9800";
      default:
        return "#9e9e9e";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobado";
      case "rejected":
        return "Rechazado";
      case "pending":
        return "Pendiente";
      default:
        return "Desconocido";
    }
  };

  const handleAdminModalClose = () => {
    setShowAdminModal(false);
  };

  const renderTestimonialsByFilter = () => {
    if (adminLoading) {
      return (
        <div className={adminStyles.adminLoading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando testimonios...</p>
        </div>
      );
    }

    if (adminTestimonials.length === 0) {
      return (
        <div className={adminStyles.adminEmpty}>
          <i className="fas fa-inbox"></i>
          <h3>No hay testimonios {getFilterText()}</h3>
          <p>
            {filter === "pending" &&
              "No hay testimonios pendientes de revisión."}
            {filter === "approved" && "No hay testimonios aprobados."}
            {filter === "rejected" && "No hay testimonios rechazados."}
            {filter === "all" && "No hay testimonios en el sistema."}
          </p>
        </div>
      );
    }

    return (
      <div className={adminStyles.adminItemsList}>
        {adminTestimonials.map((testimonial) => (
          <div key={testimonial.id} className={adminStyles.adminItemCard}>
            <div className={adminStyles.adminCardRow}>
              <div className={adminStyles.adminItemHeader}>
                <div className={adminStyles.adminItemImage}>
                  <img
                    src={getAvatar(testimonial)}
                    alt={`Avatar de ${testimonial.name}`}
                    className={adminStyles.testimonialAvatar}
                  />
                </div>
                <div className={adminStyles.adminItemInfo}>
                  <h3>{testimonial.name}</h3>
                  <p className={adminStyles.adminItemSubtitle}>
                    {testimonial.position}
                    {testimonial.company && ` en ${testimonial.company}`}
                  </p>
                  {testimonial.email && (
                    <p className={adminStyles.adminItemContact}>
                      <i className="fas fa-envelope"></i>
                      {testimonial.email}
                    </p>
                  )}
                  {testimonial.website && (
                    <p className={adminStyles.adminItemContact}>
                      <i className="fas fa-link"></i>
                      <a
                        href={
                          testimonial.website.startsWith("http")
                            ? testimonial.website
                            : `https://${testimonial.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {testimonial.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
              <div className={adminStyles.adminItemStatus}>
                <span
                  className={adminStyles.statusBadge}
                  style={{
                    backgroundColor: getStatusColor(
                      testimonial.status || "pending"
                    ),
                  }}
                >
                  {getStatusText(testimonial.status || "pending")}
                </span>
                {testimonial.created_at && (
                  <span className={adminStyles.adminItemDate}>
                    <i className="fas fa-calendar-alt"></i>
                    {new Date(testimonial.created_at).toLocaleDateString(
                      "es-ES"
                    )}
                  </span>
                )}
              </div>
            </div>            <div className={adminStyles.adminCardRow}>
              <div className={adminStyles.adminItemContent}>
                <p className={adminStyles.testimonialText}>
                  {testimonial.text}
                </p>
              </div>

              <div className={adminStyles.adminItemActions}>
                {testimonial.status === "pending" && (
                  <>
                    <button
                      className={adminStyles.adminBtnPrimary}
                      onClick={() => handleApprove(testimonial.id)}
                      title="Aprobar este testimonio"
                    >
                      <i className="fas fa-check"></i>
                      Aprobar
                    </button>
                    <button
                      className={adminStyles.adminBtnSecondary}
                      onClick={() => handleReject(testimonial.id)}
                      title="Rechazar este testimonio"
                    >
                      <i className="fas fa-times"></i>
                      Rechazar
                    </button>
                  </>
                )}
                {testimonial.status === "rejected" && (
                  <button
                    className={adminStyles.adminBtnPrimary}
                    onClick={() => handleApprove(testimonial.id)}
                    title="Aprobar este testimonio"
                  >
                    <i className="fas fa-check"></i>
                    Aprobar
                  </button>
                )}
                {testimonial.status === "approved" && (
                  <button
                    className={adminStyles.adminBtnSecondary}
                    onClick={() => handleReject(testimonial.id)}
                    title="Quitar aprobación"
                  >
                    <i className="fas fa-ban"></i>
                    Quitar aprobación
                  </button>
                )}
                <button
                  className={adminStyles.adminBtnDanger}
                  onClick={() => handleDeleteAdmin(testimonial.id)}
                  title="Eliminar permanentemente"
                >
                  <i className="fas fa-trash"></i>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getFilterText = () => {
    switch (filter) {
      case "pending":
        return "pendientes";
      case "approved":
        return "aprobados";
      case "rejected":
        return "rechazados";
      default:
        return "";
    }
  };

  const getFilterCount = (status: FilterStatus) => {
    if (status === "all") return allAdminTestimonials.length;
    return allAdminTestimonials.filter((t) => t.status === status).length;
  };

  const adminTabs: TabConfig[] = [
    {
      id: "pending",
      label: `Pendientes (${getFilterCount("pending")})`,
      icon: "fas fa-clock",
      content:
        filter === "pending" ? (
          renderTestimonialsByFilter()
        ) : (
          <div>Cargando...</div>
        ),
    },
    {
      id: "approved",
      label: `Aprobados (${getFilterCount("approved")})`,
      icon: "fas fa-check",
      content:
        filter === "approved" ? (
          renderTestimonialsByFilter()
        ) : (
          <div>Cargando...</div>
        ),
    },
    {
      id: "rejected",
      label: `Rechazados (${getFilterCount("rejected")})`,
      icon: "fas fa-times",
      content:
        filter === "rejected" ? (
          renderTestimonialsByFilter()
        ) : (
          <div>Cargando...</div>
        ),
    },
    {
      id: "all",
      label: `Todos (${getFilterCount("all")})`,
      icon: "fas fa-list",
      content:
        filter === "all" ? (
          renderTestimonialsByFilter()
        ) : (
          <div>Cargando...</div>
        ),
    },
  ];

  const handleTabChange = (tabId: string) => {
    setFilter(tabId as FilterStatus);
  };

  return (    <section
      id="testimonials"
      className={"section-cv"}
      aria-label="Testimonios"
      ref={sectionRef}
    ><HeaderSection
        icon="fas fa-comments"
        title="Testimonios"
        subtitle="Lo que dicen quienes han trabajado conmigo"
        className={styles.testimonials}
      />      {/* Modal para añadir/editar testimonios */}
      {showModal && (
        <ModalPortal>
          <div className={styles["modal-overlay"]} onClick={handleCloseModal}>
            <div className={styles["modal-content"]} onClick={(e) => e.stopPropagation()}>
              <div className={styles["modal-header"]}>
                <h3 className={styles["modal-title"]}>
                  <i className="fas fa-quote-left"></i>
                  {editingId ? "Editar Testimonio" : "Añadir Nuevo Testimonio"}
                </h3>
                <button
                  className={styles["modal-close"]}
                  onClick={handleCloseModal}
                  aria-label="Cerrar modal"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form className={styles["modal-form"]} onSubmit={handleSubmit}>
                <div className={styles["form-grid"]}>
                  <div className={styles["form-group"]}>
                    <label htmlFor="name">Nombre *</label>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>

                  <div className={styles["form-group"]}>
                    <label htmlFor="position">Puesto *</label>
                    <input
                      id="position"
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                      placeholder="Tu puesto de trabajo"
                      required
                    />
                  </div>
                </div>

                <div className={styles["form-group"]}>
                  <label htmlFor="text">Testimonio *</label>
                  <textarea
                    id="text"
                    name="text"
                    value={form.text}
                    onChange={handleChange}
                    placeholder="Comparte tu experiencia trabajando conmigo..."
                    required
                    rows={4}
                  />
                </div>

                {!showOptionalFields && (
                  <button
                    type="button"
                    className={styles["optional-toggle-btn"]}
                    onClick={() => setShowOptionalFields(true)}
                  >
                    <i className="fas fa-plus-circle"></i>
                    Añadir información adicional (opcional)
                  </button>
                )}

                {showOptionalFields && (
                  <div className={styles["optional-fields"]}>
                    <div className={styles["form-grid"]}>
                      <div className={styles["form-group"]}>
                        <label htmlFor="email">Email</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="email@ejemplo.com"
                        />
                        <small>Para mostrar tu avatar de Gravatar</small>
                      </div>

                      <div className={styles["form-group"]}>
                        <label htmlFor="company">Empresa</label>
                        <input
                          id="company"
                          name="company"
                          value={form.company}
                          onChange={handleChange}
                          placeholder="Nombre de la empresa"
                        />
                      </div>
                    </div>

                    <div className={styles["form-group"]}>
                      <label htmlFor="website">Sitio Web</label>
                      <input
                        id="website"
                        name="website"
                        type="url"
                        value={form.website}
                        onChange={handleChange}
                        placeholder="https://tusitio.com"
                      />
                    </div>

                    <button
                      type="button"
                      className={styles["optional-hide-btn"]}
                      onClick={() => setShowOptionalFields(false)}
                    >
                      <i className="fas fa-minus-circle"></i>
                      Ocultar campos opcionales
                    </button>
                  </div>
                )}

                <div className={styles["modal-actions"]}>
                  <button
                    type="button"
                    className={styles["btn-secondary"]}
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className={styles["btn-primary"]}>
                    <i className="fas fa-paper-plane"></i>
                    {editingId ? "Guardar Cambios" : "Enviar Testimonio"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}      {/* Formulario para modo admin */}
      {isAdminMode && (
        <form className={`${styles["testimonial-form"]} ${styles["admin-form"]}`} onSubmit={handleSubmit}>
          <div className={styles["form-row"]}>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre"
              required
            />
            <input
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="Puesto"
              required
            />
          </div>

          <textarea
            name="text"
            value={form.text}
            onChange={handleChange}
            placeholder="Testimonio"
            required
          />

          <div className={styles["form-row"]}>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email (opcional)"
            />
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Empresa (opcional)"
            />
          </div>
          <input
            name="website"
            type="url"
            value={form.website}
            onChange={handleChange}
            placeholder="Sitio web (opcional)"
          />

          <div className={styles["form-actions"]}>
            <button type="submit" className={`${styles["action-button"]} ${styles.primary}`}>
              {editingId ? "Guardar" : "Añadir Testimonio"}
            </button>
            {editingId && (
              <button
                type="button"
                className={styles["action-button"]}
                onClick={() => {
                  setForm(emptyForm);
                  setEditingId(null);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}<div className={"section-container"}>
        <div className={styles["testimonials-grid"]}>
          {testimonials.map(
            (
              {
                id,
                name,
                position,
                avatar,
                text,
                company,
                website,
                rating,
                created_at,
              },
              idx
            ) => {
              const isExpanded = expandedTestimonials.has(id);
              const displayText = getTruncatedText(text, isExpanded);

              return (                <div
                  key={id}
                  className={`${styles["testimonial-card"]}${
                    animatingId === id ||
                    (animatingId === -1 && idx === testimonials.length - 1)
                      ? ` ${styles["testimonial-animate"]}`
                      : ""
                  }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                  tabIndex={0}
                  aria-label={`Testimonio de ${name}`}
                >                  {/* Header: Avatar centrado */}
                  <div className={styles["testimonial-header"]}>
                    <div className={styles["testimonial-avatar-wrapper"]}>
                      <img
                        src={avatar}
                        alt={`Avatar de ${name}`}
                        className={styles["testimonial-avatar"]}
                        onError={handleImgError}
                      />
                    </div>
                  </div>                  {/* Body: Contenido principal que se expande */}
                  <div className={styles["testimonial-body"]}>
                    <div
                      className={styles["testimonial-text-container"]}
                      aria-expanded={isExpanded}
                      aria-controls={`testimonial-text-${id}`}
                    >
                      <p
                        className={`${styles["testimonial-text"]}${
                          isExpanded ? ` ${styles.expanded}` : ""
                        }`}
                        id={`testimonial-text-${id}`}
                      >
                        {displayText}
                      </p>
                      {needsReadMore(text) && (
                        <button
                          className={styles["read-more-btn"]}
                          onClick={() => toggleExpanded(id)}
                          aria-expanded={isExpanded}
                          aria-controls={`testimonial-text-${id}`}
                          aria-label={
                            isExpanded
                              ? "Contraer testimonio"
                              : "Expandir testimonio completo"
                          }
                        >
                          {isExpanded ? "Leer menos" : "Leer más"}
                        </button>
                      )}
                    </div>

                    {/* Renderizar estrellas de valoración */}
                    {renderStars(rating)}

                    {/* Fecha de creación */}
                    {created_at && (
                      <div className={styles["testimonial-date"]}>
                        <i
                          className="fas fa-calendar-alt"
                          aria-hidden="true"
                        ></i>
                        <span>{formatDate(created_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer: Información del autor - siempre en la base */}
                  <div className={styles["testimonial-footer"]}>
                    <div className={styles["testimonial-author"]}>
                      <div className={styles["author-info"]}>
                        <span className={styles["author-name"]}>{name}</span>
                        <span className={styles["author-position"]}>
                          {position}
                          {company && ` en ${company}`}
                        </span>
                        {website && (
                          <a
                            href={
                              website.startsWith("http")
                                ? website
                                : `https://${website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles["author-website"]}
                            aria-label={`Sitio web de ${name}`}
                            title="Visitar sitio web"
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </a>
                        )}
                      </div>
                    </div>

                    {isAdminMode && (
                      <div className={styles["testimonial-actions"]}>
                        <button
                          className={styles["edit-btn"]}
                          title="Editar"
                          aria-label={`Editar testimonio de ${name}`}
                          onClick={() =>
                            handleEdit({
                              id,
                              name,
                              position,
                              text,
                              company,
                              website,
                            })
                          }
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className={styles["delete-btn"]}
                          title="Eliminar"
                          aria-label={`Eliminar testimonio de ${name}`}
                          onClick={() => onDelete(id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          )}          {/* Placeholder para mantener el grid simétrico */}
          {testimonials.length % 3 !== 0 &&
            Array.from({ length: 3 - (testimonials.length % 3) }).map(
              (_, idx) => (
                <div
                  key={`placeholder-${idx}`}
                  className={styles["testimonial-placeholder"]}
                  aria-hidden="true"
                ></div>
              )
            )}
        </div>
      </div>

      {testimonials.length === 0 && (
        <div className={styles["empty-state"]}>
          <div className={styles["empty-icon"]}>
            <i className="fas fa-comments"></i>
          </div>
          <h3 className={styles["empty-title"]}>No hay testimonios disponibles</h3>
          <p className={styles["empty-description"]}>
            {isAdminMode
              ? "Añade el primer testimonio usando el formulario de arriba."
              : "¡Sé el primero en compartir tu experiencia!"}
          </p>
        </div>
      )}

      {/* Floating Action Buttons */}
      {isSectionActive && (
        <FloatingActionButtonGroup
          actions={[
            ...(showAdminFAB && onAdminClick
              ? [
                  {
                    id: "admin-testimonials",
                    onClick: isAdminMode
                      ? () => setShowAdminModal(true)
                      : onAdminClick,
                    icon: isAdminMode ? "fas fa-cog" : "fas fa-shield-alt",
                    label: "Gestionar Testimonios",
                    color: "primary" as const,
                  },
                ]
              : []),
            {
              id: "add-testimonial",
              onClick: () => setShowModal(true),
              icon: "fas fa-plus",
              label: "Añadir Testimonio",
              color: "success",
            },
          ]}
          position="bottom-right"
        />
      )}

      {/* Modal de administración */}
      {showAdminModal && (
        <AdminModal
          isOpen={showAdminModal}
          onClose={handleAdminModalClose}
          title="Administración de Testimonios"
          icon="fas fa-comments"
          tabs={adminTabs}
          onTabChange={handleTabChange}
          activeTab={filter}
          floatingActions={[
            {
              id: "refresh-testimonials",
              label: "Actualizar",
              icon: "fas fa-sync",
              variant: "secondary",
              onClick: loadAdminTestimonials,
            },
            {
              id: "export-testimonials",
              label: "Exportar",
              icon: "fas fa-download",
              variant: "primary",
              onClick: () => {
                showSuccess("Función de exportación en desarrollo");
              },
            },
          ]}
        />
      )}
    </section>
  );
};

export default TestimonialsSection;
