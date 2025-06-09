// filepath: d:\Profesional\cv-maker\frontend\src\components\sections\articles\EditArticle.tsx
// src/components/sections/articles/EditArticle.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticleById, updateArticle } from '../../../services/api';
import type { Article } from '../../../services/api';
import { useNotificationContext } from '../../../contexts/NotificationContext';
import { LexicalEditor, MediaLibrary } from '../../ui';
import './CreateArticle.css';

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
  status: 'En Desarrollo',
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

const EditArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<EnhancedArticle>(emptyArticle);
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'basic' | 'links' | 'content' | 'seo'>('basic');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { showSuccess, showError } = useNotificationContext();
  const navigate = useNavigate();

  // Cargar datos del artículo al montar el componente
  useEffect(() => {
    if (!id) {
      showError('Error', 'ID de artículo no válido');
      navigate('/articles/admin');
      return;
    }

    loadArticle(parseInt(id));
  }, [id, navigate, showError]);

  const loadArticle = async (articleId: number) => {
    try {
      setLoading(true);
      const data = await getArticleById(articleId);
      
      // Parsear metadatos SEO si existen
      let seoMetadata = {
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        is_featured: false,
        reading_time: 5,
      };

      if (data.meta_data) {
        try {
          const parsed = JSON.parse(data.meta_data);
          seoMetadata = { ...seoMetadata, ...parsed };
        } catch (error) {
          console.warn('Error parsing SEO metadata:', error);
        }
      }

      // Establecer formulario con datos cargados
      setForm({
        user_id: data.user_id,
        title: data.title,
        description: data.description,
        image_url: data.image_url || '',
        github_url: data.github_url || '',
        live_url: data.live_url || '',
        article_url: data.article_url || '',
        article_content: data.article_content || '',
        video_demo_url: data.video_demo_url || '',
        status: data.status,
        order_index: data.order_index,
        technologies: data.technologies || [],
        seo_metadata: seoMetadata,
      });
    } catch (error) {
      showError('Error', 'No se pudo cargar el artículo');
      console.error(error);
      navigate('/articles/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: keyof typeof form, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Limpiar error de validación si existe
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTechnology = () => {
    if (techInput.trim() && !form.technologies?.includes(techInput.trim())) {
      setForm(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (index: number) => {
    setForm(prev => ({
      ...prev,
      technologies: prev.technologies?.filter((_, i) => i !== index) || []
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!form.title.trim()) {
      errors.title = 'El título es obligatorio';
    }
    
    if (!form.description.trim()) {
      errors.description = 'La descripción es obligatoria';
    }
    
    if (form.technologies && form.technologies.length === 0) {
      errors.technologies = 'Debe agregar al menos una tecnología';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showError('Error de validación', 'Por favor corrige los errores antes de continuar');
      return;
    }

    if (!id) {
      showError('Error', 'ID de artículo no válido');
      return;
    }

    setSaving(true);
    try {
      // Preparar datos para enviar
      const articleData = {
        ...form,
        meta_data: JSON.stringify(form.seo_metadata)
      };
      
      // Eliminar seo_metadata del objeto principal
      const { seo_metadata, ...dataToSend } = articleData;
      
      await updateArticle(parseInt(id), dataToSend);
      showSuccess('Éxito', 'Proyecto actualizado exitosamente');
      navigate('/articles/admin');
    } catch (error) {
      showError('Error', 'No se pudo actualizar el proyecto');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/articles/admin');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      handleAddTechnology();
    }
  };

  const getProgressPercentage = () => {
    const requiredFields = ['title', 'description'];
    const optionalFields = ['image_url', 'github_url', 'live_url', 'article_content'];
    
    let filledRequired = 0;
    let filledOptional = 0;
    
    requiredFields.forEach(field => {
      if (form[field as keyof typeof form]) filledRequired++;
    });
    
    optionalFields.forEach(field => {
      if (form[field as keyof typeof form]) filledOptional++;
    });
    
    const requiredWeight = 60;
    const optionalWeight = 40;
    const techWeight = (form.technologies?.length || 0) > 0 ? 10 : 0;
    
    const requiredPercentage = (filledRequired / requiredFields.length) * requiredWeight;
    const optionalPercentage = (filledOptional / optionalFields.length) * optionalWeight;
    
    return Math.min(100, requiredPercentage + optionalPercentage + techWeight);
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="create-article-container">
        <div className="create-article-loading">
          <div className="loading-spinner"></div>
          <p>Cargando artículo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-article-container">
      {/* Header con botones de acción */}
      <div className="create-article-header">
        <h1>Editar Proyecto</h1>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            <i className="fas fa-times"></i>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <i className="fas fa-save"></i>
            {saving ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <span className="progress-text">
          {getProgressPercentage()}% completado
        </span>
      </div>

      {/* Navegación por tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          <i className="fas fa-info-circle"></i>
          Información Básica
        </button>
        <button
          className={`tab-button ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
        >
          <i className="fas fa-link"></i>
          Enlaces y Recursos
        </button>
        <button
          className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <i className="fas fa-edit"></i>
          Contenido del Artículo
        </button>
        <button
          className={`tab-button ${activeTab === 'seo' ? 'active' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          <i className="fas fa-search"></i>
          SEO y Metadata
        </button>
      </div>

      {/* Contenido de los tabs */}
      <div className="tab-content">
        {activeTab === 'basic' && (
          <div className="form-section">
            <h3>Información Básica del Proyecto</h3>
            
            <div className="form-group">
              <label htmlFor="title">Título del Proyecto *</label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="Nombre del proyecto"
                className={validationErrors.title ? 'error' : ''}
              />
              {validationErrors.title && (
                <span className="error-message">{validationErrors.title}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción *</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Descripción breve del proyecto"
                className={validationErrors.description ? 'error' : ''}
                rows={3}
              />
              {validationErrors.description && (
                <span className="error-message">{validationErrors.description}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="image_url">Imagen del Proyecto</label>
              <div className="image-input-container">
                <input
                  id="image_url"
                  type="url"
                  value={form.image_url}
                  onChange={(e) => handleFormChange('image_url', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaLibrary(true)}
                  className="btn-media-library"
                >
                  <i className="fas fa-images"></i>
                  Galería
                </button>
              </div>
              {form.image_url && (
                <div className="image-preview">
                  <img src={form.image_url} alt="Preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="status">Estado del Proyecto</label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
              >
                <option value="En Desarrollo">En Desarrollo</option>
                <option value="Completado">Completado</option>
                <option value="Pausado">Pausado</option>
                <option value="Archivado">Archivado</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="technologies">Tecnologías *</label>
              <div className="tech-input-container">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ej: React, TypeScript, Node.js"
                  className={validationErrors.technologies ? 'error' : ''}
                />
                <button 
                  type="button" 
                  onClick={handleAddTechnology}
                  disabled={!techInput.trim()}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              
              {form.technologies && form.technologies.length > 0 && (
                <div className="tech-tags">
                  {form.technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">
                      {tech}
                      <button 
                        type="button"
                        onClick={() => handleRemoveTechnology(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {validationErrors.technologies && (
                <span className="error-message">{validationErrors.technologies}</span>
              )}
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="form-section">
            <h3>Enlaces y Recursos</h3>
            
            <div className="form-group">
              <label htmlFor="github_url">Repositorio GitHub</label>
              <input
                id="github_url"
                type="url"
                value={form.github_url}
                onChange={(e) => handleFormChange('github_url', e.target.value)}
                placeholder="https://github.com/usuario/proyecto"
              />
            </div>

            <div className="form-group">
              <label htmlFor="live_url">Demo en Vivo</label>
              <input
                id="live_url"
                type="url"
                value={form.live_url}
                onChange={(e) => handleFormChange('live_url', e.target.value)}
                placeholder="https://miproyecto.netlify.app"
              />
            </div>

            <div className="form-group">
              <label htmlFor="article_url">Artículo/Blog</label>
              <input
                id="article_url"
                type="url"
                value={form.article_url}
                onChange={(e) => handleFormChange('article_url', e.target.value)}
                placeholder="https://blog.com/mi-articulo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="video_demo_url">Video Demo</label>
              <input
                id="video_demo_url"
                type="url"
                value={form.video_demo_url}
                onChange={(e) => handleFormChange('video_demo_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="form-section">
            <h3>Contenido del Artículo</h3>
            <div className="editor-container">
              <LexicalEditor
                content={form.article_content || ''}
                onChange={(content) => handleFormChange('article_content', content)}
                placeholder="Escribe el contenido detallado de tu proyecto..."
              />
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="form-section">
            <h3>Optimización SEO</h3>
            
            <div className="form-group">
              <label htmlFor="meta_title">Meta Título</label>
              <input
                id="meta_title"
                type="text"
                value={form.seo_metadata?.meta_title || ''}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  seo_metadata: {
                    ...prev.seo_metadata,
                    meta_title: e.target.value
                  }
                }))}
                placeholder="Título para motores de búsqueda"
              />
            </div>

            <div className="form-group">
              <label htmlFor="meta_description">Meta Descripción</label>
              <textarea
                id="meta_description"
                value={form.seo_metadata?.meta_description || ''}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  seo_metadata: {
                    ...prev.seo_metadata,
                    meta_description: e.target.value
                  }
                }))}
                placeholder="Descripción para motores de búsqueda"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="meta_keywords">Palabras Clave</label>
              <input
                id="meta_keywords"
                type="text"
                value={form.seo_metadata?.meta_keywords || ''}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  seo_metadata: {
                    ...prev.seo_metadata,
                    meta_keywords: e.target.value
                  }
                }))}
                placeholder="react, javascript, web development"
              />
              <small>Separadas por comas</small>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={form.seo_metadata?.is_featured || false}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    seo_metadata: {
                      ...prev.seo_metadata,
                      is_featured: e.target.checked
                    }
                  }))}
                />
                Proyecto Destacado
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="reading_time">Tiempo de Lectura (minutos)</label>
              <input
                id="reading_time"
                type="number"
                min="1"
                max="60"
                value={form.seo_metadata?.reading_time || 5}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  seo_metadata: {
                    ...prev.seo_metadata,
                    reading_time: parseInt(e.target.value) || 5
                  }
                }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Media Library Modal */}
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
};

export default EditArticle;
