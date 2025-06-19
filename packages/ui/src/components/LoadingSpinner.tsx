import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#007bff',
  className = '',
}) => {
  const sizeClasses = `spinner--${size}`;

  return (
    <div
      className={`spinner ${sizeClasses} ${className}`.trim()}
      style={{ borderTopColor: color }}
      role="status"
      aria-label="Cargando"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
};
