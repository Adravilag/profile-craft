// src/components/ui/CredentialIdInput.tsx
import React, { useState, useEffect } from 'react';
import { CertificationIssuer, validateCredentialId, getCredentialExample, generateVerifyUrl } from '@cv-maker/shared';
import styles from './CredentialIdInput.module.css';

interface CredentialIdInputProps {
  value: string;
  onChange: (value: string) => void;
  issuer: CertificationIssuer | null;
  placeholder?: string;
}

const CredentialIdInput: React.FC<CredentialIdInputProps> = ({
  value,
  onChange,
  issuer,
  placeholder = "ID de Credencial"
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [verifyUrl, setVerifyUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!value.trim() || !issuer) {
      setIsValid(null);
      setVerifyUrl(undefined);
      return;
    }

    setIsChecking(true);
    
    // Simular validación con delay para mostrar el estado de verificación
    const timer = setTimeout(() => {
      const valid = validateCredentialId(issuer, value);
      setIsValid(valid);
      
      if (valid) {
        const url = generateVerifyUrl(issuer, value);
        setVerifyUrl(url);
      } else {
        setVerifyUrl(undefined);
      }
      
      setIsChecking(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [value, issuer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const getValidationClass = () => {
    if (isChecking) return styles.checking;
    if (isValid === true) return styles.valid;
    if (isValid === false) return styles.invalid;
    return '';
  };

  const getStatusIcon = () => {
    if (isChecking) return <i className={`fas fa-spinner fa-spin ${styles.statusIcon}`}></i>;
    if (isValid === true) return <i className={`fas fa-check-circle ${styles.statusIcon} ${styles.validIcon}`}></i>;
    if (isValid === false) return <i className={`fas fa-times-circle ${styles.statusIcon} ${styles.invalidIcon}`}></i>;
    return null;
  };

  return (
    <div className={styles.credentialInputContainer}>
      <div className={`${styles.inputWrapper} ${getValidationClass()}`}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={issuer ? getCredentialExample(issuer) : placeholder}
          className={styles.credentialInput}
        />
        <div className={styles.statusContainer}>
          {getStatusIcon()}
        </div>
      </div>
      
      {issuer && (
        <div className={styles.helpText}>
          {getCredentialExample(issuer)}
        </div>
      )}
      
      {isValid === true && verifyUrl && (
        <div className={styles.verifyContainer}>
          <a 
            href={verifyUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.verifyLink}
          >
            <i className="fas fa-external-link-alt"></i>
            <span>Verificar certificación</span>
          </a>
        </div>
      )}
      
      {isValid === false && value.trim() && (
        <div className={styles.errorContainer}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>Formato de credencial no válido para {issuer?.name}</span>
        </div>
      )}
    </div>
  );
};

export default CredentialIdInput;
