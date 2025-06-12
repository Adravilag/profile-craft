// src/components/navigation/SmartNavigation.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      // Cerrar menú móvil en pantallas grandes
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar menú móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevenir scroll del body cuando el menú está abierto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Detectar si estamos en una página de artículo o proyecto
  const isInArticlePage = location.pathname.startsWith('/article/') || 
                          location.pathname.startsWith('/project/') ||
                          location.pathname.startsWith('/articles/admin') ||
                          location.pathname.startsWith('/articles/new') ||
                          location.pathname.startsWith('/articles/edit/');
  
  // Determinar la sección activa actual
  const getActiveSection = () => {
    if (isInArticlePage) {
      // Si estamos en una página de artículo, la sección activa es "articles"
      return 'articles';
    }
    return currentSection;
  };

  const activeSection = getActiveSection();

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
    // Cerrar menú móvil al navegar
    setIsMobileMenuOpen(false);
    
    if (isInArticlePage) {
      // Si estamos en una página de artículo, usar la función especializada del contexto
      navigateFromArticleToSection(sectionId);
    } else {
      // Si estamos en la página principal, usar la navegación normal con scroll
      navigateToSection(sectionId, undefined, true);
    }
  }, [isInArticlePage, navigateFromArticleToSection, navigateToSection]);

  // Toggle del menú móvil
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

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
        {/* Botón de menú hamburguesa - solo visible en móvil cuando está sticky */}
        {isMobile && isNavSticky && (
          <button
            className={`${styles.mobileMenuToggle} ${isMobileMenuOpen ? styles.active : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Abrir menú de navegación"
            aria-expanded={isMobileMenuOpen}
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
        )}

        {/* Items de navegación - ocultos en móvil cuando sticky */}
        <div className={`${styles.navItemsContainer} ${
          isMobile && isNavSticky ? styles.hiddenOnMobile : ''
        }`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.headerNavItem} ${
                activeSection === item.id && activeSection !== '' ? styles.active : ''
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

      {/* Menú móvil desplegable */}
      {isMobile && isNavSticky && (
        <div 
          ref={mobileMenuRef}
          className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}
        >
          <div className={styles.mobileMenuContent}>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`${styles.mobileMenuItem} ${
                  activeSection === item.id && activeSection !== '' ? styles.active : ''
                }`}
                onClick={() => handleNavClick(item.id)}
                aria-label={`Navegar a sección ${item.label}`}
              >
                <i className={item.icon} aria-hidden="true"></i>
                <span>{item.label}</span>
                {activeSection === item.id && (
                  <i className="fas fa-check" aria-hidden="true"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay para cerrar el menú móvil */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className={styles.mobileMenuOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default SmartNavigation;
