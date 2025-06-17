import React, { useState, useEffect } from 'react';
import { DEBUG_CONFIG, debugLog } from '../../utils/debugConfig';
import styles from './DebugController.module.css';

interface DebugControllerProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

const DebugController: React.FC<DebugControllerProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  const [debugState, setDebugState] = useState(DEBUG_CONFIG);
  const [consoleStats, setConsoleStats] = useState({
    totalLogs: 0,
    apiLogs: 0,
    performanceLogs: 0
  });

  // Actualizar estado cuando cambie la configuración
  useEffect(() => {
    setDebugState({ ...DEBUG_CONFIG });
  }, []);

  // Contar logs en tiempo real (esto es solo una simulación)
  useEffect(() => {
    if (!DEBUG_CONFIG.ENABLED) return;

    const interval = setInterval(() => {
      // Simulación de conteo de logs (en una implementación real 
      // tendríamos un sistema más sofisticado)
      setConsoleStats(prev => ({
        totalLogs: prev.totalLogs + (Math.random() > 0.7 ? 1 : 0),
        apiLogs: prev.apiLogs + (Math.random() > 0.8 ? 1 : 0),
        performanceLogs: prev.performanceLogs + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleCategory = (category: keyof typeof DEBUG_CONFIG) => {
    if (category === 'ENABLED') {
      // Si se desactiva ENABLED, desactivar todo
      Object.keys(DEBUG_CONFIG).forEach(key => {
        (DEBUG_CONFIG as any)[key] = !DEBUG_CONFIG.ENABLED;
      });
    } else {
      (DEBUG_CONFIG as any)[category] = !DEBUG_CONFIG[category];
    }
    setDebugState({ ...DEBUG_CONFIG });
    debugLog.api(`🔧 Debug ${category} ${DEBUG_CONFIG[category] ? 'activado' : 'desactivado'}`);
  };

  const clearConsole = () => {
    console.clear();
    setConsoleStats({ totalLogs: 0, apiLogs: 0, performanceLogs: 0 });
    debugLog.api('🧹 Consola limpiada');
  };

  if (!isVisible) {
    return (
      <button 
        onClick={onToggle}
        className={styles.toggleButton}
        title="Abrir controlador de debug"
      >
        🐛
      </button>
    );
  }

  return (
    <div className={styles.debugController}>
      <div className={styles.header}>
        <h3>🐛 Debug Controller</h3>
        <button onClick={onToggle} className={styles.closeButton}>×</button>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span>Total logs:</span>
          <span className={styles.count}>{consoleStats.totalLogs}</span>
        </div>
        <div className={styles.stat}>
          <span>API logs:</span>
          <span className={styles.count}>{consoleStats.apiLogs}</span>
        </div>
        <div className={styles.stat}>
          <span>Performance:</span>
          <span className={styles.count}>{consoleStats.performanceLogs}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.category}>
          <label>
            <input
              type="checkbox"
              checked={debugState.ENABLED}
              onChange={() => toggleCategory('ENABLED')}
            />
            <span className={styles.mainToggle}>Debug Global</span>
          </label>
        </div>

        <div className={styles.categories}>
          {Object.entries(debugState)
            .filter(([key]) => key !== 'ENABLED')
            .map(([key, value]) => (
              <div key={key} className={styles.category}>
                <label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleCategory(key as keyof typeof DEBUG_CONFIG)}
                    disabled={!debugState.ENABLED}
                  />
                  <span>{key.toLowerCase().replace(/_/g, ' ')}</span>
                </label>
              </div>
            ))}
        </div>

        <div className={styles.actions}>
          <button onClick={clearConsole} className={styles.clearButton}>
            🧹 Limpiar Consola
          </button>
          <button 
            onClick={() => debugLog.api('📊 Estado del debug:', debugState)}
            className={styles.statusButton}
          >
            📊 Mostrar Estado
          </button>
        </div>
      </div>

      <div className={styles.info}>
        <p>💡 Este controlador permite activar/desactivar logs específicos para optimizar el rendimiento.</p>
        <p>🚀 En producción, todos los logs se desactivan automáticamente.</p>
      </div>
    </div>
  );
};

export default DebugController;
