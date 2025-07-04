import React, { useState, useEffect } from "react";
import { getCertifications, type Certification as APICertification } from "../../../services/api";
import { useNotification } from "../../../hooks/useNotification";
import { debugLog } from "../../../utils/debugConfig";
import HeaderSection from "../header/HeaderSection";
import { FloatingActionButtonGroup } from "@cv-maker/ui";
import CertificationsAdmin from "./admin/CertificationsAdmin";
import styles from "./CertificationsSection.module.css";

// Interfaz local para el componente con nombres amigables
interface Certification {
  id: number | string;
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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { showError } = useNotification();

  const loadCertifications = async () => {
    try {
      setLoading(true);
      debugLog.dataLoading("Iniciando carga de certificaciones...");
      const data = await getCertifications();
      debugLog.dataLoading("Datos recibidos de la API:", data);
      
      // Mapear los campos de la API a la interfaz del componente
      const mappedData: Certification[] = data.map((cert: APICertification) => ({
        id: cert._id || cert.id || '',
        title: cert.title,
        issuer: cert.issuer,
        date: cert.date,
        credentialId: cert.credential_id,
        image: cert.image_url || '/assets/images/foto-perfil.jpg',
        verifyUrl: cert.verify_url
      }));
      
      debugLog.dataLoading("Datos mapeados:", mappedData);
      setCertifications(mappedData);
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

  const handleAdminClose = () => {
    setShowAdminPanel(false);
    loadCertifications(); // Recargar las certificaciones al cerrar el panel
  };

  return (
    <div className="section-cv" id="certifications">
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
                        <button 
                          className={`${styles.certVerifyBtn} ${styles.disabled}`}
                          title="Verificación no disponible"
                          disabled
                        >
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
                  setShowAdminPanel(true);
                },
                icon: "fas fa-shield-alt",
                label: "Administrar Certificaciones",
                color: "primary"
              }
            ]}
            position="bottom-right"
          />
        )}
      </div>

      {/* Panel de administración */}
      {showAdminPanel && (
        <CertificationsAdmin onClose={handleAdminClose} />
      )}
    </div>
  );
};

export default CertificationsSection;




