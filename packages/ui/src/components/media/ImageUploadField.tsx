// src/components/ui/ImageUploadField.tsx

import React, { useState } from 'react';
import { uploadImage } from '@cv-maker/shared';
import { useNotification } from '@cv-maker/shared';
import styles from './ImageUploadField.module.css';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  placeholder?: string;
  imageType?: 'profile' | 'project' | 'avatar';
  accept?: string;
  maxSize?: number; // en MB
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  label,
  placeholder = "https://ejemplo.com/imagen.jpg",
  imageType = 'project',
  accept = "image/*",
  maxSize = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleFileSelect = async (file: File) => {
    // Validaciones
    if (!file.type.startsWith('image/')) {
      showError('Solo se permiten archivos de imagen');
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      showError(`La imagen debe ser menor a ${maxSize}MB`);
      return;
    }

    setUploading(true);
    try {
      const response = await uploadImage(file, imageType);
      if (response.success) {
        onChange(response.file.url);
        showSuccess('Imagen subida exitosamente');
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      showError('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className={styles.imageUploadField}>
      <label>{label}</label>
      
      <div className={styles.inputGroup}>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={styles.urlInput}
          disabled={uploading}
        />
        
        <div className={styles.uploadSection}>
          <div
            className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''} ${uploading ? styles.uploading : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {uploading ? (
              <div className={styles.uploadingState}>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Subiendo imagen...</span>
              </div>
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt"></i>
                <span>Arrastra una imagen o</span>
                <label htmlFor={`file-${label}`} className={styles.fileLabel}>
                  selecciona archivo
                </label>
                <input
                  id={`file-${label}`}
                  type="file"
                  accept={accept}
                  onChange={handleFileInput}
                  className={styles.hiddenInput}
                  disabled={uploading}
                />
              </>
            )}
          </div>
          
          <div className={styles.uploadInfo}>
            <small>
              <i className="fas fa-info-circle"></i>
              Formatos: JPG, PNG, GIF, WebP (máx. {maxSize}MB)
            </small>
          </div>
        </div>
      </div>

      {value && (
        <div className={styles.previewSection}>
          <img 
            src={value} 
            alt="Vista previa" 
            className={styles.preview}
            loading="lazy"
          />
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => onChange('')}
            title="Eliminar imagen"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
