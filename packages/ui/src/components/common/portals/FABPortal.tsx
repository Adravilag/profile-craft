// src/components/common/FABPortal.tsx

import React from 'react';
import { createPortal } from 'react-dom';

interface FABPortalProps {
  children: React.ReactNode;
}

const FABPortal: React.FC<FABPortalProps> = ({ children }) => {
  // Crear o obtener el contenedor para los FABs
  const fabContainer = React.useMemo(() => {
    let container = document.getElementById('fab-portal-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'fab-portal-root';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
    return container;
  }, []);

  return createPortal(
    <div style={{ pointerEvents: 'auto' }}>
      {children}
    </div>,
    fabContainer
  );
};

export default FABPortal;
