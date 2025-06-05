// src/components/sections/articles/ArticlesAdmin.tsx

import React, { useState, useEffect } from 'react';
import { 
  getAdminArticles, 
  createArticle, 
  updateArticle, 
  deleteArticle
} from '../../../services/api';
import type { Article } from '../../../services/api';
import { useNotificationContext } from '../../../contexts/NotificationContext';
import { LexicalEditor, MediaLibrary } from '../../ui';
import AdminModal, { type TabConfig, type ActionButton } from '../../ui/AdminModal';
import styles from './ArticlesAdmin.module.css';

/**
 * ArticlesAdmin Component - Modal de gestión de proyectos mejorado con AdminModal
 * 
 * Migrado para usar AdminModal con funcionalidades avanzadas:
 * - Sistema de navegación por tabs (Básico, Enlaces, Contenido, SEO)
 * - Búsqueda integrada en el header del modal
 * - Validación en tiempo real con indicadores visuales
 * - Barra de progreso dinámico
 * - Botones de acción personalizables
 * - Notificaciones integradas
 * - Estados de carga y manejo de errores
 * - Accesibilidad mejorada con shortcuts de teclado
 * 
 * @param onClose - Función para cerrar el modal
 */

interface ArticlesAdminProps {
  onClose: () => void;
}

interface SeoMetadata {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_featured?: boolean;
  reading_time?: number;
}

interface EnhancedArticle extends Omit<Article, 'id'> {
  seo_metadata?: SeoMetadata;
}

const emptyArticle: EnhancedArticle = {
  user_id: 1,
  title: '',
  description: '',
  image_url: '',
  github_url: '',
  live_url: '',
  article_url: '',
  article_content: '',
  video_demo_url: '',
  status: 'Completado',
  order_index: 0,
  technologies: [],
  project_start_date: '',
  project_end_date: '',
  seo_metadata: {
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_featured: false,
    reading_time: 5
  }
};

const ArticlesAdmin: React.FC<ArticlesAdminProps> = ({ onClose }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [form, setForm] = useState<EnhancedArticle>(emptyArticle);
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'links' | 'content' | 'seo'>('basic');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormState, setInitialFormState] = useState<EnhancedArticle>(emptyArticle);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Estados para filtrado y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'status' | 'created_at' | 'views'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { showSuccess, showError } = useNotificationContext();

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await getAdminArticles();
      setArticles(data);
    } catch (error) {
      showError('Error', 'No se pudieron cargar los proyectos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
    } catch (error) {
      showError('Error', 'No se pudieron cargar los proyectos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar y ordenar artículos
  const getFilteredAndSortedArticles = () => {
    let filtered = articles.filter(article => {
      // Filtro por término de búsqueda
      const searchMatch = searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.technologies || []).some(tech => 
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Filtro por estado
      const statusMatch = statusFilter === 'all' || article.status === statusFilter;

      // Filtro por tipo
      const typeMatch = typeFilter === 'all' || 
        (typeFilter === 'article' && article.article_content) ||
        (typeFilter === 'project' && !article.article_content);

      return searchMatch && statusMatch && typeMatch;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'views':
          comparison = (a.views || 0) - (b.views || 0);
          break;
        case 'created_at':
        default:
          comparison = new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  // Función para resetear filtros
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  // Función para verificar si hay filtros activos
  const hasActiveFilters = () => {
    return searchTerm !== '' || statusFilter !== 'all' || typeFilter !== 'all' || 
           sortBy !== 'created_at' || sortOrder !== 'desc';
  };

  // Función para manejar el ordenamiento por columna
  const handleSort = (column: 'title' | 'status' | 'created_at' | 'views') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };  // Función para manejar el botón "Nuevo Proyecto" - cambia a vista de edición
  const handleNewProject = () => {
    setEditingArticle(null);
    setForm(emptyArticle);
    setInitialFormState(emptyArticle);
    setCurrentView('edit');
    setActiveTab('basic');
    setValidationErrors({});
    setHasUnsavedChanges(false);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    
    // Parsear metadatos SEO si existen
    let seoMetadata = {
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      is_featured: false,
      reading_time: 5
    };
    
    if (article.meta_data) {
      try {
        const parsed = JSON.parse(article.meta_data);
        seoMetadata = { ...seoMetadata, ...parsed };
      } catch (error) {
        console.warn('Error parsing SEO metadata:', error);
      }
    }
      setForm({
      user_id: article.user_id,
      title: article.title,
      description: article.description,
      image_url: article.image_url || '',
      github_url: article.github_url || '',
      live_url: article.live_url || '',
      article_url: article.article_url || '',
      article_content: article.article_content || '',
      video_demo_url: article.video_demo_url || '',
      status: article.status,
      order_index: article.order_index,
      technologies: article.technologies || [],
      project_start_date: article.project_start_date || '',
      project_end_date: article.project_end_date || '',
      seo_metadata: seoMetadata
    });
    setInitialFormState({
      user_id: article.user_id,
      title: article.title,
      description: article.description,
      image_url: article.image_url || '',
      github_url: article.github_url || '',
      live_url: article.live_url || '',
      article_url: article.article_url || '',
      article_content: article.article_content || '',
      video_demo_url: article.video_demo_url || '',
      status: article.status,
      order_index: article.order_index,
      technologies: article.technologies || [],
      project_start_date: article.project_start_date || '',
      project_end_date: article.project_end_date || '',
      seo_metadata: seoMetadata
    });
    setCurrentView('edit');
    setActiveTab('basic');
    setValidationErrors({});
    setHasUnsavedChanges(false);
  };

  const handleDelete = async (article: Article) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${article.title}"?`)) {
      return;
    }    try {
      await deleteArticle(article.id);
      showSuccess('Éxito', 'Proyecto eliminado exitosamente');
      await loadArticles();
    } catch (error) {
      showError('Error', 'No se pudo eliminar el proyecto');
      console.error(error);
    }
  };
  const handleFormChange = (field: keyof typeof form, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };
  const handleAddTechnology = () => {
    if (techInput.trim() && !form.technologies?.includes(techInput.trim())) {
      setForm(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), techInput.trim()]
      }));
      setTechInput('');
      setHasUnsavedChanges(true);
    }
  };  const handleRemoveTechnology = (index: number) => {
    setForm(prev => ({
      ...prev,
      technologies: prev.technologies?.filter((_, i) => i !== index) || []
    }));
    setHasUnsavedChanges(true);
  };

  // Función de validación
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!form.title.trim()) {
      errors.title = 'El título es obligatorio';
    }
    
    if (!form.description.trim()) {
      errors.description = 'La descripción es obligatoria';
    }
    
    if (form.description.length > 200) {
      errors.description = 'La descripción no puede exceder 200 caracteres';
    }

    // Validación de fechas de proyecto
    if (form.project_start_date && form.project_end_date) {
      const startDate = new Date(form.project_start_date);
      const endDate = new Date(form.project_end_date);
      
      if (endDate < startDate) {
        errors.project_end_date = 'La fecha de finalización debe ser posterior a la fecha de inicio';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Mejorar la función handleSave con validación
  const handleSave = async () => {
    if (!validateForm()) {
      showError('Formulario incompleto', 'Por favor completa todos los campos requeridos');
      setActiveTab('basic'); // Cambiar al tab básico si hay errores
      return;
    }

    try {
      setSaving(true);
      
      // Extraemos los metadatos SEO antes de enviar al API
      const { seo_metadata, ...apiArticleData } = form;
        // Convertimos a JSON los metadatos SEO y los añadimos como propiedad
      const finalArticleData = {
        ...apiArticleData,
        meta_data: seo_metadata ? JSON.stringify(seo_metadata) : undefined
      };
      
      if (editingArticle) {
        await updateArticle(editingArticle.id, finalArticleData);
        showSuccess('Éxito', 'Proyecto actualizado exitosamente');
      } else {
        await createArticle(finalArticleData);
        showSuccess('Éxito', 'Proyecto creado exitosamente');
      }
        await loadArticles();
      setCurrentView('list');
      setEditingArticle(null);
      setForm(emptyArticle);
      setInitialFormState(emptyArticle);
      setActiveTab('basic');
      setValidationErrors({});
      setHasUnsavedChanges(false);
    } catch (error) {
      showError('Error', 'No se pudo guardar el proyecto');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Función para detectar si hay cambios no guardados
  const hasFormChanged = () => {
    return JSON.stringify(form) !== JSON.stringify(initialFormState);
  };

  // Función para manejar el cierre con confirmación
  const handleClose = () => {
    if (hasFormChanged() && hasUnsavedChanges) {
      const confirmed = confirm(
        '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.'
      );
      if (!confirmed) return;
    }
    
    setCurrentView('list');
    setActiveTab('basic');
    setValidationErrors({});
    setHasUnsavedChanges(false);
    setForm(emptyArticle);
    setInitialFormState(emptyArticle);
  };

  // Función para calcular el progreso del formulario
  const getFormProgress = () => {
    const requiredFields = ['title', 'description'];
    const completedRequired = requiredFields.filter(field => form[field as keyof typeof form]).length;
    const optionalFields = ['technologies', 'image_url', 'github_url', 'live_url'];
    const completedOptional = optionalFields.filter(field => {
      const value = form[field as keyof typeof form];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    }).length;
    
    const total = requiredFields.length + optionalFields.length;
    const completed = completedRequired + completedOptional;
    return Math.round((completed / total) * 100);
  };

  const renderListView = () => (
    <div className={styles.articlesAdminList}>
      <div className={styles.adminHeader}>
        <h2>Gestionar Proyectos</h2>
        <div className={styles.adminActions}>
          <button onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNewProject();
          }} className={styles.createButton}>
            <i className="fas fa-plus"></i> Nuevo Proyecto
          </button>
          <button onClick={onClose} className={styles.closeButton}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.adminLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando proyectos...</p>
        </div>
      ) : (
        <>
          {/* Barra de filtros y controles */}
          <div className={styles.tableControls}>
            <div className={styles.controlsRow}>
              {/* Buscador */}
              <div className={styles.searchBox}>
                <i className="fas fa-search" aria-hidden="true"></i>
                <input
                  type="text"
                  placeholder="Buscar por título, descripción o tecnología..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={styles.clearSearch}
                    aria-label="Limpiar búsqueda"
                    title="Limpiar búsqueda"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>

              {/* Filtros */}
              <div className={styles.filterSelect}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filtrar por estado"
                >
                  <option value="all">Todos los estados</option>
                  <option value="Completado">Completado</option>
                  <option value="En Desarrollo">En Desarrollo</option>
                  <option value="Borrador">Borrador</option>
                </select>
              </div>

              <div className={styles.filterSelect}>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  aria-label="Filtrar por tipo"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="project">Solo Proyectos</option>
                  <option value="article">Solo Artículos</option>
                </select>
              </div>

              {/* Botón para resetear filtros */}
              {hasActiveFilters() && (
                <button
                  onClick={resetFilters}
                  className={styles.resetFiltersButton}
                  title="Resetear todos los filtros"
                  aria-label="Resetear todos los filtros"
                >
                  <i className="fas fa-undo"></i>
                  Resetear
                </button>
              )}
            </div>

            {/* Estadísticas */}
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <i className="fas fa-list"></i>
                <span>
                  Mostrando {getFilteredAndSortedArticles().length} de {articles.length} elementos
                </span>
              </div>
              {searchTerm && (
                <div className={styles.statItem}>
                  <i className="fas fa-search"></i>
                  <span>Filtrado por: "{searchTerm}"</span>
                </div>
              )}
              {statusFilter !== 'all' && (
                <div className={styles.statItem}>
                  <i className="fas fa-filter"></i>
                  <span>Estado: {statusFilter}</span>
                </div>
              )}
              {typeFilter !== 'all' && (
                <div className={styles.statItem}>
                  <i className="fas fa-tag"></i>
                  <span>Tipo: {typeFilter === 'project' ? 'Proyectos' : 'Artículos'}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.articlesTableContainer}>
            <table className={styles.articlesTable}>
              <thead>
                <tr>
                  <th className={styles.thImagen}>Imagen</th>
                  <th 
                    className={`${styles.thTitulo} ${styles.sortable}`}
                    onClick={() => handleSort('title')}
                    role="button"
                    tabIndex={0}
                    aria-label="Ordenar por título"
                  >
                    Título / Resumen
                    {sortBy === 'title' && (
                      <i className={`fas fa-chevron-${sortOrder === 'asc' ? 'up' : 'down'}`} aria-hidden="true"></i>
                    )}
                  </th>
                  <th className={styles.thTipo}>Tipo</th>
                  <th 
                    className={`${styles.thEstado} ${styles.sortable}`}
                    onClick={() => handleSort('status')}
                    role="button"
                    tabIndex={0}
                    aria-label="Ordenar por estado"
                  >
                    Estado
                    {sortBy === 'status' && (
                      <i className={`fas fa-chevron-${sortOrder === 'asc' ? 'up' : 'down'}`} aria-hidden="true"></i>
                    )}
                  </th>
                  <th className={styles.thFechas}>Fechas</th>
                  <th 
                    className={`${styles.thVisitas} ${styles.sortable}`}
                    onClick={() => handleSort('views')}
                    role="button"
                    tabIndex={0}
                    aria-label="Ordenar por visitas"
                  >
                    Visitas
                    {sortBy === 'views' && (
                      <i className={`fas fa-chevron-${sortOrder === 'asc' ? 'up' : 'down'}`} aria-hidden="true"></i>
                    )}
                  </th>
                  <th className={styles.thTecnologias}>Tecnologías</th>
                  <th className={styles.thAcciones}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAndSortedArticles().map(article => (
                <tr key={article.id}>
                  {/* Imagen */}
                  <td className={styles.tdImagen}>
                    {article.image_url ? (
                      <img 
                        src={article.image_url} 
                        alt={article.title}
                        className={styles.articleThumbnail}
                      />
                    ) : (
                      <div className={styles.noImage}>
                        <i className="fas fa-image"></i>
                      </div>
                    )}
                  </td>

                  {/* Título / Resumen */}
                  <td className={styles.tdTitulo}>
                    <div className={styles.articleInfo}>
                      <h4 title={article.title}>
                        {article.title}
                      </h4>
                      <p title={article.description}>
                        {article.description}
                      </p>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className={styles.tdTipo}>
                    {article.article_content ? (
                      <span 
                        className={`${styles.badge} ${styles.badgeArticulo}`}
                        role="badge"
                        aria-label="Tipo de contenido: Artículo"
                      >
                        <span className={styles.badgeIcon}>📰</span>
                        Artículo
                      </span>
                    ) : (
                      <span 
                        className={`${styles.badge} ${styles.badgeProyecto}`}
                        role="badge"
                        aria-label="Tipo de contenido: Proyecto"
                      >
                        <span className={styles.badgeIcon}>&lt;/&gt;</span>
                        Proyecto
                      </span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className={styles.tdEstado}>
                    <span 
                      className={`${styles.badge} ${
                        article.status === 'Completado' ? styles.badgeCompletado :
                        article.status === 'En Desarrollo' ? styles.badgeEnDesarrollo :
                        styles.badgeBorrador
                      }`}
                      role="badge"
                      aria-label={`Estado del proyecto: ${article.status}`}
                    >
                      {article.status === 'Completado' ? 'COMPLETADO' : 
                       article.status === 'En Desarrollo' ? 'EN DESARROLLO' : 'BORRADOR'}
                    </span>
                  </td>

                  {/* Fechas */}
                  <td className={styles.tdFechas}>
                    {article.project_start_date && article.project_end_date ? (
                      <time 
                        dateTime={article.project_start_date}
                        title={`Proyecto desarrollado desde ${new Date(article.project_start_date).toLocaleDateString('es-ES')} hasta ${new Date(article.project_end_date).toLocaleDateString('es-ES')}`}
                      >
                        {(() => {
                          const startDate = new Date(article.project_start_date);
                          const endDate = new Date(article.project_end_date);
                          const startYear = startDate.getFullYear();
                          const endYear = endDate.getFullYear();
                          
                          if (startYear === endYear) {
                            return `${startDate.toLocaleDateString('es-ES', { month: 'short' })} - ${endDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
                          }
                          return `${startYear} - ${endYear}`;
                        })()}
                      </time>
                    ) : article.project_start_date ? (
                      <time 
                        dateTime={article.project_start_date}
                        title={`Proyecto iniciado en ${new Date(article.project_start_date).toLocaleDateString('es-ES')}`}
                      >
                        Desde {new Date(article.project_start_date).toLocaleDateString('es-ES', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </time>
                    ) : article.created_at ? (
                      <time 
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
                      <span>—</span>
                    )}
                  </td>

                  {/* Visitas */}
                  <td className={styles.tdVisitas}>
                    <span className={styles.visitasContainer} aria-label={`Número de visitas: ${article.views || 0}`}>
                      <i className="fas fa-eye" aria-hidden="true"></i>
                      {article.views || 0}
                    </span>
                  </td>

                  {/* Tecnologías */}
                  <td className={styles.tdTecnologias}>
                    <div className={styles.techList}>
                      {article.technologies?.slice(0, 3).map((tech, idx) => (
                        <span key={idx} className={styles.badgeTec}>{tech}</span>
                      ))}
                      {(article.technologies?.length || 0) > 3 && (
                        <span 
                          className={styles.badgeTec} 
                          title={`Tecnologías adicionales: ${article.technologies?.slice(3).join(', ')}`}
                        >
                          +{(article.technologies?.length || 0) - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className={styles.tdAcciones}>
                    <div className={styles.tableActions}>
                      <button 
                        onClick={() => {
                          // Si es artículo y tiene contenido, abrir página de artículo
                          if (article.article_content) {
                            window.open(`/article/${article.id}`, '_blank');
                          } else {
                            // Si es proyecto, abrir demo o GitHub
                            const url = article.live_url && article.live_url !== "#" 
                              ? article.live_url 
                              : article.github_url;
                            if (url) {
                              window.open(url, '_blank');
                            } else {
                              showError('Error', 'No hay enlaces disponibles para este proyecto');
                            }
                          }
                        }}
                        className={styles.buttonIcon}
                        aria-label={`Ver ${article.article_content ? 'artículo' : 'proyecto'}`}
                        title={article.article_content ? 'Ver artículo completo' : 'Ver proyecto en vivo'}
                      >
                        <i className={article.article_content ? "fas fa-newspaper" : "fas fa-external-link-alt"}></i>
                      </button>
                      <button 
                        onClick={() => handleEdit(article)}
                        className={styles.buttonIcon}
                        aria-label="Editar"
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(article)}
                        className={styles.buttonIcon}
                        aria-label="Eliminar"
                        title="Eliminar"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {articles.length === 0 && (
            <div className={styles.emptyState}>
              <i className="fas fa-newspaper"></i>
              <h3>No hay artículos</h3>
              <p>Crea tu primer artículo para comenzar.</p>
              <button onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNewProject();
              }} className={styles.createFirstButton}>
                <i className="fas fa-plus"></i> Crear primer artículo
              </button>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );

  const renderEditView = () => (
    <div className={styles.articlesAdminEdit}>
      <div className={styles.adminHeader}>
        <h2>{editingArticle ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
        <div className={styles.adminActions}>
          <div className={styles.progressIndicator}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${getFormProgress()}%` }}
              ></div>
            </div>
            <span className={styles.progressText}>
              {getFormProgress()}% completado
            </span>
          </div>
          <button 
            onClick={handleSave} 
            className={styles.saveButton}
            disabled={saving || !form.title || !form.description}
          >
            {saving ? (
              <>
                <div className={styles.buttonSpinner}></div>
                Guardando...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                {editingArticle ? 'Actualizar' : 'Crear'}
              </>
            )}
          </button>
          <button 
            onClick={handleClose} 
            className={styles.cancelButton}
          >
            <i className="fas fa-arrow-left"></i> Volver
          </button>
        </div>
      </div>      {/* Navegación por tabs */}
      <div className={styles.editTabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'basic' ? styles.active : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          <i className="fas fa-info-circle"></i>
          <span>Información Básica</span>
          {(!form.title || !form.description) && <span className={styles.tabWarning}>!</span>}
          {(form.title && form.description) && <span className={styles.tabComplete}>✓</span>}
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'links' ? styles.active : ''}`}
          onClick={() => setActiveTab('links')}
        >
          <i className="fas fa-link"></i>
          <span>Enlaces</span>
          {(form.github_url || form.live_url || form.article_url || form.video_demo_url) && <span className={styles.tabComplete}>✓</span>}
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'content' ? styles.active : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <i className="fas fa-edit"></i>
          <span>Contenido</span>
          {form.article_content && <span className={styles.tabComplete}>✓</span>}
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'seo' ? styles.active : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          <i className="fas fa-search"></i>
          <span>SEO</span>
          {(form.seo_metadata?.meta_title || form.seo_metadata?.meta_description || form.seo_metadata?.is_featured) && <span className={styles.tabComplete}>✓</span>}
        </button>
      </div>      {/* Contenido de los tabs */}
      <div className={styles.editForm}>
        {/* Tab: Información Básica */}
        {activeTab === 'basic' && (
          <div className={`${styles.tabContent} ${styles.active}`}>
            <div className={styles.formSection}>
              <h3>
                <i className="fas fa-info-circle"></i>
                Información General
              </h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>
                    Título *
                    {validationErrors.title && (
                      <span className={styles.errorText}>{validationErrors.title}</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => {
                      handleFormChange('title', e.target.value);
                      if (validationErrors.title) {
                        setValidationErrors(prev => ({ ...prev, title: '' }));
                      }
                    }}
                    placeholder="Título del proyecto (ej: E-commerce con React)"
                    className={validationErrors.title ? 'error' : ''}
                    required
                  />
                </div>
                  <div className={styles.formGroup}>
                  <label>Estado</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <option value="Completado">✅ Completado</option>
                    <option value="En desarrollo">🚧 En desarrollo</option>
                    <option value="Borrador">📝 Borrador</option>
                  </select>
                </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>
                    Descripción *
                    {validationErrors.description && (
                      <span className={styles.errorText}>{validationErrors.description}</span>
                    )}
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => {
                      handleFormChange('description', e.target.value);
                      if (validationErrors.description) {
                        setValidationErrors(prev => ({ ...prev, description: '' }));
                      }
                    }}
                    placeholder="Descripción breve que aparecerá en la tarjeta del proyecto"
                    rows={3}
                    className={validationErrors.description ? styles.error : ''}
                    required
                  />
                  <div className={styles.characterCounter}>
                    {form.description.length}/200 caracteres
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>
                    URL de Imagen
                    <span className={styles.helperText}>
                      Recomendado: 1200x800px
                    </span>
                  </label>
                  <div className={styles.imageInputGroup}>
                    <input
                      type="url"
                      value={form.image_url}
                      onChange={(e) => handleFormChange('image_url', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowMediaLibrary(true)}
                      className={styles.mediaLibraryButton}
                      title="Abrir biblioteca de medios"
                    >
                      <i className="fas fa-images"></i>
                    </button>
                  </div>
                  {form.image_url && (
                    <div className={styles.imagePreview}>
                      <img src={form.image_url} alt="Vista previa" />
                    </div>
                  )}
                </div>
                  <div className={styles.formGroup}>
                  <label>
                    Orden de visualización
                    <span className={styles.helperText}>
                      Mayor número = aparece primero
                    </span>
                  </label>
                  <input
                    type="number"
                    value={form.order_index}
                    onChange={(e) => handleFormChange('order_index', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* Nueva sección: Fechas del proyecto */}
            <div className={styles.formSection}>
              <h3>
                <i className="fas fa-calendar-alt"></i>
                Duración del proyecto
                <span className={styles.optionalBadge}>Opcional</span>
              </h3>
              <div className={styles.projectDatesInfo}>
                <p>
                  <i className="fas fa-info-circle"></i>
                  Las fechas de proyecto se mostrarán en lugar de la fecha de creación cuando estén disponibles.
                </p>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>
                    <i className="fas fa-play"></i>
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    value={form.project_start_date || ''}
                    onChange={(e) => handleFormChange('project_start_date', e.target.value)}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>
                    <i className="fas fa-stop"></i>
                    Fecha de finalización
                    {validationErrors.project_end_date && (
                      <span className={styles.errorText}>{validationErrors.project_end_date}</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={form.project_end_date || ''}
                    onChange={(e) => {
                      handleFormChange('project_end_date', e.target.value);
                      if (validationErrors.project_end_date) {
                        setValidationErrors(prev => ({ ...prev, project_end_date: '' }));
                      }
                    }}
                    min={form.project_start_date || ''}
                    className={validationErrors.project_end_date ? styles.error : ''}
                  />
                </div>
              </div>
              
              {form.project_start_date && form.project_end_date && (
                <div className={styles.datePreview}>
                  <i className="fas fa-calendar-check"></i>
                  <span>
                    Duración: {new Date(form.project_start_date).toLocaleDateString('es-ES', {
                      month: 'short',
                      year: 'numeric'
                    })} - {new Date(form.project_end_date).toLocaleDateString('es-ES', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>            <div className={styles.formSection}>
              <h3>
                <i className="fas fa-code"></i>
                Tecnologías utilizadas
              </h3>
              <div className={styles.techInputGroup}>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="Agregar tecnología (ej: React, Node.js, MongoDB)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTechnology();
                    }
                  }}
                />
                <button 
                  type="button" 
                  onClick={handleAddTechnology}
                  className={styles.addTechButton}
                  disabled={!techInput.trim()}
                >
                  <i className="fas fa-plus"></i>
                  Agregar
                </button>
              </div>
              
              <div className={styles.techTags}>
                {form.technologies?.length === 0 && (
                  <div className={styles.emptyTechState}>
                    <i className="fas fa-code"></i>
                    <p>No hay tecnologías agregadas</p>
                    <small>Agrega las tecnologías principales del proyecto</small>
                  </div>
                )}
                {form.technologies?.map((tech, index) => (
                  <span key={index} className={`${styles.techTagEnhanced}`}>
                    <i className="fas fa-tag"></i>
                    {tech}
                    <button 
                      type="button"
                      onClick={() => handleRemoveTechnology(index)}
                      className={styles.removeTech}
                      title="Eliminar tecnología"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ))}
              </div>
              
              {form.technologies && form.technologies.length > 0 && (
                <div className={styles.techSummary}>
                  <span className={styles.techCount}>
                    <i className="fas fa-check-circle"></i>
                    {form.technologies.length} tecnología{form.technologies.length !== 1 ? 's' : ''} agregada{form.technologies.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}        {/* Tab: Enlaces y Recursos */}
        {activeTab === 'links' && (
          <div className={`${styles.tabContent} ${styles.active}`}>
            <div className={styles.formSection}>
              <h3>
                <i className="fas fa-link"></i>
                Enlaces del proyecto
              </h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>
                    <i className="fab fa-github"></i>
                    Repositorio de GitHub
                  </label>
                  <input
                    type="url"
                    value={form.github_url}
                    onChange={(e) => handleFormChange('github_url', e.target.value)}
                    placeholder="https://github.com/usuario/proyecto"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>
                    <i className="fas fa-external-link-alt"></i>
                    Demo en vivo
                  </label>
                  <input
                    type="url"
                    value={form.live_url}
                    onChange={(e) => handleFormChange('live_url', e.target.value)}
                    placeholder="https://mi-proyecto.vercel.app"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>
                    <i className="fas fa-newspaper"></i>
                    Artículo externo
                    <span className={styles.helperText}>
                      Enlace a artículo en blog externo
                    </span>
                  </label>
                  <input
                    type="url"
                    value={form.article_url}
                    onChange={(e) => handleFormChange('article_url', e.target.value)}
                    placeholder="https://dev.to/usuario/mi-articulo"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>
                    <i className="fas fa-video"></i>
                    Video demostración
                    <span className={styles.helperText}>
                      YouTube, Vimeo o archivo MP4
                    </span>
                  </label>
                  <input
                    type="url"
                    value={form.video_demo_url}
                    onChange={(e) => handleFormChange('video_demo_url', e.target.value)}
                    placeholder="https://youtube.com/watch?v=... o archivo.mp4"
                  />
                </div>
              </div>
              
              <div className={styles.linksPreview}>
                <h4>Vista previa de enlaces</h4>
                <div className={styles.linksGrid}>
                  {form.github_url && (
                    <div className={styles.linkPreview}>
                      <i className="fab fa-github"></i>
                      <span>Código fuente</span>
                      <small>{form.github_url}</small>
                    </div>
                  )}
                  {form.live_url && (
                    <div className={styles.linkPreview}>
                      <i className="fas fa-external-link-alt"></i>
                      <span>Demo en vivo</span>
                      <small>{form.live_url}</small>
                    </div>
                  )}
                  {form.article_url && (
                    <div className={styles.linkPreview}>
                      <i className="fas fa-newspaper"></i>
                      <span>Artículo</span>
                      <small>{form.article_url}</small>
                    </div>
                  )}
                  {form.video_demo_url && (
                    <div className={styles.linkPreview}>
                      <i className="fas fa-video"></i>
                      <span>Video demo</span>
                      <small>{form.video_demo_url}</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}        {/* Tab: Contenido */}
        {activeTab === 'content' && (
          <div className={`${styles.tabContent} ${styles.active}`}>
            <div className={styles.formSection}>
              <h3>
                <i className="fas fa-edit"></i>
                Contenido del artículo
                <span className={styles.optionalBadge}>Opcional</span>
              </h3>
              <div className={styles.contentInfo}>
                <p>
                  <i className="fas fa-info-circle"></i>
                  Si agregas contenido aquí, el proyecto aparecerá como un artículo completo 
                  en la sección de blog, además de como proyecto en el portafolio.
                </p>
              </div>
              
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <div className={styles.editorContainer}>
                  <LexicalEditor
                    content={form.article_content || ''}
                    onChange={(content: string) => handleFormChange('article_content', content)}
                    placeholder="Escribe el contenido completo del artículo aquí...

Puedes incluir:
• Descripción detallada del proyecto
• Proceso de desarrollo
• Tecnologías utilizadas y por qué
• Desafíos enfrentados
• Aprendizajes obtenidos
• Capturas de pantalla del resultado"
                  />
                </div>
              </div>
              
              {form.article_content && (
                <div className={styles.contentStats}>
                  <div className={styles.statItem}>
                    <i className="fas fa-file-alt"></i>
                    <span>{form.article_content.length} caracteres</span>
                  </div>
                  <div className={styles.statItem}>
                    <i className="fas fa-clock"></i>
                    <span>~{Math.ceil(form.article_content.length / 1000)} min lectura</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}        {/* Tab: SEO */}
        {activeTab === 'seo' && (
          <div className={`${styles.tabContent} ${styles.active}`}>
            <div className={styles.formSection}>
              <h3>
                <i className="fas fa-search"></i>
                Optimización para buscadores (SEO)
                <span className={styles.optionalBadge}>Opcional</span>
              </h3>
              
              <div className={styles.seoInfo}>
                <p>
                  <i className="fas fa-lightbulb"></i>
                  Mejora la visibilidad de tu proyecto en buscadores como Google
                </p>
              </div>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>
                    Título para SEO
                    <span className={styles.helperText}>
                      Título optimizado para buscadores (máx. 60 caracteres)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.seo_metadata?.meta_title || ''}
                    onChange={(e) => setForm({
                      ...form,
                      seo_metadata: { ...form.seo_metadata!, meta_title: e.target.value }
                    })}
                    placeholder={form.title || 'Título optimizado para buscadores'}
                    maxLength={60}
                  />
                  <div className={styles.characterCounter}>
                    {(form.seo_metadata?.meta_title?.length || 0)}/60 caracteres
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>
                    Tiempo de lectura (minutos)
                    <span className={styles.helperText}>
                      Solo aplica si tiene contenido de artículo
                    </span>
                  </label>
                  <input
                    type="number"
                    value={form.seo_metadata?.reading_time || 5}
                    onChange={(e) => setForm({
                      ...form,
                      seo_metadata: { ...form.seo_metadata!, reading_time: parseInt(e.target.value) || 5 }
                    })}
                    min="1"
                    max="60"
                    disabled={!form.article_content}
                  />
                </div>
                
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>
                    Descripción para SEO
                    <span className={styles.helperText}>
                      Descripción que aparecerá en resultados de búsqueda (máx. 160 caracteres)
                    </span>
                  </label>
                  <textarea
                    value={form.seo_metadata?.meta_description || ''}
                    onChange={(e) => setForm({
                      ...form,
                      seo_metadata: { ...form.seo_metadata!, meta_description: e.target.value }
                    })}
                    placeholder={form.description || 'Descripción optimizada para aparecer en Google y otros buscadores'}
                    rows={3}
                    maxLength={160}
                  />
                  <div className={styles.characterCounter}>
                    {(form.seo_metadata?.meta_description?.length || 0)}/160 caracteres
                  </div>
                </div>
                
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>
                    Palabras clave
                    <span className={styles.helperText}>
                      Separadas por comas (ej: react, javascript, frontend, web development)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.seo_metadata?.meta_keywords || ''}
                    onChange={(e) => setForm({
                      ...form,
                      seo_metadata: { ...form.seo_metadata!, meta_keywords: e.target.value }
                    })}
                    placeholder="react, javascript, ui, desarrollo web, frontend"
                  />
                </div>
                
                <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
                  <label className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      checked={form.seo_metadata?.is_featured || false}
                      onChange={(e) => setForm({
                        ...form,
                        seo_metadata: { ...form.seo_metadata!, is_featured: e.target.checked }
                      })}
                    />
                    <span className={styles.checkmark}></span>
                    <span className={styles.checkboxLabel}>
                      <strong>Destacar este proyecto</strong>
                      <small>Aparecerá con mayor prioridad en el portafolio</small>
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Vista previa de Google */}
              <div className={styles.seoPreview}>
                <h4>
                  <i className="fab fa-google"></i>
                  Vista previa en Google
                </h4>
                <div className={styles.googlePreview}>
                  <div className={styles.previewTitle}>
                    {form.seo_metadata?.meta_title || form.title || 'Título del proyecto'}
                  </div>
                  <div className={styles.previewUrl}>
                    miportfolio.com › proyectos › {form.title?.toLowerCase().replace(/\s+/g, '-') || 'titulo-proyecto'}
                  </div>
                  <div className={styles.previewDescription}>
                    {form.seo_metadata?.meta_description || form.description || 'Descripción del proyecto que aparecerá en los resultados de búsqueda de Google y otros motores de búsqueda.'}
                  </div>
                  {form.seo_metadata?.is_featured && (
                    <div className={styles.previewFeatured}>
                      ⭐ Proyecto destacado
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Biblioteca de medios modal */}
      {showMediaLibrary && (
        <MediaLibrary
          onSelect={(imageUrl: string) => {
            handleFormChange('image_url', imageUrl);
            setShowMediaLibrary(false);
          }}
          onClose={() => setShowMediaLibrary(false)}
        />
      )}
    </div>
  );

  return (
    <>
      {currentView === 'list' ? (
        renderListView()
      ) : (
        <ModalPortal>
          <div className={styles.articlesAdminModal}>
            <div className={styles.modalOverlay} onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}></div>
              <div className={styles.modalContent}>
                {renderEditView()}
              </div>
            </div>
        </ModalPortal>
      )}
      
      {/* Biblioteca de medios modal */}
      {showMediaLibrary && (
        <MediaLibrary
          onSelect={(imageUrl: string) => {
            handleFormChange('image_url', imageUrl);
            setShowMediaLibrary(false);
          }}
          onClose={() => setShowMediaLibrary(false)}
        />
      )}
    </>
  );
};

export default ArticlesAdmin;
