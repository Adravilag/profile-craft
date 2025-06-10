// src/components/sections/articles/ArticleFormContainer.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useUnifiedTheme } from '../../../contexts/UnifiedThemeContext';
import styles from './ArticleFormContainer.module.css';

interface ArticleFormContainerProps {
  children: React.ReactNode;
  title: string;
  icon: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonTo?: string;
  backButtonText?: string;
  showThemeToggle?: boolean;
}

const ArticleFormContainer: React.FC<ArticleFormContainerProps> = ({
  children,
  title,
  icon,
  subtitle,
  showBackButton = true,
  backButtonTo = "/articles/admin",
  backButtonText = "Volver a administración",
  showThemeToggle = true
}) => {
  const { currentGlobalTheme, toggleGlobalTheme } = useUnifiedTheme();

  return (
    <div className={styles.formContainer} data-theme={currentGlobalTheme}>
      {/* Header con estructura unificada */}
      <header className={styles.formHeader}>
        <div className={styles.headerLeft}>
          {showBackButton && (
            <Link to={backButtonTo} className={styles.backButton}>
              <i className="fas fa-arrow-left"></i>
              {backButtonText}
            </Link>
          )}
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <i className={icon}></i>
              {title}
            </h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
        
        {showThemeToggle && (
          <div className={styles.headerActions}>
            <button
              className={styles.themeToggle}
              onClick={toggleGlobalTheme}
              title={
                currentGlobalTheme === 'dark' 
                  ? 'Cambiar a modo día' 
                  : 'Cambiar a modo noche'
              }
              aria-label={
                currentGlobalTheme === 'dark'
                  ? 'Activar modo día'
                  : 'Activar modo noche'
              }
            >
              <i className={currentGlobalTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
              {currentGlobalTheme === 'dark' ? 'Modo Día' : 'Modo Noche'}
            </button>
          </div>
        )}
      </header>

      {/* Contenido principal del formulario */}
      <main className={styles.formMain}>
        <div className={styles.formContent}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default ArticleFormContainer;
