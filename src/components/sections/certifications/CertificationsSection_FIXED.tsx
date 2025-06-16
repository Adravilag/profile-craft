import React, { useState, useEffect } from "react";
import { getCertifications, createCertification, updateCertification, deleteCertification, type Certification as APICertification } from "../../../services/api";
import { useNotification } from "../../../hooks/useNotification";
import HeaderSection from "../header/HeaderSection";
import AdminModal from "../../ui/AdminModal";
import DatePicker from "../../ui/DatePicker";
import IssuerSelector from "../../ui/IssuerSelector";
import CredentialIdInput from "../../ui/CredentialIdInput";
import FloatingActionButtonGroup from "../../common/FloatingActionButtonGroup";
import { type CertificationIssuer, generateVerifyUrl, generateCertificateImageUrl } from "../../../data/certificationIssuers";
import styles from "./CertificationsSection.module.css";
import modalStyles from "./CertificationsModal.module.css";

// Interfaz local para el componente con nombres amigables
interface Certification {
  id: number;
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
  image: string;
  verifyUrl?: string;
}

interface CertificationsSectionProps {
  isAdminMode?: boolean;
  showAdminFAB?: boolean;
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({ 
  isAdminMode = false,
  showAdminFAB = false
}) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
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
    verify_url: "",
    order_index: 0,
  });
  const [selectedIssuer, setSelectedIssuer] = useState<CertificationIssuer | null>(null);
  const emptyForm = {
    title: "",
    issuer: "",
    date: "",
    credential_id: "",
    image_url: "",
    verify_url: "",
    order_index: 0,
  };

  const loadCertifications = async () => {
    try {
      setLoading(true);
      console.log("Iniciando carga de certificaciones...");
      const data = await getCertifications();
      console.log("Datos recibidos de la API:", data);
      
      // Mapear los campos de la API a la interfaz del componente
      const mappedData: Certification[] = data.map((cert: APICertification) => ({
        id: cert.id,
        title: cert.title,
        issuer: cert.issuer,
        date: cert.date,
        credentialId: cert.credential_id,
        image: cert.image_url || '/assets/images/foto-perfil.jpg',
        verifyUrl: cert.verify_url
      }));
      
      console.log("Datos mapeados:", mappedData);
      setCertifications(mappedData);
    } catch (error) {
      console.error("Error cargando certificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertifications();
  }, []);

  const handleAdminModalClose = () => {
    setShowAdminModal(false);
    loadCertifications();
  };

  const handleCertificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === "order_index" ? parseInt(value) || 0 : value 
    }));
  };

  const handleDateChange = (value: string) => {
    setForm(prev => ({ ...prev, date: value }));
  };

  const handleIssuerChange = (issuer: CertificationIssuer) => {
    if (issuer.name) {
      setSelectedIssuer(issuer);
      setForm(prev => ({ 
        ...prev, 
        issuer: issuer.name,
        image_url: issuer.logoUrl || ""
      }));
    }
  };

  const handleCertificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const certificationData = {
        title: form.title,
        issuer: form.issuer,
        date: form.date,
        credential_id: form.credential_id,
        image_url: form.image_url,
        verify_url: form.verify_url || "",
        order_index: form.order_index,
        user_id: 1
      };

      if (editingId) {
        await updateCertification(editingId, certificationData);
        showSuccess("Éxito", "Certificación actualizada correctamente");
      } else {
        await createCertification(certificationData);
        showSuccess("Éxito", "Certificación creada correctamente");
      }

      await loadCertifications();
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setSelectedIssuer(null);
    } catch (error) {
      console.error("Error guardando certificación:", error);
      showError("Error", "No se pudo guardar la certificación");
    } finally {
      setSaving(false);
    }
  };

  const handleEditCertification = (cert: any) => {
    setForm({
      title: cert.title,
      issuer: cert.issuer,
      date: cert.date,
      credential_id: cert.credential_id,
      image_url: cert.image_url,
      verify_url: cert.verify_url || "",
      order_index: cert.order_index
    });
    setEditingId(cert.id);
    setShowForm(true);
  };

  const handleDeleteCertification = async (id: number, title: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la certificación "${title}"?`)) {
      try {
        await deleteCertification(id.toString());
        showSuccess("Éxito", "Certificación eliminada correctamente");
        await loadCertifications();
      } catch (error) {
        console.error("Error eliminando certificación:", error);
        showError("Error", "No se pudo eliminar la certificación");
      }
    }
  };

  const handleNewCertification = () => {
    setForm({
      ...emptyForm,
      order_index: certifications.length,
    });
    setEditingId(null);
    setSelectedIssuer(null);
    setShowForm(true);
  };

  const renderCertificationsList = () => {
    if (certifications.length === 0) {
      return (
        <div className={modalStyles.adminEmpty}>
          <i className="fas fa-certificate"></i>
          <h3>No hay certificaciones</h3>
          <p>Añade la primera certificación usando el botón flotante.</p>
        </div>
      );
    }

    return (
      <div className={modalStyles.adminItemsList}>
        {certifications.map((cert) => (
          <div key={`cert-admin-${cert.id}`} className={modalStyles.adminItemCard}>
            <div className={modalStyles.adminItemHeader}>
              <div className={modalStyles.adminItemImage}>
                {cert.image ? (
                  <img
                    src={cert.image}
                    alt={cert.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/foto-perfil.jpg';
                    }}
                  />
                ) : (
                  <div className={modalStyles.adminPlaceholderImage}>
                    <i className="fas fa-certificate"></i>
                  </div>
                )}
              </div>
              
              <div className={modalStyles.adminItemInfo}>
                <h3>{cert.title}</h3>
                <p className={modalStyles.adminItemSubtitle}>{cert.issuer}</p>
                
                <div className={modalStyles.adminCertMetadata}>
                  <div className={modalStyles.adminItemDate}>
                    <i className="fas fa-calendar-alt"></i>
                    <span>{cert.date}</span>
                  </div>
                  {cert.credentialId && (
                    <div className={modalStyles.adminItemCredential}>
                      <i className="fas fa-id-card"></i>
                      <span>ID: {cert.credentialId}</span>
                    </div>
                  )}
                  {cert.verifyUrl && (
                    <div className={modalStyles.adminItemVerify}>
                      <a 
                        href={cert.verifyUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={modalStyles.adminVerifyLink}
                        title="Verificar certificación"
                      >
                        <i className="fas fa-external-link-alt"></i>
                        <span>Verificar</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={modalStyles.adminItemActions}>
                <button 
                  className={modalStyles.adminBtnSecondary}
                  onClick={() => {
                    handleEditCertification({
                      id: cert.id,
                      title: cert.title,
                      issuer: cert.issuer,
                      date: cert.date,
                      credential_id: cert.credentialId || "",
                      image_url: cert.image || "",
                      verify_url: cert.verifyUrl || "",
                      order_index: cert.id,
                      user_id: 1
                    });
                  }}
                >
                  <i className="fas fa-edit"></i>
                  Editar
                </button>
                <button
                  className={modalStyles.adminBtnDanger}
                  onClick={() => {
                    handleDeleteCertification(cert.id, cert.title);
                  }}
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
  
  const renderCertificationForm = () => {
    return (
      <div>
        <form onSubmit={handleCertificationSubmit} className={`${modalStyles.adminForm} admin-form`}>
          <div className={modalStyles.adminFormRow}>
            <div className={modalStyles.adminFormGroup}>
              <label htmlFor="cert-title">Título *</label>
              <input
                type="text"
                id="cert-title"
                name="title"
                value={form.title}
                onChange={handleCertificationChange}
                required
                placeholder="Ej: AWS Solutions Architect"
              />
            </div>
            <div className={modalStyles.adminFormGroup}>
              <label htmlFor="cert-issuer">Emisor *</label>
              <IssuerSelector
                id="cert-issuer"
                name="issuer"
                value={form.issuer}
                onChange={handleIssuerChange}
                required
                placeholder="Buscar o seleccionar emisor..."
              />
            </div>
          </div>

          <div className={modalStyles.adminFormRow}>
            <div className={modalStyles.adminFormGroup}>
              <label htmlFor="cert-date">Fecha *</label>
              <DatePicker
                id="cert-date"
                name="date"
                value={form.date}
                onChange={handleDateChange}
                required
                placeholder="Seleccionar fecha de emisión"
              />
            </div>
            <div className={modalStyles.adminFormGroup}>
              <label htmlFor="cert-credential">ID de Credencial</label>              <CredentialIdInput
                value={form.credential_id}
                issuer={selectedIssuer || null}
                onChange={(value) => {
                  setForm(prev => ({ ...prev, credential_id: value }));
                  
                  if (selectedIssuer && value.trim()) {
                    if (selectedIssuer.verifyBaseUrl) {
                      const verifyUrl = generateVerifyUrl(selectedIssuer, value);
                      if (verifyUrl) {
                        setForm(prev => ({ ...prev, verify_url: verifyUrl }));
                      }
                    }
                    
                    if (selectedIssuer.certificateImageUrl) {
                      const certificateImageUrl = generateCertificateImageUrl(selectedIssuer, value);
                      if (certificateImageUrl) {
                        setForm(prev => ({ ...prev, image_url: certificateImageUrl }));
                      }
                    }
                  }
                }}
                placeholder="ID opcional de la credencial"
              />
            </div>
          </div>
        </form>
      </div>
    );
  };
  
  const renderAdminContent = () => {
    if (loading) {
      return (
        <div className={modalStyles.adminLoading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando certificaciones...</p>
        </div>
      );
    }
    
    if (showForm) {
      return renderCertificationForm();
    }
    
    return renderCertificationsList();
  };

  return (
    <section className="section-cv" id="certifications">
      <HeaderSection 
        icon="fas fa-certificate" 
        title="Certificaciones" 
        subtitle="Credenciales y certificaciones profesionales obtenidas"
        className="certifications"
      />      
      <div className="section-container">
      
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}>
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando certificaciones...</p>
          </div>
        </div>
      ) : (
        <div className={styles.sectionContainer}>
          <div className={styles.certificationsGrid}>
            {certifications.map((cert, index) => (
              <div 
                key={`cert-${cert.id}`}
                className={styles.certificationCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.certImage}>
                  <img
                    src={cert.image}
                    alt={cert.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMiAyMEwyNiAyNkgzOEwzMiAyMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTQ0IDM4SDIwVjQySDQ0VjM4WiIgZmlsbD0iIzlDQTRBRiIvPgo8L3N2Zz4K';
                    }}
                  />
                </div>
                
                <div className={styles.certContent}>
                  <h3 className={styles.certTitle}>{cert.title}</h3>
                  <p className={styles.certIssuer}>{cert.issuer}</p>
                  
                  <div className={styles.certDetails}>
                    <div className={styles.certDate}>
                      <i className="fas fa-calendar-alt"></i>
                      <span>{cert.date}</span>
                    </div>
                    {cert.credentialId && (
                      <div className={styles.certId}>
                        <i className="fas fa-id-badge"></i>
                        <span>ID: {cert.credentialId}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.certActions}>
                    {cert.verifyUrl ? (
                      <a 
                        href={cert.verifyUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.certVerifyBtn}
                        title="Verificar certificación"
                      >
                        <i className="fas fa-check-circle"></i>
                        <span>Verificar</span>
                      </a>
                    ) : (
                      <button className={styles.certVerifyBtn} title="Verificar certificación">
                        <i className="fas fa-check-circle"></i>
                        <span>Verificar</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className={styles.certBadge}>
                  <i className="fas fa-award"></i>
                </div>
              </div>
            ))}
          </div>
          
          {certifications.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <i className="fas fa-certificate"></i>
              </div>
              <h3 className={styles.emptyTitle}>No hay certificaciones disponibles</h3>
              <p className={styles.emptyDescription}>
                Las certificaciones aparecerán aquí cuando estén disponibles.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Buttons para certificaciones */}
      {!isAdminMode && showAdminFAB && (
        <FloatingActionButtonGroup
          actions={[
            {
              id: "admin-certifications",
              onClick: () => {
                setShowAdminModal(true);
              },
              icon: "fas fa-shield-alt",
              label: "Administrar Certificaciones",
              color: "primary"
            },
            {
              id: "add-certification",
              onClick: () => {
                setShowForm(true);
                setShowAdminModal(true);
                handleNewCertification();
              },
              icon: "fas fa-plus",
              label: "Añadir Certificación",
              color: "success"
            }
          ]}
          position="bottom-right"
        />
      )}
      </div>

      {/* Modal de administración */}
      {showAdminModal && (
        <AdminModal
          isOpen={showAdminModal}
          onClose={handleAdminModalClose}
          title="Administrar Certificaciones"
          icon="fas fa-certificate"
          tabs={[
            {
              id: "list",
              label: "Listado",
              icon: "fas fa-list",
              content: null,
              badge: certifications.length.toString()
            },
            {
              id: "form",
              label: showForm && editingId ? "Editar" : "Nueva",
              icon: showForm && editingId ? "fas fa-edit" : "fas fa-plus",
              content: null,
              disabled: !showForm
            }
          ]}
          activeTab={showForm ? "form" : "list"}
          onTabChange={(tabId: string) => {
            if (tabId === "list" && showForm) {
              setShowForm(false);
            } else if (tabId === "form" && !showForm) {
              handleNewCertification();
            }
          }}
          showTabs={true}
          floatingActions={showForm ? [
            {
              id: "cancel-cert",
              label: "Cancelar",
              icon: "fas fa-times",
              variant: "secondary",
              onClick: () => setShowForm(false)
            },
            {
              id: "save-cert",
              label: saving ? "Guardando..." : (editingId ? "Guardar Cambios" : "Crear Certificación"),
              icon: saving ? "fas fa-spinner fa-spin" : "fas fa-save",
              variant: "primary",
              onClick: () => {
                const form = document.querySelector('.admin-form') as HTMLFormElement;
                if (form) {
                  form.requestSubmit();
                }
              },
              disabled: saving,
              loading: saving
            }
          ] : [
            {
              id: "new-cert",
              label: "Nueva Certificación",
              icon: "fas fa-plus",
              variant: "primary",
              onClick: handleNewCertification
            }
          ]}
        >
          <div className={modalStyles.adminModalContent}>
            {renderAdminContent()}
          </div>
        </AdminModal>
      )}
    </section>
  );
};

export default CertificationsSection;
