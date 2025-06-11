// src/components/common/SkeletonLoader.tsx

import React from 'react';
import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  width = '100%',
  height = '1em',
  variant = 'text',
  animation = 'pulse'
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`
        ${styles.skeleton} 
        ${styles[variant]} 
        ${styles[animation]} 
        ${className}
      `}
      style={style}
    />
  );
};

export default SkeletonLoader;
