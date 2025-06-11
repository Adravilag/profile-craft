// src/components/common/icons/CoffeeIcon.tsx

import React from 'react';

/*
 * CoffeeIcon - Taza de café con vapor animado
 * 
 * Características:
 * - Vapor flotante con diferentes delays entre líneas
 * - Animación de steam suave y realista
 * - Efectos hover interactivos
 * 
 * Uso:
 * <CoffeeIcon size={20} animate={true} />
 * <CoffeeIcon size={16} animate={false} /> // Sin vapor animado
 * 
 * Animaciones CSS aplicadas:
 * - .coffee-steam: Controla el vapor flotante
 * - .icon-hover: Efecto hover interactivo
 * 
 * Perfecto para:
 * - Botones de "Reintentar" 
 * - Estados de "preparando" o "cargando"
 * - Mensajes de espera amigables
 */

interface CoffeeIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

const CoffeeIcon: React.FC<CoffeeIconProps> = ({ 
  className = '', 
  size = 24,
  animate = true 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`${className} icon-hover`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Taza de café"
    >
      {/* Taza de café - Grid 24x24 */}
      <path
        d="M 6 9 L 6 17 Q 6 19 8 19 L 14 19 Q 16 19 16 17 L 16 9 Z"
        fill="var(--brand-accent)"
        opacity="0.9"
      />
      
      {/* Café */}
      <path
        d="M 7 10 L 7 16 Q 7 18 9 18 L 13 18 Q 15 18 15 16 L 15 10 Z"
        fill="#8B4513"
        opacity="0.8"
      />
      
      {/* Asa de la taza - Stroke 2px */}
      <path
        d="M 16 11 Q 19 11 19 14 Q 19 17 16 17"
        fill="none"
        stroke="var(--brand-accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Vapor (animado) - Espaciado 8px */}
      <g className={animate ? 'coffee-steam' : ''}>
        <path
          d="M 9 7 Q 9.5 5 9 3 Q 8.5 5 9 7"
          fill="none"
          stroke="var(--gray-400)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M 11 7 Q 11.5 5 11 3 Q 10.5 5 11 7"
          fill="none"
          stroke="var(--gray-400)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M 13 7 Q 13.5 5 13 3 Q 12.5 5 13 7"
          fill="none"
          stroke="var(--gray-400)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>
      
      {/* Platillo - Alineado con grid */}
      <ellipse
        cx="11"
        cy="19"
        rx="4"
        ry="0.8"
        fill="var(--brand-accent)"
        opacity="0.7"
      />
    </svg>
  );
};

export default CoffeeIcon;