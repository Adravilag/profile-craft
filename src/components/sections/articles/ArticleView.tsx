// src/components/sections/articles/ArticleView.tsx

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getArticleById } from '../../../services/api';
import type { Article } from '../../../services/api';
import { useUnifiedTheme } from '../../../contexts/UnifiedThemeContext';
import styles from './ArticlePage.module.css'; // Usar el archivo CSS con diseño WordPress

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

interface ArticleViewProps {
  articleId: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

const ArticleView: React.FC<ArticleViewProps> = ({ 
  articleId, 
  onBack, 
  showBackButton = true 
}) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentGlobalTheme } = useUnifiedTheme();

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getArticleById(articleId);
      setArticle(data);
    } catch (err) {
      setError('Error al cargar el artículo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
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
            {showBackButton && (
              <button onClick={handleBack} className={styles.backButton}>
                <i className="fas fa-arrow-left"></i> Volver
              </button>
            )}
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
            <p style={{ marginBottom: '32px' }}>{error || 'El artículo solicitado no existe o ha sido eliminado.'}</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {showBackButton && (
                <button onClick={handleBack} className={`${styles.wordpressActionButton} ${styles.wordpressActionSecondary}`}>
                  <i className="fas fa-arrow-left"></i> Volver
                </button>
              )}
              <button onClick={loadArticle} className={`${styles.wordpressActionButton} ${styles.wordpressActionPrimary}`}>
                <i className="fas fa-redo"></i> Reintentar
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.articlePage} data-theme={currentGlobalTheme}>
      {/* Header WordPress */}
      <header className={styles.wordpressHeader}>
        <nav className={styles.articleNavigation}>
          {showBackButton && (
            <button onClick={handleBack} className={styles.backButton}>
              <i className="fas fa-arrow-left"></i> Volver a artículos
            </button>
          )}
          <div className={styles.progressIndicator}></div>
        </nav>
      </header>
      
      {/* Contenido principal */}
      <main className={styles.mainContent}>
        {/* WordPress Article Header */}
        <header className={styles.wordpressArticleHeader}>
          <a href="#" className={styles.wordpressCategory}>
            <span>Proyecto</span>
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
              {article.technologies.map((tech, idx) => (
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
                          height: '200px',
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
              className={styles.wordpressProse}
            />
          </article>
        )}
        
        {/* WordPress Share Section */}
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 0 24px',
          borderTop: '1px solid #e1e4e8',
          marginTop: '48px'
        }}>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: article.title,
                  text: article.description,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('URL copiada al portapapeles');
              }
            }}
            className={`${styles.wordpressActionButton} ${styles.wordpressActionSecondary}`}
            title="Compartir artículo"
          >
            <i className="fas fa-share-alt"></i> Compartir este proyecto
          </button>
        </div>
      </main>
    </div>
  );
};

// Función auxiliar para convertir URLs de YouTube a embed
const getYouTubeEmbedUrl = (url: string): string => {
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

export default ArticleView;
