import React, { useState } from 'react';
import SleepingServerIcon from '../common/icons/SleepingServerIcon';
import styles from './InteractiveDemo.module.css';

export const InteractiveDemo: React.FC = () => {
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [iconSize, setIconSize] = useState(64);

  const handleWakeUp = () => {
    setIsWakingUp(true);
    setTimeout(() => setIsWakingUp(false), 1000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🎭 Demo Interactivo del Servidor</h1>
        <p>Prueba las nuevas animaciones y estados visuales</p>
      </header>

      {/* Demo Principal */}
      <div className={styles.mainDemo}>
        <div className={styles.serverContainer}>
          <h2>Servidor ProfileCraft</h2>
          
          <div className={`${styles.logoIcon} ${isWakingUp ? styles.wakingUp : ''}`}>
            <SleepingServerIcon 
              size={iconSize} 
              animate={!isWakingUp} 
              wakingUp={isWakingUp} 
            />
          </div>
          
          <div className={styles.status}>
            {isWakingUp ? (
              <span className={styles.awake}>🔔 Despertando...</span>
            ) : (
              <span className={styles.sleeping}>💤 Durmiendo pacíficamente</span>
            )}
          </div>

          <button 
            className={styles.wakeButton}
            onClick={handleWakeUp}
            disabled={isWakingUp}
          >
            {isWakingUp ? 'Despertando...' : '🔔 Despertar Servidor'}
          </button>
        </div>
      </div>

      {/* Controles de Demo */}
      <div className={styles.controls}>
        <h3>Controles de Demostración</h3>
        
        <div className={styles.controlGroup}>
          <label htmlFor="size-slider">
            Tamaño del Icono: {iconSize}px
          </label>
          <input
            id="size-slider"
            type="range"
            min="32"
            max="128"
            value={iconSize}
            onChange={(e) => setIconSize(Number(e.target.value))}
            className={styles.slider}
          />
        </div>
      </div>

      {/* Comparación de Estados */}
      <div className={styles.comparison}>
        <h3>Comparación de Estados</h3>
        
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <h4>😴 Estado Durmiendo</h4>
            <div className={styles.iconDemo}>
              <SleepingServerIcon size={48} animate={true} wakingUp={false} />
            </div>
            <ul>
              <li>✅ Ojos cerrados (líneas curvas)</li>
              <li>✅ ZZZ flotando en azul</li>
              <li>✅ Respiración suave cada 6s</li>
              <li>✅ LEDs pulsando lentamente</li>
            </ul>
          </div>

          <div className={styles.stateCard}>
            <h4>👁️ Estado Despierto</h4>
            <div className={styles.iconDemo}>
              <SleepingServerIcon size={48} animate={false} wakingUp={true} />
            </div>
            <ul>
              <li>✅ Ojos abiertos con pupilas</li>
              <li>✅ Sin ZZZ (ocultas)</li>
              <li>✅ Animación de sacudida</li>
              <li>✅ Estado alerta temporalmente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Información Técnica */}
      <div className={styles.techInfo}>
        <h3>🔧 Detalles Técnicos</h3>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h4>ZZZ Mejoradas</h4>
            <ul>
              <li><strong>Tamaño:</strong> 3-4px (33% más grandes)</li>
              <li><strong>Color:</strong> var(--brand-primary)</li>
              <li><strong>Peso:</strong> font-weight: bold</li>
              <li><strong>ViewBox:</strong> Extendido a 26x24</li>
              <li><strong>Posición:</strong> x="19-22.5" (fuera del círculo)</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h4>Animaciones de Despertar</h4>
            <ul>
              <li><strong>Container:</strong> wakeUpShake 600ms</li>
              <li><strong>Icono:</strong> serverWakeUp 800ms</li>
              <li><strong>Efecto:</strong> Translate + Scale + Rotate</li>
              <li><strong>Duración total:</strong> 1000ms</li>
              <li><strong>Easing:</strong> ease-in-out</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h4>Estados Visuales</h4>
            <ul>
              <li><strong>Ojos dormido:</strong> Paths curvas</li>
              <li><strong>Ojos despierto:</strong> Círculos + pupilas</li>
              <li><strong>ZZZ condicionales:</strong> Solo cuando duerme</li>
              <li><strong>ARIA:</strong> Labels dinámicos</li>
              <li><strong>Responsive:</strong> Funciona en todos los tamaños</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Prueba de Integración */}
      <div className={styles.integration}>
        <h3>🧪 Prueba de Integración</h3>
        <p>
          Estas animaciones están integradas en el componente ServiceUnavailable. 
          Cuando el backend esté offline y presiones "Reintentar", verás estas 
          mismas animaciones en acción.
        </p>
        
        <div className={styles.integrationDemo}>
          <div className={styles.mockServiceUnavailable}>
            <div className={styles.mockLogo}>
              <div className={`${styles.mockLogoIcon} ${isWakingUp ? styles.wakingUp : ''}`}>
                <SleepingServerIcon size={48} animate={!isWakingUp} wakingUp={isWakingUp} />
              </div>
              <h4>ProfileCraft</h4>
            </div>
            <h5>Nuestro servidor está descansando</h5>
            <p>En un momento volverá a estar disponible</p>
            <button 
              className={styles.mockRetryButton}
              onClick={handleWakeUp}
              disabled={isWakingUp}
            >
              {isWakingUp ? 'Despertando...' : 'Reintentar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo;
