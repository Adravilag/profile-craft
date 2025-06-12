// Componente temporal para debuggear el problema del botón admin
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';

const DebugInfo: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const { currentSection } = useNavigation();

  const currentPath = window.location.pathname;
  const basePath = '/profile-craft';
  const sectionPath = currentPath.startsWith(basePath) ? currentPath.substring(basePath.length) : currentPath;

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 10000,
      fontFamily: 'monospace',
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#00ff00' }}>🔍 Debug Info</h4>
      
      <div><strong>Auth Status:</strong></div>
      <div>• isAuthenticated: <span style={{ color: isAuthenticated ? '#00ff00' : '#ff0000' }}>
        {String(isAuthenticated)}
      </span></div>
      <div>• loading: <span style={{ color: loading ? '#ffff00' : '#00ff00' }}>
        {String(loading)}
      </span></div>
      <div>• user: {user ? user.name : 'null'}</div>
      <div>• token: {localStorage.getItem('portfolio_auth_token') ? 'Present' : 'Missing'}</div>
      
      <hr style={{ margin: '10px 0', border: '1px solid #444' }} />      <div><strong>Navigation:</strong></div>
      <div>• currentSection: <span style={{ color: '#00bfff' }}>
        "{currentSection}"
      </span></div>
      <div>• URL: {window.location.pathname}</div>
      <div>• Section Path: <span style={{ color: '#ffff00' }}>{sectionPath}</span></div>
      
      <hr style={{ margin: '10px 0', border: '1px solid #444' }} />
      
      <div><strong>showAdminFAB should be:</strong></div>
      <div style={{ 
        color: (isAuthenticated && currentSection === "experience") ? '#00ff00' : '#ff0000',
        fontWeight: 'bold'
      }}>
        {String(isAuthenticated && currentSection === "experience")}
      </div>
    </div>
  );
};

export default DebugInfo;
