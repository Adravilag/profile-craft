// src/components/sections/articles/ArticlesAdmin.tsx

import React, { useState, useEffect, useMemo } from "react";
import { getAdminArticles, deleteArticle } from "../../../services/api";
import type { Article } from "../../../services/api";
import { useNotificationContext } from "../../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import styles from "./ArticlesAdmin.module.css";

/**
 * ArticlesAdmin Component - Lista de gestión de artículos
 *
 * Características principales:
 * - Lista de artículos con opciones de edición y eliminación
 * - Navegación a páginas independientes para crear y editar
 * - Eliminación de artículos con confirmación
 * - Búsqueda y filtrado en tiempo real
 * - Paginación para listados largos
 * - Diseño responsive con max-width centrado
 */

interface SortConfig {
  key: keyof Article | null;
  direction: "asc" | "desc";
}

const ITEMS_PER_PAGE = 10;

const ArticlesAdmin: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { showSuccess, showError } = useNotificationContext();
  const navigate = useNavigate();

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await getAdminArticles();
      setArticles(data);
    } catch (error) {
      showError("Error", "No se pudieron cargar los proyectos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado y búsqueda
  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          article.technologies?.some((tech) =>
            tech.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Aplicar filtro de estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (article) => (article.status || "Completado") === statusFilter
      );
    }

    // Aplicar ordenamiento
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Manejar valores undefined
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
        if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [articles, searchTerm, statusFilter, sortConfig]);

  // Paginación
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);

  // Estadísticas
  const stats = useMemo(() => {
    const total = articles.length;
    const completed = articles.filter(
      (a) => (a.status || "Completado") === "Completado"
    ).length;
    const inProgress = articles.filter(
      (a) => a.status === "En Desarrollo"
    ).length;
    const draft = articles.filter((a) => a.status === "Borrador").length;

    return { total, completed, inProgress, draft };
  }, [articles]);

  // Manejo de ordenamiento
  const handleSort = (key: keyof Article) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  // Estados únicos para el filtro
  const uniqueStatuses = useMemo(() => {
    const statuses = articles.map((a) => a.status || "Completado");
    return Array.from(new Set(statuses));
  }, [articles]);

  // Función para obtener la clase CSS del estado
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Completado":
        return "completed";
      case "En Desarrollo":
        return "inProgress";
      case "Borrador":
        return "draft";
      default:
        return "completed";
    }
  };

  // Función para manejar el botón "Nuevo Proyecto" - navega a la página de creación
  const handleNewProject = () => {
    navigate("/articles/new");
  };

  const handleEdit = (article: Article) => {
    // Navegar a la página de edición independiente
    navigate(`/articles/edit/${article.id}`);
  };

  const handleView = (article: Article) => {
    // Navegar a la página de visualización del artículo/proyecto
    navigate(`/article/${article.id}`);
  };

  const getArticleType = (article: Article): string => {
    // Usar el campo type si existe, sino aplicar lógica de fallback
    if (article.type) {
      return article.type === 'articulo' ? 'Artículo' : 'Proyecto';
    }
    
    // Lógica de fallback para datos existentes sin el campo type
    if (article.article_content && article.article_content.length > 500) {
      return "Artículo";
    }
    return "Proyecto";
  };

  const handleDelete = async (article: Article) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${article.title}"?`)) {
      return;
    }
    try {
      await deleteArticle(article.id);
      showSuccess("Éxito", "Proyecto eliminado exitosamente");
      await loadArticles();
    } catch (error) {
      showError("Error", "No se pudo eliminar el proyecto");
      console.error(error);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.articlesAdminContainer}>
        <div className={styles.articlesAdmin}>
          <div className={styles.articlesAdminHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.articlesAdminTitle}>
                <i className="fas fa-newspaper"></i>
                Gestión de Proyectos
              </h1>
              <p className={styles.articlesAdminSubtitle}>
                Administra y organiza todos tus artículos y proyectos
              </p>
            </div>
            <button className={styles.btnPrimary} onClick={handleNewProject}>
              <i className="fas fa-plus"></i>
              Nuevo Proyecto
            </button>
          </div>

          {/* Estadísticas */}
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <i className="fas fa-list"></i>
              <span>Total: {stats.total}</span>
            </div>
            <div className={styles.statItem}>
              <i className="fas fa-check-circle"></i>
              <span>Completados: {stats.completed}</span>
            </div>
            <div className={styles.statItem}>
              <i className="fas fa-clock"></i>
              <span>En Desarrollo: {stats.inProgress}</span>
            </div>
            <div className={styles.statItem}>
              <i className="fas fa-edit"></i>
              <span>Borradores: {stats.draft}</span>
            </div>
          </div>

          {/* Controles de tabla */}
          <div className={styles.tableControls}>
            <div className={styles.controlsTopRow}>
              <div className={styles.leftControls}>
                <div className={styles.searchBox}>
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Buscar proyectos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchTerm && (
                    <button
                      className={styles.clearSearch}
                      onClick={() => setSearchTerm("")}
                      title="Limpiar búsqueda"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Todos los estados</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.resultsInfo}>
              Mostrando {filteredArticles.length} de {stats.total} proyectos
            </div>
          </div>

          {loading ? (
            <div className={styles.adminLoading}>
              <div className={styles.loadingSpinner}></div>
              <p>Cargando proyectos...</p>
            </div>
          ) : (
            <>
              {articles.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <i className="fas fa-newspaper"></i>
                  </div>
                  <h3>No hay proyectos creados</h3>
                  <p>
                    Comienza creando tu primer proyecto para mostrar tu trabajo
                  </p>
                  <button
                    className={styles.btnPrimary}
                    onClick={handleNewProject}
                  >
                    <i className="fas fa-plus"></i>
                    Crear mi primer proyecto
                  </button>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <i className="fas fa-search"></i>
                  </div>
                  <h3>No se encontraron resultados</h3>
                  <p>
                    Intenta con otros términos de búsqueda o cambia los filtros
                  </p>
                  <button
                    className={styles.btnSecondary}
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    <i className="fas fa-undo"></i>
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.articlesTableContainer}>
                    <table className={styles.articlesTable}>
                      <thead>
                        <tr>
                          <th className={styles.thImagen}>Imagen</th>
                          <th
                            className={`${styles.thTitulo} ${styles.sortable}`}
                            onClick={() => handleSort("title")}
                          >
                            Título
                            <i
                              className={`fas ${
                                sortConfig.key === "title"
                                  ? sortConfig.direction === "asc"
                                    ? "fa-sort-up"
                                    : "fa-sort-down"
                                  : "fa-sort"
                              }`}
                            ></i>
                          </th>
                          <th className={styles.thTipo}>Tipo</th>
                          <th
                            className={`${styles.thEstado} ${styles.sortable}`}
                            onClick={() => handleSort("status")}
                          >
                            Estado
                            <i
                              className={`fas ${
                                sortConfig.key === "status"
                                  ? sortConfig.direction === "asc"
                                    ? "fa-sort-up"
                                    : "fa-sort-down"
                                  : "fa-sort"
                              }`}
                            ></i>
                          </th>
                          <th className={styles.thTecnologias}>Tecnologías</th>
                          <th className={styles.thAcciones}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedArticles.map((article) => (
                          <tr key={article.id}>
                            <td className={styles.tdImagen}>
                              {article.image_url ? (
                                <img
                                  src={article.image_url}
                                  alt={article.title}
                                  className={styles.articleThumbnail}
                                  loading="lazy"
                                />
                              ) : (
                                <div className={styles.noImage}>
                                  <i className="fas fa-image"></i>
                                </div>
                              )}
                            </td>
                            <td className={styles.tdTitulo}>
                              <div className={styles.articleInfo}>
                                <h4 title={article.title}>{article.title}</h4>
                                <p title={article.description}>
                                  {article.description}
                                </p>
                              </div>
                            </td>
                            <td className={styles.tdTipo}>
                              <span className={styles.badgeTipo}>
                                {getArticleType(article)}
                              </span>
                            </td>
                            <td className={styles.tdEstado}>
                              <span
                                className={`${styles.badge} ${
                                  styles[
                                    `badge${(
                                      article.status || "Completado"
                                    ).replace(/\s+/g, "")}`
                                  ]
                                }`}
                              >
                                {article.status || "Completado"}
                              </span>
                            </td>
                            <td className={styles.tdTecnologias}>
                              <div className={styles.techList}>
                                {article.technologies
                                  ?.slice(0, 3)
                                  .map((tech, index) => (
                                    <span
                                      key={index}
                                      className={styles.badgeTec}
                                      title={tech}
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                {article.technologies &&
                                  article.technologies.length > 3 && (
                                    <span
                                      className={styles.badgeTecMore}
                                      title={`${article.technologies
                                        .slice(3)
                                        .join(", ")}`}
                                    >
                                      +{article.technologies.length - 3}
                                    </span>
                                  )}
                              </div>
                            </td>
                            <td className={styles.tdAcciones}>
                              <div className={styles.tableActions}>
                                <button
                                  className={`${styles.buttonIcon} ${styles.viewBtn}`}
                                  onClick={() => handleView(article)}
                                  title="Ver artículo/proyecto"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className={`${styles.buttonIcon} ${styles.editBtn}`}
                                  onClick={() => handleEdit(article)}
                                  title="Editar proyecto"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className={`${styles.buttonIcon} ${styles.deleteBtn}`}
                                  onClick={() => handleDelete(article)}
                                  title="Eliminar proyecto"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista Mobile Cards - Responsive */}
                  <div className={styles.mobileCardContainer}>
                    {paginatedArticles.map((article) => (
                      <div key={article.id} className={styles.mobileCard}>
                        <div className={styles.mobileCardHeader}>
                          <img
                            src={
                              article.image_url ||
                              "/assets/images/default-article.jpg"
                            }
                            alt={article.title}
                            className={styles.mobileCardThumbnail}
                            onError={(e) => {
                              e.currentTarget.src =
                                "/assets/images/default-article.jpg";
                            }}
                          />
                          <div className={styles.mobileCardContent}>
                            <h3 className={styles.mobileCardTitle}>
                              {article.title}
                            </h3>
                            <p className={styles.mobileCardDescription}>
                              {article.description}
                            </p>
                          </div>
                        </div>

                        <div className={styles.mobileCardMeta}>
                          <div className={styles.mobileCardMetaRow}>
                            <span className={styles.mobileCardLabel}>
                              Tipo:
                            </span>
                            <span className={styles.badgeTipo}>
                              {getArticleType(article)}
                            </span>
                          </div>
                          <div className={styles.mobileCardMetaRow}>
                            <span className={styles.mobileCardLabel}>
                              Estado:
                            </span>
                            <span
                              className={`${styles.statusBadge} ${
                                styles[
                                  getStatusClass(article.status || "Completado")
                                ]
                              }`}
                            >
                              {article.status || "Completado"}
                            </span>
                          </div>
                          <div className={styles.mobileCardMetaRow}>
                            <span className={styles.mobileCardLabel}>
                              Fecha:
                            </span>
                            <span className={styles.mobileCardValue}>
                              {article.created_at
                                ? new Date(
                                    article.created_at
                                  ).toLocaleDateString("es-ES")
                                : "Sin fecha"}
                            </span>
                          </div>
                        </div>

                        {article.technologies &&
                          article.technologies.length > 0 && (
                            <div className={styles.mobileCardTechnologies}>
                              {article.technologies.map((tech, index) => (
                                <span key={index} className={styles.techBadge}>
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}

                        <div className={styles.mobileCardActions}>
                          <button
                            className={`${styles.buttonIcon} ${styles.viewBtn}`}
                            onClick={() => handleView(article)}
                            title="Ver artículo/proyecto"
                          >
                            <i className="fas fa-eye"></i>
                            Ver
                          </button>
                          <button
                            className={`${styles.buttonIcon} ${styles.editBtn}`}
                            onClick={() => handleEdit(article)}
                            title="Editar proyecto"
                          >
                            <i className="fas fa-edit"></i>
                            Editar
                          </button>
                          <button
                            className={`${styles.buttonIcon} ${styles.deleteBtn}`}
                            onClick={() => handleDelete(article)}
                            title="Eliminar proyecto"
                          >
                            <i className="fas fa-trash"></i>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.paginationBtn}
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chevron-left"></i>
                        Anterior
                      </button>

                      <div className={styles.paginationInfo}>
                        Página {currentPage} de {totalPages}
                      </div>

                      <button
                        className={styles.paginationBtn}
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlesAdmin;
