import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CurriculumMD3 from './components/CurriculumMD3';
import ArticlePage from './components/sections/articles/ArticlePage';
import ArticlesAdminPage from './components/sections/articles/ArticlesAdminPage';
import ServiceUnavailable from './components/common/ServiceUnavailable';
import { PerformanceTest } from './components/debug/PerformanceTest';
import SystemShowcase from './components/debug/SystemShowcase';
import DebugController from './components/debug/DebugController';
import { NotificationProvider } from './contexts/NotificationContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UnifiedThemeProvider } from './contexts/UnifiedThemeContext';
import { InitialSetupProvider } from './contexts/InitialSetupContext';
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';
import React, { useState } from 'react';

// Componente wrapper para mostrar DebugController solo a administradores
interface AdminDebugControllerProps {
  isVisible: boolean;
  onToggle: () => void;
}

const AdminDebugController: React.FC<AdminDebugControllerProps> = ({ isVisible, onToggle }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Solo mostrar si está en desarrollo Y el usuario es administrador
  const isAdmin = isAuthenticated && user?.role === 'admin';
  
  if (!import.meta.env.DEV || !isAdmin) {
    return null;
  }
  
  return (
    <DebugController 
      isVisible={isVisible}
      onToggle={onToggle}
    />
  );
};

function App() {
  const { } = usePerformanceMonitoring();
  const [showDebugController, setShowDebugController] = useState(false);

  // Usar /profile-craft como basename tanto en desarrollo como en producción
  const basename = '/profile-craft';

  return (
    <UnifiedThemeProvider>
      <NavigationProvider>
        <DataProvider>
          <AuthProvider>
            <InitialSetupProvider>
                <NotificationProvider>
                  <ServiceUnavailable showWhenOffline={true}>
                    <Router basename={basename}>
                    <Routes>
                    <Route path="/" element={<CurriculumMD3 />} />
                    <Route path="/article/:id" element={<ArticlePage />} />
                    <Route path="/project/:id" element={<ArticlePage />} />
                    <Route path="/articles/admin" element={<ArticlesAdminPage />} />
                    <Route path="/articles/new" element={<ArticlesAdminPage />} />
                    <Route path="/articles/edit/:id" element={<ArticlesAdminPage />} />
                    <Route path="/performance-test" element={<PerformanceTest />} />
                    <Route path="/showcase" element={<SystemShowcase />} />
                    <Route path="/article" element={<Navigate to="/articles" replace />} />
                    <Route path="/article/" element={<Navigate to="/articles" replace />} />
                    {/* Rutas para secciones individuales - todas cargan CurriculumMD3 */}
                    <Route path="/about" element={<CurriculumMD3 />} />
                    <Route path="/experience" element={<CurriculumMD3 />} />
                    <Route path="/articles" element={<CurriculumMD3 />} />
                    <Route path="/skills" element={<CurriculumMD3 />} />
                    <Route path="/certifications" element={<CurriculumMD3 />} />
                    <Route path="/testimonials" element={<CurriculumMD3 />} />
                    <Route path="/contact" element={<CurriculumMD3 />} />
                    {/* Capturar cualquier sección no reconocida y redirigir a inicio */}
                    <Route path="/:section" element={<CurriculumMD3 />} />
                  </Routes>
                </Router>
              </ServiceUnavailable>
            </NotificationProvider>
            
            {/* Debug Controller - Solo visible en desarrollo y para administradores */}
            <AdminDebugController 
              isVisible={showDebugController}
              onToggle={() => setShowDebugController(v => !v)}
            />
          </InitialSetupProvider>
        </AuthProvider>
      </DataProvider>
    </NavigationProvider>
  </UnifiedThemeProvider>
  );
}

export default App;