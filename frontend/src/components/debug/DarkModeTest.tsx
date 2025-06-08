import React from 'react';
import { useUnifiedTheme } from '../../contexts/UnifiedThemeContext';

const DarkModeTest: React.FC = () => {
  const { currentGlobalTheme, toggleGlobalTheme } = useUnifiedTheme();

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '10px',
      background: 'var(--md-sys-color-surface-container)',
      border: '1px solid var(--md-sys-color-outline)',
      borderRadius: '8px',
      zIndex: 9999,
      color: 'var(--md-sys-color-on-surface)',
      fontSize: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div>Tema actual: <strong>{currentGlobalTheme}</strong></div>
      <div>Data-theme: <strong>{document.documentElement.getAttribute('data-theme')}</strong></div>
      <div>Body classes: <strong>{document.body.className}</strong></div>
      <button 
        onClick={toggleGlobalTheme}
        style={{
          marginTop: '8px',
          padding: '4px 8px',
          background: 'var(--md-sys-color-primary)',
          color: 'var(--md-sys-color-on-primary)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        Toggle Tema
      </button>
    </div>
  );
};

export default DarkModeTest;
