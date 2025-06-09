// src/pages/ArticlePage.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getArticleById } from "../../../services/api";
import type { Article } from "../../../services/api";
import { useNotificationContext } from "../../../contexts/NotificationContext";
import { useUnifiedTheme } from "../../../contexts/UnifiedThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import ThemeControls from "../../article/ThemeControls";
import DateIndicators from "../../article/DateIndicators";
import FloatingActionButton from "../../common/FloatingActionButton";
import AdminModal from "../../ui/AdminModal";
import SmartNavigation from "../../navigation/SmartNavigation";
import styles from "./ArticlePage.module.css";

interface ArticlePageProps {}

const ArticlePage: React.FC<ArticlePageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useNotificationContext();
  const { preferences, currentGlobalTheme } = useUnifiedTheme();
  const { isAuthenticated } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState<number>(0);
  const [showThemeControls, setShowThemeControls] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

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
  }, [id, navigate, showError]);

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
    setShowAdminModal(true);
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

  // Estilos aplicados al contenedor principal del artículo
  const contentStyle = {
    "--article-font-size": `${preferences.fontSize}px`,
    "--article-line-height": preferences.lineHeight,
    "--article-max-width":
      preferences.maxWidth === 1000 ? "100%" : `${preferences.maxWidth}px`,
  } as React.CSSProperties;

  return (
    <div className={themeClasses} style={contentStyle}>
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
          {/* Hero section */}
          <section className={styles.articleHero}>
            {article.image_url && (
              <div className={styles.heroImage}>
                <img src={article.image_url} alt={article.title} />
                <div className={styles.imageOverlay}></div>
              </div>
            )}

            <div className={styles.heroContent}>
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
              </div>{" "}
              <h1 className={styles.articleTitle}>{article.title}</h1>
              <p className={styles.articleDescription}>{article.description}</p>
              {/* Date Indicators */}
              <DateIndicators
                createdAt={article.created_at}
                updatedAt={article.updated_at}
                projectStartDate={article.project_start_date}
                projectEndDate={article.project_end_date}
                readingTime={readingTime}
                lastReadAt={article.last_read_at}
              />
              {/* Technologies tags */}
              {article.technologies && article.technologies.length > 0 && (
                <div className={styles.techStack}>
                  {article.technologies.slice(0, 6).map((tech, idx) => (
                    <span key={idx} className={styles.techTag}>
                      {tech}
                    </span>
                  ))}
                  {article.technologies.length > 6 && (
                    <span className={styles.techMore}>
                      +{article.technologies.length - 6}
                    </span>
                  )}
                </div>
              )}
              {/* Action buttons */}
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
                  </a>
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
      </main>{" "}
      {/* Footer simplificado */}
      <footer className={styles.articleFooter}>
        <div className={styles.footerContent}>
          <button onClick={handleShare} className={styles.shareButton}>
            <i className="fas fa-share-alt"></i>
            <span>Compartir</span>
          </button>

          {/* Related articles section placeholder */}
          <div className={styles.relatedArticles}>
            <h3>Más proyectos</h3>
            <p>Explora más proyectos en mi portafolio</p>
            <Link to="/" className={styles.portfolioLink}>
              Ver portafolio completo
            </Link>
          </div>
        </div>
      </footer>
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
            label="Administrar artículos"
            position="bottom-right"
            color="secondary"
            usePortal={false}
          />
        </div>
      )}
      {/* Modal de administración */}
      {showAdminModal && isAuthenticated && (
        <AdminModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          title="Administración de Artículos"
          subtitle="Gestiona todos los artículos del portafolio"
          icon="fas fa-newspaper"
          size="large"
          floatingActions={[
            {
              id: "new-article",
              label: "Nuevo artículo",
              icon: "fas fa-plus",
              onClick: () => {
                setShowAdminModal(false);
                navigate("/articles/new");
              },
              variant: "primary",
            },
            {
              id: "edit-current",
              label: "Editar este artículo",
              icon: "fas fa-edit",
              onClick: handleEditArticle,
              variant: "secondary",
            },
          ]}
        >
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  color: "var(--md-sys-color-on-surface)",
                }}
              >
                Artículo actual
              </h3>
              {article && (
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "var(--md-sys-color-surface-variant)",
                    borderRadius: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <h4 style={{ margin: "0 0 8px 0" }}>{article.title}</h4>
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      color: "var(--md-sys-color-on-surface-variant)",
                    }}
                  >
                    {article.description}
                  </p>
                  <small
                    style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                  >
                    ID: {article.id} | Estado: {article.status}
                  </small>
                </div>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <button
                onClick={() => {
                  setShowAdminModal(false);
                  navigate("/articles/new");
                }}
                style={{
                  padding: "16px 20px",
                  backgroundColor: "var(--md-sys-color-primary)",
                  color: "var(--md-sys-color-on-primary)",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--md-sys-color-primary-container)";
                  e.currentTarget.style.color =
                    "var(--md-sys-color-on-primary-container)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--md-sys-color-primary)";
                  e.currentTarget.style.color =
                    "var(--md-sys-color-on-primary)";
                }}
              >
                <i className="fas fa-plus"></i>
                <span>Crear nuevo artículo</span>
              </button>

              <button
                onClick={() => {
                  setShowAdminModal(false);
                  navigate("/");
                }}
                style={{
                  padding: "16px 20px",
                  backgroundColor: "var(--md-sys-color-secondary)",
                  color: "var(--md-sys-color-on-secondary)",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--md-sys-color-secondary-container)";
                  e.currentTarget.style.color =
                    "var(--md-sys-color-on-secondary-container)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--md-sys-color-secondary)";
                  e.currentTarget.style.color =
                    "var(--md-sys-color-on-secondary)";
                }}
              >
                <i className="fas fa-list"></i>
                <span>Ver todos los artículos</span>
              </button>

              <button
                onClick={handleEditArticle}
                style={{
                  padding: "16px 20px",
                  backgroundColor: "var(--md-sys-color-tertiary)",
                  color: "var(--md-sys-color-on-tertiary)",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--md-sys-color-tertiary-container)";
                  e.currentTarget.style.color =
                    "var(--md-sys-color-on-tertiary-container)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--md-sys-color-tertiary)";
                  e.currentTarget.style.color =
                    "var(--md-sys-color-on-tertiary)";
                }}
              >
                <i className="fas fa-edit"></i>
                <span>Editar este artículo</span>
              </button>

              <button
                onClick={() => {
                  setShowAdminModal(false);
                  handleShare();
                }}
                style={{
                  padding: "16px 20px",
                  backgroundColor: "var(--md-sys-color-surface-variant)",
                  color: "var(--md-sys-color-on-surface-variant)",
                  border: "1px solid var(--md-sys-color-outline)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--md-sys-color-inverse-surface)";
                  e.currentTarget.style.color =
                    "var(--md-sys-color-inverse-on-surface)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--md-sys-color-surface-variant)";
                  e.currentTarget.style.color =
                    "var(--md-sys-color-on-surface-variant)";
                }}
              >
                <i className="fas fa-share-alt"></i>
                <span>Compartir artículo</span>
              </button>
            </div>
          </div>
        </AdminModal>
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
