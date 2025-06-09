// src/components/navigation/SmartNavigation.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '../../contexts/NavigationContext';
import styles from './SmartNavigation.module.css';

interface SmartNavigationProps {
  navItems: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
}

const SmartNavigation: React.FC<SmartNavigationProps> = ({ navItems }) => {
  const { currentSection, navigateToSection, navigateFromArticleToSection } = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Detectar si estamos en una página de artículo o proyecto
  const isInArticlePage = location.pathname.startsWith('/article/') || location.pathname.startsWith('/project/');

  // Establecer altura del nav como variable CSS al montar
  useEffect(() => {
    const setNavHeightVariable = () => {
      const navElement = document.querySelector(`.${styles.headerPortfolioNav}`) as HTMLElement;
      if (navElement) {
        const navHeight = navElement.offsetHeight;
        document.documentElement.style.setProperty('--header-nav-height', `${navHeight}px`);
      }
    };

    // Establecer inmediatamente
    setNavHeightVariable();
    
    // También establecer después de un breve delay para asegurar el renderizado
    const timeout = setTimeout(setNavHeightVariable, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  // Detectar cuando el nav debe estar sticky
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Calcular la altura real del header dinámicamente
      const headerElement = document.querySelector('.header-curriculum') as HTMLElement;
      const headerHeight = headerElement?.offsetHeight || 400;
      
      // Determinar si el nav debe estar sticky
      const navSticky = scrollY >= headerHeight - 80;
      setIsNavSticky(navSticky);
      
      // Calcular progreso del scroll
      const progress = Math.min(scrollY / headerHeight, 1);
      setScrollProgress(progress);
      
      // Establecer variable CSS para altura del nav (para scroll-margin-top)
      const navElement = document.querySelector(`.${styles.headerPortfolioNav}`) as HTMLElement;
      if (navElement) {
        const navHeight = navElement.offsetHeight;
        document.documentElement.style.setProperty('--header-nav-height', `${navHeight}px`);
      }
    };

    // Llamada inicial
    handleScroll();

    // Listener de scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Manejar navegación con lógica diferente según el contexto
  const handleNavClick = useCallback((sectionId: string) => {
    if (isInArticlePage) {
      // Si estamos en una página de artículo, usar la función especializada del contexto
      navigateFromArticleToSection(sectionId);
    } else {
      // Si estamos en la página principal, usar la navegación normal con scroll
      navigateToSection(sectionId, undefined, true);
    }
  }, [isInArticlePage, navigateFromArticleToSection, navigateToSection]);

  return (
    <>
      {/* Barra de progreso de scroll */}
      <div className={styles.scrollProgressContainer}>
        <div 
          className={styles.scrollProgressBar}
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Navegación principal */}
      <nav className={`${styles.headerPortfolioNav} ${isNavSticky ? styles.navSticky : ''}`}>
        <div className={styles.headerNavContainer}>
          {/* Botón de volver si estamos en una página de artículo */}
          {isInArticlePage && (
            <button
              className={`${styles.headerNavItem} ${styles.backButton}`}
              onClick={() => navigate(-1)}
              aria-label="Volver atrás"
              title="Volver"
            >
              <i className="fas fa-arrow-left" aria-hidden="true"></i>
              <span>Volver</span>
            </button>
          )}
          
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.headerNavItem} ${
                currentSection === item.id ? styles.active : ''
              }`}
              onClick={() => handleNavClick(item.id)}
              aria-label={`Navegar a sección ${item.label}`}
              title={`Ir a ${item.label}`}
            >
              <i className={item.icon} aria-hidden="true"></i>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default SmartNavigation;
