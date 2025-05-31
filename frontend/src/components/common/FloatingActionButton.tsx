// src/components/common/FloatingActionButton.tsx

import React from 'react';
import './FloatingActionButton.css';
import FABPortal from './FABPortal';

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
  const buttonElement = (
    <div className={`fab-container fab-${position} ${className}`}>
      <button
        className={`fab fab-${size} fab-${color}`}
        onClick={onClick}
        aria-label={ariaLabel || label}
        title={label}
      >
        <i className={icon}></i>
        <span className="fab-label">{label}</span>
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
