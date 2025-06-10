// src/components/sections/skills/components/SkillValidationModal.tsx

import React, { useState } from 'react';
import ModalPortal from '../../../common/ModalPortal';
import styles from './SkillValidationModal.module.css';

interface SkillValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (validationData: any) => void;
  skillName: string;
}

const SkillValidationModal: React.FC<SkillValidationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  skillName
}) => {
  const [validationData, setValidationData] = useState({
    proofUrl: '',
    comment: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValidationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(validationData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className={styles.validationModalOverlay} onClick={onClose}>
        <div className={styles.validationModal} onClick={e => e.stopPropagation()}>
          <div className={styles.validationHeader}>
            <div>
              <h2 className={styles.validationTitle}>Validar Habilidad</h2>
              <p className={styles.validationSubtitle}>
                Proporcione evidencia para validar la habilidad: <strong>{skillName}</strong>
              </p>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className={styles.validationBody}>
            <form onSubmit={handleSubmit}>
              <div className={styles.validationSection}>
                <h3 className={styles.sectionTitle}>
                  <i className="fas fa-certificate"></i>
                  Información de Validación
                </h3>
                
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>URL de prueba o certificado</label>
                  <input 
                    type="url"
                    name="proofUrl"
                    className={styles.textInput}
                    placeholder="https://ejemplo.com/certificado"
                    value={validationData.proofUrl}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Comentario (opcional)</label>
                  <input
                    type="text"
                    name="comment"
                    className={styles.textInput}
                    placeholder="Información adicional sobre su experiencia con esta habilidad"
                    value={validationData.comment}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.actionsContainer}>
                <button 
                  type="button" 
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  <i className="fas fa-check-circle"></i>
                  Enviar Validación
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default SkillValidationModal;