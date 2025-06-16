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
import DatePicker from "../../ui/DatePicker";
import IssuerSelector from "../../ui/IssuerSelector";
import CredentialIdInput from "../../ui/CredentialIdInput";
import {
  type CertificationIssuer,
  CERTIFICATION_ISSUERS,
  generateVerifyUrl,
  generateCertificateImageUrl,
} from "../../../data/certificationIssuers";
import styles from "./CertificationsAdmin.module.css";
import "../../styles/modal.css";

interface CertificationsAdminProps {
  onClose: () => void;
}

const CertificationsAdmin: React.FC<CertificationsAdminProps> = ({
  onClose,
}) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
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

  const [selectedIssuer, setSelectedIssuer] =
    useState<CertificationIssuer | null>(null);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "order_index" ? parseInt(value) || 0 : value,
    }));
  };

  const handleDateChange = (value: string) => {
    setForm((prev) => ({ ...prev, date: value }));
  };

  const handleIssuerChange = (issuer: CertificationIssuer) => {
    if (issuer.name) {
      setSelectedIssuer(issuer);
      setForm((prev) => ({
        ...prev,
        issuer: issuer.name,
        // Auto-mapear la imagen del logo del emisor
        image_url: issuer.logoUrl || prev.image_url,
      }));

      // Si ya hay un credential_id, generar URLs automáticamente
      if (form.credential_id && form.credential_id.trim()) {
        // Generar URL de verificación
        if (issuer.verifyBaseUrl) {
          const verifyUrl = generateVerifyUrl(issuer, form.credential_id);
          if (verifyUrl) {
            setForm((prev) => ({ ...prev, verify_url: verifyUrl }));
          }
        }

        // Generar URL de imagen del certificado si está disponible
        if (issuer.certificateImageUrl) {
          const certificateImageUrl = generateCertificateImageUrl(
            issuer,
            form.credential_id
          );
          if (certificateImageUrl) {
            setForm((prev) => ({ ...prev, image_url: certificateImageUrl }));
          }
        }
      }
    } else {
      // Limpieza cuando se vacía el selector
      setSelectedIssuer(null);
      setForm((prev) => ({
        ...prev,
        issuer: "",
        image_url: "",
        verify_url: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.issuer.trim() || !form.date.trim()) {
      showError(
        "Error de validación",
        "Título, emisor y fecha son obligatorios"
      );
      return;
    }

    try {
      setSaving(true);

      // Generar URLs automáticamente si hay emisor seleccionado y credential_id
      let verifyUrl = "";
      let imageUrl = form.image_url; // Usar la imagen actual por defecto

      if (selectedIssuer && form.credential_id.trim()) {
        // Generar URL de verificación
        const generatedVerifyUrl = generateVerifyUrl(
          selectedIssuer,
          form.credential_id
        );
        if (generatedVerifyUrl) {
          verifyUrl = generatedVerifyUrl;
        }

        // Generar URL de imagen del certificado si está disponible
        if (selectedIssuer.certificateImageUrl) {
          const certificateImageUrl = generateCertificateImageUrl(
            selectedIssuer,
            form.credential_id
          );
          if (certificateImageUrl) {
            imageUrl = certificateImageUrl;
          }
        }
      } else if (selectedIssuer && !form.credential_id.trim()) {
        // Si hay emisor pero no credential_id, usar el logo del emisor
        imageUrl = selectedIssuer.logoUrl || form.image_url;
      }

      const certificationData = {
        ...form,
        image_url: imageUrl,
        verify_url: verifyUrl || undefined,
        user_id: 1,
        order_index: form.order_index || certifications.length,
      };

      if (editingId) {
        await updateCertification(editingId, certificationData);
        showSuccess(
          "Certificación actualizada",
          "Los cambios se han guardado correctamente"
        );
      } else {
        await createCertification(certificationData);
        showSuccess(
          "Certificación creada",
          "La nueva certificación se ha añadido correctamente"
        );
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
    // Buscar el emisor basado en el nombre
    const issuer = CERTIFICATION_ISSUERS.find(
      (iss: CertificationIssuer) => iss.name === certification.issuer
    );

    setForm({
      title: certification.title,
      issuer: certification.issuer,
      date: certification.date,
      credential_id: certification.credential_id || "",
      image_url: certification.image_url || "",
      order_index: certification.order_index,
    });

    // Configurar el emisor seleccionado para habilitar la funcionalidad automática
    setSelectedIssuer(issuer || null);
    setEditingId(certification.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la certificación "${title}"?`)) {
      return;
    }

    try {
      await deleteCertification(id.toString());
      showSuccess(
        "Certificación eliminada",
        "La certificación se ha eliminado correctamente"
      );
      await loadCertifications();
    } catch (error) {
      console.error("Error eliminando certificación:", error);
      showError("Error", "No se pudo eliminar la certificación");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setSelectedIssuer(null);
    setEditingId(null);
  };

  const handleNewCertification = () => {
    setForm({
      ...emptyForm,
      order_index: certifications.length,
    });
    setSelectedIssuer(null);
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
            </h2>{" "}
            <button className={styles.closeBtn} onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>{" "}
          <div className={styles.adminToolbar}>
            <button
              className={styles.newCertificationBtn}
              onClick={handleNewCertification}
            >
              <i className="fas fa-plus"></i>
              Nueva Certificación
            </button>
          </div>{" "}
          <div className="admin-content">
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
                  <div
                    key={certification.id}
                    className={styles.adminCertificationCard}
                  >
                    {" "}
                    <div className={styles.certificationHeader}>
                      <div className={styles.certificationImage}>
                        {certification.image_url ? (
                          <img
                            src={certification.image_url}
                            alt={certification.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/assets/images/foto-perfil.jpg";
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
                        <p className="issuer">{certification.issuer}</p>{" "}
                        <p className="date">
                          <i className="fas fa-calendar-alt"></i>
                          {certification.date}
                        </p>{" "}
                        {certification.credential_id && (
                          <p className="credentialId">
                            {" "}
                            <i className="fas fa-id-badge"></i>
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
                        onClick={() =>
                          handleDelete(certification.id, certification.title)
                        }
                      >
                        <i className="fas fa-trash"></i>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>{" "}
          {/* Modal de formulario */}
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
                  </button>{" "}
                </div>

                <form
                  onSubmit={handleSubmit}
                  className={styles.certificationForm}
                >
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
                      <IssuerSelector
                        id="issuer"
                        name="issuer"
                        value={form.issuer}
                        onChange={handleIssuerChange}
                        required
                        placeholder="Buscar o seleccionar emisor..."
                      />
                    </div>{" "}
                  </div>{" "}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="date">Fecha de emisión *</label>
                      <DatePicker
                        id="date"
                        name="date"
                        value={form.date}
                        onChange={handleDateChange}
                        required
                        placeholder="Seleccionar fecha de emisión"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="credential_id">ID de credencial</label>
                      <CredentialIdInput
                        value={form.credential_id}
                        onChange={(value) => {
                          setForm((prev) => ({
                            ...prev,
                            credential_id: value,
                          }));

                          // Auto-generar URLs cuando cambia el credential_id
                          if (selectedIssuer && value.trim()) {
                            // Generar URL de verificación
                            if (selectedIssuer.verifyBaseUrl) {
                              const verifyUrl = generateVerifyUrl(
                                selectedIssuer,
                                value
                              );
                              if (verifyUrl) {
                                setForm((prev) => ({
                                  ...prev,
                                  verify_url: verifyUrl,
                                }));
                              }
                            }

                            // Generar URL de imagen del certificado si está disponible
                            if (selectedIssuer.certificateImageUrl) {
                              const certificateImageUrl =
                                generateCertificateImageUrl(
                                  selectedIssuer,
                                  value
                                );
                              if (certificateImageUrl) {
                                setForm((prev) => ({
                                  ...prev,
                                  image_url: certificateImageUrl,
                                }));
                              }
                            }
                          } else if (!value.trim()) {
                            // Limpiar URLs si se borra el credential_id
                            setForm((prev) => ({
                              ...prev,
                              verify_url: "",
                              // Solo resetear a logo del emisor si hay emisor seleccionado
                              image_url: selectedIssuer?.logoUrl || "",
                            }));
                          }
                        }}
                        issuer={selectedIssuer}
                        placeholder="ID de credencial"
                      />
                    </div>{" "}
                  </div>
                  {/* Mostrar información del emisor seleccionado */}
                  {selectedIssuer && (
                    <div className={styles.issuerPreview}>
                      <div className={styles.previewHeader}>
                        <i className="fas fa-eye"></i>
                        <span>Vista previa del emisor seleccionado</span>
                      </div>
                      <div className={styles.previewContent}>
                        <div className={styles.previewLogo}>
                          <img
                            src={selectedIssuer.logoUrl}
                            alt={`${selectedIssuer.name} logo`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (
                                parent &&
                                !parent.querySelector(".logo-fallback")
                              ) {
                                const fallback = document.createElement("div");
                                fallback.className = "logo-fallback";
                                fallback.innerHTML =
                                  '<i class="fas fa-certificate"></i>';
                                fallback.style.cssText = `
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                  width: 100%;
                                  height: 100%;
                                  color: var(--md-sys-color-on-surface-variant);
                                  font-size: 1.5rem;
                                  opacity: 0.7;
                                `;
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        </div>
                        <div className={styles.previewInfo}>
                          <div className={styles.previewName}>
                            {selectedIssuer.name}
                          </div>
                          {selectedIssuer.description && (
                            <div className={styles.previewDescription}>
                              {selectedIssuer.description}
                            </div>
                          )}
                          <div className={styles.previewDetails}>
                            <span className={styles.previewCategory}>
                              <i className="fas fa-tag"></i>
                              {selectedIssuer.category}
                            </span>
                            {selectedIssuer.verifyBaseUrl && (
                              <span className={styles.previewVerify}>
                                <i className="fas fa-check-circle"></i>
                                Verificación automática disponible
                              </span>
                            )}
                            {selectedIssuer.certificateImageUrl && (
                              <span
                                className={styles.previewVerify}
                                style={{
                                  background:
                                    "var(--md-sys-color-success-container)",
                                  color:
                                    "var(--md-sys-color-on-success-container)",
                                }}
                              >
                                <i className="fas fa-certificate"></i>
                                Imagen de certificado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                      type="button"
                      className={styles.btnSecondary}
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
                          {editingId
                            ? "Guardar Cambios"
                            : "Crear Certificación"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
};

export default CertificationsAdmin;
