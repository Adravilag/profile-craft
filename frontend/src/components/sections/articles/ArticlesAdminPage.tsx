import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useUnifiedTheme } from "../../../contexts/UnifiedThemeContext";
import useAuthGuard from "../../../hooks/useAuthGuard";
import SmartNavigation from "../../navigation/SmartNavigation";
import ArticlesAdmin from "./ArticlesAdmin";
import CreateArticle from "./CreateArticle";
import EditArticle from "./EditArticle";
import styles from "./ArticlesAdminPage.module.css";
import Footer from "../../common/Footer";

const ArticlesAdminPage: React.FC = () => {
  const location = useLocation();
  const { currentGlobalTheme, toggleGlobalTheme } = useUnifiedTheme();
  
  // Usar el hook useAuthGuard para manejar la autenticación de manera robusta
  const { isLoading, isAuthenticated, shouldRender, error } = useAuthGuard({
    redirectTo: '/',
    redirectDelay: 150,
    requireAuth: true
  });  
  console.log('🔍 ArticlesAdminPage: Auth guard state -', {
    isLoading,
    isAuthenticated,
    shouldRender,
    error
  });
  
  // Detectar el modo según la URL
  const isNewMode = location.pathname === "/articles/new";
  const isEditMode = location.pathname.startsWith("/articles/edit/");

  // Items de navegación para SmartNavigation
  const navItems = [
    { id: "about", label: "Sobre mí", icon: "fas fa-user" },
    { id: "experience", label: "Experiencia", icon: "fas fa-briefcase" },
    { id: "articles", label: "Proyectos", icon: "fas fa-project-diagram" },
    { id: "skills", label: "Habilidades", icon: "fas fa-tools" },
    { id: "certifications", label: "Certificaciones", icon: "fas fa-certificate" },
    { id: "testimonials", label: "Testimonios", icon: "fas fa-comments" },
    { id: "contact", label: "Contacto", icon: "fas fa-envelope" },  ];

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className={styles.adminPage} data-theme={currentGlobalTheme}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <h1>Verificando autenticación...</h1>
          <p>Por favor espera mientras verificamos tu sesión.</p>
        </div>
      </div>
    );
  }

  // Si hay un error de autenticación o no debe renderizar
  if (!shouldRender) {
    return (
      <div className={styles.adminPage} data-theme={currentGlobalTheme}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>🔒</div>
          <h1>Acceso restringido</h1>
          <p>{error || 'Necesitas estar autenticado para acceder a esta página.'}</p>
          <div className={styles.actionButtons}>
            <Link to="/" className={styles.btnPrimary}>
              Volver al portafolio
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className={styles.btnSecondary}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }
    return (
    <div className={styles.adminPage} data-theme={currentGlobalTheme}>      
      {/* Navegación inteligente */}
      <SmartNavigation navItems={navItems} />      {/* Header ultra-minimalista - Solo mostrar en modo admin, no en new/edit */}
      {!isNewMode && !isEditMode && (
        <header className={styles.adminHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <Link to="/" className={styles.backButton}>
                ← Volver
              </Link>
              <h1 className={styles.title}>Administración de Proyectos</h1>
            </div>
            <div className={styles.headerRight}>
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
                    ? 'Cambiar a modo día' 
                    : 'Cambiar a modo noche'
                }
              >
                <i className={`fas fa-sun ${styles.sunIcon}`}></i>
                <i className={`fas fa-moon ${styles.moonIcon}`}></i>
                <span>
                  {currentGlobalTheme === 'dark' ? 'Modo Día' : 'Modo Noche'}
                </span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Contenido principal */}
      <main className={styles.adminMain}>        {isNewMode ? (
          <CreateArticle />
        ) : isEditMode ? (
          <EditArticle />        ) : (
          <ArticlesAdmin />
        )}
      </main>
        <Footer />
    </div>
  );
};

export default ArticlesAdminPage;
