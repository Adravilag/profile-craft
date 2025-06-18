// src/components/common/RelatedProjects.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '@cv-maker/shared';
import type { Article } from '@cv-maker/shared';
import styles from './RelatedProjects.module.css';

interface RelatedProjectsProps {
  currentArticleId: string;
  maxProjects?: number;
  className?: string;
}

const RelatedProjects: React.FC<RelatedProjectsProps> = ({ 
  currentArticleId, 
  maxProjects = 3, 
  className = '' 
}) => {
  const [projects, setProjects] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRelatedProjects();
  }, [currentArticleId]);
  const loadRelatedProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const articles = await getArticles();
      
      // Filtrar el artículo actual y tomar los más recientes
      const filteredProjects = articles
        .filter((article: Article) => article.id !== currentArticleId)
        .sort((a: Article, b: Article) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
        .slice(0, maxProjects);

      setProjects(filteredProjects);
    } catch (err) {
      setError('Error al cargar proyectos relacionados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProjectType = (article: Article) => {
    return !article.article_content || article.article_content.length < 500 
      ? 'Proyecto' 
      : 'Artículo';
  };

  if (loading) {
    return (
      <div className={`${styles.relatedProjects} ${className}`}>
        <div className={styles.relatedHeader}>
          <h2 className={styles.relatedTitle}>
            <i className="fas fa-project-diagram"></i>
            Últimos Proyectos
          </h2>
          <p className={styles.relatedSubtitle}>
            Explora más proyectos recientes
          </p>
        </div>
        
        <div className={styles.relatedGrid}>
          {[...Array(maxProjects)].map((_, index) => (
            <div key={index} className={styles.relatedCardSkeleton}>
              <div className={styles.relatedImageSkeleton}></div>
              <div className={styles.relatedContentSkeleton}>
                <div className={styles.relatedTitleSkeleton}></div>
                <div className={styles.relatedDescriptionSkeleton}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || projects.length === 0) {
    return (
      <div className={`${styles.relatedProjects} ${className}`}>
        <div className={styles.relatedHeader}>
          <h2 className={styles.relatedTitle}>
            <i className="fas fa-project-diagram"></i>
            Últimos Proyectos
          </h2>
          <p className={styles.relatedSubtitle}>
            {error || 'No hay proyectos relacionados disponibles'}
          </p>
        </div>
        
        <div className={styles.relatedEmpty}>
          <i className="fas fa-folder-open"></i>
          <p>No se encontraron proyectos relacionados</p>
          <Link to="/" className={styles.relatedEmptyLink}>
            Ver todos los proyectos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.relatedProjects} ${className}`}>
      <div className={styles.relatedHeader}>
        <h2 className={styles.relatedTitle}>
          <i className="fas fa-project-diagram"></i>
          Últimos Proyectos
        </h2>
        <p className={styles.relatedSubtitle}>
          Explora más proyectos recientes de mi portafolio
        </p>
      </div>

      <div className={styles.relatedGrid}>
        {projects.map((project) => (
          <article key={project.id} className={styles.relatedCard}>
            <Link to={`/article/${project.id}`} className={styles.relatedCardLink}>
              {/* Project Image */}
              <div className={styles.relatedImageContainer}>
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className={styles.relatedImage}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.relatedImagePlaceholder}>
                    <i className="fas fa-project-diagram"></i>
                  </div>
                )}
                
                {/* Project Type Badge */}
                <div className={styles.relatedBadge}>
                  <i className={getProjectType(project) === 'Proyecto' ? 'fas fa-code' : 'fas fa-newspaper'}></i>
                  {getProjectType(project)}
                </div>
              </div>

              {/* Project Content */}
              <div className={styles.relatedContent}>
                <h3 className={styles.relatedCardTitle}>
                  {project.title}
                </h3>
                
                <p className={styles.relatedCardDescription}>
                  {project.description}
                </p>                {/* Project Meta */}
                <div className={styles.relatedMeta}>
                  {project.created_at && (
                    <div className={styles.relatedMetaItem}>
                      <i className="fas fa-calendar"></i>
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                  )}
                  
                  {project.status && (
                    <div className={styles.relatedMetaItem}>
                      <i className="fas fa-flag"></i>
                      <span>{project.status}</span>
                    </div>
                  )}
                </div>

                {/* Technologies Preview */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className={styles.relatedTechnologies}>
                    {project.technologies.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className={styles.relatedTechChip}>
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className={styles.relatedTechMore}>
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Hover Arrow */}
              <div className={styles.relatedArrow}>
                <i className="fas fa-arrow-right"></i>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* View All Link */}
      <div className={styles.relatedFooter}>
        <Link to="/" className={styles.relatedViewAll}>
          <i className="fas fa-th-large"></i>
          Ver todos los proyectos
          <i className="fas fa-external-link-alt"></i>
        </Link>
      </div>
    </div>
  );
};

export default RelatedProjects;
