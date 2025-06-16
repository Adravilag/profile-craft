// src/components/sections/articles/CreateArticle.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createArticle } from '../../../services/api';
import type { Article } from '../../../services/api';
import { useNotificationContext } from '../../../contexts/NotificationContext';
import { LexicalEditor, MediaLibrary } from '../../ui';
import ArticleFormContainer from './ArticleFormContainer';
import styles from './CreateArticleForm.module.css';

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
  user_id: 'dynamic-admin-id',
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
  type: 'proyecto', // Valor por defecto
  technologies: [],
  seo_metadata: {
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_featured: false,
    reading_time: 5
  }
};

const CreateArticle: React.FC = () => {
  const [form, setForm] = useState<EnhancedArticle>(emptyArticle);
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'links' | 'content' | 'seo'>('basic');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { showSuccess, showError } = useNotificationContext();
  const navigate = useNavigate();


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
    
    // Comentado para permitir guardar sin tecnologías
    // if (form.technologies && form.technologies.length === 0) {
    //   errors.technologies = 'Debe agregar al menos una tecnología';
    // }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showError('Error de validación', 'Por favor corrige los errores antes de continuar');
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
      
      await createArticle(dataToSend);
      showSuccess('Éxito', 'Proyecto creado exitosamente');
      navigate('/articles/admin');
    } catch (error) {
      showError('Error', 'No se pudo crear el proyecto');
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

  return (
    <React.Fragment>
      <ArticleFormContainer
        title="Crear Nuevo Proyecto"
        icon="fas fa-plus-circle"
        subtitle="Agrega un nuevo proyecto a tu portafolio"
      >
        {/* Barra de progreso */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <span className={styles.progressText}>
            Progreso: {Math.round(getProgressPercentage())}%
          </span>
        </div>

          {/* Tabs de navegación */}
          <div className={styles.formTabs}>
            {[
              { key: 'basic', label: 'Básico', icon: 'fas fa-info-circle' },
              { key: 'links', label: 'Enlaces', icon: 'fas fa-link' },
              { key: 'content', label: 'Contenido', icon: 'fas fa-edit' },
              { key: 'seo', label: 'SEO', icon: 'fas fa-search' }
            ].map((tab) => (
              <button
                key={tab.key}
                className={`${styles.formTab} ${activeTab === tab.key ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido del formulario */}
          <div className={styles.formContent}>
        {activeTab === 'basic' && (
          <div className={styles.formSection}>
            <h3><i className="fas fa-info-circle"></i>Información Básica</h3>
            
            <div className={styles.formColumns}>
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">
                    Título del Proyecto *
                    {validationErrors.title && <span className={styles.errorText}>{validationErrors.title}</span>}
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Nombre de tu proyecto"
                    className={validationErrors.title ? styles.error : ''}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">
                    Descripción *
                    {validationErrors.description && <span className={styles.errorText}>{validationErrors.description}</span>}
                  </label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Describe brevemente tu proyecto"
                    rows={4}
                    className={validationErrors.description ? styles.error : ''}
                  />
                </div>
              </div>                <div className={styles.formColumn}>
                  <div className={styles.formGroup}>
                    <label htmlFor="type">Tipo de Contenido</label>
                    <select
                      id="type"
                      value={form.type || 'proyecto'}
                      onChange={(e) => handleFormChange('type', e.target.value)}
                    >
                      <option value="proyecto">Proyecto</option>
                      <option value="articulo">Artículo</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="status">Estado del Proyecto</label>
                    <select
                      id="status"
                      value={form.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                    >
                      <option value="En progreso">En progreso</option>
                      <option value="Completado">Completado</option>
                      <option value="Pausado">Pausado</option>
                    </select>
                  </div>

                <div className={styles.formGroup}>
                  <label>
                    Tecnologías Utilizadas
                    {validationErrors.technologies && <span className={styles.errorText}>{validationErrors.technologies}</span>}
                  </label>
                  <div className={styles.techInputContainer}>
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ej: React, TypeScript, Node.js"
                      className={validationErrors.technologies ? styles.error : ''}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddTechnology}
                      disabled={!techInput.trim()}
                      title="Agregar tecnología"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <small>Presiona Enter o haz clic en + para agregar una tecnología</small>
                  
                  {form.technologies && form.technologies.length > 0 && (
                    <div className={styles.techTags}>
                      {form.technologies.map((tech, index) => (
                        <span key={index} className={styles.techTag}>
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
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className={styles.formSection}>
            <h3><i className="fas fa-link"></i>Enlaces y Recursos</h3>
            
            <div className={styles.formColumns}>
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label htmlFor="image_url">URL de Imagen Principal</label>
                  <div className={styles.urlInputGroup}>
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
                      className={styles.mediaButton}
                      title="Seleccionar imagen desde la biblioteca multimedia"
                    >
                      <i className="fas fa-image"></i>
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="github_url">Repositorio de GitHub</label>
                  <input
                    id="github_url"
                    type="url"
                    value={form.github_url}
                    onChange={(e) => handleFormChange('github_url', e.target.value)}
                    placeholder="https://github.com/usuario/repositorio"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="live_url">Demo en Vivo</label>
                  <input
                    id="live_url"
                    type="url"
                    value={form.live_url}
                    onChange={(e) => handleFormChange('live_url', e.target.value)}
                    placeholder="https://miproyecto.netlify.app"
                  />
                </div>
              </div>

              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label htmlFor="article_url">Artículo/Blog</label>
                  <input
                    id="article_url"
                    type="url"
                    value={form.article_url}
                    onChange={(e) => handleFormChange('article_url', e.target.value)}
                    placeholder="https://blog.com/mi-articulo"
                  />
                </div>

                <div className={styles.formGroup}>
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
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className={styles.formSection}>
            <h3><i className="fas fa-edit"></i>Contenido del Artículo</h3>
            <div className={styles.editorContainer}>              <LexicalEditor
                content={form.article_content || ''}
                onChange={(content) => handleFormChange('article_content', content)}
                placeholder="Escribe el contenido detallado de tu proyecto..."
              />
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className={styles.formSection}>
            <h3><i className="fas fa-search"></i>Optimización SEO</h3>
            
            <div className={styles.formColumns}>
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
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
                    placeholder="Título optimizado para SEO"
                    maxLength={60}
                  />
                  <small>Máximo 60 caracteres</small>
                </div>

                <div className={styles.formGroup}>
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
                    placeholder="Descripción breve para motores de búsqueda"
                    rows={3}
                    maxLength={160}
                  />
                  <small>Máximo 160 caracteres</small>
                </div>
              </div>

              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
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

                <div className={styles.formGroup}>
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

                <div className={styles.formGroup}>
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
            </div>
          </div>
        )}
          </div>

          {/* Botones de acción en la parte inferior */}
          <div className={styles.formActions}>
            <button
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={saving}
            >
              <i className="fas fa-times"></i>
              Cancelar
            </button>
            <button
              className={`${styles.saveButton} ${saving ? 'loading' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              <i className="fas fa-save"></i>
              {saving ? 'Guardando...' : 'Guardar Proyecto'}
            </button>
          </div>
      </ArticleFormContainer>

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
    </React.Fragment>
  );
};

export default CreateArticle;
