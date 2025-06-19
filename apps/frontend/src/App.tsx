import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CurriculumMD3 from './components/CurriculumMD3';
import ArticlePage from './components/sections/articles/pages/ArticlePage';
import ArticlesAdminPage from './components/sections/articles/pages/ArticlesAdminPage';
import { ServiceUnavailable, DebugController } from '@cv-maker/ui';
import { 
  NotificationProvider, 
  NavigationProvider, 
  DataProvider, 
  AuthProvider, 
  UnifiedThemeProvider,
  InitialSetupProvider,
  useAuth,
  usePerformanceMonitoring 
} from '@cv-maker/shared';
import React, { useState } from 'react';

// Componente interno que usa los hooks de contexto
const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  // Inicializar monitoreo de performance
  usePerformanceMonitoring();
  const [showDebugController, setShowDebugController] = useState(false);

  // Solo mostrar debug controller si está en desarrollo Y el usuario es administrador
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Usar /profile-craft como basename tanto en desarrollo como en producción
  const basename = '/profile-craft';

  return (
    <>
      <ServiceUnavailable showWhenOffline={true}>
        <Router basename={basename}>
          <Routes>
            <Route path="/" element={<CurriculumMD3 />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/project/:id" element={<ArticlePage />} />
            <Route path="/articles/admin" element={<ArticlesAdminPage />} />
            <Route path="/articles/new" element={<ArticlesAdminPage />} />
            <Route path="/articles/edit/:id" element={<ArticlesAdminPage />} />
            <Route path="/article" element={<Navigate to="/articles" replace />} />
            <Route path="/article/" element={<Navigate to="/articles" replace />} />            {/* Rutas para secciones individuales - redirigir a hash fragments */}
            <Route path="/about" element={<Navigate to="/#about" replace />} />
            <Route path="/experience" element={<Navigate to="/#experience" replace />} />
            <Route path="/articles" element={<Navigate to="/#articles" replace />} />
            <Route path="/skills" element={<Navigate to="/#skills" replace />} />
            <Route path="/certifications" element={<Navigate to="/#certifications" replace />} />
            <Route path="/testimonials" element={<Navigate to="/#testimonials" replace />} />
            <Route path="/contact" element={<Navigate to="/#contact" replace />} />
            {/* Capturar cualquier sección no reconocida y redirigir a inicio */}
            <Route path="/:section" element={<CurriculumMD3 />} />
          </Routes>
        </Router>
      </ServiceUnavailable>
      
      {/* Debug Controller - Solo visible en desarrollo y para administradores */}
      {import.meta.env.DEV && isAdmin && (
        <DebugController 
          isVisible={showDebugController}
          onToggle={() => setShowDebugController(v => !v)}
        />
      )}
    </>
  );
};

function App() {
  return (
    <UnifiedThemeProvider>
      <NavigationProvider>
        <DataProvider>
          <AuthProvider>
            <InitialSetupProvider>
              <NotificationProvider>
                <AppContent />
              </NotificationProvider>
            </InitialSetupProvider>
          </AuthProvider>
        </DataProvider>
      </NavigationProvider>
    </UnifiedThemeProvider>
  );
}

export default App;



