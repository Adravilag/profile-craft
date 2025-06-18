// src/components/ui/Pagination.tsx

import React from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  showInfo?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showInfo = true
}) => {
  // No mostrar paginación si hay solo una página
  if (totalPages <= 1) return null;

  // Calcular el rango de elementos mostrados
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const delta = 2; // Número de páginas a mostrar a cada lado de la página actual
    const pages: (number | string)[] = [];
    
    // Siempre mostrar la primera página
    pages.push(1);
    
    // Calcular el rango alrededor de la página actual
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    
    // Agregar puntos suspensivos si hay un gap
    if (start > 2) {
      pages.push('...');
    }
    
    // Agregar páginas en el rango
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Agregar puntos suspensivos si hay un gap
    if (end < totalPages - 1) {
      pages.push('...');
    }
    
    // Siempre mostrar la última página (si no es la primera)
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={styles.paginationContainer}>      {/* Información de elementos */}
      {showInfo && (
        <div className={styles.paginationInfo}>
          <span>
            {totalItems === 1 
              ? `1 proyecto`
              : `Mostrando ${startItem}-${endItem} de ${totalItems} proyectos`
            }
          </span>
        </div>
      )}

      {/* Controles de paginación */}
      <nav className={styles.pagination} aria-label="Navegación de páginas">
        {/* Botón anterior */}
        <button
          className={`${styles.pageButton} ${styles.prevNext}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
        >
          <i className="fas fa-chevron-left"></i>
          <span className={styles.buttonText}>Anterior</span>
        </button>

        {/* Números de página */}
        <div className={styles.pageNumbers}>
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {typeof page === 'number' ? (
                <button
                  className={`${styles.pageButton} ${
                    page === currentPage ? styles.active : ''
                  }`}
                  onClick={() => onPageChange(page)}
                  aria-label={`Página ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ) : (
                <span className={styles.ellipsis} aria-hidden="true">
                  {page}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Botón siguiente */}
        <button
          className={`${styles.pageButton} ${styles.prevNext}`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Página siguiente"
        >
          <span className={styles.buttonText}>Siguiente</span>
          <i className="fas fa-chevron-right"></i>
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
