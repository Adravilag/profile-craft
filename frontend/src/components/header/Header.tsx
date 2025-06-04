import { useEffect, useState } from "react";
import usePDFExport from "../../hooks/usePDFExport";
import { getUserProfile } from "../../services/api";
import type { UserProfile } from "../../services/api";
import LazyImage from "../ui/LazyImage";
import { useHeader } from "../../hooks/useHeader";
import TechnicalTerminal from "../sections/skills/components/TechnicalTerminal";

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode?: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode }) => {
  const { exportToPDF } = usePDFExport();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usar el hook optimizado de header
  const { state, actions, elementRef, shareMenuRef } = useHeader({
    profileName: profile?.name,
    darkMode,
    onToggleDarkMode,
    exportToPDF,
  });
  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar el perfil.");
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    // Verificar que Font Awesome esté cargado
    const checkFontAwesome = () => {
      const testIcon = document.createElement("i");
      testIcon.className = "fa-brands fa-linkedin";
      testIcon.style.visibility = "hidden";
      testIcon.style.position = "absolute";
      testIcon.style.fontFamily = "Font Awesome 6 Brands";
      document.body.appendChild(testIcon);

      const styles = window.getComputedStyle(testIcon, ":before");
      const content = styles.getPropertyValue("content");

      document.body.removeChild(testIcon);

      console.log("Font Awesome content detected:", content);

      if (content && content !== "none" && content !== '""') {
        console.log("✅ Font Awesome cargado correctamente");
      } else {
        console.warn("⚠️ Font Awesome no está cargado correctamente");
        console.log("Probando URL de Font Awesome...");

        // Verificar si la URL de Font Awesome está accesible
        fetch(
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        )
          .then((response) =>
            console.log("Font Awesome CDN status:", response.status)
          )
          .catch((error) =>
            console.error("Error accessing Font Awesome CDN:", error)
          );
      }
    };

    // Verificar después de un pequeño delay para asegurar que Font Awesome se haya cargado
    setTimeout(checkFontAwesome, 1000);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);
  if (loading) {
    return (
      <header className="header-curriculum loading">
        <div className="header-skeleton">
          <div className="header-skeleton-content">
            <div className="header-skeleton-image"></div>
            <div className="header-skeleton-text">
              <div className="header-skeleton-line long"></div>
              <div className="header-skeleton-line medium"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (error || !profile) {
    return (
      <header className="header-curriculum error">
        <div className="header-error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error || "Error al cargar el perfil"}</span>
        </div>
      </header>
    );
  }

  return (
    <header
      ref={elementRef}
      className={`
        header-curriculum 
        ${state.isScrolled ? "scrolled" : ""} 
        ${state.isCompact ? "compact" : ""}
        ${!state.isVisible ? "hidden" : ""}
      `}
    >
      {/* Indicador de progreso de scroll */}
      <div
        className="header-scroll-progress"
        style={{ width: `${state.scrollProgress}%` }}
      />
      
      <div className="header-content">
        <div className="header-top">
          <div className="header-avatar-container">
            <LazyImage
              src={
                profile.profile_image?.startsWith("http")
                  ? profile.profile_image
                  : profile.profile_image
                  ? `/${profile.profile_image.replace(/^\//, "")}`
                  : "/assets/images/foto-perfil.jpg"
              }
              alt={`Foto de perfil de ${profile.name}`}
              className="header-profile-image"
              fallbackSrc="/assets/images/foto-perfil.jpg"
              onError={() => console.log("Error cargando la imagen de perfil")}
              onLoad={() => console.log("Imagen de perfil cargada exitosamente")}
            />
          </div>
          
          <div className="header-info">
            <div className="header-text-section">
              <h1 className="header-name-title">{profile.name}</h1>
              <div className="role-badge-container">
                {profile.role_title && (
                  <h2 className="header-role-title">
                    {profile.role_title.includes('React') || profile.role_title.includes('Spring Boot') ? (
                      profile.role_title.split(/(\bReact\b|\bSpring Boot\b)/g).map((part, partIndex) => 
                        part === 'React' || part === 'Spring Boot' ? (
                          <span key={partIndex} className="tech-highlight">{part}</span>
                        ) : (
                          <span key={partIndex}>{part}</span>
                        )
                      )
                    ) : (
                      profile.role_title
                    )}
                  </h2>
                )}
                {profile.status && (
                  <span
                    className="header-status-badge-inline"
                    aria-label={`Estado actual: ${profile.status}`}
                    title={
                      profile.status === "Disponible"
                        ? "🚀 Disponible para nuevas oportunidades | Incorporación inmediata"
                        : profile.status
                    }
                  >
                    {profile.status}
                  </span>
                )}
              </div>
              {profile.role_subtitle && (
                <p className="header-role-subtitle">{profile.role_subtitle}</p>
              )}
            </div>

            <div className="header-contact-section">
              <div className="header-contact-info">
                {profile.email && (
                  <a 
                    href={`mailto:${profile.email}`} 
                    className="header-contact-item"
                    aria-label={`Enviar correo a ${profile.email}`}
                  >
                    <i className="fas fa-envelope" aria-hidden="true"></i> 
                    <span>{profile.email}</span>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    className="header-contact-item"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ver perfil de LinkedIn"
                  >
                    <i
                      className="fa-brands fa-linkedin"
                      aria-hidden="true"
                      style={{
                        fontFamily: "Font Awesome 6 Brands",
                        fontWeight: 400,
                      }}
                    ></i>
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile.phone && (
                  <a 
                    href={`tel:${profile.phone}`} 
                    className="header-contact-item"
                    aria-label={`Llamar al ${profile.phone}`}
                  >
                    <i className="fas fa-phone" aria-hidden="true"></i> 
                    <span>{profile.phone}</span>
                  </a>
                )}
                {profile.location && (
                  <span 
                    className="header-contact-item"
                    aria-label={`Ubicación: ${profile.location}`}
                  >
                    <i className="fas fa-map-marker-alt" aria-hidden="true"></i> 
                    <span>{profile.location}</span>
                  </span>
                )}
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    className="header-contact-item"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ver perfil de GitHub"
                  >
                    <i
                      className="fa-brands fa-github"
                      aria-hidden="true"
                      style={{
                        fontFamily: "Font Awesome 6 Brands",
                        fontWeight: 400,
                      }}
                    ></i>
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>

            <div className="header-action-section">
              <div className="header-action-buttons">
                <button
                  className="header-action-button primary"
                  onClick={() => actions.handleDownloadPDF()}
                  aria-label="Descargar CV en formato PDF"
                  title="Descargar CV en formato PDF"
                  disabled={state.isLoading}
                >
                  {state.isLoading ? (
                    <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                  ) : (
                    <i className="fas fa-download" aria-hidden="true"></i>
                  )}
                  <span>{state.isLoading ? 'Generando...' : 'Descargar CV'}</span>
                </button>
                
                <button
                  className="header-action-button theme-toggle"
                  onClick={() => actions.handleToggleTheme()}
                  type="button"
                  aria-label={
                    darkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
                  }
                  title={
                    darkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
                  }
                >
                  <i 
                    className={darkMode ? "fas fa-sun" : "fas fa-moon"} 
                    aria-hidden="true"
                  ></i>
                </button>
                
                <div className="header-share-container" ref={shareMenuRef}>
                  <button
                    className="header-action-button share-button"
                    onClick={() => actions.handleNativeShare()}
                    type="button"
                    aria-label="Compartir mi perfil"
                    title="Compartir mi perfil"
                    aria-haspopup="true"
                    aria-expanded={state.shareMenuOpen}
                  >
                    <i className="fas fa-share-alt" aria-hidden="true"></i> 
                    <span>Compartir</span>
                  </button>
                  
                  {state.shareMenuOpen && (
                    <div className="header-share-menu" role="menu">
                      {actions.getShareOptions().map((option) => (
                        <button
                          key={option.name}
                          className="header-share-option"
                          onClick={option.action}
                          style={{ '--option-color': option.color } as React.CSSProperties}
                          role="menuitem"
                          tabIndex={0}
                        >
                          <i className={option.icon} aria-hidden="true"></i>
                          <span>{option.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal técnico integrado en la presentación */}
        <div className="header-terminal-section">
          <div className="header-terminal-intro">
            <h3 className="header-terminal-title">
              <i className="fas fa-terminal"></i>
              Explorar habilidades técnicas
            </h3>
            <p className="header-terminal-subtitle">
              Descubre mi stack tecnológico a través de comandos interactivos
            </p>
          </div>
          <div className="header-terminal-container">
            <TechnicalTerminal 
              className="header-technical-terminal"
              theme="dark"
              speed="normal"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
