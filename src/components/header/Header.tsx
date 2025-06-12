import { useEffect, useState } from "react";
import usePDFExport from "../../hooks/usePDFExport";
import { getUserProfile } from "../../services/api";
import type { UserProfile } from "../../services/api";
import LazyImage from "../ui/LazyImage";
import { useHeader } from "../../hooks/useHeader";
import InteractiveTerminal from "./terminal/InteractiveTerminal";
import { getImageUrl } from '../../utils/imageAssets';
import ContactTooltips from './ContactTooltips';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode?: () => void;
  isFirstTime?: boolean; // Nuevo prop para indicar si es primera vez
}

const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode, isFirstTime = false }) => {
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
    // Si es primera vez, no cargar el perfil
    if (isFirstTime) {
      setLoading(false);
      return;
    }

    getUserProfile()
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar el perfil.");
        setLoading(false);
      });
  }, [isFirstTime]);
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

  // Si es primera vez, no mostrar el header completo
  if (isFirstTime) {
    return null;
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
                  : getImageUrl('profilePhoto') // ✅ Usar imagen optimizada
              }
              alt={`Foto de perfil de ${profile.name}`}
              className="header-profile-image"
              fallbackSrc="/assets/images/foto-perfil.jpg" // ✅ Fallback local
              onError={() => console.log("Error cargando la imagen de perfil")}
              onLoad={() =>
                console.log("Imagen de perfil cargada exitosamente")
              }
            />
          </div>

          <div className="header-info">
            <div className="header-text-section">
              <h1 className="header-name-title">{profile.name}</h1>
              <div className="role-badge-container">
                {profile.role_title && (
                  <h2 className="header-role-title">
                    {profile.role_title.includes("React") ||
                    profile.role_title.includes("Spring Boot")
                      ? profile.role_title
                          .split(/(\bReact\b|\bSpring Boot\b)/g)
                          .map((part, partIndex) =>
                            part === "React" || part === "Spring Boot" ? (
                              <span key={partIndex} className="tech-highlight">
                                {part}
                              </span>
                            ) : (
                              <span key={partIndex}>{part}</span>
                            )
                          )
                      : profile.role_title}
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
              <ContactTooltips
                contacts={[
                  ...(profile.email ? [{
                    type: 'email' as const,
                    icon: 'fas fa-envelope',
                    value: profile.email,
                    color: '#ea4335'
                  }] : []),
                  ...(profile.linkedin_url ? [{
                    type: 'linkedin' as const,
                    icon: 'fab fa-linkedin',
                    value: profile.linkedin_url,
                    color: '#0077b5'
                  }] : []),
                  ...(profile.github_url ? [{
                    type: 'github' as const,
                    icon: 'fab fa-github',
                    value: profile.github_url,
                    color: '#333333'
                  }] : []),
                  ...(profile.location ? [{
                    type: 'location' as const,
                    icon: 'fas fa-map-marker-alt',
                    value: profile.location,
                    color: '#4285f4'
                  }] : [])
                ]}
                compact={true}
              />
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
                    <i
                      className="fas fa-spinner fa-spin"
                      aria-hidden="true"
                    ></i>
                  ) : (
                    <i className="fas fa-download" aria-hidden="true"></i>
                  )}
                  <span>
                    {state.isLoading ? "Generando..." : "Descargar CV"}
                  </span>
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
                  </button>

                  {state.shareMenuOpen && (
                    <div className="header-share-menu" role="menu">
                      {actions.getShareOptions().map((option) => (
                        <button
                          key={option.name}
                          className="header-share-option"
                          onClick={option.action}
                          style={
                            {
                              "--option-color": option.color,
                            } as React.CSSProperties
                          }
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

        {/* Terminal interactiva integrada en la presentación */}
        <div className="header-terminal-section">
          <div className="header-terminal-intro">
            <h3 className="header-terminal-title">
              <i className="fas fa-terminal"></i>
              Explora mi CV
            </h3>
            <p className="header-terminal-hint">
              💡 Escribe comandos como: <code>help</code>, <code>skills</code>,{" "}
              <code>projects</code>, <code>about</code>
            </p>
          </div>
          <div className="header-terminal-container">
            <InteractiveTerminal />
          </div>
        </div>
      </div>

      {/* Top Right Action Icons */}
      <div className="header-top-right-actions">
        <button
          className="header-icon-button download-button"
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
        </button>

        <button
          className="header-icon-button theme-toggle"
          onClick={() => actions.handleToggleTheme()}
          type="button"
          aria-label={
            darkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
          }
          title={darkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        >
          <i
            className={darkMode ? "fas fa-sun" : "fas fa-moon"}
            aria-hidden="true"
          ></i>
        </button>

        <div className="header-share-container" ref={shareMenuRef}>
          <button
            className="header-icon-button share-button"
            onClick={() => actions.handleNativeShare()}
            type="button"
            aria-label="Compartir mi perfil"
            title="Compartir mi perfil"
            aria-haspopup="true"
            aria-expanded={state.shareMenuOpen}
          >
            <i className="fas fa-share-alt" aria-hidden="true"></i>
          </button>

          {state.shareMenuOpen && (
            <div className="header-share-menu" role="menu">
              {actions.getShareOptions().map((option) => (
                <button
                  key={option.name}
                  className="header-share-option"
                  onClick={option.action}
                  style={
                    { "--option-color": option.color } as React.CSSProperties
                  }
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
    </header>
  );
};

export default Header;
