import React, { useState, useEffect } from "react";
import { getCertifications, type Certification as APICertification } from "../../../services/api";
import CertificationsAdmin from "./CertificationsAdmin";
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
}) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      const data = await getCertifications();
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
    // Recargar certificaciones después de cerrar el modal admin
    loadCertifications();
  };

  // Debug logging
  console.log('CertificationsSection - showAdminFAB:', showAdminFAB, 'onAdminClick:', !!onAdminClick);

  return (
    <section className="certifications-section" id="certifications">
      <div className="section-header">
        <h2 className="section-title">
          <div className="title-icon">
            <i className="fas fa-certificate"></i>
          </div>
          <span className="title-text">Certificaciones</span>
          <div className="title-decoration"></div>
        </h2>
        <p className="section-subtitle">
          Credenciales y certificaciones profesionales obtenidas
        </p>
      </div>
      
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando certificaciones...</p>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}

      {/* Floating Action Button para administración */}
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
      )}

      {/* Modal de administración */}
      {showAdminModal && (
        <CertificationsAdmin onClose={handleAdminModalClose} />
      )}
    </section>
  );
};

export default CertificationsSection;
