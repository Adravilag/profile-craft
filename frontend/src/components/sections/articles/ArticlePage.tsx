// src/pages/ArticlePage.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getArticleById, getUserProfile } from "../../../services/api";
import type { Article, UserProfile } from "../../../services/api";
import { useNotificationContext } from "../../../contexts/NotificationContext";
import { useUnifiedTheme } from "../../../contexts/UnifiedThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import ThemeControls from "../../article/ThemeControls";
import DateIndicators from "../../article/DateIndicators";
import FloatingActionButton from "../../common/FloatingActionButton";
import SmartNavigation from "../../navigation/SmartNavigation";
import SmartImage from "../../common/SmartImage";
import Footer from "../../common/Footer";
import styles from "./ArticlePage.module.css";

interface ArticlePageProps {}

const ArticlePage: React.FC<ArticlePageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useNotificationContext();
  const { preferences, currentGlobalTheme } = useUnifiedTheme();
  const { isAuthenticated } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState<number>(0);
  const [showThemeControls, setShowThemeControls] = useState(false);

  // Establecer la sección "articles" como activa cuando se carga la página
  useEffect(() => {
    // Actualizar la URL para reflejar que estamos en la sección de artículos
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/article/') || currentPath.startsWith('/project/')) {
      // Actualizar el body para indicar que estamos en la sección articles
      document.body.setAttribute('data-active-section', 'articles');
      document.body.className = document.body.className
        .replace(/section-active-\w+/g, '')
        .trim();
      document.body.classList.add('section-active-articles');
    }
  }, []);

  useEffect(() => {
    if (!id) {
      showError("Error", "ID de artículo no válido");
      navigate("/");
      return;
    }

    loadArticle(parseInt(id));
    loadProfile();
  }, [id, navigate, showError]);

  const loadProfile = async () => {
    try {
      const profileData = await getUserProfile();
      setProfile(profileData);
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const loadArticle = async (articleId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getArticleById(articleId);
      setArticle(data);

      // Calcular tiempo de lectura estimado
      if (data.article_content) {
        const wordsPerMinute = 200;
        const words = data.article_content
          .replace(/<[^>]*>/g, "")
          .split(/\s+/).length;
        setReadingTime(Math.ceil(words / wordsPerMinute));
      }
    } catch (err) {
      setError("Error al cargar el artículo");
      showError("Error", "No se pudo cargar el artículo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: window.location.href,
        });
      } catch (err) {
        // Si falla la API nativa, copiar al portapapeles
        navigator.clipboard.writeText(window.location.href);
      }
    } else if (article) {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleEditArticle = () => {
    if (article) {
      navigate(`/articles/edit/${article.id}`);
    }
  };

  const handleAdminPanel = () => {
    navigate('/articles/admin');
  };
  if (loading) {
    return (
      <div className={styles.articlePage}>
        <div className={styles.articlePageLoading}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <p>Cargando artículo...</p>
          </div>
        </div>
      </div>
    );
  }
  if (error || !article) {
    return (
      <div className={styles.articlePage}>
        <div className={styles.articlePageError}>
          <div className={styles.errorContent}>
            <i className="fas fa-exclamation-triangle"></i>
            <h1>Artículo no encontrado</h1>
            <p>
              {error || "El artículo solicitado no existe o ha sido eliminado."}
            </p>
            <div className={styles.errorActions}>
              <Link to="/" className={`${styles.btn} ${styles.btnPrimary}`}>
                <i className="fas fa-home"></i>
                Volver al portafolio
              </Link>
              <button
                onClick={() => loadArticle(parseInt(id!))}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                <i className="fas fa-redo"></i>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const isProject =
    !article.article_content || article.article_content.length < 500;

  // Sistema de detección inteligente de tipo de imagen
  const getImageTypeClass = (imageUrl: string, title: string): string => {
    if (!imageUrl) {
      return styles.heroImagePlaceholder;
    }

    const url = imageUrl.toLowerCase();
    const titleLower = title.toLowerCase();
    
    // Sistema de puntuación por categorías
    let logoScore = 0;
    let photoScore = 0;
    let screenshotScore = 0;
    
    // === DETECCIÓN DE LOGOS ===
    if (titleLower.includes('airpixel') || titleLower.includes('pixihama')) logoScore += 10;
    if (titleLower.includes('brandmaker') || titleLower.includes('logocraft')) logoScore += 8;
    if (url.includes('logo') || url.includes('icon') || url.includes('brand')) logoScore += 8;
    if (url.endsWith('.svg')) logoScore += 6;
    if (titleLower.match(/\b(logo|brand|identity|design)\b/)) logoScore += 5;
    
    // === DETECCIÓN DE FOTOS ===
    if (titleLower.includes('memo') || titleLower.includes('personal')) photoScore += 10;
    if (url.includes('photo') || url.includes('portrait') || url.includes('avatar')) photoScore += 8;
    if (url.includes('unsplash') || url.includes('pexels')) photoScore += 9;
    
    // === DETECCIÓN DE SCREENSHOTS/MOCKUPS ===
    if (url.includes('screenshot') || url.includes('mockup') || url.includes('preview')) screenshotScore += 9;
    if (titleLower.includes('app') || titleLower.includes('dashboard')) screenshotScore += 6;
    if (titleLower.match(/\b(react|vue|angular|web|cms|crm)\b/)) screenshotScore += 4;
    
    // === ALGORITMO DE DECISIÓN ===
    const maxScore = Math.max(logoScore, photoScore, screenshotScore);
    const threshold = 5;
    
    if (maxScore >= threshold) {
      if (logoScore === maxScore) {
        return `${styles.heroImage} ${styles.logoType}`;
      } else if (photoScore === maxScore) {
        return `${styles.heroImage} ${styles.photoType}`;
      } else if (screenshotScore === maxScore) {
        return `${styles.heroImage} ${styles.screenshotType}`;
      }
    }
    
    return `${styles.heroImage} ${styles.genericType}`;
  };

  // Items de navegación para SmartNavigation
  const navItems = [
    { id: "about", label: "Sobre mí", icon: "fas fa-user" },
    { id: "experience", label: "Experiencia", icon: "fas fa-briefcase" },
    { id: "articles", label: "Proyectos", icon: "fas fa-project-diagram" },
    { id: "skills", label: "Habilidades", icon: "fas fa-tools" },
    {
      id: "certifications",
      label: "Certificaciones",
      icon: "fas fa-certificate",
    },
    { id: "testimonials", label: "Testimonios", icon: "fas fa-comments" },
    { id: "contact", label: "Contacto", icon: "fas fa-envelope" },
  ];

  // Aplicar estilos del tema
  const themeClasses = [
    styles.articlePage,
    styles[`theme-${currentGlobalTheme}`],
    styles[`reading-${preferences.readingMode}`],
  ].join(" ");

  // Estilos aplicados únicamente al contenido del artículo (texto)
  const articleContentStyle = {
    "--article-font-size": `${preferences.fontSize}px`,
    "--article-line-height": preferences.lineHeight,
    "--article-max-width":
      preferences.maxWidth === 1000 ? "100%" : `${preferences.maxWidth}px`,
  } as React.CSSProperties;

  return (
    <div className={themeClasses}>
      {/* SmartNavigation para cambiar de sección */}
      <SmartNavigation navItems={navItems} />
      {/* Theme Controls */}
      <ThemeControls
        isVisible={showThemeControls}
        onToggleVisibility={() => setShowThemeControls(!showThemeControls)}
      />
      {/* Fixed back button (mantener para compatibilidad mobile) */}
      <Link to="/" className={styles.fixedBackButton}>
        <i className="fas fa-arrow-left"></i>
      </Link>{" "}
      {/* Contenido principal centrado */}
      <main className={styles.articleMain}>
        <div className={styles.articleCenteredContainer}>
          {/* Hero Image - Enhanced with SmartImage component */}
          {article.image_url ? (
            <div className={getImageTypeClass(article.image_url, article.title)}>
              <SmartImage
                src={article.image_url}
                alt={article.title}
                loading="eager" // Cargar imagen hero inmediatamente
                fallbackSrc="/assets/images/default-project.png" // Imagen de fallback
                onLoad={() => {
                  console.log(`✅ Image loaded successfully: ${article.title}`);
                }}
                onError={() => {
                  console.warn(`❌ Failed to load image for: ${article.title}`);
                }}
              />
              <div className={styles.imageOverlay}></div>
            </div>
          ) : (
            <div className={styles.heroImagePlaceholder}>
              <div className={styles.placeholderContent}>
                <i className={`fas fa-project-diagram ${styles.placeholderIcon}`}></i>
                <span className={styles.placeholderText}>
                  {isProject ? 'Proyecto' : 'Artículo'}
                </span>
              </div>
            </div>
          )}

          {/* Hero Content Section */}
          <section className={styles.articleHero}>
            <div className={styles.heroContent}>
              {/* Header actions - repositioned for new layout */}
              <div className={styles.heroActions}>
                <button
                  onClick={() => setShowThemeControls(!showThemeControls)}
                  className={styles.headerActionBtn}
                  title="Personalizar lectura"
                >
                  <i className="fas fa-text-height"></i>
                </button>
                <button
                  onClick={handleShare}
                  className={styles.headerActionBtn}
                  title="Compartir artículo"
                >
                  <i className="fas fa-share-alt"></i>
                </button>
              </div>

              {/* Unified main badge */}
              <div className={styles.mainBadge}>
                <span
                  className={`${styles.badgeText} ${
                    isProject ? styles.badgeProject : styles.badgeArticle
                  }`}
                >
                  <i
                    className={isProject ? "fas fa-code" : "fas fa-newspaper"}
                  ></i>
                  {isProject ? "Proyecto" : "Artículo"}
                  {article.status && (
                    <span className={styles.badgeStatus}>
                      {" "}
                      • {article.status}
                    </span>
                  )}
                  {!isProject && readingTime > 0 && (
                    <span className={styles.badgeReading}>
                      {" "}
                      • {readingTime} min
                    </span>
                  )}
                </span>
              </div>
              
              {/* Enhanced title with gradient effect */}
              <div className={styles.titleContainer}>
                <h1 className={styles.articleTitle}>{article.title}</h1>
                <div className={styles.titleUnderline}></div>
              </div>
              
              <p className={styles.articleDescription}>{article.description}</p>
              {/* Enhanced Date Indicators with better layout */}
              <div className={styles.metadataSection}>
                <DateIndicators
                  createdAt={article.created_at}
                  updatedAt={article.updated_at}
                  projectStartDate={article.project_start_date}
                  projectEndDate={article.project_end_date}
                  readingTime={readingTime}
                  lastReadAt={article.last_read_at}
                />
              </div>

              {/* Enhanced Technologies tags with improved styling */}
              {article.technologies && article.technologies.length > 0 && (
                <div className={styles.techSection}>
                  <div className={styles.techHeader}>
                    <i className="fas fa-code"></i>
                    <span>Tecnologías</span>
                  </div>
                  <div className={styles.techStack}>
                    {article.technologies.slice(0, 6).map((tech, idx) => (
                      <span key={idx} className={styles.techTag}>
                        {tech}
                      </span>
                    ))}
                    {article.technologies.length > 6 && (
                      <span className={styles.techMore}>
                        +{article.technologies.length - 6} más
                      </span>
                    )}
                  </div>
                </div>
              )}
              {/* Enhanced Action buttons with better grouping */}
              <div className={styles.actionButtonsContainer}>
                <div className={styles.actionButtons}>
                  {article.github_url && (
                    <a
                      href={article.github_url}
                      className={`${styles.actionBtn} ${styles.actionBtnGithub}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-github"></i>
                      <span>Ver código</span>
                      <i className="fas fa-external-link-alt"></i>
                    </a>
                  )}
                  {article.live_url && article.live_url !== "#" && (
                    <a
                      href={article.live_url}
                      className={`${styles.actionBtn} ${styles.actionBtnDemo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-external-link-alt"></i>
                      <span>Ver demo</span>
                      <i className="fas fa-arrow-up-right-from-square"></i>
                    </a>
                  )}
                  {article.article_url && (
                    <a
                      href={article.article_url}
                      className={`${styles.actionBtn} ${styles.actionBtnExternal}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-link"></i>
                      <span>Fuente original</span>
                      <i className="fas fa-external-link-alt"></i>
                    </a>
                  )}
                </div>
                
                {/* Progress indicator for articles */}
                {!isProject && article.article_content && (
                  <div className={styles.readingProgress}>
                    <div className={styles.progressInfo}>
                      <i className="fas fa-clock"></i>
                      <span>{readingTime} min de lectura</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
          {/* Video demo si existe */}
          {article.video_demo_url && (
            <section className={styles.videoSection}>
              <div className={styles.videoContainer}>
                {article.video_demo_url.includes("youtube.com") ||
                article.video_demo_url.includes("youtu.be") ? (
                  <iframe
                    src={getYouTubeEmbedUrl(article.video_demo_url)}
                    title={`Demo de ${article.title}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video controls preload="metadata">
                    <source src={article.video_demo_url} type="video/mp4" />
                    Tu navegador no soporta el elemento video.
                  </video>
                )}
              </div>
            </section>
          )}
          {/* Contenido del artículo si existe */}
          {article.article_content && article.article_content.length >= 500 && (
            <section className={styles.articleBody}>
              <div
                className={styles.articleProse}
                style={articleContentStyle}
                dangerouslySetInnerHTML={{ __html: article.article_content }}
              />
            </section>
          )}{" "}
          {/* Si es un proyecto sin contenido extenso, mostrar información resumida */}
          {isProject && (
            <section className={styles.projectSummary}>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                  <h3>
                    <i className="fas fa-info-circle"></i>
                    Acerca del proyecto
                  </h3>
                  <p>{article.description}</p>
                </div>

                {article.technologies && article.technologies.length > 0 && (
                  <div className={styles.summaryCard}>
                    <h3>
                      <i className="fas fa-cogs"></i>
                      Tecnologías utilizadas
                    </h3>
                    <div className={styles.techList}>
                      {article.technologies.map((tech, idx) => (
                        <span key={idx} className={styles.techItem}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.summaryCard}>
                  <h3>
                    <i className="fas fa-flag-checkered"></i>
                    Estado del proyecto
                  </h3>
                  <p
                    className={`${styles.statusText} ${
                      article.status.toLowerCase().replace(" ", "-") ===
                      "completado"
                        ? styles.statusTextCompletado
                        : styles.statusTextEnProgreso
                    }`}
                  >
                    {article.status}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      
      {/* Article actions and related content section */}
      <section className={styles.articleActions}>
        <div className={styles.actionsContent}>
          <button onClick={handleShare} className={styles.shareButton}>
            <i className="fas fa-share-alt"></i>
            <span>Compartir</span>
          </button>

          {/* Related articles section */}
          <div className={styles.relatedArticles}>
            <h3>Más proyectos</h3>
            <p>Explora más proyectos en mi portafolio</p>
            <Link to="/" className={styles.portfolioLink}>
              Ver portafolio completo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer 
        darkMode={currentGlobalTheme === 'dark'} 
        className="curriculum-footer"
        profile={profile}
      />
      {/* Floating Action Buttons para administración - posicionados correctamente */}
      {isAuthenticated && article && (
        <div className={styles.fabContainer}>
          <FloatingActionButton
            onClick={handleEditArticle}
            icon="fas fa-edit"
            label="Editar artículo"
            position="bottom-right"
            color="primary"
            usePortal={false}
          />
          <FloatingActionButton
            onClick={handleAdminPanel}
            icon="fas fa-cog"
            label="Panel de administración"
            position="bottom-right"
            color="secondary"
            usePortal={false}
          />
        </div>
      )}
    </div>
  );
};

// Función auxiliar para convertir URLs de YouTube a embed
const getYouTubeEmbedUrl = (url: string): string => {
  const youtubeRegex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

export default ArticlePage;
