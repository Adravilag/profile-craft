// src/components/common/ProgressBar.tsx

import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number; // 0-100
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
  'aria-label'?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'primary',
  size = 'md',
  showPercentage = false,
  animated = true,
  className = '',
  'aria-label': ariaLabel = 'Progreso de conexión'
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`${styles.container} ${className}`}>
      {showPercentage && (
        <div className={styles.percentage}>
          <span className={styles.percentageText}>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div
        className={`
          ${styles.progressBar} 
          ${styles[variant]} 
          ${styles[size]}
          ${animated ? styles.animated : ''}
        `}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div
          className={styles.progressFill}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;