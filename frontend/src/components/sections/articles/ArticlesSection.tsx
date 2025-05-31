// src/components/sections/articles/ArticlesSection.tsx

import React, { useState, useEffect } from "react";
import { getArticles } from "../../../services/api";
import type { Article } from "../../../services/api";
import FloatingActionButton from "../../common/FloatingActionButton";
import "./ArticlesSection.css";

interface ArticlesSectionProps {
  onArticleClick?: (articleId: number) => void;
  showAdminButton?: boolean;
  onAdminClick?: () => void;
}

const ArticlesSection: React.FC<ArticlesSectionProps> = ({
  onArticleClick,
  showAdminButton = false,
  onAdminClick,
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await getArticles();
      setArticles(data);
    } catch (err) {
      setError("Error al cargar los proyectos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (articleId: number) => {
    if (onArticleClick) {
      onArticleClick(articleId);
    } else {
      // Navegación por defecto - abrir en nueva pestaña o modal
      window.open(`#/article/${articleId}`, "_blank");
    }
  };
  if (loading) {
    return (
      <section className="cv-section">
        <div className="section-header">
          <div className="section-title">
            <div className="title-icon">
              <i className="fas fa-project-diagram"></i>
            </div>
            <span className="title-text">Proyectos Destacados</span>
          </div>
          <p className="section-subtitle">
            Una selección de mis proyectos más relevantes y sus tecnologías
          </p>
        </div>
        <div className="articles-loading">
          <div className="loading-spinner"></div>
          <p>Cargando proyectos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="cv-section">
        <div className="section-header">
          <div className="section-title">
            <div className="title-icon">
              <i className="fas fa-project-diagram"></i>
            </div>
            <span className="title-text">Proyectos Destacados</span>
          </div>
          <p className="section-subtitle">
            Una selección de mis proyectos más relevantes y sus tecnologías
          </p>
        </div>
        <div className="articles-error">
          <p>{error}</p>
          <button onClick={loadArticles} className="retry-button">
            Reintentar
          </button>
        </div>
      </section>
    );
  }
  if (articles.length === 0) {
    return (
      <section className="cv-section">
        <div className="section-header">
          <div className="section-title">
            <div className="title-icon">
              <i className="fas fa-project-diagram"></i>
            </div>
            <span className="title-text">Proyectos Destacados</span>
          </div>
          <p className="section-subtitle">
            Una selección de mis proyectos más relevantes y sus tecnologías
          </p>
        </div>
        <div className="articles-empty">
          <i className="fas fa-project-diagram"></i>
          <p>No hay proyectos publicados aún.</p>
          {showAdminButton && (
            <button onClick={onAdminClick} className="admin-button">
              <i className="fas fa-plus"></i> Crear primer proyecto
            </button>
          )}
        </div>
      </section>
    );
  }
  return (
    <section className="cv-section">
      <div className="section-header">
        <div className="section-title">
          <div className="title-icon">
            <i className="fas fa-project-diagram"></i>
          </div>
          <span className="title-text">Proyectos Destacados</span>
        </div>
        <p className="section-subtitle">
          Una selección de mis proyectos más relevantes y sus tecnologías
        </p>
      </div>

      <div className="articles-grid">
        {articles.map((article) => (
          <article
            key={article.id}
            className="article-card"
            onClick={() => handleArticleClick(article.id)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleArticleClick(article.id);
              }
            }}
          >
            {article.image_url && (
              <div className="article-image">
                <img
                  src={article.image_url}
                  alt={article.title}
                  loading="lazy"
                />
                <div className="article-overlay">
                  <i className="fas fa-newspaper"></i>
                </div>
              </div>
            )}

            <div className="article-content">
              <div className="article-meta">
                <span className="article-status">{article.status}</span>
                {article.technologies && article.technologies.length > 0 && (
                  <div className="article-technologies">
                    {article.technologies.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="tech-tag-small">
                        {tech}
                      </span>
                    ))}
                    {article.technologies.length > 3 && (
                      <span className="tech-more">
                        +{article.technologies.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <h3 className="article-title">{article.title}</h3>
              <p className="article-description">{article.description}</p>

              {article.summary && (
                <div
                  className="article-summary"
                  dangerouslySetInnerHTML={{ __html: article.summary }}
                />
              )}
              <div className="article-actions">
                <span className="read-more">
                  Ver proyecto completo <i className="fas fa-arrow-right"></i>
                </span>

                <div className="article-links">
                  {article.github_url && (
                    <a
                      href={article.github_url}
                      className="article-link github"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Ver código en GitHub"
                    >
                      <i className="fab fa-github"></i>
                    </a>
                  )}
                  {article.live_url && article.live_url !== "#" && (
                    <a
                      href={article.live_url}
                      className="article-link demo"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Ver demo en vivo"
                    >
                      <i className="fas fa-external-link-alt"></i>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}{" "}
      </div>
      {/* Floating Action Button para administración */}
      {showAdminButton && onAdminClick && (
        <FloatingActionButton
          onClick={onAdminClick}
          icon="fas fa-edit"
          label="Gestionar Proyectos"
          color="primary"
          position="bottom-right"
        />
      )}
    </section>
  );
};

export default ArticlesSection;
