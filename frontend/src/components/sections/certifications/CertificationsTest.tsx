import React, { useState } from "react";
import CertificationsAdmin from "./CertificationsAdmin";

const CertificationsTest: React.FC = () => {
  const [showAdminModal, setShowAdminModal] = useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test de Certificaciones Admin</h1>
      
      <button 
        onClick={() => setShowAdminModal(true)}
        style={{ 
          padding: '10px 20px', 
          background: 'blue', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Abrir Admin de Certificaciones
      </button>

      {/* Modal de administración */}
      {showAdminModal && (
        <CertificationsAdmin onClose={() => setShowAdminModal(false)} />
      )}
    </div>
  );
};

export default CertificationsTest;
