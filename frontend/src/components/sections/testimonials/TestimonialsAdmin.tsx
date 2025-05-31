// src/components/sections/testimonials/TestimonialsAdmin.tsx

import React, { useState, useEffect } from "react";
import {
  getAdminTestimonials,
  approveTestimonial,
  rejectTestimonial,
  deleteTestimonial,
  type Testimonial,
} from "../../../services/api";
import { useNotification } from "../../../hooks/useNotification";
import ModalPortal from "../../common/ModalPortal";
import md5 from "blueimp-md5";
import "./TestimonialsAdmin.css";

interface TestimonialsAdminProps {
  onClose: () => void;
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

const TestimonialsAdmin: React.FC<TestimonialsAdminProps> = ({ onClose }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const { showSuccess, showError } = useNotification();  const loadTestimonials = async () => {
    try {
      setLoading(true);
      console.log('TestimonialsAdmin: Loading testimonials with filter:', filter);
      const data = await getAdminTestimonials(
        filter === "all" ? undefined : filter
      );
      console.log('TestimonialsAdmin: Loaded testimonials:', data.length, data);
      setTestimonials(data);
      
      // Cargar todos los testimonios para los conteos si no los tenemos
      if (allTestimonials.length === 0) {
        const allData = await getAdminTestimonials();
        setAllTestimonials(allData);
      }
    } catch (error) {
      console.error('TestimonialsAdmin: Error loading testimonials:', error);
      showError("Error al cargar testimonios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, [filter]);  const handleApprove = async (id: number) => {
    try {
      await approveTestimonial(id, testimonials.length);
      showSuccess("Testimonio aprobado");
      // Recargar todos los testimonios para actualizar conteos
      const allData = await getAdminTestimonials();
      setAllTestimonials(allData);
      loadTestimonials();
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
      setAllTestimonials(allData);
      loadTestimonials();
    } catch (error) {
      showError("Error al rechazar testimonio");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este testimonio?")) {
      try {
        await deleteTestimonial(id);
        showSuccess("Testimonio eliminado");
        // Recargar todos los testimonios para actualizar conteos
        const allData = await getAdminTestimonials();
        setAllTestimonials(allData);
        loadTestimonials();
      } catch (error) {
        showError("Error al eliminar testimonio");
      }
    }
  };

  const getAvatar = (testimonial: Testimonial) => {
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
  const pendingCount = allTestimonials.filter(
    (t) => t.status === "pending"
  ).length;
  return (
    <ModalPortal>
      <div className="testimonials-admin-overlay">
        <div className="testimonials-admin-modal">
          <div className="admin-header">
            <h2>
              <i className="fas fa-shield-alt"></i>
              Administración de Testimonios
              {pendingCount > 0 && (
                <span className="pending-badge">{pendingCount} pendientes</span>
              )}
            </h2>
            <button className="close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="admin-filters">            <button
              className={`filter-btn ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pendientes (
              {allTestimonials.filter((t) => t.status === "pending").length})
            </button>
            <button
              className={`filter-btn ${filter === "approved" ? "active" : ""}`}
              onClick={() => setFilter("approved")}
            >
              Aprobados (
              {allTestimonials.filter((t) => t.status === "approved").length})
            </button>
            <button
              className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
              onClick={() => setFilter("rejected")}
            >
              Rechazados (
              {allTestimonials.filter((t) => t.status === "rejected").length})
            </button>
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Todos ({allTestimonials.length})
            </button>
          </div>

          <div className="admin-content">
            {loading ? (
              <div className="loading">
                <i className="fas fa-spinner fa-spin"></i>
                Cargando testimonios...
              </div>
            ) : testimonials.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>
                  No hay testimonios{" "}
                  {filter !== "all"
                    ? `${
                        filter === "pending"
                          ? "pendientes"
                          : filter === "approved"
                          ? "aprobados"
                          : "rechazados"
                      }`
                    : ""}
                </p>
              </div>
            ) : (
              <div className="admin-testimonials-list">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="admin-testimonial-card">
                    <div className="testimonial-header">
                      <div className="testimonial-meta">
                        <img
                          src={getAvatar(testimonial)}
                          alt={`Avatar de ${testimonial.name}`}
                          className="testimonial-avatar"
                        />
                        <div className="testimonial-info">
                          <h3>{testimonial.name}</h3>
                          <p className="position">
                            {testimonial.position}
                            {testimonial.company &&
                              ` en ${testimonial.company}`}
                          </p>
                          {testimonial.email && (
                            <p className="email">
                              <i className="fas fa-envelope"></i>
                              {testimonial.email}
                            </p>
                          )}
                          {testimonial.website && (
                            <p className="website">
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
                      <div className="testimonial-status">
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
                        <span className="created-date">
                          {testimonial.created_at &&
                            new Date(testimonial.created_at).toLocaleDateString(
                              "es-ES"
                            )}
                        </span>
                      </div>
                    </div>

                    <div className="testimonial-content">
                      <p>"{testimonial.text}"</p>
                    </div>                    <div className="testimonial-actions">
                      {testimonial.status === "pending" && (
                        <>
                          <button
                            className="action-btn approve-btn"
                            onClick={() => handleApprove(testimonial.id)}
                            title="Aprobar este testimonio"
                          >
                            <i className="fas fa-check"></i>
                            Aprobar
                          </button>
                          <button
                            className="action-btn reject-btn"
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
                          className="action-btn approve-btn"
                          onClick={() => handleApprove(testimonial.id)}
                          title="Aprobar este testimonio"
                        >
                          <i className="fas fa-check"></i>
                          Aprobar
                        </button>
                      )}
                      {testimonial.status === "approved" && (
                        <button
                          className="action-btn reject-btn"
                          onClick={() => handleReject(testimonial.id)}
                          title="Quitar aprobación"
                        >
                          <i className="fas fa-ban"></i>
                          Quitar aprobación
                        </button>
                      )}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(testimonial.id)}
                        title="Eliminar permanentemente"
                      >
                        <i className="fas fa-trash"></i>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default TestimonialsAdmin;
