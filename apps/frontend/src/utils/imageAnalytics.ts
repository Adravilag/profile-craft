// Image Performance Analytics
import { debugLog } from './debugConfig';

export interface ImageMetrics {
  imageUrl: string;
  title: string;
  detectedType: 'logo' | 'photo' | 'screenshot' | 'generic';
  confidence: number;
  loadTime: number;
  retryCount: number;
  finalUrl?: string; // En caso de fallback
  timestamp: number;
}

export class ImageAnalytics {
  private static metrics: ImageMetrics[] = [];
  private static readonly MAX_METRICS = 100; // Límite para evitar memory leaks
  static recordImageLoad(metrics: Omit<ImageMetrics, 'timestamp'>) {
    const fullMetrics: ImageMetrics = {
      ...metrics,
      timestamp: Date.now()
    };

    ImageAnalytics.metrics.push(fullMetrics);

    // Mantener solo las últimas métricas
    if (ImageAnalytics.metrics.length > ImageAnalytics.MAX_METRICS) {
      ImageAnalytics.metrics = ImageAnalytics.metrics.slice(-ImageAnalytics.MAX_METRICS);
    }

    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      debugLog.images('📊 Image Analytics:', {
        image: metrics.title,
        type: metrics.detectedType,
        confidence: `${metrics.confidence}%`,
        loadTime: `${metrics.loadTime}ms`,
        retries: metrics.retryCount
      });
    }
  }
  static getMetrics(): ImageMetrics[] {
    return [...ImageAnalytics.metrics];
  }

  static getAverageLoadTime(): number {
    if (ImageAnalytics.metrics.length === 0) return 0;
    const total = ImageAnalytics.metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    return total / ImageAnalytics.metrics.length;
  }

  static getTypeAccuracy(): Record<string, { count: number; avgConfidence: number }> {
    const typeStats: Record<string, { count: number; totalConfidence: number }> = {};

    ImageAnalytics.metrics.forEach(metric => {
      if (!typeStats[metric.detectedType]) {
        typeStats[metric.detectedType] = { count: 0, totalConfidence: 0 };
      }
      typeStats[metric.detectedType].count++;
      typeStats[metric.detectedType].totalConfidence += metric.confidence;
    });

    const result: Record<string, { count: number; avgConfidence: number }> = {};
    Object.entries(typeStats).forEach(([type, stats]) => {
      result[type] = {
        count: stats.count,
        avgConfidence: stats.totalConfidence / stats.count
      };
    });

    return result;
  }

  static getRetryStats(): { totalRetries: number; avgRetries: number; maxRetries: number } {
    const retries = ImageAnalytics.metrics.map(m => m.retryCount);
    return {
      totalRetries: retries.reduce((sum, count) => sum + count, 0),
      avgRetries: retries.length > 0 ? retries.reduce((sum, count) => sum + count, 0) / retries.length : 0,
      maxRetries: Math.max(...retries, 0)
    };
  }

  static exportReport(): string {
    const typeAccuracy = this.getTypeAccuracy();
    const retryStats = this.getRetryStats();
    const avgLoadTime = this.getAverageLoadTime();    return `
# Image System Performance Report
Generated: ${new Date().toISOString()}

## Summary
- Total images analyzed: ${ImageAnalytics.metrics.length}
- Average load time: ${avgLoadTime.toFixed(2)}ms
- Total retries: ${retryStats.totalRetries}
- Average retries per image: ${retryStats.avgRetries.toFixed(2)}

## Type Detection Accuracy
${Object.entries(typeAccuracy).map(([type, stats]) => 
  `- ${type}: ${stats.count} images, ${stats.avgConfidence.toFixed(1)}% avg confidence`
).join('\n')}

## Recent Images (Last 10)
${ImageAnalytics.metrics.slice(-10).map(m => 
  `- ${m.title}: ${m.detectedType} (${m.confidence}% confidence, ${m.loadTime}ms)`
).join('\n')}
    `.trim();
  }

  static clearMetrics(): void {
    ImageAnalytics.metrics = [];
  }
}

// Hook personalizado para image analytics
export const useImageAnalytics = () => {
  return {
    recordLoad: ImageAnalytics.recordImageLoad,
    getMetrics: ImageAnalytics.getMetrics,
    getReport: ImageAnalytics.exportReport,
    clear: ImageAnalytics.clearMetrics
  };
};
