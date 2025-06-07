// src/pages/ArticlePage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getArticleById } from '../services/api';
import type { Article } from '../services/api';
import { useNotificationContext } from '../contexts/NotificationContext';
import styles from './ArticlePage.module.css';

interface ArticlePageProps {}

const ArticlePage: React.FC<ArticlePageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useNotificationContext();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState<number>(0);

  useEffect(() => {
    if (!id) {
      showError('Error', 'ID de artículo no válido');
      navigate('/');
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
        const words = data.article_content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        setReadingTime(Math.ceil(words / wordsPerMinute));
      }
    } catch (err) {
      setError('Error al cargar el artículo');
      showError('Error', 'No se pudo cargar el artículo');
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
          url: window.location.href
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
            <p>{error || 'El artículo solicitado no existe o ha sido eliminado.'}</p>
            <div className={styles.errorActions}>
              <Link to="/" className={`${styles.btn} ${styles.btnPrimary}`}>
                <i className="fas fa-home"></i>
                Volver al portafolio
              </Link>
              <button onClick={() => loadArticle(parseInt(id!))} className={`${styles.btn} ${styles.btnSecondary}`}>
                <i className="fas fa-redo"></i>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const isProject = !article.article_content || article.article_content.length < 500;
  return (
    <div className={styles.articlePage}>
      {/* Fixed back button */}
      <Link to="/" className={styles.fixedBackButton}>
        <i className="fas fa-arrow-left"></i>
      </Link>      {/* Contenido principal */}
      <main className={styles.articleContent}>
        <div className={styles.contentContainer}>
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
                <span className={`${styles.badgeText} ${isProject ? styles.badgeProject : styles.badgeArticle}`}>
                  <i className={isProject ? 'fas fa-code' : 'fas fa-newspaper'}></i>
                  {isProject ? 'Proyecto' : 'Artículo'}
                  {article.status && (
                    <span className={styles.badgeStatus}> • {article.status}</span>
                  )}
                  {!isProject && readingTime > 0 && (
                    <span className={styles.badgeReading}> • {readingTime} min</span>
                  )}
                </span>
              </div>
              
              <h1 className={styles.articleTitle}>{article.title}</h1>
              <p className={styles.articleDescription}>{article.description}</p>
              
              {/* Technologies tags */}
              {article.technologies && article.technologies.length > 0 && (
                <div className={styles.techStack}>
                  {article.technologies.slice(0, 6).map((tech, idx) => (
                    <span key={idx} className={styles.techTag}>{tech}</span>
                  ))}
                  {article.technologies.length > 6 && (
                    <span className={styles.techMore}>+{article.technologies.length - 6}</span>
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
                {article.live_url && article.live_url !== '#' && (
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
          </section>{/* Video demo si existe */}
          {article.video_demo_url && (
            <section className={styles.videoSection}>
              <div className={styles.videoContainer}>
                {article.video_demo_url.includes('youtube.com') || article.video_demo_url.includes('youtu.be') ? (
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
          )}          {/* Si es un proyecto sin contenido extenso, mostrar información resumida */}
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
                        <span key={idx} className={styles.techItem}>{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className={styles.summaryCard}>
                  <h3>
                    <i className="fas fa-flag-checkered"></i>
                    Estado del proyecto
                  </h3>
                  <p className={`${styles.statusText} ${article.status.toLowerCase().replace(' ', '-') === 'completado' ? styles.statusTextCompletado : styles.statusTextEnProgreso}`}>
                    {article.status}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>      {/* Footer simplificado */}
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
    </div>
  );
};

// Función auxiliar para convertir URLs de YouTube a embed
const getYouTubeEmbedUrl = (url: string): string => {
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

export default ArticlePage;
