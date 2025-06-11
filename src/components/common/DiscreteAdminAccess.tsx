// src/components/common/DiscreteAdminAccess.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from './LoginModal';
import ProfileAdmin from '../sections/profile/ProfileAdmin';
import styles from './DiscreteAdminAccess.module.css';

const DiscreteAdminAccess: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminIndicator, setShowAdminIndicator] = useState(false);
  const [showProfileAdmin, setShowProfileAdmin] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setShowAdminIndicator(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleEditProfile = () => {
    setShowProfileAdmin(true);
    setShowAdminIndicator(false);
  };

  // Combinación de teclas: Ctrl + Alt + A
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        if (!isAuthenticated) {
          setShowLoginModal(true);
        } else {
          setShowAdminIndicator(!showAdminIndicator);
        }
      }
      
      // ESC para ocultar indicador
      if (event.key === 'Escape' && showAdminIndicator) {
        setShowAdminIndicator(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, showAdminIndicator]);

  // Auto-mostrar indicador cuando se autentica
  useEffect(() => {
    if (isAuthenticated) {
      setShowAdminIndicator(true);
      // Auto-ocultar después de 3 segundos
      const timer = setTimeout(() => {
        setShowAdminIndicator(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  return (
    <>
      {/* Indicador discreto en la esquina inferior derecha */}
      {isAuthenticated && (
        <div 
          className={`${styles.adminIndicator} ${showAdminIndicator ? styles.visible : ''}`}
          onClick={() => setShowAdminIndicator(!showAdminIndicator)}
          title="Panel de Administración (Ctrl+Alt+A)"
        >
          <div className={styles.adminDot}>
            <i className="fas fa-user-shield"></i>
          </div>
          
          {showAdminIndicator && (
            <div className={styles.adminPanel}>
              <div className={styles.adminInfo}>
                <span className={styles.adminName}>{user?.name}</span>
                <span className={styles.adminRole}>Administrador</span>
              </div>
              <div className={styles.adminActions}>
                <button
                  className={styles.adminActionBtn}
                  onClick={handleEditProfile}
                  title="Editar perfil"
                >
                  <i className="fas fa-user-edit"></i>
                </button>
                <button
                  className={`${styles.adminActionBtn} ${styles.logout}`}
                  onClick={handleLogout}
                  title="Cerrar sesión"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pequeño indicador para acceso cuando no está autenticado */}
      {!isAuthenticated && (
        <div 
          className={styles.adminAccessHint}
          onClick={() => setShowLoginModal(true)}
          title="Acceso de Administrador (Ctrl+Alt+A)"
        >
          <i className="fas fa-shield-alt"></i>
        </div>
      )}

      {/* Modal de login */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />

      {/* Modal de edición de perfil */}
      {showProfileAdmin && (
        <ProfileAdmin
          onClose={() => setShowProfileAdmin(false)}
        />
      )}
    </>
  );
};

export default DiscreteAdminAccess;
