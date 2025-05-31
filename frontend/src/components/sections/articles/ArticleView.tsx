// src/components/sections/articles/ArticleView.tsx

import React, { useState, useEffect } from 'react';
import { getArticleById } from '../../../services/api';
import type { Article } from '../../../services/api';
import './ArticleView.css';

interface ArticleViewProps {
  articleId: number;
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
      <div className="article-view">
        <div className="article-loading">
          <div className="loading-spinner"></div>
          <p>Cargando artículo...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="article-view">
        <div className="article-error">
          {showBackButton && (
            <button onClick={handleBack} className="back-button">
              <i className="fas fa-arrow-left"></i> Volver
            </button>
          )}
          <div className="error-content">
            <i className="fas fa-exclamation-triangle"></i>
            <h2>Artículo no encontrado</h2>
            <p>{error || 'El artículo solicitado no existe o ha sido eliminado.'}</p>
            <button onClick={loadArticle} className="retry-button">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-view">
      {showBackButton && (
        <button onClick={handleBack} className="back-button">
          <i className="fas fa-arrow-left"></i> Volver a artículos
        </button>
      )}
      
      <article className="article-full">
        <header className="article-header">
          {article.image_url && (
            <div className="article-hero-image">
              <img src={article.image_url} alt={article.title} />
              <div className="hero-overlay"></div>
            </div>
          )}
          
          <div className="article-header-content">
            <div className="article-meta-full">
              <span className="article-status-full">{article.status}</span>
              {article.technologies && article.technologies.length > 0 && (
                <div className="article-technologies-full">
                  {article.technologies.map((tech, idx) => (
                    <span key={idx} className="tech-tag-full">{tech}</span>
                  ))}
                </div>
              )}
            </div>
            
            <h1 className="article-title-full">{article.title}</h1>
            <p className="article-description-full">{article.description}</p>
            
            <div className="article-actions-full">
              {article.github_url && (
                <a 
                  href={article.github_url} 
                  className="action-link github"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-github"></i> Ver código en GitHub
                </a>
              )}
              {article.live_url && article.live_url !== '#' && (
                <a 
                  href={article.live_url} 
                  className="action-link demo"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-external-link-alt"></i> Ver demo en vivo
                </a>
              )}
              {article.article_url && (
                <a 
                  href={article.article_url} 
                  className="action-link external"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-link"></i> Artículo original
                </a>
              )}
            </div>
          </div>
        </header>
        
        {article.video_demo_url && (
          <section className="article-video">
            <h3>Demo en Video</h3>
            <div className="video-container">
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
        
        {article.article_content && (
          <section className="article-content-full">
            <div className="article-content-wrapper">
              <div 
                className="article-prose"
                dangerouslySetInnerHTML={{ __html: article.article_content }}
              />
            </div>
          </section>
        )}
        
        <footer className="article-footer">
          <div className="article-footer-actions">
            {showBackButton && (
              <button onClick={handleBack} className="footer-back-button">
                <i className="fas fa-arrow-left"></i> Volver a artículos
              </button>
            )}
            
            <div className="share-buttons">
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
                    // Aquí podrías mostrar una notificación
                  }
                }}
                className="share-button"
                title="Compartir artículo"
              >
                <i className="fas fa-share-alt"></i> Compartir
              </button>
            </div>
          </div>
        </footer>
      </article>
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
