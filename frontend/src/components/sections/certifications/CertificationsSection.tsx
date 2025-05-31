import React, { useState, useEffect } from "react";
import { getCertifications, createCertification, updateCertification, deleteCertification, type Certification as APICertification } from "../../../services/api";
import { useNotification } from "../../../hooks/useNotification";
import AdminModal from "../../ui/AdminModal";
import "./Certifications.css";

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
  onAdminClick?: () => void;
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({ 
  isAdminMode = false,
  showAdminFAB = false,
  onAdminClick
}) => {  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);  const { showSuccess, showError } = useNotification();
  
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
  };  const loadCertifications = async () => {
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
        verifyUrl: undefined // Campo no disponible en la base de datos actual
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
  }, []);  const handleAdminModalClose = () => {
    setShowAdminModal(false);
    // Recargar certificaciones después de cerrar el modal admin
    loadCertifications();
  };

  // Funciones de administración
  const handleCertificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === "order_index" ? parseInt(value) || 0 : value 
    }));
  };

  const handleCertificationSubmit = async (e: React.FormEvent) => {
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
  const handleEditCertification = (cert: APICertification) => {
    console.log("🔧 handleEditCertification called with:", cert);
    setForm({
      title: cert.title,
      issuer: cert.issuer,
      date: cert.date,
      credential_id: cert.credential_id || "",
      image_url: cert.image_url || "",
      order_index: cert.order_index,
    });
    setEditingId(cert.id);
    setShowForm(true);
    console.log("🔧 handleEditCertification - Form set, showForm set to true");
  };

  const handleDeleteCertification = async (id: number, title: string) => {
    console.log("🔧 handleDeleteCertification called with:", id, title);
    
    if (!confirm(`¿Estás seguro de eliminar la certificación "${title}"?`)) {
      console.log("🔧 handleDeleteCertification - User cancelled");
      return;
    }

    try {
      console.log("🔧 handleDeleteCertification - Deleting...");
      await deleteCertification(id);
      showSuccess("Certificación eliminada", "La certificación se ha eliminado correctamente");
      await loadCertifications();
      console.log("🔧 handleDeleteCertification - Successfully deleted and reloaded");
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
    console.log("🔧 handleNewCertification - Button clicked!");
    console.log("🔧 handleNewCertification - Current certifications.length:", certifications.length);
    setForm({
      ...emptyForm,
      order_index: certifications.length,
    });
    setEditingId(null);
    setShowForm(true);
    console.log("🔧 handleNewCertification - showForm set to true");
  };

  const renderCertificationsList = () => {
    if (certifications.length === 0) {
      return (        <div className="admin-empty">
          <i className="fas fa-certificate"></i>
          <h3>No hay certificaciones</h3>
          <p>Añade la primera certificación usando el botón flotante.</p>
        </div>
      );
    }

    return (
      <div className="admin-items-list">
        {certifications.map((cert) => (
          <div key={cert.id} className="admin-item-card">            <div className="admin-item-header">
              <div className="admin-item-image">
                {cert.image ? (
                  <img
                    src={cert.image}
                    alt={cert.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/foto-perfil.jpg';
                    }}
                  />
                ) : (
                  <div className="admin-placeholder-image">
                    <i className="fas fa-certificate"></i>
                  </div>
                )}
              </div>
              
              <div className="admin-item-info">
                <h3>{cert.title}</h3>
                <p className="admin-item-subtitle">{cert.issuer}</p>
                
                <div className="admin-cert-metadata">
                  <div className="admin-item-date">
                    <i className="fas fa-calendar-alt"></i>
                    <span>{cert.date}</span>
                  </div>
                  {cert.credentialId && (
                    <div className="admin-item-credential">
                      <i className="fas fa-id-card"></i>
                      <span>ID: {cert.credentialId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
              <div className="admin-item-actions">
              <button 
                className="admin-btn-secondary"
                onClick={() => {
                  console.log("🔧 Edit button clicked for cert:", cert);
                  handleEditCertification({
                    id: cert.id,
                    title: cert.title,
                    issuer: cert.issuer,
                    date: cert.date,
                    credential_id: cert.credentialId || "",
                    image_url: cert.image || "",
                    order_index: cert.id,
                    user_id: 1
                  });
                }}
              >
                <i className="fas fa-edit"></i>
                Editar
              </button>
              <button 
                className="admin-btn-danger"
                onClick={() => {
                  console.log("🔧 Delete button clicked for cert:", cert.id, cert.title);
                  handleDeleteCertification(cert.id, cert.title);
                }}
              >
                <i className="fas fa-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };  const renderCertificationForm = () => {
    return (
      <div>
        {/* Botón volver en el formulario */}
        <div className="admin-form-header">
          <button 
            type="button"
            className="admin-btn-back"
            onClick={handleCloseForm}
          >
            <i className="fas fa-arrow-left"></i>
            Volver a Lista
          </button>
        </div>
        
        <form onSubmit={handleCertificationSubmit} className="admin-form">
          <div className="admin-form-row">
            <div className="admin-form-group">
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
            <div className="admin-form-group">
              <label htmlFor="cert-issuer">Emisor *</label>
              <input
                type="text"
                id="cert-issuer"
                name="issuer"
                value={form.issuer}
                onChange={handleCertificationChange}
                required
                placeholder="Ej: Amazon Web Services"
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="cert-date">Fecha *</label>
              <input
                type="text"
                id="cert-date"
                name="date"
                value={form.date}
                onChange={handleCertificationChange}
                required
                placeholder="Ej: 2024, Enero 2024"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="cert-credential">ID de Credencial</label>
              <input
                type="text"
                id="cert-credential"
                name="credential_id"
                value={form.credential_id}
                onChange={handleCertificationChange}
                placeholder="Ej: AWS-SAA-2024-123456"
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group full-width">
              <label htmlFor="cert-image">URL de Imagen</label>
              <input
                type="url"
                id="cert-image"
                name="image_url"
                value={form.image_url}
                onChange={handleCertificationChange}
                placeholder="https://ejemplo.com/imagen-certificacion.jpg"
              />
            </div>
          </div>

          <div className="admin-form-actions">
            <button 
              type="button" 
              className="admin-btn-secondary"
              onClick={handleCloseForm}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="admin-btn-primary"
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
    );
  };const renderAdminContent = () => {
    console.log("🔧 AdminModal - Rendering content...");
    console.log("🔧 AdminModal - loading:", loading);
    console.log("🔧 AdminModal - showForm:", showForm);
    console.log("🔧 AdminModal - certifications.length:", certifications.length);
    console.log("🔧 AdminModal - certifications:", certifications);
    
    if (loading) {
      console.log("🔧 AdminModal - Mostrando loading...");
      return (
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando certificaciones...</p>
        </div>
      );
    }
    
    if (showForm) {
      console.log("🔧 AdminModal - Mostrando formulario...");
      return renderCertificationForm();
    }
    
    console.log("🔧 AdminModal - Mostrando lista...");
    return renderCertificationsList();
  };  return (
    <section className="cv-section" id="certifications">
      <div className="section-header">
        <h2 className="section-title">
          <div className="title-icon">
            <i className="fas fa-certificate"></i>
          </div>
          <span className="title-text">Certificaciones</span>
          <div className="title-decoration"></div>
        </h2>        <p className="section-subtitle">
          Credenciales y certificaciones profesionales obtenidas
        </p>      </div>      
      
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando certificaciones...</p>
          </div>
        </div>
      ) : (
        <div className="section-container">
          <div className="certifications-grid">
            {certifications.map((cert, index) => (
              <div 
                key={cert.id} 
                className="certification-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="cert-image">
                  <img
                    src={cert.image}
                    alt={cert.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMiAyMEwyNiAyNkgzOEwzMiAyMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTQ0IDM4SDIwVjQySDQ0VjM4WiIgZmlsbD0iIzlDQTRBRiIvPgo8L3N2Zz4K';
                    }}
                  />
                </div>
                
                <div className="cert-content">
                  <h3 className="cert-title">{cert.title}</h3>
                  <p className="cert-issuer">{cert.issuer}</p>
                  
                  <div className="cert-details">
                    <div className="cert-date">
                      <i className="fas fa-calendar-alt"></i>
                      <span>{cert.date}</span>
                    </div>
                    {cert.credentialId && (
                      <div className="cert-id">
                        <i className="fas fa-id-badge"></i>
                        <span>ID: {cert.credentialId}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="cert-actions">
                    {cert.verifyUrl ? (
                      <a 
                        href={cert.verifyUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="cert-verify-btn"
                        title="Verificar certificación"
                      >
                        <i className="fas fa-check-circle"></i>
                        <span>Verificar</span>
                      </a>
                    ) : (
                      <button className="cert-verify-btn" title="Verificar certificación">
                        <i className="fas fa-check-circle"></i>
                        <span>Verificar</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="cert-badge">
                  <i className="fas fa-award"></i>
                </div>
              </div>
            ))}
          </div>
          
          {certifications.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-certificate"></i>
              </div>
              <h3 className="empty-title">No hay certificaciones disponibles</h3>
              <p className="empty-description">
                Las certificaciones aparecerán aquí cuando estén disponibles.
              </p>
            </div>
          )}
        </div>
      )}      {/* Floating Action Button para administración */}
      {!isAdminMode && showAdminFAB && onAdminClick && (
        <div 
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000
          }}
        >
          <button
            onClick={() => {
              console.log('Admin button clicked');
              setShowAdminModal(true);
            }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#6750A4',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            title="Administrar Certificaciones"
          >
            <i className="fas fa-shield-alt"></i>
          </button>
        </div>
      )}      {/* Modal de administración */}
      {showAdminModal && (
        <AdminModal
          isOpen={showAdminModal}
          onClose={handleAdminModalClose}
          title="Administrar Certificaciones"
          icon="fas fa-certificate"
        >
          <div className="admin-modal-content">
            {renderAdminContent()}
            
            {/* FAB para nueva certificación */}
            {!showForm && (
              <div className="admin-fab-container">
                <button 
                  className="admin-fab"
                  onClick={handleNewCertification}
                  title="Nueva Certificación"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            )}
          </div>
        </AdminModal>
      )}
    </section>
  );
};

export default CertificationsSection;
