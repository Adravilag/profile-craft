import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CurriculumMD3 from './components/CurriculumMD3';
import ArticlePage from './components/sections/articles/ArticlePage';
import ArticlesAdminPage from './components/sections/articles/ArticlesAdminPage';
import VideoTestPage from './pages/VideoTestPage';
import ServiceUnavailable from './components/common/ServiceUnavailable';
import { DesignSystemDemo } from './components/debug/DesignSystemDemo';
import { PerformanceTest } from './components/debug/PerformanceTest';
import SystemShowcase from './components/debug/SystemShowcase';
import InteractiveDemo from './components/debug/InteractiveDemo';
import { NotificationProvider } from './contexts/NotificationContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { DataProvider } from './contexts/DataContext';
// Removido AuthProvider duplicado
import { UnifiedThemeProvider } from './contexts/UnifiedThemeContext';
import { InitialSetupProvider } from './contexts/InitialSetupContext';
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';

function App() {
  const { } = usePerformanceMonitoring();

  // Usar /profile-craft como basename tanto en desarrollo como en producción
  const basename = '/profile-craft';

  return (
    <UnifiedThemeProvider>
      <NavigationProvider>
        <DataProvider>
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
                    <Route path="/test/video" element={<VideoTestPage />} />
                    <Route path="/design-system" element={<DesignSystemDemo />} />
                    <Route path="/performance-test" element={<PerformanceTest />} />
                    <Route path="/showcase" element={<SystemShowcase />} />
                    <Route path="/interactive-demo" element={<InteractiveDemo />} />
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
          </InitialSetupProvider>
      </DataProvider>
    </NavigationProvider>
  </UnifiedThemeProvider>
  );
}

export default App;