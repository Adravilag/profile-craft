// src/components/common/ModalPortal.tsx

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ModalPortal.module.css';

interface ModalPortalProps {
  children: React.ReactNode;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    // Crear el contenedor del portal
    const portalContainer = document.createElement('div');
    portalContainer.className = styles.modalPortalContainer;
    
    // Agregar al body
    document.body.appendChild(portalContainer);
    
    // Prevenir scroll del body cuando el modal está abierto
    document.body.classList.add(styles.scrollLock);
    
    setContainer(portalContainer);

    // Cleanup al desmontar
    return () => {
      if (portalContainer && document.body.contains(portalContainer)) {
        document.body.removeChild(portalContainer);
      }
      document.body.classList.remove(styles.scrollLock);
    };
  }, []);

  // Renderizar usando portal si el contenedor está disponible
  if (!container) {
    return null;
  }

  return createPortal(children, container);
};

export default ModalPortal;
