// src/components/navigation/SmartNavigation.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import './SmartNavigation.module.css';

interface SmartNavigationProps {
  navItems: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
}

const SmartNavigation: React.FC<SmartNavigationProps> = ({ navItems }) => {
  const { currentSection, navigateToSection } = useNavigation();
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Establecer altura del nav como variable CSS al montar
  useEffect(() => {
    const setNavHeightVariable = () => {
      const navElement = document.querySelector('.header-portfolio-nav') as HTMLElement;
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
      const navElement = document.querySelector('.header-portfolio-nav') as HTMLElement;
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

  // Manejar navegación con scroll inteligente
  const handleNavClick = useCallback((sectionId: string) => {
    // Navegar con scroll inteligente habilitado
    navigateToSection(sectionId, undefined, true);
  }, [navigateToSection]);

  return (
    <>
      {/* Barra de progreso de scroll */}
      <div className="scroll-progress-container">
        <div 
          className="scroll-progress-bar"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Navegación principal */}
      <nav className={`header-portfolio-nav ${isNavSticky ? 'nav-sticky' : ''}`}>
        <div className="header-nav-container">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`header-nav-item ${
                currentSection === item.id ? 'active' : ''
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
