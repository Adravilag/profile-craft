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

  // Log para depurar re-renders
  console.log('🔄 DiscreteAdminAccess render:', {
    isAuthenticated,
    user: user?.name,
    showAdminIndicator,
    showLoginModal
  });

  const handleLogout = async () => {
    try {
      console.log('🔴 DiscreteAdminAccess: Iniciando logout...');
      console.log('🔴 Estado antes del logout:', { isAuthenticated, user: user?.name });
      
      // Forzar limpieza inmediata del estado local primero
      setShowAdminIndicator(false);
      
      // Limpiar localStorage inmediatamente
      localStorage.removeItem('portfolio_auth_token');
      sessionStorage.removeItem('portfolio_auth_token');
      console.log('🧹 Tokens eliminados manualmente');
      
      // Llamar al logout del contexto
      await logout();
      
      console.log('🔴 Logout completado');
      
      // Verificar estado después de un delay
      setTimeout(() => {
        console.log('🔴 Estado después del logout:', { 
          isAuthenticated, 
          user: user?.name,
          tokenInStorage: localStorage.getItem('portfolio_auth_token') 
        });
        
        // Si aún está autenticado, forzar recarga
        if (isAuthenticated || localStorage.getItem('portfolio_auth_token')) {
          console.log('⚠️ Logout incompleto, forzando recarga...');
          window.location.reload();
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ Error during logout in DiscreteAdminAccess:', error);
      
      // Logout de emergencia
      localStorage.removeItem('portfolio_auth_token');
      sessionStorage.removeItem('portfolio_auth_token');
      setShowAdminIndicator(false);
      window.location.reload();
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
    console.log('🔄 DiscreteAdminAccess: useEffect isAuthenticated cambió:', isAuthenticated);
    
    if (isAuthenticated) {
      setShowAdminIndicator(true);
      // Remover el auto-ocultar después de 3 segundos para evitar que se cierre automáticamente
      // const timer = setTimeout(() => {
      //   setShowAdminIndicator(false);
      // }, 3000);
      // 
      // return () => clearTimeout(timer);
    } else {
      // Si no está autenticado, asegurar que el indicador esté oculto
      console.log('🔄 DiscreteAdminAccess: Usuario no autenticado, ocultando indicador');
      setShowAdminIndicator(false);
    }
  }, [isAuthenticated]);

  // Efecto para manejar clics fuera del panel para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const adminIndicator = target.closest(`.${styles.adminIndicator}`);
      const adminPanel = target.closest(`.${styles.adminPanel}`);
      
      // Si no se hizo clic en el indicador ni en el panel, cerrar el panel
      if (!adminIndicator && !adminPanel && showAdminIndicator) {
        console.log('🔄 Cerrando panel por clic fuera');
        setShowAdminIndicator(false);
      }
    };

    // Solo agregar el listener cuando el panel está visible
    if (showAdminIndicator) {
      // Usar mousedown para capturar antes del clic
      document.addEventListener('mousedown', handleClickOutside);
      console.log('🔄 Listener de clic fuera agregado');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      console.log('🔄 Listener de clic fuera removido');
    };
  }, [showAdminIndicator]);

  console.log('🔄 DiscreteAdminAccess: Renderizando con:', {
    isAuthenticated,
    user: user?.name,
    showAdminIndicator,
    shouldShow: isAuthenticated && showAdminIndicator
  });

  return (
    <>
      {/* Indicador discreto en la esquina inferior derecha */}
      {isAuthenticated && (
        <div 
          className={`${styles.adminIndicator} ${showAdminIndicator ? styles.visible : ''}`}
          onClick={(e) => {
            e.stopPropagation(); // Evitar que el clic se propague
            console.log('🔄 Toggle del adminIndicator:', !showAdminIndicator);
            setShowAdminIndicator(!showAdminIndicator);
          }}
          title="Panel de Administración (Ctrl+Alt+A)"
        >
          <div className={styles.adminDot}>
            <i className="fas fa-user-shield"></i>
          </div>
          
          {showAdminIndicator && (
            <div 
              className={styles.adminPanel}
              onClick={(e) => e.stopPropagation()} // Evitar que los clics en el panel lo cierren
            >
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
