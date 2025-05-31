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
import AdminModal, { type TabConfig } from "../../ui/AdminModal";
import md5 from "blueimp-md5";
import "./TestimonialsSection.css";
import "../../styles/modal.css";

export interface Testimonial {
  id: number;
  name: string;
  position: string;
  text: string;
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

  // Funciones de administración
  const loadAdminTestimonials = async () => {
    try {
      setAdminLoading(true);
      const data = await getAdminTestimonials(
        filter === "all" ? undefined : filter
      );
      setAdminTestimonials(data);

      // Cargar todos los testimonios para los conteos si no los tenemos
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
      // Recargar todos los testimonios para actualizar conteos
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
      // Recargar todos los testimonios para actualizar conteos
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
        // Recargar todos los testimonios para actualizar conteos
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

  // Renderizado de testimonios por filtro
  const renderTestimonialsByFilter = () => {
    if (adminLoading) {
      return (
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando testimonios...</p>
        </div>
      );
    }

    if (adminTestimonials.length === 0) {
      return (
        <div className="admin-empty">
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
      <div className="admin-items-list">
        {adminTestimonials.map((testimonial) => (
          <div key={testimonial.id} className="admin-item-card">
            <div className="admin-card-row">
              <div className="admin-item-header">
                <div className="admin-item-image">
                  <img
                    src={getAvatar(testimonial)}
                    alt={`Avatar de ${testimonial.name}`}
                    className="testimonial-avatar"
                  />
                </div>

                <div className="admin-item-info">
                  <h3>{testimonial.name}</h3>
                  <p className="admin-item-subtitle">
                    {testimonial.position}
                    {testimonial.company && ` en ${testimonial.company}`}
                  </p>
                  {testimonial.email && (
                    <p className="admin-item-contact">
                      <i className="fas fa-envelope"></i>
                      {testimonial.email}
                    </p>
                  )}
                  {testimonial.website && (
                    <p className="admin-item-contact">
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
              <div className="admin-item-status">
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(
                      testimonial.status || "pending"
                    ),
                  }}
                >
                  {getStatusText(testimonial.status || "pending")}
                </span>
                {testimonial.created_at && (
                  <span className="admin-item-date">
                    <i className="fas fa-calendar-alt"></i>
                    {new Date(testimonial.created_at).toLocaleDateString(
                      "es-ES"
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className="admin-card-row">
              <div className="admin-item-content">
                <p className="testimonial-text">"{testimonial.text}"</p>
              </div>

              <div className="admin-item-actions">
                {testimonial.status === "pending" && (
                  <>
                    <button
                      className="admin-btn-primary"
                      onClick={() => handleApprove(testimonial.id)}
                      title="Aprobar este testimonio"
                    >
                      <i className="fas fa-check"></i>
                      Aprobar
                    </button>
                    <button
                      className="admin-btn-secondary"
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
                    className="admin-btn-primary"
                    onClick={() => handleApprove(testimonial.id)}
                    title="Aprobar este testimonio"
                  >
                    <i className="fas fa-check"></i>
                    Aprobar
                  </button>
                )}
                {testimonial.status === "approved" && (
                  <button
                    className="admin-btn-secondary"
                    onClick={() => handleReject(testimonial.id)}
                    title="Quitar aprobación"
                  >
                    <i className="fas fa-ban"></i>
                    Quitar aprobación
                  </button>
                )}
                <button
                  className="admin-btn-danger"
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
  }; // Configuración de tabs para AdminModal
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

  return (
    <section className="cv-section" aria-label="Testimonios">
      <div className="section-header">
        <h2 className="section-title">
          <div className="title-icon">
            <i className="fas fa-comments"></i>
          </div>
          <span className="title-text">Testimonios</span>
          <div className="title-decoration"></div>
        </h2>{" "}
        <p className="section-subtitle">
          Lo que dicen quienes han trabajado conmigo
        </p>
      </div>{" "}
      {/* Modal para añadir/editar testimonios */}
      {showModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <i className="fas fa-quote-left"></i>
                  {editingId ? "Editar Testimonio" : "Añadir Nuevo Testimonio"}
                </h3>
                <button
                  className="modal-close"
                  onClick={handleCloseModal}
                  aria-label="Cerrar modal"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
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

                  <div className="form-group">
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

                <div className="form-group">
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
                    className="optional-toggle-btn"
                    onClick={() => setShowOptionalFields(true)}
                  >
                    <i className="fas fa-plus-circle"></i>
                    Añadir información adicional (opcional)
                  </button>
                )}

                {showOptionalFields && (
                  <div className="optional-fields">
                    <div className="form-grid">
                      <div className="form-group">
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

                      <div className="form-group">
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

                    <div className="form-group">
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
                      className="optional-hide-btn"
                      onClick={() => setShowOptionalFields(false)}
                    >
                      <i className="fas fa-minus-circle"></i>
                      Ocultar campos opcionales
                    </button>
                  </div>
                )}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-paper-plane"></i>
                    {editingId ? "Guardar Cambios" : "Enviar Testimonio"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
      {/* Formulario para modo admin */}
      {isAdminMode && (
        <form className="testimonial-form admin-form" onSubmit={handleSubmit}>
          <div className="form-row">
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

          <div className="form-row">
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

          <div className="form-actions">
            <button type="submit" className="action-button primary">
              {editingId ? "Guardar" : "Añadir Testimonio"}
            </button>
            {editingId && (
              <button
                type="button"
                className="action-button"
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
      )}
      <div className="section-container">
        <div className="testimonials-grid">
          {testimonials.map(
            ({ id, name, position, avatar, text, company, website }, idx) => (
              <div
                key={id}
                className={`testimonial-card${
                  animatingId === id ||
                  (animatingId === -1 && idx === testimonials.length - 1)
                    ? " testimonial-animate"
                    : ""
                }`}
                tabIndex={0}
                aria-label={`Testimonio de ${name}`}
              >
                <div className="testimonial-avatar-wrapper">
                  <img
                    src={avatar}
                    alt={`Avatar de ${name}`}
                    className="testimonial-avatar"
                    onError={handleImgError}
                  />
                </div>
                <div className="testimonial-content">
                  <span className="quote-icon" aria-hidden="true">
                    "
                  </span>
                  <p className="testimonial-text">{text}</p>
                  <div className="testimonial-author">
                    <div className="author-info">
                      <span className="author-name">{name}</span>
                      <span className="author-position">
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
                          className="author-website"
                          aria-label={`Sitio web de ${name}`}
                        >
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                      )}
                    </div>
                  </div>
                  {isAdminMode && (
                    <div className="testimonial-actions">
                      <button
                        className="edit-btn"
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
                        tabIndex={0}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="delete-btn"
                        title="Eliminar"
                        aria-label={`Eliminar testimonio de ${name}`}
                        onClick={() => onDelete(id)}
                        tabIndex={0}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
      {testimonials.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-comments"></i>
          </div>
          <h3 className="empty-title">No hay testimonios disponibles</h3>
          <p className="empty-description">
            {isAdminMode
              ? "Añade el primer testimonio usando el formulario de arriba."
              : "¡Sé el primero en compartir tu experiencia!"}
          </p>{" "}
        </div>
      )}{" "}
      {/* Floating Action Buttons para testimonios */}
      {!isAdminMode && (
        <FloatingActionButtonGroup
          actions={[
            {
              id: "add-testimonial",
              onClick: () => {
                console.log("FAB clicked - opening modal");
                setShowModal(true);
              },
              icon: "fas fa-plus",
              label: "Añadir Testimonio",
              color: "secondary",
            },
            ...(showAdminFAB && onAdminClick
              ? [
                  {
                    id: "admin-panel",
                    onClick: () => {
                      console.log("Admin FAB clicked - opening admin modal");
                      setShowAdminModal(true);
                    },
                    icon: "fas fa-cog",
                    label: "Panel Admin",
                    color: "warning" as const,
                  },
                ]
              : []),
          ]}
          position="bottom-right"
        />
      )}{" "}
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
        />
      )}
    </section>
  );
};

export default TestimonialsSection;
