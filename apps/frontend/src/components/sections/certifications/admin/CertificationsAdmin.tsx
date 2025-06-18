import React, { useState, useEffect } from "react";
import {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  type Certification,
} from "../../../../services/api";
import { useNotification } from "../../../../hooks/useNotification";
import { ModalPortal, IssuerSelector, CredentialIdInput } from "@cv-maker/ui";
import {
  type CertificationIssuer,
  CERTIFICATION_ISSUERS,
  generateVerifyUrl,
  generateCertificateImageUrl,
} from "../../../../data/certificationIssuers";
import styles from "./CertificationsAdmin.module.css";

interface CertificationsAdminProps {
  onClose: () => void;
}

const CertificationsAdmin: React.FC<CertificationsAdminProps> = ({
  onClose,
}) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, date: e.target.value }));
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
        date: convertMonthFormatToReadable(form.date), // Convertir de vuelta a formato legible
        image_url: imageUrl,
        verify_url: verifyUrl || undefined,
        user_id: 1,
        order_index: form.order_index || certifications.length,
      };

      if (editingId) {
        await updateCertification(editingId, certificationData);
        showSuccess(
          "¡Certificación actualizada!",
          "Los cambios se han guardado correctamente"
        );
      } else {
        await createCertification(certificationData);
        showSuccess(
          "¡Certificación creada!",
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
  // Función para convertir fecha a formato YYYY-MM
  const convertDateToMonthFormat = (dateString: string): string => {
    if (!dateString) return "";
    
    // Si ya está en formato YYYY-MM, devolverlo tal como está
    if (/^\d{4}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Si es solo un año (ej: "2024")
    if (/^\d{4}$/.test(dateString)) {
      return `${dateString}-01`; // Enero por defecto
    }
    
    // Convertir formatos como "Junio 2025", "June 2025", etc.
    const monthsEs = {
      'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
      'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
      'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
    };
    
    const monthsEn = {
      'january': '01', 'february': '02', 'march': '03', 'april': '04',
      'may': '05', 'june': '06', 'july': '07', 'august': '08',
      'september': '09', 'october': '10', 'november': '11', 'december': '12'
    };
    
    const lowerDate = dateString.toLowerCase();
    const yearMatch = dateString.match(/(\d{4})/);
    
    if (yearMatch) {
      const year = yearMatch[1];
      
      // Buscar mes en español
      for (const [monthName, monthNum] of Object.entries(monthsEs)) {
        if (lowerDate.includes(monthName)) {
          return `${year}-${monthNum}`;
        }
      }
      
      // Buscar mes en inglés
      for (const [monthName, monthNum] of Object.entries(monthsEn)) {
        if (lowerDate.includes(monthName)) {
          return `${year}-${monthNum}`;
        }
      }
      
      // Si no se encuentra mes, usar enero
      return `${year}-01`;
    }
    
    return "";
  };

  // Función para convertir de formato YYYY-MM a formato legible
  const convertMonthFormatToReadable = (monthString: string): string => {
    if (!monthString || !monthString.includes('-')) return monthString;
    
    const [year, month] = monthString.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const monthIndex = parseInt(month) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${monthNames[monthIndex]} ${year}`;
    }
    
    return monthString;
  };

  const handleEdit = (certification: Certification) => {
    // Buscar el emisor basado en el nombre
    const issuer = CERTIFICATION_ISSUERS.find(
      (iss: CertificationIssuer) => iss.name === certification.issuer
    );

    setForm({
      title: certification.title,
      issuer: certification.issuer,
      date: convertDateToMonthFormat(certification.date),
      credential_id: certification.credential_id || "",
      image_url: certification.image_url || "",
      order_index: certification.order_index,
    });

    // Configurar el emisor seleccionado para habilitar la funcionalidad automática
    setSelectedIssuer(issuer || null);
    setEditingId(certification._id || certification.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: number | string, title: string) => {
    if (!confirm(`🗑️ ¿Estás seguro de eliminar la certificación "${title}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteCertification(id.toString());
      showSuccess(
        "¡Certificación eliminada!",
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

  const handleDemoData = () => {
    if (showForm) {
      // Demo data para el formulario
      const demoData = {
        title: "AWS Solutions Architect Associate",
        issuer: "Amazon Web Services",
        date: "2024-06",
        credential_id: "AWS-SAA-C03-123456",
        image_url: "https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Solutions-Architect-Associate_badge.3419559c682629072f1eb968d59dea0741772c0f.png",
        order_index: certifications.length
      };
      
      setForm(demoData);
      
      // Buscar el emisor AWS en la lista
      const awsIssuer = CERTIFICATION_ISSUERS.find(issuer => 
        issuer.name.toLowerCase().includes('amazon') || 
        issuer.name.toLowerCase().includes('aws')
      );
      
      if (awsIssuer) {
        setSelectedIssuer(awsIssuer);
      }
      
      showSuccess("Datos demo cargados", "Se han cargado datos de ejemplo en el formulario");
    } else {
      showError("Error", "Primero abre el formulario para usar datos demo");
    }
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
            <div className={styles.toolbarLeft}>
              <button
                className={styles.newCertificationBtn}
                onClick={handleNewCertification}
              >
                <i className="fas fa-plus"></i>
                Nueva Certificación
              </button>
              <button
                className={styles.demoCrudBtn}
                onClick={handleDemoData}
                title="Llenar con datos de ejemplo"
              >
                <i className="fas fa-magic"></i>
                Datos Demo
              </button>
            </div>
            <div className={styles.toolbarRight}>
              <span className={styles.statsText}>
                {certifications.length} certificaciones totales
              </span>
            </div>
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
                    key={certification._id || certification.id}
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
                        <p className={styles.issuer}>{certification.issuer}</p>
                        
                        <div className={styles.certMetadata}>
                          <p className={styles.date}>
                            <i className="fas fa-calendar-alt"></i>
                            <span>{certification.date}</span>
                          </p>
                        {certification.credential_id && (
                          <p className={styles.credentialId}>
                            <i className="fas fa-id-badge"></i>
                            <span>ID: {certification.credential_id}</span>
                          </p>
                        )}
                        {certification.verify_url && (
                          <a 
                            href={certification.verify_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.verifyLink}
                            title="Verificar certificación online"
                          >
                            <i className="fas fa-external-link-alt"></i>
                            <span>Verificar online</span>
                          </a>
                        )}
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.certificationActions}>
                      <button
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        onClick={() => handleEdit(certification)}
                        title="Editar certificación"
                      >
                        <i className="fas fa-edit"></i>
                        Editar
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() =>
                          handleDelete(certification._id || certification.id || '', certification.title)
                        }
                        title="Eliminar certificación"
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
          {/* Modal de formulario */}
          {showForm && (
            <div className={styles.formModalOverlay}>
              <div className={styles.formModal}>
                <div className={styles.formHeader}>
                  <h3>
                    <i className="fas fa-certificate"></i>
                    {editingId ? "✏️ Editar Certificación" : "➕ Nueva Certificación"}
                  </h3>
                  <div className={styles.formHeaderActions}>
                    {showForm && !editingId && (
                      <button 
                        type="button"
                        className={styles.demoCrudBtn}
                        onClick={handleDemoData}
                        title="Cargar datos de ejemplo"
                      >
                        <i className="fas fa-magic"></i>
                        Demo
                      </button>
                    )}
                    <button className={styles.closeBtn} onClick={handleCloseForm}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className={styles.certificationForm}
                >
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="title">
                        <i className="fas fa-certificate"></i>
                        Título *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className={styles.modernInput}
                        required
                        placeholder="Ej: AWS Solutions Architect"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="issuer">
                        <i className="fas fa-building"></i>
                        Emisor *
                      </label>
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
                      <label htmlFor="date">
                        <i className="fas fa-calendar-alt"></i>
                        Fecha de emisión *
                      </label>
                      <input
                        type="month"
                        id="date"
                        name="date"
                        value={form.date}
                        onChange={handleDateChange}
                        className={styles.modernInput}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="credential_id">
                        <i className="fas fa-id-card"></i>
                        ID de credencial
                      </label>
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




