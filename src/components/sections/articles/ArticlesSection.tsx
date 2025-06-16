// src/components/sections/articles/ArticlesSection.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getArticles } from "../../../services/api";
import type { Article } from "../../../services/api";
import { useData } from "../../../contexts/DataContext";
import FloatingActionButton from "../../common/FloatingActionButton";
import HeaderSection from "../header/HeaderSection";
import Pagination from "../../ui/Pagination";
import styles from "./ArticlesSection.module.css";

interface ArticlesSectionProps {
  onArticleClick?: (articleId: string) => void;
  showAdminButton?: boolean;
  onAdminClick?: () => void;
}

const ArticlesSection: React.FC<ArticlesSectionProps> = ({
  onArticleClick,
  showAdminButton = false,
  onAdminClick,
}) => {
  const navigate = useNavigate();
  const { articles, articlesLoading, articlesError } = useData();
  const [localArticles, setLocalArticles] = useState<Article[]>([]);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(3); // 3 artículos por página para mostrar paginación a partir del 4º proyecto
  const [isChangingPage, setIsChangingPage] = useState(false);

  // Estados de filtro
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'projects' | 'articles'>('all');

  // Usar los artículos del contexto si están disponibles, de lo contrario usar los locales
  const currentArticles = articles.length > 0 ? articles : localArticles;
  const currentLoading = articles.length > 0 ? articlesLoading : (localArticles.length === 0);
  const currentError = articles.length > 0 ? articlesError : null;



  // Función para filtrar artículos por tipo
  const getFilteredArticles = () => {
    let filtered = currentArticles;
    
    if (selectedFilter === 'projects') {
      filtered = currentArticles.filter(article => !article.article_content);
    } else if (selectedFilter === 'articles') {
      filtered = currentArticles.filter(article => article.article_content);
    }
    
    return filtered;
  };

  const filteredArticles = getFilteredArticles();
  const filteredTotalArticles = filteredArticles.length;
  const filteredTotalPages = Math.ceil(filteredTotalArticles / articlesPerPage);
  const filteredStartIndex = (currentPage - 1) * articlesPerPage;
  const filteredEndIndex = filteredStartIndex + articlesPerPage;
  const paginatedFilteredArticles = filteredArticles.slice(filteredStartIndex, filteredEndIndex);

  // Función para cambiar de página
  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    
    setIsChangingPage(true);
    
    // Pequeña animación de transición
    setTimeout(() => {
      setCurrentPage(page);
      setIsChangingPage(false);
      
      // Scroll suave hacia el título de la sección
      const sectionTitle = document.querySelector('#articles .header-section-title');
      if (sectionTitle) {
        sectionTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Función para cambiar filtro
  const handleFilterChange = (filter: 'all' | 'projects' | 'articles') => {
    setSelectedFilter(filter);
    setCurrentPage(1); // Resetear a la primera página
  };

  useEffect(() => {
    // Intentar cargar artículos si no están en el contexto
    if (articles.length === 0 && localArticles.length === 0) {
      loadArticles();
    }
  }, [articles.length, localArticles.length]);

  const loadArticles = async () => {
    try {
      const data = await getArticles();
      console.log('Artículos cargados:', data?.length || 0);
      setLocalArticles(data);
    } catch (err) {
      console.error("Error al cargar los proyectos:", err);
    }
  };

  const handleArticleClick = (articleId: string) => {
    if (onArticleClick) {
      onArticleClick(articleId);
    } else {
      // Navegar a la página independiente del artículo
      navigate(`/article/${articleId}`);
    }
  };

  const handleAdminClick = () => {
    // Navegar a la página de administración de artículos
    navigate('/articles/admin');
    onAdminClick?.(); // Llamar al callback original si existe
  };

  // Verificar si hay diferentes tipos de contenido para mostrar filtros
  const hasProjects = currentArticles.some(article => !article.article_content);
  const hasArticles = currentArticles.some(article => article.article_content);
  const showFilters = hasProjects && hasArticles;

  if (currentLoading) {
    return (
      <section className={styles.articlesSection}>
        <HeaderSection 
          icon="fas fa-project-diagram" 
          title="Proyectos Destacados" 
          subtitle="Una selección de mis proyectos más relevantes y sus tecnologías" 
          className="articles" 
        />
        <div className="section-container">
          <div className={styles.articlesGrid}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className={styles.articleCardSkeleton}>
                <div className={styles.skeletonImage}></div>
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonBadges}>
                    <div className={styles.skeletonBadge}></div>
                    <div className={styles.skeletonBadge}></div>
                  </div>
                  <div className={styles.skeletonTitle}></div>
                  <div className={styles.skeletonDescription}>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonLine}></div>
                  </div>
                  <div className={styles.skeletonTechs}>
                    <div className={styles.skeletonTech}></div>
                    <div className={styles.skeletonTech}></div>
                    <div className={styles.skeletonTech}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (currentError) {
    return (      <section className={styles.articlesSection}>
        <HeaderSection 
          icon="fas fa-project-diagram" 
          title="Proyectos Destacados" 
          subtitle="Una selección de mis proyectos más relevantes y sus tecnologías" 
          className="articles" 
        />
        <div className={styles.articlesError}>
          <p>{currentError}</p>
          <button onClick={loadArticles} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  if (currentArticles.length === 0 && !currentLoading) {
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
            <button onClick={handleAdminClick} className={styles.adminButton}>
              <i className="fas fa-plus"></i> Crear primer proyecto
            </button>
          )}
        </div>      </section>
    );
  }

  return (
    <section className="section-cv" id="articles">
      <HeaderSection 
        icon="fas fa-project-diagram" 
        title="Proyectos Destacados" 
        subtitle={
          filteredTotalArticles > articlesPerPage 
            ? `Mis proyectos más relevantes (${filteredTotalArticles} ${selectedFilter === 'all' ? 'proyectos' : selectedFilter === 'projects' ? 'proyectos' : 'artículos'} ${selectedFilter === 'all' ? 'en total' : 'encontrados'})`
            : "Una selección de mis proyectos más relevantes y sus tecnologías"
        }
        className="articles" 
      />
      <div className="section-container">

      {/* Filtros por tipo de contenido */}
      {showFilters && (
        <div className={styles.filtersContainer}>
          <button 
            className={`${styles.filterButton} ${selectedFilter === 'all' ? styles.active : ''}`}
            onClick={() => handleFilterChange('all')}
            aria-pressed={selectedFilter === 'all'}
          >
            <i className="fas fa-th"></i> Todos
          </button>
          <button 
            className={`${styles.filterButton} ${selectedFilter === 'projects' ? styles.active : ''}`}
            onClick={() => handleFilterChange('projects')}
            aria-pressed={selectedFilter === 'projects'}
          >
            <i className="fas fa-code"></i> Proyectos
          </button>
          <button 
            className={`${styles.filterButton} ${selectedFilter === 'articles' ? styles.active : ''}`}
            onClick={() => handleFilterChange('articles')}
            aria-pressed={selectedFilter === 'articles'}
          >
            <i className="fas fa-newspaper"></i> Artículos
          </button>
        </div>
      )}

      <div className={`${styles.articlesGrid} ${isChangingPage ? styles.loading : ''}`}>
        {paginatedFilteredArticles.map((article) => (
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
                <div 
                  className={styles.articleOverlay}
                  data-tooltip="Ver proyecto completo"
                  role="button"
                  tabIndex={-1}
                  aria-label="Abrir proyecto"
                >
                  <i className="fas fa-newspaper" aria-hidden="true"></i>
                </div>
              </div>
            )}

            <div className={styles.articleContent}>
              {/* Badge del tipo de contenido */}
              <div className={styles.articleTypeContainer}>
                {article.article_content ? (
                  <span 
                    className={`${styles.articleBadge} ${styles.articleTypeBadge}`}
                    role="badge"
                    aria-label="Tipo de contenido: Artículo"
                  >
                    <i className="fas fa-newspaper" aria-hidden="true"></i>
                    Artículo
                  </span>
                ) : (
                  <span 
                    className={`${styles.articleBadge} ${styles.projectTypeBadge}`}
                    role="badge"
                    aria-label="Tipo de contenido: Proyecto"
                  >
                    <i className="fas fa-code" aria-hidden="true"></i>
                    Proyecto
                  </span>
                )}
                
                {/* Badge de estado */}
                <span 
                  className={`${styles.articleBadge} ${styles.articleStatus}`}
                  data-status={article.status}
                  role="badge"
                  aria-label={`Estado del proyecto: ${article.status}`}
                >
                  {article.status === 'Completado' ? 'COMPLETADO' : 
                   article.status === 'En Desarrollo' ? 'EN DESARROLLO' : 'BORRADOR'}
                </span>
              </div>

              {/* Meta información: fechas y visitas */}
              <div className={styles.articleMeta}>
                <div className={styles.articleDates}>
                  {article.created_at ? (
                    <time 
                      className={styles.articleDate}
                      dateTime={article.created_at}
                      title={`Publicado el ${new Date(article.created_at).toLocaleDateString('es-ES')}`}
                    >
                      {new Date(article.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short', 
                        year: 'numeric'
                      })}
                    </time>
                  ) : (
                    <span className={styles.articleDate}>Fecha no disponible</span>
                  )}
                </div>
                <span className={styles.articleViews} aria-label={`Número de visitas: ${article.views || 0}`}>
                  <i className="fas fa-eye" aria-hidden="true"></i>
                  {article.views || 0}
                </span>
              </div>

              {/* Título del proyecto */}
              <h3 className={styles.articleTitle}>{article.title}</h3>
              
              {/* Descripción breve */}
              <p className={styles.articleDescription}>{article.description}</p>

              {/* Tecnologías utilizadas */}
              {article.technologies && article.technologies.length > 0 && (
                <div className={styles.articleTechnologies}>
                  {article.technologies.slice(0, 4).map((tech, idx) => (
                    <span key={idx} className={styles.techChip}>
                      {tech}
                    </span>
                  ))}
                  {article.technologies.length > 4 && (
                    <span className={styles.techMore}>
                      +{article.technologies.length - 4}
                    </span>
                  )}
                </div>
              )}
              {/* Enlaces del proyecto */}
              <div className={styles.articleLinks}>
                {article.github_url && (
                  <a
                    href={article.github_url}
                    className={`${styles.articleLink} ${styles.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Ver repositorio en GitHub"
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
                    aria-label="Ver demo en vivo"
                  >
                    <i className="fas fa-eye"></i>
                  </a>
                )}
                {article.video_demo_url && (
                  <a
                    href={article.video_demo_url}
                    className={`${styles.articleLink} ${styles.video}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Ver video demostración"
                  >
                    <i className="fab fa-youtube"></i>
                  </a>
                )}
              </div>

              <div className={styles.articleActions}>
                <span className={styles.readMore}>
                  Ver proyecto completo <i className="fas fa-arrow-right"></i>
                </span>
              </div>
            </div>
          </article>        ))}
      </div>

      {/* Componente de paginación */}
      {filteredTotalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={filteredTotalPages}
          onPageChange={handlePageChange}
          totalItems={filteredTotalArticles}
          itemsPerPage={articlesPerPage}
          showInfo={true}
        />
      )}

      </div>

      {/* Floating Action Button para administración */}
      {showAdminButton && (
        <FloatingActionButton
          onClick={handleAdminClick}
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
