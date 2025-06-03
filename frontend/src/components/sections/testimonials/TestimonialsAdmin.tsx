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
import styles from "./TestimonialsAdmin.module.css";

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
      <div className={styles.testimonialsAdminOverlay}>
        <div className={styles.testimonialsAdminModal}>
          <div className={styles.adminHeader}>
            <h2>
              <i className="fas fa-shield-alt"></i>
              Administración de Testimonios
              {pendingCount > 0 && (
                <span className={styles.pendingBadge}>{pendingCount} pendientes</span>
              )}
            </h2>
            <button className={styles.closeBtn} onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className={styles.adminFilters}>
            <button
              className={`${styles.filterBtn} ${filter === "pending" ? styles.active : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pendientes (
              {allTestimonials.filter((t) => t.status === "pending").length})
            </button>
            <button
              className={`${styles.filterBtn} ${filter === "approved" ? styles.active : ""}`}
              onClick={() => setFilter("approved")}
            >
              Aprobados (
              {allTestimonials.filter((t) => t.status === "approved").length})
            </button>
            <button
              className={`${styles.filterBtn} ${filter === "rejected" ? styles.active : ""}`}
              onClick={() => setFilter("rejected")}
            >
              Rechazados (
              {allTestimonials.filter((t) => t.status === "rejected").length})
            </button>
            <button
              className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
              onClick={() => setFilter("all")}
            >
              Todos ({allTestimonials.length})
            </button>
          </div>

          <div className={styles.adminContent}>
            {loading ? (
              <div className={styles.loading}>
                <i className="fas fa-spinner fa-spin"></i>
                Cargando testimonios...
              </div>
            ) : testimonials.length === 0 ? (
              <div className={styles.emptyState}>
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
              <div className={styles.adminTestimonialsList}>
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className={styles.adminTestimonialCard}>
                    <div className={styles.testimonialHeader}>
                      <div className={styles.testimonialMeta}>
                        <img
                          src={getAvatar(testimonial)}
                          alt={`Avatar de ${testimonial.name}`}
                          className={styles.testimonialAvatar}
                        />
                        <div className={styles.testimonialInfo}>
                          <h3>{testimonial.name}</h3>
                          <p className={styles.position}>
                            {testimonial.position}
                            {testimonial.company &&
                              ` en ${testimonial.company}`}
                          </p>
                          {testimonial.email && (
                            <p className={styles.email}>
                              <i className="fas fa-envelope"></i>
                              {testimonial.email}
                            </p>
                          )}
                          {testimonial.website && (
                            <p className={styles.website}>
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
                      <div className={styles.testimonialStatus}>
                        <span
                          className={styles.statusBadge}
                          style={{
                            backgroundColor: getStatusColor(
                              testimonial.status || "pending"
                            ),
                          }}
                        >
                          {getStatusText(testimonial.status || "pending")}
                        </span>
                        <span className={styles.createdDate}>
                          {testimonial.created_at &&
                            new Date(testimonial.created_at).toLocaleDateString(
                              "es-ES"
                            )}
                        </span>
                      </div>
                    </div>

                    <div className={styles.testimonialContent}>
                      <p>"{testimonial.text}"</p>
                    </div>

                    <div className={styles.testimonialActions}>
                      {testimonial.status === "pending" && (
                        <>
                          <button
                            className={`${styles.actionBtn} ${styles.approveBtn}`}
                            onClick={() => handleApprove(testimonial.id)}
                            title="Aprobar este testimonio"
                          >
                            <i className="fas fa-check"></i>
                            Aprobar
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.rejectBtn}`}
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
                          className={`${styles.actionBtn} ${styles.approveBtn}`}
                          onClick={() => handleApprove(testimonial.id)}
                          title="Aprobar este testimonio"
                        >
                          <i className="fas fa-check"></i>
                          Aprobar
                        </button>
                      )}
                      {testimonial.status === "approved" && (
                        <button
                          className={`${styles.actionBtn} ${styles.rejectBtn}`}
                          onClick={() => handleReject(testimonial.id)}
                          title="Quitar aprobación"
                        >
                          <i className="fas fa-ban"></i>
                          Quitar aprobación
                        </button>
                      )}
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
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
