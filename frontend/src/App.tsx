// Portfolio Moderno con Material Design 3
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CurriculumMD3 from './components/CurriculumMD3';
import NavigationTest from './components/NavigationTest';
import { NotificationProvider } from './contexts/NotificationContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { AuthProvider } from './contexts/AuthContext';
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';
import { useEffect } from 'react';

function App() {
  const { metrics, getNavigationMetrics, getResourceMetrics, getMemoryInfo } = usePerformanceMonitoring();

  useEffect(() => {
    // Log de métricas de rendimiento para desarrollo
    if (import.meta.env.DEV) {
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
    <NavigationProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/*" element={<CurriculumMD3 />} />
              <Route path="/test" element={<NavigationTest />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </NavigationProvider>
  );
}

export default App;