// src/components/common/icons/SleepingServerIcon.tsx

import React from 'react';

/*
 * SleepingServerIcon - Servidor durmiendo con animaciones mejoradas
 * 
 * Características:
 * - ZZZ flotantes con delays escalonados (3s de duración)
 * - Servidor con animación de "respiración" (4s ease-in-out)
 * - LEDs con pulso de standby (delays de 0.3s entre cada LED)
 * - Efectos hover interactivos
 * 
 * Uso:
 * <SleepingServerIcon size={48} animate={true} />
 * <SleepingServerIcon size={24} animate={false} /> // Versión estática
 * 
 * Animaciones CSS aplicadas:
 * - .sleeping-zzz: Controla las ZZZ flotantes
 * - .sleeping-server: Respiración del servidor
 * - .status-pulse: Pulso sutil de los LEDs
 * - .icon-hover: Efecto hover interactivo
 */

interface SleepingServerIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
  wakingUp?: boolean;
}

const SleepingServerIcon: React.FC<SleepingServerIconProps> = ({ 
  className = '', 
  size = 24,
  animate = true,
  wakingUp = false
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 24"
      className={`${className} ${wakingUp ? 'waking-up-shake' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={wakingUp ? "Servidor despertando..." : "Servidor durmiendo pacíficamente"}
    >
      {/* Servidor principal - Grid 24x24 con respiración */}
      <rect
        x="4"
        y="8"
        width="16"
        height="12"
        rx="2"
        fill="var(--gray-500)"
        className={animate ? 'sleeping-server' : ''}
      />
      
      {/* Pantalla del servidor */}
      <rect
        x="6"
        y="10"
        width="12"
        height="3"
        rx="1"
        fill="var(--surface-primary)"
        opacity="0.6"
      />
      
      {/* LEDs del servidor (en standby) - Espaciado 8px */}
      <circle 
        cx="7" 
        cy="16" 
        r="1" 
        fill="var(--gray-400)" 
        className={animate ? 'status-pulse' : ''}
        style={{ animationDelay: '0s' }}
      />
      <circle 
        cx="10" 
        cy="16" 
        r="1" 
        fill="var(--gray-400)" 
        className={animate ? 'status-pulse' : ''}
        style={{ animationDelay: '0.3s' }}
      />
      <circle 
        cx="13" 
        cy="16" 
        r="1" 
        fill="var(--gray-400)" 
        className={animate ? 'status-pulse' : ''}
        style={{ animationDelay: '0.6s' }}
      />
      
      {/* Ventilador (parado) */}
      <circle cx="16" cy="16" r="1.5" fill="none" stroke="var(--gray-400)" strokeWidth="0.5" opacity="0.5" />
      <line x1="14.5" y1="16" x2="17.5" y2="16" stroke="var(--gray-400)" strokeWidth="0.5" opacity="0.5" />
      <line x1="16" y1="14.5" x2="16" y2="17.5" stroke="var(--gray-400)" strokeWidth="0.5" opacity="0.5" />
      
      {/* Ojos - Cerrados cuando duerme, abiertos cuando despierta */}
      {wakingUp ? (
        // Ojos abiertos (despierto/alerta)
        <>
          <circle cx="9.5" cy="11.5" r="0.8" fill="var(--gray-700)" />
          <circle cx="13.5" cy="11.5" r="0.8" fill="var(--gray-700)" />
          <circle cx="9.5" cy="11.3" r="0.3" fill="var(--surface-primary)" />
          <circle cx="13.5" cy="11.3" r="0.3" fill="var(--surface-primary)" />
        </>
      ) : (
        // Ojos cerrados (durmiendo)
        <>
          <path
            d="M 9 11.5 Q 10 12 11 11.5"
            fill="none"
            stroke="var(--gray-700)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path
            d="M 13 11.5 Q 14 12 15 11.5"
            fill="none"
            stroke="var(--gray-700)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </>
      )}
      
      {/* ZZZ (partículas de sueño) - Solo cuando duerme, más grandes y visibles */}
      {!wakingUp && (
        <g className={animate ? 'sleeping-zzz' : ''}>
          <text 
            x="19" 
            y="8" 
            fontSize="4" 
            fill="var(--surface-primary)"
            className={animate ? 'zzz-1' : ''}
            fontWeight="bold"
          >
            Z
          </text>
          <text 
            x="21" 
            y="5" 
            fontSize="3.5" 
            fill="var(--surface-primary)"
            className={animate ? 'zzz-2' : ''}
            fontWeight="bold"
          >
            Z
          </text>
          <text 
            x="22.5" 
            y="2" 
            fontSize="3" 
            fill="var(--brand-primary)" 
            className={animate ? 'zzz-3' : ''}
            fontWeight="bold"
          >
            Z
          </text>
        </g>
      )}
      
      {/* Sombra - Alineada con grid */}
      <ellipse
        cx="12"
        cy="21"
        rx="6"
        ry="1"
        fill="var(--gray-400)"
        opacity="0.2"
      />
    </svg>
  );
};

export default SleepingServerIcon;