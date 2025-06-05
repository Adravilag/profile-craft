// filepath: d:\Profesional\cv-maker\frontend\src\components\sections\articles\ArticlesAdmin.new.tsx

import React, { useState, useEffect } from 'react';
import { 
  getAdminArticles, 
  createArticle, 
  updateArticle, 
  deleteArticle
} from '../../../services/api';
import type { Article } from '../../../services/api';
import { useNotificationContext } from '../../../contexts/NotificationContext';
import { MediaLibrary } from '../../ui';
import LexicalEditorNew from '../../ui/LexicalEditorNew';
import AdminModal, { type TabConfig, type ActionButton } from '../../ui/AdminModal';
import styles from './ArticlesAdmin.module.css';

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
  const [showEditModal, setShowEditModal] = useState(false);

  // Estados para filtrado y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'status' | 'created_at' | 'views'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { showSuccess, showError } = useNotificationContext();

  // Datos mock para desarrollo y demostración
  const mockArticles: Article[] = [
    {
      id: 1,
      user_id: 1,
      title: 'AirPixel - Generador de Imágenes IA',
      description: 'Aplicación web avanzada que utiliza IA para generar imágenes personalizadas con múltiples estilos artísticos.',
      image_url: '/assets/images/projects/airpixel-preview.jpg',
      github_url: 'https://github.com/usuario/airpixel',
      live_url: 'https://airpixel.demo.com',
      article_url: 'https://blog.ejemplo.com/airpixel-ia-generacion',
      article_content: '<p>Este proyecto combina tecnologías de vanguardia...</p>',
      video_demo_url: 'https://youtube.com/watch?v=demo123',
      status: 'Completado',
      order_index: 1,
      technologies: ['React', 'TypeScript', 'OpenAI API', 'Tailwind CSS', 'Node.js'],
      project_start_date: '2024-01-15',
      project_end_date: '2024-04-20',
      views: 1247,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-04-20T15:30:00Z'
    },
    {
      id: 2,
      user_id: 1,
      title: 'TaskManager Pro - Gestión de Proyectos',
      description: 'Sistema completo de gestión de tareas y proyectos con colaboración en tiempo real y análisis de productividad.',
      image_url: '/assets/images/projects/taskmanager-preview.jpg',
      github_url: 'https://github.com/usuario/taskmanager-pro',
      live_url: 'https://taskmanager-pro.demo.com',
      article_url: '',
      article_content: '<p>Una solución integral para equipos de desarrollo...</p>',
      video_demo_url: '',
      status: 'En Desarrollo',
      order_index: 2,
      technologies: ['Vue.js', 'TypeScript', 'Firebase', 'Vuetify', 'Express.js'],
      project_start_date: '2024-03-01',
      project_end_date: '',
      views: 856,
      created_at: '2024-03-01T09:00:00Z',
      updated_at: '2024-12-01T12:15:00Z'
    },
    {
      id: 3,
      user_id: 1,
      title: 'TypeScript Advanced Guide',
      description: 'Guía completa y práctica de TypeScript avanzado con ejemplos reales y mejores prácticas para desarrolladores.',
      image_url: '/assets/images/articles/typescript-guide.jpg',
      github_url: 'https://github.com/usuario/typescript-guide',
      live_url: '',
      article_url: 'https://blog.ejemplo.com/typescript-guia-avanzada',
      article_content: '<p>TypeScript se ha convertido en una herramienta esencial...</p>',
      video_demo_url: '',
      status: 'Completado',
      order_index: 3,
      technologies: ['TypeScript', 'Node.js', 'Jest', 'Webpack'],
      project_start_date: '2024-05-10',
      project_end_date: '2024-06-15',
      views: 2134,
      created_at: '2024-05-10T14:00:00Z',
      updated_at: '2024-06-15T16:45:00Z'
    }
  ];

  useEffect(() => {
    // En desarrollo, usar datos mock
    if (process.env.NODE_ENV === 'development') {
      setArticles(mockArticles);
      setLoading(false);
    } else {
      loadArticles();
    }
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

  // Configuración de tabs para AdminModal
  const getTabsConfig = (): TabConfig[] => {
    const isBasicValid = form.title.trim() && form.description.trim();
    const hasLinks = !!(form.github_url || form.live_url || form.article_url || form.video_demo_url);
    const hasContent = !!form.article_content;
    const hasSeo = !!(
      form.seo_metadata?.meta_title ||
      form.seo_metadata?.meta_description ||
      form.seo_metadata?.is_featured
    );

    return [
      {
        id: 'basic',
        label: 'Información Básica',
        icon: 'fas fa-info-circle',
        badge: isBasicValid ? '✓' : '!',
        tooltip: isBasicValid ? 'Información básica completa' : 'Completa los campos obligatorios'
      },
      {
        id: 'links',
        label: 'Enlaces',
        icon: 'fas fa-link',
        badge: hasLinks ? '✓' : undefined,
        tooltip: hasLinks ? 'Enlaces configurados' : 'Agrega enlaces del proyecto'
      },
      {
        id: 'content',
        label: 'Contenido',
        icon: 'fas fa-edit',
        badge: hasContent ? '✓' : undefined,
        tooltip: hasContent ? 'Contenido agregado' : 'Agrega contenido del artículo'
      },
      {
        id: 'seo',
        label: 'SEO',
        icon: 'fas fa-search',
        badge: hasSeo ? '✓' : undefined,
        tooltip: hasSeo ? 'SEO configurado' : 'Optimiza para motores de búsqueda'
      }
    ];
  };

  // Configuración de botones de acción para AdminModal
  const getActionButtons = (): ActionButton[] => {
    const canSave = form.title.trim() && form.description.trim() && !saving;

    return [
      {
        id: 'save',
        label: saving ? 'Guardando...' : (editingArticle ? 'Actualizar' : 'Crear'),
        variant: 'primary',
        icon: saving ? 'fas fa-spinner fa-spin' : 'fas fa-save',
        loading: saving,
        disabled: !canSave,
        onClick: handleSave,
        tooltip: canSave ? 'Guardar proyecto' : 'Completa los campos requeridos'
      },
      {
        id: 'cancel',
        label: 'Cancelar',
        variant: 'secondary',
        icon: 'fas fa-times',
        onClick: () => setShowEditModal(false),
        tooltip: 'Cancelar y volver a la lista'
      }
    ];
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
      const isProject = ['Completado', 'en-curso', 'Pendiente'].includes(article.status);
      const typeMatch = typeFilter === 'all' ||
        (typeFilter === 'proyecto' && isProject) ||
        (typeFilter === 'articulo' && !isProject);

      return searchMatch && statusMatch && typeMatch;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'views':
          aValue = a.views || 0;
          bValue = b.views || 0;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at || '').getTime();
          bValue = new Date(b.created_at || '').getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
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
    return (
      searchTerm !== '' ||
      statusFilter !== 'all' ||
      typeFilter !== 'all' ||
      sortBy !== 'created_at' ||
      sortOrder !== 'desc'
    );
  };

  // Función para manejar el ordenamiento por columna
  const handleSort = (column: 'title' | 'status' | 'created_at' | 'views') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Función para manejar el botón "Nuevo Proyecto"  const handleNewProject = () => {
    setEditingArticle(null);
    setForm(emptyArticle);
    setActiveTab('basic');
    setValidationErrors({});
    setHasUnsavedChanges(false);
    setShowEditModal(true);
  };

  // Función para manejar edición existente
  const handleEdit = (article: Article) => {
    setEditingArticle(article);

    let seoMetadata: SeoMetadata = {
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

    const formData: EnhancedArticle = {
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
      seo_metadata
    };

    setForm(formData);
    setActiveTab('basic');
    setValidationErrors({});
    setHasUnsavedChanges(false);
    setShowEditModal(true);
  };

  // Función para eliminar
  const handleDelete = async (article: Article) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${article.title}"?`)) {
      return;
    }

    try {
      await deleteArticle(article.id);
      showSuccess('Éxito', 'Proyecto eliminado exitosamente');
      await loadArticles();
    } catch (error) {
      showError('Error', 'No se pudo eliminar el proyecto');
      console.error(error);
    }
  };

  // Manejo de cambios en el formulario
  const handleFormChange = (field: keyof EnhancedArticle, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);

    // Si existía un error de validación en ese campo, lo limpio
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Agregar tecnología
  const handleAddTechnology = () => {
    if (techInput.trim() && !form.technologies?.includes(techInput.trim())) {
      setForm(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), techInput.trim()]
      }));
      setTechInput('');
      setHasUnsavedChanges(true);
    }
  };

  // Eliminar tecnología
  const handleRemoveTechnology = (index: number) => {
    setForm(prev => ({
      ...prev,
      technologies: prev.technologies?.filter((_, i) => i !== index) || []
    }));
    setHasUnsavedChanges(true);
  };

  // Validación de formulario
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
  // Renderizado de badges de Tipo (Proyecto vs Artículo)
  const renderTypeBadge = (status: string) => {
    const isProject = ['Completado', 'En Desarrollo', 'Pausado'].includes(status);
    if (isProject) {
      return <span className={styles.badgeProyecto}>Proyecto</span>;
    } else {
      return <span className={styles.badgeArticulo}>Artículo</span>;
    }
  };
  // Renderizado de badge de Estado
  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'Completado': styles.badgeCompletado,
      'En Desarrollo': styles.badgeEnCurso,
      'Pausado': styles.badgePendiente,
      'Borrador': styles.badgeBorrador
    };

    const className = statusMap[status] || styles.badgeBorrador;
    return <span className={className}>{status}</span>;
  };

  // Renderizado de Fechas (inicio / fin)
  const renderDates = (startDate: string, endDate: string) => {
    const formatDate = (date: string) => {
      if (!date) return null;
      return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    if (!start && !end) {
      return <span className={styles.sinFecha}>Sin fechas</span>;
    }

    return (
      <div>
        {start && <div><strong>Inicio:</strong> {start}</div>}
        {end && <div><strong>Fin:</strong> {end}</div>}
      </div>
    );
  };

  // Renderizado de tecnologías (hasta 3 + “+N más”)
  const renderTechnologies = (technologies: string[]) => {
    if (!technologies || technologies.length === 0) {
      return <span className={styles.sinFecha}>Sin tecnologías</span>;
    }

    return (
      <div className={styles.techContainer}>
        {technologies.slice(0, 3).map((tech, index) => (
          <span key={index} className={styles.badgeTec}>
            {tech}
          </span>
        ))}
        {technologies.length > 3 && (
          <span className={styles.badgeTec}>
            +{technologies.length - 3} más
          </span>
        )}
      </div>
    );
  };

  // =======================================
  //  RENDERIZADO PRINCIPAL DE LA PÁGINA
  // =======================================
  const renderMainContent = () => {
    // Aplicar filtros y búsqueda
    const filteredArticles = articles.filter(article => {
      const matchesSearch =
        searchTerm === '' ||
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.technologies?.some(tech =>
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        );      const matchesStatus = statusFilter === 'all' || article.status === statusFilter;

      const isProject = ['Completado', 'En Desarrollo', 'Pausado'].includes(article.status);
      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'proyecto' && isProject) ||
        (typeFilter === 'articulo' && !isProject);

      return matchesSearch && matchesStatus && matchesType;
    });

    // Aplicar ordenamiento
    const sortedArticles = [...filteredArticles].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'views':
          aValue = a.views || 0;
          bValue = b.views || 0;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at || '').getTime();
          bValue = new Date(b.created_at || '').getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return (
      <div className={styles.pageContainer}>
        {/* Header de la página */}
        <div className={styles.pageHeader}>
          <h1>
            <i className="fas fa-project-diagram" /> Gestión de Proyectos y Artículos
          </h1>
          <p className={styles.subtitulo}>
            Administra tus proyectos de desarrollo y artículos técnicos desde un solo lugar
          </p>
        </div>

        {/* Panel de filtros */}
        <div className={styles.filtersPanel}>
          <button
            className={`${styles.filterButton} ${typeFilter === 'all' ? styles.active : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            <i className="fas fa-th-large" />
            Todos
          </button>
          <button
            className={`${styles.filterButton} ${typeFilter === 'proyecto' ? styles.active : ''}`}
            onClick={() => setTypeFilter('proyecto')}
          >
            <i className="fas fa-code" />
            Proyectos
          </button>
          <button
            className={`${styles.filterButton} ${typeFilter === 'articulo' ? styles.active : ''}`}
            onClick={() => setTypeFilter('articulo')}
          >
            <i className="fas fa-newspaper" />
            Artículos
          </button>

          <div
            style={{
              margin: '0 16px',
              height: '24px',
              width: '1px',
              backgroundColor: 'rgba(255,255,255,0.2)'
            }}
          />

          <button
            className={`${styles.filterButton} ${statusFilter === 'all' ? styles.active : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Todos los estados
          </button>
          <button
            className={`${styles.filterButton} ${statusFilter === 'Completado' ? styles.active : ''}`}
            onClick={() => setStatusFilter('Completado')}
          >
            Completados
          </button>          <button
            className={`${styles.filterButton} ${statusFilter === 'En Desarrollo' ? styles.active : ''}`}
            onClick={() => setStatusFilter('En Desarrollo')}
          >
            En desarrollo
          </button>

          <div className={styles.filtersCount}>
            <i className="fas fa-list iconList" />
            {sortedArticles.length} de {articles.length} elementos
          </div>
        </div>

        {/* Tabla de proyectos/artículos */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.imagen}>Imagen</th>
                <th className={styles.titulo}>Título y Resumen</th>
                <th className={styles.tipo}>Tipo</th>
                <th className={styles.estado}>Estado</th>
                <th className={styles.fechas}>Fechas del Proyecto</th>
                <th className={styles.visitas}>Visitas</th>
                <th className={styles.tecnologias}>Tecnologías</th>
                <th className={styles.acciones}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedArticles.map(article => (
                <tr key={article.id}>
                  <td className={styles.imagen}>
                    <img
                      src={article.image_url || '/assets/images/placeholder-project.jpg'}
                      alt={article.title}
                      onError={e => {
                        (e.target as HTMLImageElement).src = '/assets/images/placeholder-project.jpg';
                      }}
                    />
                  </td>
                  <td className={styles.titulo}>
                    <h4>{article.title}</h4>
                    <p>{article.description}</p>
                  </td>
                  <td className={styles.tipo}>{renderTypeBadge(article.status)}</td>
                  <td className={styles.estado}>{renderStatusBadge(article.status)}</td>
                  <td className={styles.fechas}>
                    {renderDates(article.project_start_date || '', article.project_end_date || '')}
                  </td>
                  <td className={styles.visitas}>
                    <i className="fas fa-eye iconEye" />
                    {article.views || 0}
                  </td>
                  <td className={styles.tecnologias}>
                    {renderTechnologies(article.technologies || [])}
                  </td>
                  <td className={styles.acciones}>
                    <button
                      className={styles.buttonIcon}
                      onClick={() => handleEdit(article)}
                      title="Editar proyecto"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      className={styles.buttonIcon}
                      onClick={() => handleDelete(article)}
                      title="Eliminar proyecto"
                    >
                      <i className="fas fa-trash" />
                    </button>
                    {article.live_url && (
                      <button
                        className={styles.buttonIcon}
                        onClick={() => window.open(article.live_url, '_blank')}
                        title="Ver demo en vivo"
                      >
                        <i className="fas fa-external-link-alt" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedArticles.length === 0 && (
            <div className={styles.emptyState}>
              <i className="fas fa-search" />
              <h3>No se encontraron resultados</h3>
              <p>Intenta ajustar los filtros o términos de búsqueda</p>
            </div>
          )}
        </div>
      </div>
    ); // <<<– Aquí cerramos el return(...) de renderMainContent
  }; // <<<– Y aquí cerramos la llave de la función renderMainContent

  // =======================================
  //  Función para guardar (Crear/Actualizar)
  // =======================================
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
      setShowEditModal(false);
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

  // =======================================
  //  Función para calcular el progreso
  // =======================================
  const getFormProgress = () => {
    const requiredFields = ['title', 'description'];
    const completedRequired = requiredFields.filter(field => !!form[field as keyof EnhancedArticle]).length;

    const optionalFields = ['technologies', 'image_url', 'github_url', 'live_url'];
    const completedOptional = optionalFields.filter(field => {
      const value = form[field as keyof EnhancedArticle];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    }).length;

    const total = requiredFields.length + optionalFields.length;
    const completed = completedRequired + completedOptional;
    return Math.round((completed / total) * 100);
  };

  // =======================================
  //  Renderizado de cada tab
  // =======================================
  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'basic':
        return renderBasicTab();
      case 'links':
        return renderLinksTab();
      case 'content':
        return renderContentTab();
      case 'seo':
        return renderSeoTab();
      default:
        return null;
    }
  };

  const renderBasicTab = () => (
    <div className={styles.tabContent}>
      {/* === Información General === */}
      <div className={styles.formSection}>
        <h3>
          <i className="fas fa-info-circle" /> Información General
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
              onChange={e => handleFormChange('title', e.target.value)}
              placeholder="Título del proyecto (ej: E-commerce con React)"
              className={validationErrors.title ? styles.error : ''}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Estado</label>
            <select
              value={form.status}
              onChange={e => handleFormChange('status', e.target.value)}
            >
              <option value="Completado">✅ Completado</option>
              <option value="en-curso">🚧 En curso</option>
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
              onChange={e => handleFormChange('description', e.target.value)}
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
              <span className={styles.helperText}>Recomendado: 1200×800px</span>
            </label>
            <div className={styles.imageInputGroup}>
              <input
                type="url"
                value={form.image_url}
                onChange={e => handleFormChange('image_url', e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
              <button
                type="button"
                onClick={() => setShowMediaLibrary(true)}
                className={styles.mediaLibraryButton}
                title="Abrir biblioteca de medios"
              >
                <i className="fas fa-images" />
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
              <span className={styles.helperText}>Mayor número = aparece primero</span>
            </label>
            <input
              type="number"
              value={form.order_index}
              onChange={e => handleFormChange('order_index', parseInt(e.target.value) || 0)}
              min={0}
              max={100}
            />
          </div>
        </div>
      </div>

      {/* === Fechas del proyecto === */}
      <div className={styles.formSection}>
        <h3>
          <i className="fas fa-calendar-alt" /> Duración del proyecto
          <span className={styles.optionalBadge}>Opcional</span>
        </h3>
        <div className={styles.projectDatesInfo}>
          <p>
            <i className="fas fa-info-circle" /> Las fechas de proyecto se mostrarán
            en lugar de la fecha de creación cuando estén disponibles.
          </p>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>
              <i className="fas fa-play" /> Fecha de inicio
            </label>
            <input
              type="date"
              value={form.project_start_date || ''}
              onChange={e => handleFormChange('project_start_date', e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>
              <i className="fas fa-stop" /> Fecha de finalización
              {validationErrors.project_end_date && (
                <span className={styles.errorText}>{validationErrors.project_end_date}</span>
              )}
            </label>
            <input
              type="date"
              value={form.project_end_date || ''}
              onChange={e => handleFormChange('project_end_date', e.target.value)}
              min={form.project_start_date || ''}
              className={validationErrors.project_end_date ? styles.error : ''}
            />
          </div>
        </div>
      </div>

      {/* === Tecnologías === */}
      <div className={styles.formSection}>
        <h3>
          <i className="fas fa-code" /> Tecnologías utilizadas
          <span className={styles.optionalBadge}>Opcional</span>
        </h3>
        <div className={styles.techInputGroup}>
          <input
            type="text"
            value={techInput}
            onChange={e => setTechInput(e.target.value)}
            placeholder="Ej: React, TypeScript, Node.js..."
            onKeyPress={e => {
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
            <i className="fas fa-plus" /> Agregar
          </button>
        </div>

        {form.technologies && form.technologies.length > 0 && (
          <div className={styles.techList}>
            {form.technologies.map((tech, index) => (
              <span key={index} className={styles.techTag}>
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTechnology(index)}
                  className={styles.removeTech}
                  aria-label={`Eliminar ${tech}`}
                >
                  <i className="fas fa-times" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // =======================================
  //  Funciones para cada tab
  // =======================================
  const renderLinksTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.formSection}>
        <h3>
          <i className="fas fa-link" /> Enlaces del proyecto
        </h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>
              <i className="fab fa-github" /> GitHub Repository
            </label>
            <input
              type="url"
              value={form.github_url}
              onChange={e => handleFormChange('github_url', e.target.value)}
              placeholder="https://github.com/usuario/repositorio"
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <i className="fas fa-external-link-alt" /> Demo en vivo
            </label>
            <input
              type="url"
              value={form.live_url}
              onChange={e => handleFormChange('live_url', e.target.value)}
              placeholder="https://mi-proyecto.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <i className="fas fa-newspaper" /> Enlace del artículo
            </label>
            <input
              type="url"
              value={form.article_url}
              onChange={e => handleFormChange('article_url', e.target.value)}
              placeholder="https://mi-blog.com/mi-articulo"
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <i className="fas fa-video" /> Video demo
            </label>
            <input
              type="url"
              value={form.video_demo_url}
              onChange={e => handleFormChange('video_demo_url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.formSection}>
        <h3>
          <i className="fas fa-edit" /> Contenido del artículo
          <span className={styles.optionalBadge}>Opcional</span>
        </h3>
        <div className={styles.contentInfo}>
          <p>
            <i className="fas fa-info-circle" /> Si agregas contenido, este proyecto se
            mostrará como un artículo completo.
          </p>
        </div>        <div className={styles.lexicalEditorContainer}>
          <LexicalEditorNew
            content={form.article_content || ''}
            onChange={content => handleFormChange('article_content', content)}
            placeholder="Escribe el contenido completo de tu artículo aquí..."
          />
        </div>
      </div>
    </div>
  );

  const renderSeoTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.formSection}>
        <h3>
          <i className="fas fa-search" /> Optimización SEO
          <span className={styles.optionalBadge}>Opcional</span>
        </h3>

        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>
              Título SEO
              <span className={styles.helperText}>
                Si no se especifica, se usará el título principal
              </span>
            </label>            <input
              type="text"
              value={form.seo_metadata?.meta_title || ''}
              onChange={e => setForm({
                ...form,
                seo_metadata: { ...form.seo_metadata!, meta_title: e.target.value }
              })}
              placeholder={form.title || 'Título optimizado para SEO'}
              maxLength={60}
            />
            <div className={styles.characterCounter}>
              {(form.seo_metadata?.meta_title?.length || 0)}/60 caracteres
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>
              Descripción SEO
              <span className={styles.helperText}>
                Descripción que aparece en Google (recomendado: 150-160 caracteres)
              </span>
            </label>
            <textarea
              value={form.seo_metadata?.meta_description || ''}
              onChange={e => setForm({
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
              onChange={e => setForm({
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
                onChange={e => setForm({
                  ...form,
                  seo_metadata: { ...form.seo_metadata!, is_featured: e.target.checked }
                })}
              />
              <span className={styles.checkmark} />
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
            <i className="fab fa-google" /> Vista previa en Google
          </h4>
          <div className={styles.googlePreview}>
            <div className={styles.previewTitle}>
              {form.seo_metadata?.meta_title || form.title || 'Título del proyecto'}
            </div>
            <div className={styles.previewUrl}>
              miportfolio.com › proyectos ›{' '}
              {form.title?.toLowerCase().replace(/\s+/g, '-') || 'titulo-proyecto'}
            </div>
            <div className={styles.previewDescription}>
              {form.seo_metadata?.meta_description ||
                form.description ||
                'Descripción del proyecto que aparecerá en los resultados de búsqueda de Google y otros motores de búsqueda.'}
            </div>
            {form.seo_metadata?.is_featured && (
              <div className={styles.previewFeatured}>⭐ Proyecto destacado</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // =======================================
  //  RETORNO FINAL DEL COMPONENTE
  // =======================================
  return (
    <>      {/* Modal principal con AdminModal */}
      <AdminModal
        isOpen={true}
        onClose={onClose}
        title="Gestión de Proyectos"
        subtitle={`${articles.length} proyecto${articles.length !== 1 ? 's' : ''} en total`}
        size="fullscreen"
        loading={loading}
        icon="fas fa-folder-open"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por título, descripción o tecnología..."
        actionButtons={[
          {
            id: 'new',
            label: 'Nuevo Proyecto',
            variant: 'primary',
            icon: 'fas fa-plus',
            onClick: handleNewProject,
            tooltip: 'Crear un nuevo proyecto'
          }
        ]}
        showProgress={false}
        preventClose={false}
      >
        {renderMainContent()}
      </AdminModal>

      {/* Modal de edición con AdminModal */}
      {showEditModal && (
        <AdminModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={editingArticle ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          subtitle={editingArticle ? `Editando: ${editingArticle.title}` : 'Crear un nuevo proyecto'}
          size="large"
          loading={false}
          saving={saving}
          tabs={getTabsConfig()}
          activeTab={activeTab}
          onTabChange={(tabId: string) => setActiveTab(tabId as 'basic' | 'links' | 'content' | 'seo')}
          actionButtons={getActionButtons()}
          showProgress={true}
          progress={getFormProgress()}
          preventClose={hasUnsavedChanges}
          onBeforeClose={() => {
            if (hasUnsavedChanges) {
              return confirm('¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.');
            }
            return true;
          }}
        >
          {renderTabContent(activeTab)}
        </AdminModal>
      )}

      {/* Modal de biblioteca de medios */}
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
