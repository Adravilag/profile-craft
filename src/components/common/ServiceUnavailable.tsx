// src/components/common/ServiceUnavailable.tsx

import React, { useState } from 'react';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import SleepingServerIcon from './icons/SleepingServerIcon';
import CoffeeIcon from './icons/CoffeeIcon';
import ProgressBar from './ProgressBar';
import styles from './ServiceUnavailable.module.css';

interface ServiceUnavailableProps {
  children: React.ReactNode;
  showWhenOffline?: boolean;
  showTechnicalDetails?: boolean; // Solo para desarrollo
}

const ServiceUnavailable: React.FC<ServiceUnavailableProps> = ({ 
  children, 
  showWhenOffline = true,
  showTechnicalDetails = false // Por defecto oculto para usuarios finales
}) => {
  const { isOnline, isChecking, checkBackendHealth, retryCount } = useBackendStatus();
  const [isWakingUp, setIsWakingUp] = useState(false);

  const handleRetry = async () => {
    setIsWakingUp(true);
    await checkBackendHealth();
    // Mantener la animación de despertar por un momento
    setTimeout(() => setIsWakingUp(false), 1000);
  };

  const handleContact = () => {
    window.open('mailto:contacto@profilecraft.com', '_blank');
  };

  // Si el backend está online, mostrar el contenido normal
  if (isOnline) {
    return <>{children}</>;
  }

  // Si no debe mostrar cuando está offline, mostrar contenido normal
  if (!showWhenOffline) {
    return <>{children}</>;
  }

  return (
    <div className={styles.serviceUnavailable}>
      <div className={styles.container}>
        <div className={styles.content}>
          
          {/* Logo minimalista */}
          <div className={styles.logo}>
            <div className={`${styles.logoIcon} ${isWakingUp ? styles.wakingUp : ''}`}>
              <SleepingServerIcon size={48} animate={!isWakingUp} wakingUp={isWakingUp} />
            </div>
            <h1>ProfileCraft</h1>
          </div>

          {/* Mensaje principal limpio */}
          <div className={styles.mainMessage}>
            <h2>Nuestro servidor está descansando</h2>
            <p className={styles.subtitle}>
              En un momento volverá a estar disponible
            </p>
          </div>

          {/* Progress bar solo si está reintentando */}
          {isChecking && (
            <div className={styles.retryProgress}>
              <ProgressBar 
                progress={75} 
                variant="primary" 
                size="md"
                showPercentage={false}
                aria-label="Reintentando conexión..."
              />
              <p className={styles.retryText}>Reintentando...</p>
            </div>
          )}

          {/* Acciones principales - Solo dos botones esenciales */}
          <div className={styles.actions}>
            <button
              className={styles.retryButton}
              onClick={handleRetry}
              disabled={isChecking}
              aria-label="Reintentar conexión"
            >
              {isChecking ? (
                <>
                  <div className={styles.spinner} />
                  Reintentando...
                </>
              ) : (
                <>
                  <CoffeeIcon size={16} />
                  Reintentar
                </>
              )}
            </button>

            <button
              className={styles.contactButton}
              onClick={handleContact}
              aria-label="Contactar soporte"
            >
              Contáctanos
            </button>
          </div>

          {/* Mensaje breve y amigable */}
          <div className={styles.helpText}>
            <p>
              Si el problema persiste, no dudes en contactarnos. 
              Estamos aquí para ayudarte.
            </p>
          </div>

          {/* Detalles técnicos - Solo para desarrollo/debug */}
          {showTechnicalDetails && (
            <div className={styles.technicalInfo}>
              <details className={styles.details}>
                <summary>Mostrar detalles técnicos</summary>
                <div className={styles.technicalDetails}>
                  <p><strong>Estado:</strong> Servidor no disponible</p>
                  <p><strong>Reintentos:</strong> {retryCount}/3</p>
                  <p><strong>Verificando:</strong> {isChecking ? 'Sí' : 'No'}</p>
                  <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
                </div>
              </details>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/*
 * Ejemplo de uso del ServiceUnavailable component rediseñado:
 * 
 * Para usuarios finales (producción):
 * <ServiceUnavailable showTechnicalDetails={false}>
 *   <App />
 * </ServiceUnavailable>
 * 
 * Para desarrollo/debug:
 * <ServiceUnavailable showTechnicalDetails={true}>
 *   <App />
 * </ServiceUnavailable>
 * 
 * El diseño es minimalista y profesional:
 * - Logo simple sin texto extra
 * - Mensaje claro: "Nuestro servidor está descansando"
 * - Solo dos botones: "Reintentar" y "Contáctanos"
 * - Detalles técnicos ocultos por defecto
 * - Progress bar solo cuando está reintentando
 * - Diseño compacto que funciona en móvil
 */

export default ServiceUnavailable;
