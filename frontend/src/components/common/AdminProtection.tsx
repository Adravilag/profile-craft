// src/components/common/AdminProtection.tsx

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from './LoginModal';

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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '2rem',
        color: 'var(--md-sys-color-on-surface-variant)'
      }}>
        <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
        Verificando autenticación...
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <>
        {fallback || (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'var(--md-sys-color-surface-variant)',
            borderRadius: '16px',
            margin: '2rem'
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              background: 'var(--md-sys-color-error-container)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <i className="fas fa-lock" style={{ 
                fontSize: '1.5rem', 
                color: 'var(--md-sys-color-on-error-container)' 
              }}></i>
            </div>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: 'var(--md-sys-color-on-surface)',
              fontSize: '1.25rem'
            }}>
              Acceso Restringido
            </h3>
            <p style={{ 
              margin: '0 0 2rem 0', 
              color: 'var(--md-sys-color-on-surface-variant)',
              maxWidth: '400px'
            }}>
              Esta sección requiere permisos de administrador. Por favor, inicia sesión para continuar.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                padding: '0.75rem 2rem',
                background: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(var(--md-sys-color-primary-rgb), 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <i className="fas fa-sign-in-alt"></i>
              Iniciar Sesión
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
