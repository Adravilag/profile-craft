// Componente selector de emisores de certificaciones
import React, { useState, useRef, useEffect } from 'react';
import { CERTIFICATION_ISSUERS, ISSUER_CATEGORIES, type CertificationIssuer } from '../../data/certificationIssuers';
import styles from './IssuerSelector.module.css';

interface IssuerSelectorProps {
  value: string;
  onChange: (issuer: CertificationIssuer) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
  id?: string;
}

const IssuerSelector: React.FC<IssuerSelectorProps> = ({
  value,
  onChange,
  placeholder = "Seleccionar emisor",
  required = false,
  name,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredIssuer, setHoveredIssuer] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar emisores según búsqueda y categoría
  const filteredIssuers = CERTIFICATION_ISSUERS.filter(issuer => {
    const matchesSearch = issuer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issuer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || issuer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIssuerSelect = (issuer: CertificationIssuer) => {
    setSearchTerm(issuer.name);
    onChange(issuer);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const clearSelection = () => {
    setSearchTerm('');
    onChange({} as CertificationIssuer); // Enviar objeto vacío para limpiar
  };

  return (
    <div className={styles.issuerSelectorContainer} ref={containerRef}>
      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          required={required}
          name={name}
          id={id}
          className={styles.issuerInput}
          autoComplete="off"
        />
        <div className={styles.inputButtons}>
          {searchTerm && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={clearSelection}
              title="Limpiar selección"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
          <button
            type="button"
            className={styles.dropdownButton}
            onClick={() => setIsOpen(!isOpen)}
            title="Abrir selector"
          >
            <i className={`fas fa-chevron-down ${isOpen ? styles.rotated : ''}`}></i>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className={styles.dropdownContainer}>
          {/* Filtros por categoría */}
          <div className={styles.categoryFilters}>
            <div className={styles.filterLabel}>Categorías:</div>
            <div className={styles.categoryButtons}>
              {ISSUER_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  type="button"
                  className={`${styles.categoryButton} ${
                    selectedCategory === category.id ? styles.active : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de emisores */}
          <div className={styles.issuersList}>
            {filteredIssuers.length === 0 ? (
              <div className={styles.noResults}>
                <i className="fas fa-search"></i>
                <p>No se encontraron emisores</p>
                <small>Prueba con otro término de búsqueda o categoría</small>
              </div>
            ) : (
              filteredIssuers.map(issuer => (
                <button
                  key={issuer.id}
                  type="button"
                  className={`${styles.issuerOption} ${
                    hoveredIssuer === issuer.id ? styles.hovered : ''
                  }`}
                  onClick={() => handleIssuerSelect(issuer)}
                  onMouseEnter={() => setHoveredIssuer(issuer.id)}
                  onMouseLeave={() => setHoveredIssuer(null)}
                >
                  <div className={styles.issuerLogo}>
                    <img 
                      src={issuer.logoUrl} 
                      alt={`${issuer.name} logo`}
                      onError={(e) => {
                        // Si la imagen falla, mostrar un icono por defecto
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className={styles.logoFallback}>
                      <i className="fas fa-certificate"></i>
                    </div>
                  </div>
                  
                  <div className={styles.issuerInfo}>
                    <div className={styles.issuerName}>{issuer.name}</div>
                    {issuer.description && (
                      <div className={styles.issuerDescription}>
                        {issuer.description}
                      </div>
                    )}
                    <div className={styles.issuerCategory}>
                      <i className="fas fa-tag"></i>
                      {ISSUER_CATEGORIES.find(cat => cat.id === issuer.category)?.name}
                    </div>
                  </div>
                  
                  <div className={styles.selectIcon}>
                    <i className="fas fa-plus"></i>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer con información */}
          <div className={styles.dropdownFooter}>
            <small>
              <i className="fas fa-info-circle"></i>
              Se cargarán automáticamente el logo y URL de verificación
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuerSelector;
