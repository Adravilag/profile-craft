// src/components/common/FloatingActionButton.tsx

import React from 'react';
import styles from './FloatingActionButton.module.css';
import FABPortal from '../portals/FABPortal';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  ariaLabel?: string;
  position?: 'bottom-right' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
  usePortal?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label,
  ariaLabel,
  position = 'bottom-right',
  size = 'medium',
  color = 'primary',
  className = '',
  usePortal = true
}) => {
  const getPositionClass = (position: string) => {
    switch (position) {
      case 'bottom-right':
        return styles.fabBottomRight;
      case 'bottom-left':
        return styles.fabBottomLeft;
      default:
        return styles.fabBottomRight;
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return styles.fabSmall;
      case 'medium':
        return styles.fabMedium;
      case 'large':
        return styles.fabLarge;
      default:
        return styles.fabMedium;
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'primary':
        return styles.fabPrimary;
      case 'secondary':
        return styles.fabSecondary;
      case 'success':
        return styles.fabSuccess;
      case 'warning':
        return styles.fabWarning;
      case 'danger':
        return styles.fabDanger;
      default:
        return styles.fabPrimary;
    }
  };

  const buttonElement = (
    <div className={`${styles.fabContainer} ${getPositionClass(position)} ${className}`}>
      <button
        className={`${styles.fab} ${getSizeClass(size)} ${getColorClass(color)}`}
        onClick={onClick}
        aria-label={ariaLabel || label}
        title={label}
      >
        <i className={icon}></i>
        <span className={styles.fabLabel}>{label}</span>
      </button>
    </div>
  );

  return usePortal ? (
    <FABPortal>{buttonElement}</FABPortal>
  ) : (
    buttonElement
  );
};

export default FloatingActionButton;
