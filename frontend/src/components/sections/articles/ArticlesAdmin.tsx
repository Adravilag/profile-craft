// src/components/sections/articles/ArticlesAdmin.tsx

import React, { useState, useEffect } from "react";
import {
  getAdminArticles,
  deleteArticle,
} from "../../../services/api";
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
 */

const ArticlesAdmin: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Función para manejar el botón "Nuevo Proyecto" - navega a la página de creación
  const handleNewProject = () => {
    navigate("/articles/new");
  };

  const handleEdit = (article: Article) => {
    // Navegar a la página de edición independiente
    navigate(`/articles/edit/${article.id}`);
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
    <div className={styles.articlesAdmin}>
      <div className={styles.articlesAdminHeader}>
        <h1 className={styles.articlesAdminTitle}>Gestión de Proyectos</h1>
        <button 
          className={styles.btnPrimary}
          onClick={handleNewProject}
        >
          + Nuevo Proyecto
        </button>
      </div>

      {loading ? (
        <div className={styles.adminLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando proyectos...</p>
        </div>
      ) : (
        <>
          {articles.length === 0 ? (
            <div className={styles.adminLoading}>
              <p>No hay proyectos creados aún.</p>
              <button 
                className={styles.btnPrimary}
                onClick={handleNewProject}
              >
                Crear mi primer proyecto
              </button>
            </div>
          ) : (
            <div className={styles.articlesTableContainer}>
              <table className={styles.articlesTable}>
                <thead>
                  <tr>
                    <th className={styles.thImagen}>Imagen</th>
                    <th className={styles.thTitulo}>Título</th>
                    <th className={styles.thEstado}>Estado</th>
                    <th className={styles.thTecnologias}>Tecnologías</th>
                    <th className={styles.thAcciones}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id}>
                      <td className={styles.tdImagen}>
                        {article.image_url ? (
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className={styles.articleThumbnail}
                          />
                        ) : (
                          <div className={styles.noImage}>📄</div>
                        )}
                      </td>
                      <td className={styles.tdTitulo}>
                        <div className={styles.articleInfo}>
                          <h4>{article.title}</h4>
                          <p>{article.description}</p>
                        </div>
                      </td>
                      <td className={styles.tdEstado}>
                        <span className={`${styles.badge} ${styles[`badge${article.status?.replace(/\s+/g, '') || 'Completado'}`]}`}>
                          {article.status || 'Completado'}
                        </span>
                      </td>
                      <td className={styles.tdTecnologias}>
                        <div className={styles.techList}>
                          {article.technologies?.slice(0, 3).map((tech, index) => (
                            <span key={index} className={styles.badgeTec}>
                              {tech}
                            </span>
                          ))}
                          {article.technologies && article.technologies.length > 3 && (
                            <span className={styles.badgeTec}>
                              +{article.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={styles.tdAcciones}>
                        <div className={styles.tableActions}>
                          <button
                            className={styles.buttonIcon}
                            onClick={() => handleEdit(article)}
                            title="Editar proyecto"
                          >
                            ✏️
                          </button>
                          <button
                            className={styles.buttonIcon}
                            onClick={() => handleDelete(article)}
                            title="Eliminar proyecto"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArticlesAdmin;
