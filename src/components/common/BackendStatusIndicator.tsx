// src/components/common/BackendStatusIndicator.tsx

import React from 'react';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import CoffeeIcon from './icons/CoffeeIcon';
import SleepingServerIcon from './icons/SleepingServerIcon';
import ProgressBar from './ProgressBar';
import styles from './BackendStatusIndicator.module.css';

interface BackendStatusIndicatorProps {
  showWhenOnline?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  className?: string;
}

const BackendStatusIndicator: React.FC<BackendStatusIndicatorProps> = ({
  showWhenOnline = false,
  position = 'top-right',
  className = ''
}) => {
  const { 
    isOnline, 
    isChecking, 
    lastChecked, 
    error, 
    retryCount,
    checkBackendHealth,
    retryConnection 
  } = useBackendStatus();

  // No mostrar nada si está online y no se requiere mostrar cuando está online
  if (isOnline && !showWhenOnline) return null;
  const getStatusText = () => {
    if (isChecking) return '☕ Despertando servidor...';
    if (isOnline) return '✅ Servicio activo';
    return '😴 Servidor descansando';
  };

  const getStatusIcon = () => {
    if (isChecking) return <CoffeeIcon size={20} animate={true} />;
    if (isOnline) return <i className="fas fa-check-circle" style={{ color: 'var(--status-online)' }}></i>;
    return <SleepingServerIcon size={20} animate={true} />;
  };

  const formatLastChecked = () => {
    if (!lastChecked) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastChecked.getTime()) / 1000);
    
    if (diff < 60) return 'hace menos de 1 minuto';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} minutos`;
    return `hace ${Math.floor(diff / 3600)} horas`;
  };

  return (
    <div className={`${styles.indicator} ${styles[position]} ${className}`}>      <div className={`${styles.status} ${isOnline ? styles.online : styles.offline}`}>
        <div className={styles.statusHeader}>
          <div className={styles.statusIcon}>
            {getStatusIcon()}
          </div>
          <span className={styles.statusText}>{getStatusText()}</span>
        </div>
          {!isOnline && (
          <div className={styles.offlineDetails}>            {/* Progress bar para mostrar estado de reconexión */}
            {isChecking && (
              <ProgressBar 
                progress={Math.min((retryCount / 5) * 100, 100)} 
                size="sm" 
                variant="warning"
                animated={true}
                aria-label={`Intento de reconexión ${retryCount} de 5`}
              />
            )}
            
            <div className={styles.errorMessage}>
              <CoffeeIcon size={16} animate={true} />
              <span>
                ProfileCraft necesita un momentito para despertar. 
                {retryCount >= 3 ? 
                  ' El servidor está tomando su café matutino ☕ y pronto estará listo.' :
                  ' Es normal, solo está estirándose después de la siesta.'
                }
              </span>
            </div>
            
            {error && (
              <div className={styles.errorDetail}>
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className={styles.actions}>              <button 
                className={styles.retryButton}
                onClick={retryConnection}
                disabled={isChecking || retryCount >= 5}
              >
                {isChecking ? (
                  <>
                    <CoffeeIcon size={16} animate={true} />
                    Preparando café...
                  </>
                ) : retryCount >= 5 ? (
                  <>
                    <SleepingServerIcon size={16} animate={true} />
                    Esperando al dormilón...
                  </>
                ) : (
                  <>
                    <i className="fas fa-redo"></i>
                    🔔 ¡Despiértalo! ({retryCount}/5)
                  </>
                )}
              </button>
                <button 
                className={styles.manualCheckButton}
                onClick={() => checkBackendHealth()}
                disabled={isChecking}
              >
                <i className="fas fa-sync-alt"></i>
                🔍 Verificar ahora
              </button>
            </div>

            <div className={styles.suggestions}>
              <h4>💡 Consejos mientras esperas:</h4>              <ul>
                <li>🌐 Verifica tu conexión a internet</li>
                <li>☕ El servidor está preparando su café (cold start)</li>
                <li>⏱️ Prueba recargar en 1-2 minutos</li>
                <li>🔧 Puede estar haciendo mantenimiento</li>
                <li>📞 Contáctanos si persiste (¡somos amigables!)</li>
              </ul>
            </div>
          </div>
        )}

        {lastChecked && (
          <div className={styles.lastChecked}>
            Última verificación: {formatLastChecked()}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendStatusIndicator;
