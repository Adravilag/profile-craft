// src/components/sections/certifications/CertificationsAdmin.tsx

import React, { useState, useEffect } from "react";
import {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  type Certification,
} from "../../../services/api";
import { useNotification } from "../../../hooks/useNotification";
import ModalPortal from "../../common/ModalPortal";
import styles from "./CertificationsAdmin.module.css";
import "../../styles/modal.css";

interface CertificationsAdminProps {
  onClose: () => void;
}

const CertificationsAdmin: React.FC<CertificationsAdminProps> = ({ onClose }) => {  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useNotification();
  const [form, setForm] = useState({
    title: "",
    issuer: "",
    date: "",
    credential_id: "",
    image_url: "",
    order_index: 0,
  });

  const emptyForm = {
    title: "",
    issuer: "",
    date: "",
    credential_id: "",
    image_url: "",
    order_index: 0,
  };

  const loadCertifications = async () => {
    try {
      setLoading(true);
      const data = await getCertifications();
      setCertifications(data);
    } catch (error) {
      console.error("Error cargando certificaciones:", error);
      showError("Error", "No se pudieron cargar las certificaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertifications();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === "order_index" ? parseInt(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.issuer.trim() || !form.date.trim()) {
      showError("Error de validación", "Título, emisor y fecha son obligatorios");
      return;
    }

    try {
      setSaving(true);
      
      const certificationData = {
        ...form,
        user_id: 1,
        order_index: form.order_index || certifications.length,
      };

      if (editingId) {
        await updateCertification(editingId, certificationData);
        showSuccess("Certificación actualizada", "Los cambios se han guardado correctamente");
      } else {
        await createCertification(certificationData);
        showSuccess("Certificación creada", "La nueva certificación se ha añadido correctamente");
      }

      await loadCertifications();
      handleCloseForm();
    } catch (error) {
      console.error("Error guardando certificación:", error);
      showError("Error", "No se pudo guardar la certificación");
    } finally {
      setSaving(false);
    }
  };
  const handleEdit = (certification: Certification) => {
    setForm({
      title: certification.title,
      issuer: certification.issuer,
      date: certification.date,
      credential_id: certification.credential_id || "",
      image_url: certification.image_url || "",
      order_index: certification.order_index,
    });
    setEditingId(certification.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la certificación "${title}"?`)) {
      return;
    }

    try {
      await deleteCertification(id);
      showSuccess("Certificación eliminada", "La certificación se ha eliminado correctamente");
      await loadCertifications();
    } catch (error) {
      console.error("Error eliminando certificación:", error);
      showError("Error", "No se pudo eliminar la certificación");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleNewCertification = () => {
    setForm({
      ...emptyForm,
      order_index: certifications.length,
    });
    setEditingId(null);
    setShowForm(true);
  };
  return (
    <ModalPortal>
      <div className={styles.certificationsAdminOverlay}>
        <div className={styles.certificationsAdminModal}>
          <div className={styles.adminHeader}>
            <h2>
              <i className="fas fa-certificate"></i>
              Administración de Certificaciones
            </h2>            <button className={styles.closeBtn} onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>          <div className={styles.adminToolbar}>
            <button 
              className={styles.newCertificationBtn}
              onClick={handleNewCertification}
            >
              <i className="fas fa-plus"></i>
              Nueva Certificación
            </button>
          </div>          <div className="admin-content">
            {loading ? (
              <div className={styles.loading}>
                <i className="fas fa-spinner fa-spin"></i>
                <p>Cargando certificaciones...</p>
              </div>
            ) : certifications.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fas fa-certificate"></i>
                <h3>No hay certificaciones</h3>
                <p>Añade la primera certificación usando el botón de arriba.</p>
              </div>
            ) : (
              <div className={styles.certificationsList}>
                {certifications.map((certification) => (
                  <div key={certification.id} className={styles.adminCertificationCard}>                    <div className={styles.certificationHeader}>
                      <div className={styles.certificationImage}>
                        {certification.image_url ? (
                          <img
                            src={certification.image_url}
                            alt={certification.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/images/foto-perfil.jpg';
                            }}
                          />
                        ) : (
                          <div className={styles.placeholderImage}>
                            <i className="fas fa-certificate"></i>
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.certificationInfo}>
                        <h3>{certification.title}</h3>
                        <p className="issuer">{certification.issuer}</p>                        <p className="date">
                          <i className="fas fa-calendar-alt"></i>
                          {certification.date}
                        </p>                        {certification.credential_id && (
                          <p className="credentialId">                            <i className="fas fa-id-badge"></i>
                            ID: {certification.credential_id}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={styles.certificationActions}>
                      <button
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        onClick={() => handleEdit(certification)}
                      >
                        <i className="fas fa-edit"></i>
                        Editar
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(certification.id, certification.title)}
                      >
                        <i className="fas fa-trash"></i>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>          {/* Modal de formulario */}
          {showForm && (
            <div className={styles.formModalOverlay}>
              <div className={styles.formModal}>
                <div className={styles.formHeader}>
                  <h3>
                    <i className="fas fa-certificate"></i>
                    {editingId ? "Editar Certificación" : "Nueva Certificación"}
                  </h3>
                  <button className={styles.closeBtn} onClick={handleCloseForm}>
                    <i className="fas fa-times"></i>
                  </button>                </div>

                <form onSubmit={handleSubmit} className={styles.certificationForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="title">Título *</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        placeholder="Ej: AWS Solutions Architect"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="issuer">Emisor *</label>
                      <input
                        type="text"
                        id="issuer"
                        name="issuer"
                        value={form.issuer}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Amazon Web Services"
                      />
                    </div>                  </div>                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="date">Fecha de emisión *</label>
                      <input
                        type="text"
                        id="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                        placeholder="Ej: 2024, Marzo 2024, etc."
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="credential_id">ID de credencial</label>
                      <input
                        type="text"
                        id="credential_id"
                        name="credential_id"
                        value={form.credential_id}
                        onChange={handleChange}
                        placeholder="Ej: AWS-SAA-2024-001"
                      />
                    </div>                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="image_url">URL de imagen</label>
                      <input
                        type="url"
                        id="image_url"
                        name="image_url"
                        value={form.image_url}
                        onChange={handleChange}
                        placeholder="https://ejemplo.com/imagen.jpg"                      />
                    </div>                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="order_index">Orden</label>
                      <input
                        type="number"
                        id="order_index"
                        name="order_index"
                        value={form.order_index}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button 
                      type="button"                      className={styles.btnSecondary}
                      onClick={handleCloseForm}
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className={styles.btnPrimary}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          {editingId ? "Guardar Cambios" : "Crear Certificación"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>          )}
        </div>
      </div>
    </ModalPortal>
  );
};

export default CertificationsAdmin;
