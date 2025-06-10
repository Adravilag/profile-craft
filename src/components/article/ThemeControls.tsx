// src/components/article/ThemeControls.tsx
import React, { useState } from 'react';
import { useUnifiedTheme } from '../../contexts/UnifiedThemeContext';
import styles from './ThemeControls.module.css';

interface ThemeControlsProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const ThemeControls: React.FC<ThemeControlsProps> = ({ isVisible, onToggleVisibility }) => {
  const { 
    preferences, 
    currentGlobalTheme, 
    isReadingMode, 
    setGlobalTheme,
    updateReadingPreference, 
    resetToDefaults 
  } = useUnifiedTheme();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const themeOptions = [
    { value: 'light', icon: 'fa-sun', label: 'Claro' },
    { value: 'dark', icon: 'fa-moon', label: 'Oscuro' },
    { value: 'auto', icon: 'fa-adjust', label: 'Auto' }
  ];

  const readingModeOptions = [
    { value: 'normal', icon: 'fa-align-left', label: 'Normal' },
    { value: 'focus', icon: 'fa-eye', label: 'Enfoque' },
    { value: 'minimal', icon: 'fa-minus', label: 'Mínimo' }
  ];

  return (
    <>
      {/* Botón flotante de controles */}
      <button
        className={`${styles.themeToggleButton} ${isVisible ? styles.active : ''}`}
        onClick={onToggleVisibility}
        aria-label="Abrir controles de tema"
        title="Controles de tema y lectura"
      >
        <i className={`fas ${currentGlobalTheme === 'dark' ? 'fa-moon' : 'fa-sun'}`}></i>
        {isReadingMode && <span className={styles.readingModeIndicator}></span>}
      </button>

      {/* Panel de controles */}
      {isVisible && (
        <div className={styles.themeControlsPanel}>
          <div className={styles.panelHeader}>
            <h3>
              <i className="fas fa-palette"></i>
              Personalización
            </h3>
            <button
              className={styles.closeButton}
              onClick={onToggleVisibility}
              aria-label="Cerrar controles"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className={styles.panelContent}>
            {/* Tema */}
            <div className={styles.controlGroup}>
              <label className={styles.groupLabel}>
                <i className="fas fa-brush"></i>
                Tema
              </label>
              <div className={styles.themeGrid}>
                {themeOptions.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.themeOption} ${preferences.globalTheme === option.value ? styles.active : ''}`}
                    onClick={() => setGlobalTheme(option.value as any)}
                    title={option.label}
                  >
                    <i className={`fas ${option.icon}`}></i>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modo de lectura */}
            <div className={styles.controlGroup}>
              <label className={styles.groupLabel}>
                <i className="fas fa-book-reader"></i>
                Modo de lectura
              </label>
              <div className={styles.readingModeGrid}>
                {readingModeOptions.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.readingModeOption} ${preferences.readingMode === option.value ? styles.active : ''}`}
                    onClick={() => updateReadingPreference('readingMode', option.value as any)}
                    title={option.label}
                  >
                    <i className={`fas ${option.icon}`}></i>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ajustes rápidos */}
            <div className={styles.controlGroup}>
              <label className={styles.groupLabel}>
                <i className="fas fa-sliders-h"></i>
                Ajustes rápidos
              </label>
              <div className={styles.quickControls}>
                {/* Tamaño de fuente */}
                <div className={styles.sliderControl}>
                  <label>
                    <i className="fas fa-font"></i>
                    Tamaño ({preferences.fontSize}px)
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="24"
                    value={preferences.fontSize}
                    onChange={(e) => updateReadingPreference('fontSize', parseInt(e.target.value))}
                    className={styles.slider}
                  />
                </div>

                {/* Altura de línea */}
                <div className={styles.sliderControl}>
                  <label>
                    <i className="fas fa-text-height"></i>
                    Espaciado ({preferences.lineHeight})
                  </label>
                  <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={preferences.lineHeight}
                    onChange={(e) => updateReadingPreference('lineHeight', parseFloat(e.target.value))}
                    className={styles.slider}
                  />
                </div>

                {/* Ancho máximo */}
                <div className={styles.sliderControl}>
                  <label>
                    <i className="fas fa-arrows-alt-h"></i>
                    Ancho ({preferences.maxWidth}px)
                  </label>
                  <input
                    type="range"
                    min="600"
                    max="1000"
                    step="50"
                    value={preferences.maxWidth}
                    onChange={(e) => updateReadingPreference('maxWidth', parseInt(e.target.value))}
                    className={styles.slider}
                  />
                </div>
              </div>
            </div>

            {/* Configuración avanzada */}
            <div className={styles.controlGroup}>
              <button
                className={styles.toggleAdvanced}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
                Configuración avanzada
              </button>

              {showAdvanced && (
                <div className={styles.advancedControls}>
                  {/* Modo nocturno automático */}
                  <div className={styles.checkboxControl}>
                    <label>
                      <input
                        type="checkbox"
                        checked={preferences.autoNightMode}
                        onChange={(e) => updateReadingPreference('autoNightMode', e.target.checked)}
                      />
                      <span className={styles.checkboxLabel}>
                        <i className="fas fa-clock"></i>
                        Modo nocturno automático
                      </span>
                    </label>
                  </div>

                  {preferences.autoNightMode && (
                    <div className={styles.timeControls}>
                      <div className={styles.timeControl}>
                        <label>
                          <i className="fas fa-moon"></i>
                          Inicio nocturno
                        </label>
                        <input
                          type="time"
                          value={preferences.nightModeStart}
                          onChange={(e) => updateReadingPreference('nightModeStart', e.target.value)}
                        />
                      </div>
                      <div className={styles.timeControl}>
                        <label>
                          <i className="fas fa-sun"></i>
                          Fin nocturno
                        </label>
                        <input
                          type="time"
                          value={preferences.nightModeEnd}
                          onChange={(e) => updateReadingPreference('nightModeEnd', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className={styles.panelActions}>
              <button
                className={styles.resetButton}
                onClick={resetToDefaults}
                title="Restaurar configuración por defecto"
              >
                <i className="fas fa-undo"></i>
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar panel */}
      {isVisible && (
        <div 
          className={styles.overlay}
          onClick={onToggleVisibility}
        />
      )}
    </>
  );
};

export default ThemeControls;
