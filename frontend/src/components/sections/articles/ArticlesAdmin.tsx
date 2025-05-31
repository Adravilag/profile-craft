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
import { useNavigation } from '../../../contexts/NavigationContext';
import { LexicalEditor, MediaLibrary } from '../../ui';
import ModalPortal from '../../common/ModalPortal';
import './ArticlesAdmin.css';
import '../../styles/modal.css';

/**
 * ArticlesAdmin Component - Modal de gestión de proyectos mejorado
 * 
 * Características principales:
 * - Sistema de navegación por tabs (Básico, Enlaces, Contenido, SEO)
 * - Validación en tiempo real con indicadores visuales
 * - Barra de progreso dinámico
 * - Vista previa de metadatos SEO estilo Google
 * - Gestión mejorada de tecnologías
 * - Editor de contenido integrado con Lexical
 * - Diseño responsive con animaciones suaves
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
  const [currentView, setCurrentView] = useState<'list' | 'edit'>('list');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [form, setForm] = useState<EnhancedArticle>(emptyArticle);
  const [techInput, setTechInput] = useState('');  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'links' | 'content' | 'seo'>('basic');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);  const [initialFormState, setInitialFormState] = useState<EnhancedArticle>(emptyArticle);
  const { showSuccess, showError } = useNotificationContext();
  const { navigateToSection } = useNavigation();
  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await getAdminArticles();
      setArticles(data);    } catch (error) {
      showError('Error', 'No se pudieron cargar los proyectos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };  // Función para manejar el botón "Nuevo Proyecto" - navega a la página de creación
  const handleNewProject = () => {
    navigateToSection('articles', 'new');
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

  const renderListView = () => (
    <div className="articles-admin-list">
      <div className="admin-header">        <h2>Gestionar Proyectos</h2>        <div className="admin-actions">
          <button onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNewProject();
          }} className="create-button">
            <i className="fas fa-plus"></i> Nuevo Proyecto
          </button>
          <button onClick={onClose} className="close-button">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Cargando proyectos...</p>
        </div>
      ) : (
        <div className="articles-table-container">
          <table className="articles-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Tecnologías</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article.id}>
                  <td>
                    {article.image_url ? (
                      <img 
                        src={article.image_url} 
                        alt={article.title}
                        className="article-thumbnail"
                      />
                    ) : (
                      <div className="no-image">
                        <i className="fas fa-image"></i>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="article-info">
                      <h4>{article.title}</h4>
                      <p>{article.description}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${article.status.toLowerCase().replace(' ', '-')}`}>
                      {article.status}
                    </span>
                  </td>
                  <td>
                    <div className="tech-list">
                      {article.technologies?.slice(0, 3).map((tech, idx) => (
                        <span key={idx} className="tech-tag-small">{tech}</span>
                      ))}
                      {(article.technologies?.length || 0) > 3 && (
                        <span className="tech-more">+{(article.technologies?.length || 0) - 3}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="article-type">
                      {article.article_content ? (
                        <span className="type-article">
                          <i className="fas fa-newspaper"></i> Artículo
                        </span>
                      ) : (
                        <span className="type-project">
                          <i className="fas fa-code"></i> Proyecto
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        onClick={() => handleEdit(article)}
                        className="edit-button"
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(article)}
                        className="delete-button"
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
            <div className="empty-state">
              <i className="fas fa-newspaper"></i>
              <h3>No hay artículos</h3>
              <p>Crea tu primer artículo para comenzar.</p>              <button onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNewProject();
              }} className="create-first-button">
                <i className="fas fa-plus"></i> Crear primer artículo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );  // Función para detectar si hay cambios no guardados
  const hasFormChanged = () => {
    return JSON.stringify(form) !== JSON.stringify(initialFormState);
  };  // Función para manejar el cierre con confirmación
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
  const renderEditView = () => (
    <div className="articles-admin-edit">
      <div className="admin-header">
        <h2>{editingArticle ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
        <div className="admin-actions">
          <div className="progress-indicator">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getFormProgress()}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {getFormProgress()}% completado
            </span>
          </div>
          <button 
            onClick={handleSave} 
            className="save-button"
            disabled={saving || !form.title || !form.description}
          >
            {saving ? (
              <>
                <div className="button-spinner"></div>
                Guardando...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                {editingArticle ? 'Actualizar' : 'Crear'}
              </>
            )}
          </button>          <button 
            onClick={handleClose} 
            className="cancel-button"
          >
            <i className="fas fa-arrow-left"></i> Volver
          </button>
        </div>
      </div>      {/* Navegación por tabs */}
      <div className="edit-tabs">
        <button
          className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          <i className="fas fa-info-circle"></i>
          <span>Información Básica</span>
          {(!form.title || !form.description) && <span className="tab-warning">!</span>}
          {(form.title && form.description) && <span className="tab-complete">✓</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
        >
          <i className="fas fa-link"></i>
          <span>Enlaces</span>
          {(form.github_url || form.live_url || form.article_url || form.video_demo_url) && <span className="tab-complete">✓</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <i className="fas fa-edit"></i>
          <span>Contenido</span>
          {form.article_content && <span className="tab-complete">✓</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'seo' ? 'active' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          <i className="fas fa-search"></i>
          <span>SEO</span>
          {(form.seo_metadata?.meta_title || form.seo_metadata?.meta_description || form.seo_metadata?.is_featured) && <span className="tab-complete">✓</span>}
        </button>
      </div>

      {/* Contenido de los tabs */}
      <div className="edit-form">
        {/* Tab: Información Básica */}
        {activeTab === 'basic' && (
          <div className="tab-content active">
            <div className="form-section">
              <h3>
                <i className="fas fa-info-circle"></i>
                Información General
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Título *
                    {validationErrors.title && (
                      <span className="error-text">{validationErrors.title}</span>
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
                
                <div className="form-group">
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
                
                <div className="form-group full-width">
                  <label>
                    Descripción *
                    {validationErrors.description && (
                      <span className="error-text">{validationErrors.description}</span>
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
                    className={validationErrors.description ? 'error' : ''}
                    required
                  />
                  <div className="character-counter">
                    {form.description.length}/200 caracteres
                  </div>
                </div>
                
                <div className="form-group">
                  <label>
                    URL de Imagen
                    <span className="helper-text">
                      Recomendado: 1200x800px
                    </span>
                  </label>
                  <div className="image-input-group">
                    <input
                      type="url"
                      value={form.image_url}
                      onChange={(e) => handleFormChange('image_url', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowMediaLibrary(true)}
                      className="media-library-button"
                      title="Abrir biblioteca de medios"
                    >
                      <i className="fas fa-images"></i>
                    </button>
                  </div>
                  {form.image_url && (
                    <div className="image-preview">
                      <img src={form.image_url} alt="Vista previa" />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label>
                    Orden de visualización
                    <span className="helper-text">
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

            <div className="form-section">
              <h3>
                <i className="fas fa-code"></i>
                Tecnologías utilizadas
              </h3>
              <div className="tech-input-group">
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
                  className="add-tech-button"
                  disabled={!techInput.trim()}
                >
                  <i className="fas fa-plus"></i>
                  Agregar
                </button>
              </div>
              
              <div className="tech-tags">
                {form.technologies?.length === 0 && (
                  <div className="empty-tech-state">
                    <i className="fas fa-code"></i>
                    <p>No hay tecnologías agregadas</p>
                    <small>Agrega las tecnologías principales del proyecto</small>
                  </div>
                )}
                {form.technologies?.map((tech, index) => (
                  <span key={index} className="tech-tag enhanced">
                    <i className="fas fa-tag"></i>
                    {tech}
                    <button 
                      type="button"
                      onClick={() => handleRemoveTechnology(index)}
                      className="remove-tech"
                      title="Eliminar tecnología"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ))}
              </div>
              
              {form.technologies && form.technologies.length > 0 && (
                <div className="tech-summary">
                  <span className="tech-count">
                    <i className="fas fa-check-circle"></i>
                    {form.technologies.length} tecnología{form.technologies.length !== 1 ? 's' : ''} agregada{form.technologies.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Enlaces y Recursos */}
        {activeTab === 'links' && (
          <div className="tab-content active">
            <div className="form-section">
              <h3>
                <i className="fas fa-link"></i>
                Enlaces del proyecto
              </h3>
              <div className="form-grid">
                <div className="form-group">
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
                
                <div className="form-group">
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
                
                <div className="form-group">
                  <label>
                    <i className="fas fa-newspaper"></i>
                    Artículo externo
                    <span className="helper-text">
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
                
                <div className="form-group">
                  <label>
                    <i className="fas fa-video"></i>
                    Video demostración
                    <span className="helper-text">
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
              
              <div className="links-preview">
                <h4>Vista previa de enlaces</h4>
                <div className="links-grid">
                  {form.github_url && (
                    <div className="link-preview">
                      <i className="fab fa-github"></i>
                      <span>Código fuente</span>
                      <small>{form.github_url}</small>
                    </div>
                  )}
                  {form.live_url && (
                    <div className="link-preview">
                      <i className="fas fa-external-link-alt"></i>
                      <span>Demo en vivo</span>
                      <small>{form.live_url}</small>
                    </div>
                  )}
                  {form.article_url && (
                    <div className="link-preview">
                      <i className="fas fa-newspaper"></i>
                      <span>Artículo</span>
                      <small>{form.article_url}</small>
                    </div>
                  )}
                  {form.video_demo_url && (
                    <div className="link-preview">
                      <i className="fas fa-video"></i>
                      <span>Video demo</span>
                      <small>{form.video_demo_url}</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Contenido */}
        {activeTab === 'content' && (
          <div className="tab-content active">
            <div className="form-section">
              <h3>
                <i className="fas fa-edit"></i>
                Contenido del artículo
                <span className="optional-badge">Opcional</span>
              </h3>
              <div className="content-info">
                <p>
                  <i className="fas fa-info-circle"></i>
                  Si agregas contenido aquí, el proyecto aparecerá como un artículo completo 
                  en la sección de blog, además de como proyecto en el portafolio.
                </p>
              </div>
              
              <div className="form-group full-width">
                <div className="editor-container">
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
                <div className="content-stats">
                  <div className="stat-item">
                    <i className="fas fa-file-alt"></i>
                    <span>{form.article_content.length} caracteres</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-clock"></i>
                    <span>~{Math.ceil(form.article_content.length / 1000)} min lectura</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: SEO */}
        {activeTab === 'seo' && (
          <div className="tab-content active">
            <div className="form-section">
              <h3>
                <i className="fas fa-search"></i>
                Optimización para buscadores (SEO)
                <span className="optional-badge">Opcional</span>
              </h3>
              
              <div className="seo-info">
                <p>
                  <i className="fas fa-lightbulb"></i>
                  Mejora la visibilidad de tu proyecto en buscadores como Google
                </p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Título para SEO
                    <span className="helper-text">
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
                  <div className="character-counter">
                    {(form.seo_metadata?.meta_title?.length || 0)}/60 caracteres
                  </div>
                </div>
                
                <div className="form-group">
                  <label>
                    Tiempo de lectura (minutos)
                    <span className="helper-text">
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
                
                <div className="form-group full-width">
                  <label>
                    Descripción para SEO
                    <span className="helper-text">
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
                  <div className="character-counter">
                    {(form.seo_metadata?.meta_description?.length || 0)}/160 caracteres
                  </div>
                </div>
                
                <div className="form-group full-width">
                  <label>
                    Palabras clave
                    <span className="helper-text">
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
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={form.seo_metadata?.is_featured || false}
                      onChange={(e) => setForm({
                        ...form,
                        seo_metadata: { ...form.seo_metadata!, is_featured: e.target.checked }
                      })}
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-label">
                      <strong>Destacar este proyecto</strong>
                      <small>Aparecerá con mayor prioridad en el portafolio</small>
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Vista previa de Google */}
              <div className="seo-preview">
                <h4>
                  <i className="fab fa-google"></i>
                  Vista previa en Google
                </h4>
                <div className="google-preview">
                  <div className="preview-title">
                    {form.seo_metadata?.meta_title || form.title || 'Título del proyecto'}
                  </div>
                  <div className="preview-url">
                    miportfolio.com › proyectos › {form.title?.toLowerCase().replace(/\s+/g, '-') || 'titulo-proyecto'}
                  </div>
                  <div className="preview-description">
                    {form.seo_metadata?.meta_description || form.description || 'Descripción del proyecto que aparecerá en los resultados de búsqueda de Google y otros motores de búsqueda.'}
                  </div>
                  {form.seo_metadata?.is_featured && (
                    <div className="preview-featured">
                      ⭐ Proyecto destacado
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>      {/* Biblioteca de medios modal */}
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
        renderListView()      ) : (
        <ModalPortal>
          <div className="articles-admin-modal">
            <div className="modal-overlay" onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}></div>
              <div className="modal-content">
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
