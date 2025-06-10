import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import styles from './Layout.module.css';

/**
 * Layout Component - Wrapper común para toda la aplicación
 * 
 * Características:
 * - AppBar/Navigation superior
 * - Área de contenido dinámico (main)
 * - Footer fijo al fondo
 * - Estructura Material Design 3
 * - Sistema de grid 8dp
 */

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layoutWrapper}>
      {/* Navigation/AppBar placeholder - Se puede integrar aquí la navegación existente */}
      
      {/* Main content area */}
      <main className={styles.mainContent}>
        {children || <Outlet />}
      </main>
      
      {/* Footer global */}
      <Footer />
    </div>
  );
};

export default Layout;
