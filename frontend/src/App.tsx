import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CurriculumMD3 from './components/CurriculumMD3';
import ArticlePage from './components/sections/articles/ArticlePage';
import { NotificationProvider } from './contexts/NotificationContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { AuthProvider } from './contexts/AuthContext';
import { UnifiedThemeProvider } from './contexts/UnifiedThemeContext';
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';
import { useEffect } from 'react';

function App() {
  const { metrics, getNavigationMetrics, getResourceMetrics, getMemoryInfo } = usePerformanceMonitoring();

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
          <NotificationProvider>
            <Router>
              <Routes>
                <Route path="/" element={<CurriculumMD3 />} />
                <Route path="/article/:id" element={<ArticlePage />} />
                <Route path="/project/:id" element={<ArticlePage />} />
                {/* Rutas para secciones individuales - todas cargan CurriculumMD3 */}
                <Route path="/about" element={<CurriculumMD3 initialSection="about" />} />
                <Route path="/experience" element={<CurriculumMD3 initialSection="experience" />} />
                <Route path="/articles" element={<CurriculumMD3 initialSection="articles" />} />
                <Route path="/skills" element={<CurriculumMD3 initialSection="skills" />} />
                <Route path="/certifications" element={<CurriculumMD3 initialSection="certifications" />} />
                <Route path="/testimonials" element={<CurriculumMD3 initialSection="testimonials" />} />
                <Route path="/contact" element={<CurriculumMD3 initialSection="contact" />} />
                {/* Capturar cualquier sección no reconocida y redirigir a inicio */}
                <Route path="/:section" element={<CurriculumMD3 />} />
              </Routes>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </NavigationProvider>
    </UnifiedThemeProvider>
  );
}

export default App;