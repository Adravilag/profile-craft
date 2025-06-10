// Development Analytics Dashboard
import React, { useState, useEffect } from 'react';
import { useImageAnalytics, type ImageMetrics } from '../../utils/imageAnalytics';
import styles from './AnalyticsDashboard.module.css';

interface AnalyticsDashboardProps {
  isVisible: boolean;
  onToggle: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isVisible, onToggle }) => {
  const { getMetrics, getReport, clear } = useImageAnalytics();
  const [metrics, setMetrics] = useState(() => getMetrics());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh, getMetrics]);

  const handleExportReport = () => {
    const report = getReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-analytics-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'logo': return '#6750a4';
      case 'photo': return '#625b71';
      case 'screenshot': return '#7d5260';
      case 'generic': return '#49454f';
      default: return '#79747e';
    }
  };

  if (!isVisible) {
    return (
      <button 
        className={styles.toggleButton}
        onClick={onToggle}
        title="Analytics Dashboard"
      >
        📊
      </button>
    );
  }  const avgLoadTime = metrics.length > 0 
    ? metrics.reduce((sum: number, m: ImageMetrics) => sum + m.loadTime, 0) / metrics.length 
    : 0;

  const typeStats = metrics.reduce((acc: Record<string, { count: number; totalConfidence: number }>, metric: ImageMetrics) => {
    if (!acc[metric.detectedType]) {
      acc[metric.detectedType] = { count: 0, totalConfidence: 0 };
    }
    acc[metric.detectedType].count++;
    acc[metric.detectedType].totalConfidence += metric.confidence;
    return acc;
  }, {} as Record<string, { count: number; totalConfidence: number }>);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h3>🔍 Image Analytics</h3>
        <div className={styles.controls}>
          <label className={styles.autoRefreshToggle}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button onClick={() => setMetrics(getMetrics())} className={styles.refreshBtn}>
            🔄
          </button>
          <button onClick={onToggle} className={styles.closeBtn}>
            ✕
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{metrics.length}</div>
          <div className={styles.statLabel}>Images Analyzed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{avgLoadTime.toFixed(1)}ms</div>
          <div className={styles.statLabel}>Avg Load Time</div>
        </div>        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {metrics.reduce((sum: number, m: ImageMetrics) => sum + m.retryCount, 0)}
          </div>
          <div className={styles.statLabel}>Total Retries</div>
        </div>
      </div>

      <div className={styles.typeDistribution}>
        <h4>Type Distribution</h4>
        <div className={styles.typeCharts}>
          {Object.entries(typeStats).map(([type, stats]) => {
            const avgConfidence = stats.totalConfidence / stats.count;
            const percentage = (stats.count / metrics.length) * 100;
            
            return (
              <div key={type} className={styles.typeItem}>
                <div className={styles.typeHeader}>
                  <span 
                    className={styles.typeColor}
                    style={{ backgroundColor: getTypeColor(type) }}
                  ></span>
                  <span className={styles.typeName}>{type}</span>
                  <span className={styles.typeCount}>{stats.count}</span>
                </div>
                <div className={styles.typeBar}>
                  <div 
                    className={styles.typeBarFill}
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: getTypeColor(type)
                    }}
                  ></div>
                </div>
                <div className={styles.typeConfidence}>
                  {avgConfidence.toFixed(1)}% avg confidence
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.recentImages}>
        <h4>Recent Images</h4>
        <div className={styles.imagesList}>
          {metrics.slice(-5).reverse().map((metric: ImageMetrics, index: number) => (
            <div key={index} className={styles.imageItem}>
              <div className={styles.imageInfo}>
                <div className={styles.imageTitle}>{metric.title}</div>
                <div className={styles.imageDetails}>
                  <span 
                    className={styles.imageType}
                    style={{ color: getTypeColor(metric.detectedType) }}
                  >
                    {metric.detectedType}
                  </span>
                  <span className={styles.imageConfidence}>
                    {metric.confidence}%
                  </span>
                  <span className={styles.imageLoadTime}>
                    {metric.loadTime.toFixed(1)}ms
                  </span>
                  {metric.retryCount > 0 && (
                    <span className={styles.imageRetries}>
                      {metric.retryCount} retries
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button onClick={handleExportReport} className={styles.exportBtn}>
          📄 Export Report
        </button>
        <button onClick={() => { clear(); setMetrics([]); }} className={styles.clearBtn}>
          🗑️ Clear Data
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
