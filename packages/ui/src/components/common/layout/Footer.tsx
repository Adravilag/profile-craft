import React, { useEffect, useState } from 'react';
import styles from './Footer.module.css';
import { getUserProfile } from '@cv-maker/shared';
import type { ApiUserProfile as UserProfile } from '@cv-maker/shared';

interface FooterProps {
  darkMode?: boolean;
  className?: string;
  profile?: UserProfile | null; // Optional profile prop
}

const Footer: React.FC<FooterProps> = ({ darkMode = false, className = '', profile: profileProp }) => {
  const currentYear = new Date().getFullYear();
  const [profile, setProfile] = useState<UserProfile | null>(profileProp || null);
  const [loading, setLoading] = useState(!profileProp);
  const [error, setError] = useState<string | null>(null);

  // Load profile data if not provided as prop
  useEffect(() => {
    if (!profileProp) {
      getUserProfile()
        .then((data) => {
          setProfile(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error loading profile for footer:', err);
          setError('No se pudo cargar la información del perfil');
          setLoading(false);
        });
    } else {
      setProfile(profileProp);
      setLoading(false);
    }
  }, [profileProp]);

  // Update profile when prop changes
  useEffect(() => {
    if (profileProp) {
      setProfile(profileProp);
      setLoading(false);
      setError(null);
    }
  }, [profileProp]);
  
  // Build social links from profile data with fallbacks
  const socialLinks = [
    {
      name: 'LinkedIn',
      url: profile?.linkedin_url || 'https://linkedin.com',
      icon: 'fa-brands fa-linkedin',
      color: '#0077b5',
      ariaLabel: 'Visitar perfil de LinkedIn',
      show: !!profile?.linkedin_url // Only show if URL exists
    },
    {
      name: 'GitHub',
      url: profile?.github_url || 'https://github.com',
      icon: 'fa-brands fa-github',
      color: '#333',
      ariaLabel: 'Visitar perfil de GitHub',
      show: !!profile?.github_url // Only show if URL exists
    },
    {
      name: 'Email',
      url: `mailto:${profile?.email || 'contact@example.com'}`,
      icon: 'fas fa-envelope',
      color: '#ea4335',
      ariaLabel: 'Enviar email',
      show: !!profile?.email // Only show if email exists
    }
  ].filter(link => link.show); // Filter out links without real data

  const quickLinks = [
    { name: 'Inicio', href: '#home' },
    { name: 'Sobre mí', href: '#about' },
    { name: 'Experiencia', href: '#experience' },
    { name: 'Proyectos', href: '#projects' },
    { name: 'Contacto', href: '#contact' }
  ];

  const legalLinks = [
    { name: 'Privacidad', href: '/privacy' },
    { name: 'Términos', href: '/terms' },
    { name: 'Cookies', href: '/cookies' }
  ];

  // Show loading skeleton while data is being fetched
  if (loading) {
    return (
      <footer 
        className={`${styles.footer} ${className} ${styles.loading}`}
        data-theme={darkMode ? 'dark' : 'light'}
        role="contentinfo"
        aria-label="Información del sitio web"
      >
        <div className={styles.footerContainer}>
          <div className={styles.footerMain}>
            <div className={styles.footerSection}>
              <div className={styles.brandSection}>
                <div className={styles.logoContainer}>
                  <div className={styles.brandIcon}>
                    <i className="fas fa-code" aria-hidden="true"></i>
                  </div>
                  <div className={styles.brandText}>
                    <h3 className={styles.brandName}>ProfileCraft</h3>
                    <p className={styles.brandTagline}>
                      Cargando información del perfil...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Show error message if profile couldn't be loaded
  if (error && !profile) {
    console.warn('Footer: Error loading profile:', error);
  }

  return (
    <footer 
      className={`${styles.footer} ${className}`}
      data-theme={darkMode ? 'dark' : 'light'}
      role="contentinfo"
      aria-label="Información del sitio web"
    >
      {/* Patrón decorativo superior */}
      <div className={styles.decorativePattern} aria-hidden="true">
        <div className={styles.patternElement}></div>
        <div className={styles.patternElement}></div>
        <div className={styles.patternElement}></div>
      </div>

      <div className={styles.footerContainer}>
        {/* Sección principal del footer */}
        <div className={styles.footerMain}>
          {/* Información del desarrollador */}
          <div className={styles.footerSection}>
            <div className={styles.brandSection}>
              <div className={styles.logoContainer}>
                <div className={styles.brandIcon}>
                  <i className="fas fa-code" aria-hidden="true"></i>
                </div>
                <div className={styles.brandText}>
                  <h3 className={styles.brandName}>ProfileCraft</h3>
                  <p className={styles.brandTagline}>
                    Creando experiencias digitales excepcionales
                  </p>
                </div>
              </div>

              {/* Redes sociales */}
              <div className={styles.socialSection}>
                <h4 className={styles.sectionTitle}>Sígueme</h4>
                <div className={styles.socialLinks} role="list">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      className={styles.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      style={{ '--social-color': social.color } as React.CSSProperties}
                      role="listitem"
                    >
                      <i className={social.icon} aria-hidden="true"></i>
                      <span className={styles.socialName}>{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Navegación</h4>
            <nav className={styles.quickLinksNav} aria-label="Enlaces rápidos">
              <ul className={styles.quickLinks} role="list">
                {quickLinks.map((link) => (
                  <li key={link.name} role="listitem">
                    <a
                      href={link.href}
                      className={styles.quickLink}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.querySelector(link.href);
                        element?.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }}
                    >
                      <i className="fas fa-chevron-right" aria-hidden="true"></i>
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Información de contacto */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Contacto</h4>
            <div className={styles.contactInfo}>
              {profile?.location && (
                <div className={styles.contactItem}>
                  <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.email && (
                <div className={styles.contactItem}>
                  <i className="fas fa-envelope" aria-hidden="true"></i>
                  <a href={`mailto:${profile.email}`} className={styles.contactLink}>
                    {profile.email}
                  </a>
                </div>
              )}
              {profile?.phone && (
                <div className={styles.contactItem}>
                  <i className="fas fa-phone" aria-hidden="true"></i>
                  <span>{profile.phone}</span>
                </div>
              )}
              
              {/* Fallback message when profile data is loading or missing */}
              {(!profile?.location && !profile?.email && !profile?.phone && !loading) && (
                <div className={styles.contactItem}>
                  <i className="fas fa-info-circle" aria-hidden="true"></i>
                  <span>Información de contacto disponible en el CV</span>
                </div>
              )}
            </div>

            {/* Estado de disponibilidad */}
            <div className={styles.availabilityStatus}>
              <div className={styles.statusIndicator}>
                <div className={styles.statusDot}></div>
                <span className={styles.statusText}>
                  {profile?.status || 'Disponible para nuevos proyectos'}
                </span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Mantente al día</h4>
            <p className={styles.newsletterDescription}>
              Recibe actualizaciones sobre nuevos proyectos y tecnologías.
            </p>
            <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className={styles.emailInput}
                  aria-label="Dirección de email para newsletter"
                  required
                />
                <button 
                  type="submit" 
                  className={styles.subscribeButton}
                  aria-label="Suscribirse al newsletter"
                >
                  <i className="fas fa-paper-plane" aria-hidden="true"></i>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className={styles.footerDivider}></div>

        {/* Pie de página */}
        <div className={styles.footerBottom}>
          <div className={styles.copyrightSection}>
            <p className={styles.copyright}>
              © {currentYear} {profile?.name || 'ProfileCraft'}. Hecho con{' '}
              <span className={styles.heartIcon} aria-label="amor">❤️</span>{' '}
              usando React y Material Design 3.
            </p>
          </div>

          <div className={styles.legalLinks}>
            {legalLinks.map((link, index) => (
              <React.Fragment key={link.name}>
                <a
                  href={link.href}
                  className={styles.legalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.name}
                </a>
                {index < legalLinks.length - 1 && (
                  <span className={styles.separator} aria-hidden="true">•</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Tecnologías utilizadas */}
          <div className={styles.techStack}>
            <span className={styles.techLabel}>Desarrollado con:</span>
            <div className={styles.techIcons}>
              <i className="fab fa-react" title="React" aria-label="React"></i>
              <i className="fab fa-js-square" title="JavaScript" aria-label="JavaScript"></i>
              <i className="fab fa-css3-alt" title="CSS3" aria-label="CSS3"></i>
              <i className="fab fa-html5" title="HTML5" aria-label="HTML5"></i>
            </div>
          </div>
        </div>
      </div>

      {/* 
        Nota: ScrollToTopButton se maneja externamente en CurriculumMD3.tsx
        para evitar duplicación de funcionalidad 
      */}
    </footer>
  );
};

export default Footer;