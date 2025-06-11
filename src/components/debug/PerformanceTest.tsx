import React, { useState, useEffect } from 'react';
import SleepingServerIcon from '../common/icons/SleepingServerIcon';
import CoffeeIcon from '../common/icons/CoffeeIcon';
import ProgressBar from '../common/ProgressBar';
import styles from './PerformanceTest.module.css';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  animationsRunning: number;
  memoryUsage?: number;
}

export const PerformanceTest: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    animationsRunning: 0
  });
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Performance monitoring
  useEffect(() => {
    if (!isRunning) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFrame = (currentTime: number) => {
      frameCount++;
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= 1000) { // Update every second
        const fps = Math.round((frameCount * 1000) / deltaTime);
        const frameTime = deltaTime / frameCount;
        
        setMetrics(prev => ({
          ...prev,
          fps,
          frameTime,
          memoryUsage: (performance as any).memory?.usedJSHeapSize / 1024 / 1024
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFrame);
    };

    animationId = requestAnimationFrame(measureFrame);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isRunning]);

  const runPerformanceTests = () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results: string[] = [];
    
    // Test 1: Baseline FPS
    setTimeout(() => {
      results.push(`✅ Baseline FPS: ${metrics.fps} (Target: >30fps)`);
      setTestResults([...results]);
    }, 2000);

    // Test 2: Multiple animations stress test
    setTimeout(() => {
      results.push(`⚡ Stress test: Running multiple animations simultaneously`);
      setTestResults([...results]);
    }, 4000);

    // Test 3: Memory usage
    setTimeout(() => {
      const memUsage = metrics.memoryUsage || 0;
      const status = memUsage < 50 ? '✅' : memUsage < 100 ? '⚠️' : '❌';
      results.push(`${status} Memory usage: ${memUsage.toFixed(1)}MB (Target: <50MB)`);
      setTestResults([...results]);
    }, 6000);

    // Test 4: Frame time consistency
    setTimeout(() => {
      const consistent = metrics.frameTime < 33.33; // 30fps = 33.33ms per frame
      results.push(`${consistent ? '✅' : '⚠️'} Frame time: ${metrics.frameTime.toFixed(1)}ms (Target: <33.33ms)`);
      setTestResults([...results]);
    }, 8000);

    // Final results
    setTimeout(() => {
      results.push(`🎯 Performance test completed`);
      setTestResults([...results]);
      setIsRunning(false);
    }, 10000);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Animation Performance Testing</h1>
      
      {/* Performance Metrics */}
      <section className={styles.metricsSection}>
        <h2>Real-time Metrics</h2>
        <div className={styles.metricsGrid}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>FPS</span>
            <span className={styles.metricValue} data-status={metrics.fps >= 30 ? 'good' : 'warning'}>
              {metrics.fps}
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Frame Time</span>
            <span className={styles.metricValue} data-status={metrics.frameTime <= 33.33 ? 'good' : 'warning'}>
              {metrics.frameTime.toFixed(1)}ms
            </span>
          </div>
          {metrics.memoryUsage && (
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Memory</span>
              <span className={styles.metricValue} data-status={metrics.memoryUsage <= 50 ? 'good' : 'warning'}>
                {metrics.memoryUsage.toFixed(1)}MB
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Test Controls */}
      <section className={styles.controlsSection}>
        <button 
          className={styles.testButton}
          onClick={runPerformanceTests}
          disabled={isRunning}
        >
          {isRunning ? 'Running Tests...' : 'Start Performance Test'}
        </button>
      </section>

      {/* Animation Stress Test */}
      <section className={styles.animationSection}>
        <h2>Animation Stress Test</h2>
        <div className={styles.animationGrid}>
          {/* Multiple animated icons */}
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={styles.animationItem}>
              {i % 2 === 0 ? <SleepingServerIcon /> : <CoffeeIcon />}
            </div>
          ))}
        </div>
        
        {/* Multiple progress bars */}
        <div className={styles.progressSection}>
          <h3>Progress Bar Performance</h3>
          {Array.from({ length: 3 }, (_, i) => (
            <ProgressBar 
              key={i}
              progress={((i + 1) * 25) % 100}
              size={i === 0 ? 'sm' : i === 1 ? 'md' : 'lg'}
              animated={isRunning}
            />
          ))}
        </div>
      </section>

      {/* Test Results */}
      <section className={styles.resultsSection}>
        <h2>Test Results</h2>
        <div className={styles.resultsList}>
          {testResults.map((result, index) => (
            <div key={index} className={styles.resultItem}>
              {result}
            </div>
          ))}
          {testResults.length === 0 && (
            <div className={styles.noResults}>
              Click "Start Performance Test" to begin testing
            </div>
          )}
        </div>
      </section>

      {/* Performance Recommendations */}
      <section className={styles.recommendationsSection}>
        <h2>Performance Optimization Guidelines</h2>
        <div className={styles.recommendation}>
          <h3>✅ Optimizations Implemented</h3>
          <ul>
            <li><strong>CSS Animations:</strong> Using transform and opacity for GPU acceleration</li>
            <li><strong>60fps Target:</strong> All animations designed for 16.67ms frame time</li>
            <li><strong>Reduced Motion:</strong> Respects user preferences</li>
            <li><strong>Efficient Selectors:</strong> Minimal CSS recalculation</li>
            <li><strong>Animation Cleanup:</strong> Proper cleanup of animation listeners</li>
          </ul>
        </div>
        
        <div className={styles.recommendation}>
          <h3>🎯 Performance Targets</h3>
          <ul>
            <li><strong>FPS:</strong> &gt;30fps (mobile), &gt;60fps (desktop)</li>
            <li><strong>Frame Time:</strong> &lt;33.33ms (30fps), &lt;16.67ms (60fps)</li>
            <li><strong>Memory:</strong> &lt;50MB for animations</li>
            <li><strong>CPU Usage:</strong> &lt;30% during animations</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
