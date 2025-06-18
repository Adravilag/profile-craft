// src/components/common/ImageModal.tsx

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ImageModal.module.css';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  imageAlt: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageUrl, imageAlt, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer}>
        <button
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <i className="fas fa-times"></i>
        </button>
        
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <img
            src={imageUrl}
            alt={imageAlt}
            className={styles.modalImage}
          />
          
          <div className={styles.modalInfo}>
            <p className={styles.modalAlt}>{imageAlt}</p>
            <div className={styles.modalActions}>
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.modalAction}
              >
                <i className="fas fa-external-link-alt"></i>
                Abrir en nueva pestaña
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageModal;
