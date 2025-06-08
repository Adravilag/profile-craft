// src/components/debug/ThemeSyncTest.tsx
import React from 'react';
import { useUnifiedTheme } from '../../contexts/UnifiedThemeContext';

const ThemeSyncTest: React.FC = () => {
  const { 
    currentGlobalTheme, 
    preferences,
    setGlobalTheme,
    toggleGlobalTheme
  } = useUnifiedTheme();

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '12px',
    zIndex: 9999,
    minWidth: '200px',
    fontFamily: 'monospace'
  };

  const buttonStyle: React.CSSProperties = {
    margin: '2px',
    padding: '4px 8px',
    fontSize: '10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#007acc',
    color: 'white'
  };
  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>🎨 Theme Debug</div>
      
      <div style={{ marginBottom: '4px' }}>
        <strong>Current Theme:</strong> {currentGlobalTheme}
      </div>
      <div style={{ marginBottom: '8px', fontSize: '10px', opacity: 0.8 }}>
        Global Setting: {preferences.globalTheme}
      </div>
      
      <div>
        <strong>Theme Controls:</strong><br/>
        <button style={buttonStyle} onClick={() => setGlobalTheme('light')}>Light</button>
        <button style={buttonStyle} onClick={() => setGlobalTheme('dark')}>Dark</button>
        <button style={buttonStyle} onClick={() => setGlobalTheme('auto')}>Auto</button>
        <button style={buttonStyle} onClick={toggleGlobalTheme}>Toggle</button>
      </div>
    </div>
  );
};

export default ThemeSyncTest;
