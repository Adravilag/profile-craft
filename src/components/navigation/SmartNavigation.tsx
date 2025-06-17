// src/components/navigation/SmartNavigation.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '../../contexts/NavigationContext';
import { useNotification } from '../../hooks/useNotification';
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
  const { showNotification } = useNotification();
  const location = useLocation();
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    // Obtener tema actual del sistema
    const savedTheme = localStorage.getItem('cv-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Log para debuggear estado
  console.log('🔄 SmartNavigation render:', {
    isMobile,
    isNavSticky,
    currentTheme
  });

  // Aplicar tema inicial al documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

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

  // Manejar cambio de tema día/noche
  const handleToggleTheme = useCallback(() => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    
    // Guardar en localStorage
    localStorage.setItem('cv-theme', newTheme);
    
    // Aplicar al documento
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Mostrar notificación
    showNotification(
      'success',
      `Modo ${newTheme === 'light' ? 'Claro' : 'Oscuro'} activado`,
      `El tema se ha cambiado exitosamente`,
      3000
    );
  }, [currentTheme, setCurrentTheme, showNotification]);

  // Manejar descarga del CV usando el mismo método que el botón original
  const handleDownloadCV = useCallback(async () => {
    try {
      // URL del CV en Google Drive (enlace directo de descarga) - mismo método que useHeader
      const googleDriveFileId = '1vNkB5NRzjiKyrs3ug3y8tkUtyB6IT0sb';
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${googleDriveFileId}`;
      
      // Crear un enlace temporal y hacer clic para descargar
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'adrián-portillo-cv-portfolio.pdf';
      link.target = '_blank';
      
      // Añadir al DOM, hacer clic y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification(
        'success',
        'CV Descargado',
        'Tu curriculum se ha descargado desde Google Drive',
        3000
      );
    } catch (error) {
      console.error('Error downloading CV from Google Drive:', error);
      showNotification(
        'error',
        'Error de descarga',
        'Hubo un problema al descargar el CV. Inténtalo de nuevo.',
        5000
      );
    }
  }, [showNotification]);

  // Manejar compartir enlace
  const handleShareLink = useCallback(async () => {
    const currentUrl = window.location.href;
    
    try {
      // Si el navegador soporta Web Share API (principalmente móviles)
      if (navigator.share) {
        await navigator.share({
          title: 'CV - Adrián Portillo',
          text: 'Mira el portafolio profesional de Adrián Portillo',
          url: currentUrl,
        });
        
        showNotification(
          'success',
          'Enlace compartido',
          'El enlace se ha compartido exitosamente',
          3000
        );
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(currentUrl);
        showNotification(
          'success',
          'Enlace copiado',
          'El enlace se ha copiado al portapapeles',
          3000
        );
      }
    } catch (error) {
      // Si el usuario cancela el share, no mostrar error
      if ((error as Error).name !== 'AbortError') {
        console.error('Error al compartir:', error);
        
        // Intentar fallback de copia al portapapeles
        try {
          await navigator.clipboard.writeText(currentUrl);
          showNotification(
            'success',
            'Enlace copiado',
            'El enlace se ha copiado al portapapeles',
            3000
          );
        } catch (clipboardError) {
          console.error('Error al copiar al portapapeles:', clipboardError);
          showNotification(
            'error',
            'Error al compartir',
            'No se pudo compartir o copiar el enlace',
            5000
          );
        }
      }
    }
  }, [showNotification]);

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

        {/* Botones de acción - solo visible en móvil cuando está sticky */}
        {isMobile && isNavSticky && (
          <div className={styles.adminButtons}>
            <button
              className={styles.adminActionBtn}
              onClick={handleToggleTheme}
              aria-label={`Cambiar a modo ${currentTheme === 'light' ? 'oscuro' : 'claro'}`}
              title={`Modo ${currentTheme === 'light' ? 'Oscuro' : 'Claro'}`}
            >
              <i className={`fas ${currentTheme === 'light' ? 'fa-moon' : 'fa-sun'}`} aria-hidden="true"></i>
            </button>
            <button
              className={styles.adminActionBtn}
              onClick={handleDownloadCV}
              aria-label="Descargar CV"
              title="Descargar CV"
            >
              <i className="fas fa-download" aria-hidden="true"></i>
            </button>
            <button
              className={styles.adminActionBtn}
              onClick={handleShareLink}
              aria-label="Compartir enlace"
              title="Compartir"
            >
              <i className="fas fa-share-alt" aria-hidden="true"></i>
            </button>
          </div>
        )}
      </nav>

      {/* Menú móvil desplegable */}
      {isMobile && isNavSticky && (
        <div 
          ref={mobileMenuRef}
          className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}
        >
          <div className={styles.mobileMenuContent}>
            {/* Items de navegación */}
            <div className={styles.mobileMenuSection}>
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
