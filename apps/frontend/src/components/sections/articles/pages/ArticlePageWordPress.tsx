// src/components/sections/articles/ArticlePage.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import { getArticleById, getUserProfile } from "../../../../services/api";
import type { Article, UserProfile } from "../../../../services/api";
import { useNotificationContext, useUnifiedTheme, useAuth } from "@cv-maker/shared";
import { SmartNavigation, FloatingActionButton, Footer } from "@cv-maker/ui";
import styles from "./ArticlePage.module.css";

// Función utilitaria para detectar si el contenido es HTML o Markdown
const isHtmlContent = (content: string): boolean => {
  const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
  return htmlTagPattern.test(content);
};

// Componente para renderizar contenido dinámicamente
const ContentRenderer: React.FC<{ content: string; className?: string }> = ({ content, className }) => {
  if (isHtmlContent(content)) {
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  } else {
    return (
      <div className={className}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }
};

interface ArticlePageProps {}

const ArticlePage: React.FC<ArticlePageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useNotificationContext();
  const { currentGlobalTheme } = useUnifiedTheme();
  const { isAuthenticated } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState<number>(0);

  // Establecer la sección "articles" como activa cuando se carga la página
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/article/') || currentPath.startsWith('/project/')) {
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

    loadArticle(id);
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

  const loadArticle = async (articleId: string) => {
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
        navigator.clipboard.writeText(window.location.href);
      }
    } else if (article) {
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

  // Items de navegación para SmartNavigation
  const navItems = [
    { id: "home", label: "Inicio", icon: "fas fa-home" },
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

  // Función auxiliar para convertir URLs de YouTube a embed
  const getYouTubeEmbedUrl = (url: string): string => {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  if (loading) {
    return (
      <div className={styles.articlePage} data-theme={currentGlobalTheme}>
        <div className={styles.wordpressHeader}>
          <nav className={styles.articleNavigation}>
            <div className={styles.backButton}>
              <i className="fas fa-spinner fa-spin"></i> Cargando...
            </div>
          </nav>
        </div>
        <main className={styles.mainContent}>
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 0',
            color: 'var(--text-color, #656d76)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Cargando artículo...</h1>
            <p>Por favor espera mientras cargamos el contenido.</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={styles.articlePage} data-theme={currentGlobalTheme}>
        <div className={styles.wordpressHeader}>
          <nav className={styles.articleNavigation}>
            <Link to="/" className={styles.backButton}>
              <i className="fas fa-arrow-left"></i> Volver a artículos
            </Link>
          </nav>
        </div>
        <main className={styles.mainContent}>
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 0',
            color: 'var(--text-color, #656d76)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '24px', color: '#dc3545' }}>
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Artículo no encontrado</h1>
            <p style={{ marginBottom: '32px' }}>
              {error || "El artículo solicitado no existe o ha sido eliminado."}
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/" className={`${styles.wordpressActionButton} ${styles.wordpressActionPrimary}`}>
                <i className="fas fa-home"></i>
                Volver al portafolio
              </Link>
              <button
                onClick={() => loadArticle(id!)}
                className={`${styles.wordpressActionButton} ${styles.wordpressActionSecondary}`}
              >
                <i className="fas fa-redo"></i>
                Reintentar
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Determinar si es proyecto usando el campo type (con fallback a lógica anterior)
  const isProject = article.type ? article.type === 'proyecto' : (!article.article_content || article.article_content.length < 500);

  return (
    <div className={styles.articlePage} data-theme={currentGlobalTheme}>
      {/* WordPress Header */}
      <header className={styles.wordpressHeader}>
        <nav className={styles.articleNavigation}>
          <Link to="/" className={styles.backButton}>
            <i className="fas fa-arrow-left"></i> Volver a artículos
          </Link>
          <div className={styles.progressIndicator}></div>
        </nav>
      </header>

      {/* SmartNavigation para cambiar de sección */}
      <SmartNavigation navItems={navItems} />

      {/* Contenido principal */}
      <main className={styles.mainContent}>
        {/* WordPress Article Header */}
        <header className={styles.wordpressArticleHeader}>
          <a href="#" className={styles.wordpressCategory}>
            <span>{isProject ? 'Proyecto' : 'Artículo'}</span>
          </a>
          
          <h1 className={styles.wordpressTitle}>{article.title}</h1>
          <div className={styles.wordpressExcerpt}>
            {article.description}
          </div>
          
          {/* WordPress Post Meta */}
          <div className={styles.wordpressPostMeta}>
            <div className={styles.wordpressMetaItem}>
              <i className={`fas fa-flag ${styles.wordpressMetaIcon}`}></i>
              <span className={styles.wordpressMetaText}>{article.status}</span>
            </div>
            
            {article.created_at && (
              <>
                <div className={styles.wordpressDivider}></div>
                <div className={styles.wordpressMetaItem}>
                  <i className={`fas fa-calendar ${styles.wordpressMetaIcon}`}></i>
                  <span className={styles.wordpressMetaText}>
                    {new Date(article.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </>
            )}
            
            {article.updated_at && (
              <>
                <div className={styles.wordpressDivider}></div>
                <div className={styles.wordpressMetaItem}>
                  <i className={`fas fa-edit ${styles.wordpressMetaIcon}`}></i>
                  <span className={styles.wordpressMetaText}>
                    Actualizado el {new Date(article.updated_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </>
            )}

            {!isProject && readingTime > 0 && (
              <>
                <div className={styles.wordpressDivider}></div>
                <div className={styles.wordpressMetaItem}>
                  <i className={`fas fa-clock ${styles.wordpressMetaIcon}`}></i>
                  <span className={styles.wordpressMetaText}>
                    {readingTime} min de lectura
                  </span>
                </div>
              </>
            )}
          </div>
        </header>
        
        {/* WordPress Technologies Section */}
        {article.technologies && article.technologies.length > 0 && (
          <div className={styles.wordpressTechnologies}>
            <div className={styles.wordpressTechHeader}>
              <i className={`fas fa-tools ${styles.wordpressTechIcon}`}></i>
              <h2 className={styles.wordpressTechTitle}>Tecnologías Utilizadas</h2>
            </div>
            <div className={styles.wordpressTechList}>
              {article.technologies.map((tech: string, idx: number) => (
                <span key={idx} className={styles.wordpressTechChip}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* WordPress Action Buttons */}
        <div className={styles.wordpressActions}>
          {article.live_url && article.live_url !== '#' && (
            <a 
              href={article.live_url} 
              className={`${styles.wordpressActionButton} ${styles.wordpressActionPrimary}`}
              target="_blank" 
              rel="noopener noreferrer"
            >
              <i className={`fas fa-external-link-alt ${styles.wordpressActionIcon}`}></i>
              Ver Demo
            </a>
          )}
          
          {article.github_url && (
            <a 
              href={article.github_url} 
              className={`${styles.wordpressActionButton} ${styles.wordpressActionSecondary}`}
              target="_blank" 
              rel="noopener noreferrer"
            >
              <i className={`fab fa-github ${styles.wordpressActionIcon}`}></i>
              Ver Código
            </a>
          )}
          
          {article.article_url && (
            <a 
              href={article.article_url} 
              className={`${styles.wordpressActionButton} ${styles.wordpressActionSecondary}`}
              target="_blank" 
              rel="noopener noreferrer"
            >
              <i className={`fas fa-newspaper ${styles.wordpressActionIcon}`}></i>
              Leer Artículo
            </a>
          )}
        </div>

        {/* WordPress Media Section */}
        {(article.image_url || article.video_demo_url) && (
          <div className={styles.wordpressMediaSection}>
            <div className={styles.wordpressMediaGrid}>
              {/* Imagen del proyecto */}
              {article.image_url && (
                <div className={styles.wordpressMediaItem}>
                  <h3 className={styles.wordpressMediaTitle}>Imagen del Proyecto</h3>
                  <p className={styles.wordpressMediaDescription}>
                    Captura de pantalla principal del proyecto
                  </p>
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className={styles.wordpressProse}
                    style={{ width: '100%', borderRadius: '8px', marginTop: '12px' }}
                  />
                </div>
              )}
              
              {/* Video demo */}
              {article.video_demo_url && (
                <div className={styles.wordpressMediaItem}>
                  <h3 className={styles.wordpressMediaTitle}>Demo en Video</h3>
                  <p className={styles.wordpressMediaDescription}>
                    Demostración completa del funcionamiento del proyecto
                  </p>
                  <div style={{ marginTop: '12px' }}>
                    {article.video_demo_url.includes('youtube.com') || article.video_demo_url.includes('youtu.be') ? (
                      <iframe
                        src={getYouTubeEmbedUrl(article.video_demo_url)}
                        title={`Demo de ${article.title}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          width: '100%',
                          height: '300px',
                          borderRadius: '8px',
                          border: '1px solid #d0d7de'
                        }}
                      ></iframe>
                    ) : (
                      <a 
                        href={article.video_demo_url} 
                        className={styles.wordpressMediaLink}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <i className={`fas fa-play ${styles.wordpressMediaIcon}`}></i>
                        Ver Video Demo
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* WordPress Article Content */}
        {article.article_content && article.article_content.trim() && (
          <article className={styles.wordpressArticleContent}>
            <ContentRenderer 
              content={article.article_content}
              className={`${styles.wordpressProse}`}
            />
          </article>
        )}

        {/* Project Summary para proyectos */}
        {isProject && (
          <div className={styles.wordpressProjectSummary}>
            <div className={styles.wordpressSummaryGrid}>
              <div className={styles.wordpressSummaryCard}>
                <h3>
                  <i className="fas fa-info-circle"></i>
                  Acerca del proyecto
                </h3>
                <p>{article.description}</p>
              </div>

              {article.technologies && article.technologies.length > 0 && (
                <div className={styles.wordpressSummaryCard}>
                  <h3>
                    <i className="fas fa-cogs"></i>
                    Tecnologías utilizadas
                  </h3>
                  <div className={styles.wordpressTechList}>
                    {article.technologies.map((tech: string, idx: number) => (
                      <span key={idx} className={styles.wordpressTechChip}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.wordpressSummaryCard}>
                <h3>
                  <i className="fas fa-flag-checkered"></i>
                  Estado del proyecto
                </h3>
                <p className={styles.wordpressStatusText}>
                  {article.status}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* WordPress Share Section */}
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 0 24px',
          borderTop: '1px solid #e1e4e8',
          marginTop: '48px'
        }}>
          <button 
            onClick={handleShare}
            className={`${styles.wordpressActionButton} ${styles.wordpressActionSecondary}`}
            title="Compartir artículo"
          >
            <i className="fas fa-share-alt"></i> Compartir este {isProject ? 'proyecto' : 'artículo'}
          </button>
        </div>
      </main>

      {/* Footer */}
      <Footer 
        darkMode={currentGlobalTheme === 'dark'} 
        className="curriculum-footer"
        profile={profile}
      />

      {/* Floating Action Buttons para administración */}
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

export default ArticlePage;
