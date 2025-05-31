// Componente de selector de tema mejorado
import React, { useState } from 'react';
import { useTheme, type Theme } from '../../hooks/useTheme';
import './ThemeToggle.css';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, isDark, setTheme } = useTheme();
  const [showOptions, setShowOptions] = useState(false);

  const themes: { key: Theme; label: string; icon: string }[] = [
    { key: 'light', label: 'Claro', icon: 'fas fa-sun' },
    { key: 'dark', label: 'Oscuro', icon: 'fas fa-moon' },
    { key: 'auto', label: 'Automático', icon: 'fas fa-circle-half-stroke' },
  ];

  const currentTheme = themes.find(t => t.key === theme) || themes[0];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setShowOptions(false);
  };

  return (
    <div className={`theme-toggle ${className}`}>
      <button
        className={`theme-toggle-button ${isDark ? 'dark' : 'light'}`}
        onClick={() => setShowOptions(!showOptions)}
        aria-label="Cambiar tema"
        title={`Tema actual: ${currentTheme.label}`}
      >
        <i className={currentTheme.icon}></i>
        <span className="theme-label">{currentTheme.label}</span>
        <i className={`fas fa-chevron-down toggle-arrow ${showOptions ? 'open' : ''}`}></i>
      </button>

      {showOptions && (
        <>
          <div 
            className="theme-overlay"
            onClick={() => setShowOptions(false)}
          />
          <div className="theme-options">
            {themes.map((themeOption) => (
              <button
                key={themeOption.key}
                className={`theme-option ${theme === themeOption.key ? 'active' : ''}`}
                onClick={() => handleThemeChange(themeOption.key)}
              >
                <i className={themeOption.icon}></i>
                <span>{themeOption.label}</span>
                {theme === themeOption.key && (
                  <i className="fas fa-check theme-check"></i>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeToggle;
