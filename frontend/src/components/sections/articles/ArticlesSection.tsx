// src/components/sections/articles/ArticlesSection.tsx

import React, { useState, useEffect } from "react";
import { getArticles } from "../../../services/api";
import type { Article } from "../../../services/api";
import FloatingActionButton from "../../common/FloatingActionButton";
import HeaderSection from "../header/HeaderSection";
import styles from "./ArticlesSection.module.css";

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
  };  if (loading) {
    return (      <section className={styles.articlesSection}>
        <HeaderSection 
          icon="fas fa-project-diagram" 
          title="Proyectos Destacados" 
          subtitle="Una selección de mis proyectos más relevantes y sus tecnologías" 
          className="articles" 
        />
        <div className={styles.articlesLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando proyectos...</p>
        </div>
      </section>
    );
  }
  if (error) {
    return (      <section className={styles.articlesSection}>
        <HeaderSection 
          icon="fas fa-project-diagram" 
          title="Proyectos Destacados" 
          subtitle="Una selección de mis proyectos más relevantes y sus tecnologías" 
          className="articles" 
        />
        <div className={styles.articlesError}>
          <p>{error}</p>
          <button onClick={loadArticles} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </section>
    );
  }  if (articles.length === 0) {
    return (
      <section className={styles.articlesSection}>
        <HeaderSection 
          icon="fas fa-project-diagram" 
          title="Proyectos Destacados" 
          subtitle="Una selección de mis proyectos más relevantes y sus tecnologías" 
          className="articles" 
        />
        <div className={styles.articlesEmpty}>
          <i className="fas fa-project-diagram"></i>
          <p>No hay proyectos publicados aún.</p>
          {showAdminButton && (
            <button onClick={onAdminClick} className={styles.adminButton}>
              <i className="fas fa-plus"></i> Crear primer proyecto
            </button>
          )}
        </div>      </section>
    );
  }

  return (
    <section className="section-cv">
      <HeaderSection 
        icon="fas fa-project-diagram" 
        title="Proyectos Destacados" 
        subtitle="Una selección de mis proyectos más relevantes y sus tecnologías" 
        className="articles" 
      />
      <div className="section-container">

      <div className={styles.articlesGrid}>
        {articles.map((article) => (
          <article
            key={article.id}
            className={styles.articleCard}
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
              <div className={styles.articleImage}>
                <img
                  src={article.image_url}
                  alt={article.title}
                  loading="lazy"
                />
                <div className={styles.articleOverlay}>
                  <i className="fas fa-newspaper"></i>
                </div>
              </div>
            )}

            <div className={styles.articleContent}>
              <div className={styles.articleMeta}>
                <span className={styles.articleStatus}>{article.status}</span>
                {article.technologies && article.technologies.length > 0 && (
                  <div className={styles.articleTechnologies}>
                    {article.technologies.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className={styles.techTagSmall}>
                        {tech}
                      </span>
                    ))}
                    {article.technologies.length > 3 && (
                      <span className={styles.techMore}>
                        +{article.technologies.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <h3 className={styles.articleTitle}>{article.title}</h3>
              <p className={styles.articleDescription}>{article.description}</p>

              {article.summary && (
                <div
                  className={styles.articleSummary}
                  dangerouslySetInnerHTML={{ __html: article.summary }}
                />
              )}
              <div className={styles.articleActions}>
                <span className={styles.readMore}>
                  Ver proyecto completo <i className="fas fa-arrow-right"></i>
                </span>

                <div className={styles.articleLinks}>
                  {article.github_url && (
                    <a
                      href={article.github_url}
                      className={`${styles.articleLink} ${styles.github}`}
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
                      className={`${styles.articleLink} ${styles.demo}`}
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
          </article>        ))}
      </div>
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
