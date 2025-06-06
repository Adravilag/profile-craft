// src/components/common/AdminProtection.tsx

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from './LoginModal';
import styles from './AdminProtection.module.css';

interface AdminProtectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

const AdminProtection: React.FC<AdminProtectionProps> = ({ 
  children, 
  fallback = null,
  requireAuth = true 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <i className={`fas fa-spinner ${styles.loadingSpinner}`}></i>
        Verificando autenticación...
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (      <>
        {fallback || (
          <div className={styles.accessDeniedContainer}>
            <div className={styles.lockIcon}>
              <i className="fas fa-lock"></i>
            </div>
            <h3 className={styles.title}>
              Acceso Restringido
            </h3>
            <p className={styles.description}>
              Esta sección requiere permisos de administrador. Por favor, inicia sesión para continuar.
            </p>
            <button
              className={styles.loginButton}
              onClick={() => setShowLoginModal(true)}
            >
              <i className="fas fa-sign-in-alt"></i>
              <span>Iniciar Sesión</span>
            </button>
          </div>
        )}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      </>
    );
  }

  return <>{children}</>;
};

export default AdminProtection;
