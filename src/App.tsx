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
import { AuthProvider } from './contexts/AuthContext';
import { UnifiedThemeProvider } from './contexts/UnifiedThemeContext';
import { InitialSetupProvider } from './contexts/InitialSetupContext';
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';
import { useEffect } from 'react';

function App() {
  const { metrics, getNavigationMetrics, getResourceMetrics, getMemoryInfo } = usePerformanceMonitoring();

  // Usar /profile-craft como basename tanto en desarrollo como en producción
  const basename = '/profile-craft';

  useEffect(() => {
    // Log de métricas de rendimiento para desarrollo
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        console.group('🚀 Performance Metrics');
        console.log('LCP:', metrics.lcp);
        console.log('FID:', metrics.fid);
        console.log('CLS:', metrics.cls);
        console.log('FCP:', metrics.fcp);
        console.log('TTFB:', metrics.ttfb);
        
        const navigationMetrics = getNavigationMetrics();
        if (navigationMetrics) {
          console.log('Navigation Metrics:', navigationMetrics);
        }
        
        const resourceMetrics = getResourceMetrics();
        if (resourceMetrics) {
          console.log('Resource Metrics:', resourceMetrics.slice(0, 5)); // Solo las primeras 5
        }
        
        const memoryInfo = getMemoryInfo();
        if (memoryInfo) {
          console.log('Memory Info:', memoryInfo);
        }
        
        console.groupEnd();
      }, 2000); // Esperar 2 segundos para que se capturen las métricas
    }
  }, [metrics, getNavigationMetrics, getResourceMetrics, getMemoryInfo]);

  return (
    <UnifiedThemeProvider>
      <NavigationProvider>
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
        </AuthProvider>
      </NavigationProvider>
    </UnifiedThemeProvider>
  );
}

export default App;