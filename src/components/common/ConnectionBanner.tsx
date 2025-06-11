// src/components/common/ConnectionBanner.tsx

import React from 'react';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import CoffeeIcon from './icons/CoffeeIcon';
import styles from './ConnectionBanner.module.css';

interface ConnectionBannerProps {
  onRetry?: () => void;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

const ConnectionBanner: React.FC<ConnectionBannerProps> = ({
  onRetry,
  onDismiss,
  showDismiss = false
}) => {
  const { isOnline, isChecking, retryCount, retryConnection } = useBackendStatus();

  // No mostrar si está online
  if (isOnline) return null;

  const handleRetry = () => {
    retryConnection();
    onRetry?.();
  };

  return (
    <div className={styles.banner}>
      <div className={styles.content}>        <div className={styles.message}>
          {isChecking ? (
            <>
              <CoffeeIcon size={20} animate={true} />
              <span>☕ Preparando conexión...</span>
            </>
          ) : retryCount >= 3 ? (
            <>
              <i className="fas fa-bed"></i>
              <span>😴 Servidor despertando...</span>
            </>
          ) : (
            <>
              <i className="fas fa-wifi"></i>
              <span>🔗 Reconectando...</span>
            </>
          )}
        </div>
        
        <div className={styles.actions}>
          {!isChecking && retryCount < 5 && (
            <button 
              className={styles.retryBtn}
              onClick={handleRetry}
            >
              <i className="fas fa-redo"></i>
              Reintentar
            </button>
          )}
          
          {showDismiss && onDismiss && (
            <button 
              className={styles.dismissBtn}
              onClick={onDismiss}
              aria-label="Cerrar banner"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>
      
      {retryCount >= 3 && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
      )}
    </div>
  );
};

export default ConnectionBanner;
