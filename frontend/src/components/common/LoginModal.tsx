// src/components/common/LoginModal.tsx

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ModalPortal from './ModalPortal';
import './LoginModal.css';
import '../styles/modal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      
      if (success) {
        setUsername('');
        setPassword('');
        onClose();
        onSuccess?.();
      } else {
        setError('Credenciales incorrectas. Inténtalo de nuevo.');
      }
    } catch (error) {
      setError('Error de conexión. Por favor, inténtalo más tarde.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="login-modal-overlay" onClick={handleClose}>
        <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
          <button
            className="login-close"
            onClick={handleClose}
            aria-label="Cerrar modal de login"
          >
            <i className="fas fa-times"></i>
          </button>

          <div className="login-header">
            <h2 className="login-title">
              <i className="fas fa-lock"></i>
              Acceso Administrativo
            </h2>
            <p className="login-subtitle">
              Ingresa tus credenciales para acceder al panel de administración
            </p>
          </div>

          {error && (
            <div className="login-error">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="login-actions">
              <button
                type="button"
                className="login-btn login-btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="login-btn login-btn-primary"
                disabled={loading || !username || !password}
              >
                {loading ? (
                  <>
                    <span className="login-loading"></span>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Iniciar Sesión
                  </>
                )}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--md-sys-color-primary-container)', borderRadius: '8px', fontSize: '0.85rem' }}>
            <p style={{ margin: 0, color: 'var(--md-sys-color-on-primary-container)' }}>
              <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
              <strong>Demo:</strong> Usuario: <code>admin</code> | Contraseña: <code>admin123</code>
            </p>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default LoginModal;
