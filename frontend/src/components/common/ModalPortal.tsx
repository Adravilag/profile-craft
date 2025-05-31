// src/components/common/ModalPortal.tsx

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Crear el contenedor del portal
    const portalContainer = document.createElement('div');
    portalContainer.style.position = 'fixed';
    portalContainer.style.top = '0';
    portalContainer.style.left = '0';
    portalContainer.style.width = '100%';
    portalContainer.style.height = '100%';
    portalContainer.style.zIndex = '9999';
    portalContainer.style.pointerEvents = 'auto';
    portalContainer.className = 'modal-portal-container';
    
    // Agregar al body
    document.body.appendChild(portalContainer);
    setContainer(portalContainer);

    // Cleanup al desmontar
    return () => {
      if (portalContainer && document.body.contains(portalContainer)) {
        document.body.removeChild(portalContainer);
      }
    };
  }, []);

  // Renderizar usando portal si el contenedor está disponible
  if (!container) {
    return null;
  }

  return createPortal(children, container);
};

export default ModalPortal;
