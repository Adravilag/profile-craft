import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticleById, updateArticle } from '../../../services/api';
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

const EditArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<EnhancedArticle>(emptyArticle);
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'basic' | 'links' | 'content' | 'seo'>('basic');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [contentStats, setContentStats] = useState({
    words: 0,
    characters: 0,
    readingTime: 0,
    headers: 0
  });

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
        description: data.description,        image_url: data.image_url || '',
        github_url: data.github_url || '',
        live_url: data.live_url || '',
        article_url: data.article_url || '',
        article_content: data.article_content || '',
        video_demo_url: data.video_demo_url || '',
        status: data.status,
        order_index: data.order_index,
        type: data.type || 'proyecto', // Asegurar valor por defecto
        technologies: data.technologies || [],
        seo_metadata: seoMetadata
      });
    } catch (error) {
      console.error('Error loading article:', error);
      showError('Error', 'No se pudo cargar el artículo');
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

  // Auto-guardado cada 30 segundos si hay cambios
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (form.article_content && form.article_content.trim() && !saving && !autoSaving) {
        try {
          setAutoSaving(true);
          const articleData = {
            ...form,
            meta_data: JSON.stringify(form.seo_metadata)
          };
          const { seo_metadata, ...dataToSend } = articleData;
          
          if (id) {
            await updateArticle(parseInt(id), dataToSend);
            setLastSaved(new Date());
            console.log('Auto-guardado exitoso');
          }
        } catch (error) {
          console.warn('Error en auto-guardado:', error);
        } finally {
          setAutoSaving(false);
        }
      }
    }, 30000); // 30 segundos

    return () => clearInterval(autoSaveInterval);
  }, [form, saving, autoSaving, id]);

  // Actualizar estadísticas del contenido
  useEffect(() => {
    const content = form.article_content || '';
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    const characters = content.length;
    const readingTime = Math.ceil(words / 200); // 200 WPM promedio
    const headers = (content.match(/^#{1,6}\s+.+$/gm) || []).length;

    setContentStats({
      words,
      characters,
      readingTime,
      headers
    });

    // Actualizar tiempo de lectura en metadatos SEO
    if (readingTime !== form.seo_metadata?.reading_time) {
      setForm(prev => ({
        ...prev,
        seo_metadata: {
          ...prev.seo_metadata,
          reading_time: readingTime
        }
      }));
    }
  }, [form.article_content]);

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <ArticleFormContainer
        title="Cargando Proyecto"
        icon="fas fa-spinner fa-spin"
        subtitle="Obteniendo datos del proyecto..."
        showBackButton={false}
        showThemeToggle={false}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '200px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid var(--border-color)', 
            borderTop: '3px solid var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando artículo...</p>
        </div>
      </ArticleFormContainer>
    );
  }
  // Función para generar plantillas inteligentes basadas en el tipo y tecnologías
  const generateSmartTemplate = (templateType: 'portfolio' | 'technical' | 'blog') => {
    const projectType = form.type || 'proyecto';
    const isArticle = projectType === 'articulo';
    const title = form.title || (isArticle ? 'Título del Artículo' : 'Título del Proyecto');
    const description = form.description || 'Descripción del proyecto que explica su propósito y objetivos principales.';
    
    // Usar templateType para personalizar el enfoque
    const isPortfolio = templateType === 'portfolio';
    const isTechnical = templateType === 'technical'; 
    const isBlog = templateType === 'blog';
    
    // Determinar el stack tecnológico principal
    const technologies = form.technologies || [];
    const hasReact = technologies.some(tech => tech.toLowerCase().includes('react'));
    const hasNode = technologies.some(tech => tech.toLowerCase().includes('node'));
    const hasTypescript = technologies.some(tech => tech.toLowerCase().includes('typescript'));
    const hasPython = technologies.some(tech => tech.toLowerCase().includes('python'));
    const hasDatabase = technologies.some(tech => 
      tech.toLowerCase().includes('sql') || 
      tech.toLowerCase().includes('mongo') || 
      tech.toLowerCase().includes('database')
    );

    // Determinar categoría del proyecto
    let projectCategory = 'web';
    if (technologies.some(tech => tech.toLowerCase().includes('mobile') || tech.toLowerCase().includes('react native'))) {
      projectCategory = 'mobile';
    } else if (technologies.some(tech => tech.toLowerCase().includes('ai') || tech.toLowerCase().includes('machine learning'))) {
      projectCategory = 'ai';
    } else if (technologies.some(tech => tech.toLowerCase().includes('game') || tech.toLowerCase().includes('unity'))) {
      projectCategory = 'game';
    }    // Generar contenido específico por tipo
    const techSection = technologies.length > 0 ? 
      technologies.map(tech => {
        const techLower = tech.toLowerCase();
        let description = `Implementación moderna y eficiente de ${tech}`;
        
        if (techLower.includes('react')) {
          description = isTechnical 
            ? `Arquitectura de componentes con ${tech}, implementando patrones de diseño avanzados y optimización de rendimiento`
            : isPortfolio 
            ? `Interfaz de usuario reactiva con ${tech}, destacando la experiencia del usuario y diseño moderno`
            : `Desarrollo frontend con ${tech}, creando experiencias web interactivas y dinámicas`;
        } else if (techLower.includes('node')) {
          description = isTechnical
            ? `Backend escalable con ${tech}, implementando arquitecturas RESTful y microservicios`
            : isPortfolio
            ? `Servidor robusto con ${tech}, proporcionando APIs eficientes y seguras`
            : `Backend moderno con ${tech}, gestionando datos y lógica de negocio`;
        } else if (techLower.includes('typescript')) {
          description = isTechnical
            ? `Sistema de tipos estático con ${tech}, implementando interfaces complejas y decoradores`
            : `Desarrollo tipado con ${tech}, mejorando la calidad del código y reduciendo errores`;
        } else if (techLower.includes('python')) {
          description = isTechnical
            ? `Procesamiento de datos con ${tech}, implementando algoritmos optimizados y análisis estadístico`
            : `Lógica de backend con ${tech}, aprovechando su sintaxis limpia y amplio ecosistema`;
        }
        
        return `- **${tech}**: ${description}`;
      }).join('\n') :
      '- **Frontend moderno**: Utiliza tecnologías web actuales\n- **Responsive design**: Adaptable a diferentes dispositivos';

    return { 
      title, 
      description, 
      techSection, 
      projectCategory, 
      isArticle, 
      hasReact, 
      hasNode, 
      hasTypescript, 
      hasPython, 
      hasDatabase,
      isPortfolio,
      isTechnical,
      isBlog
    };
  };

  return (
    <React.Fragment>
      <ArticleFormContainer
        title="Editar Proyecto"
        icon="fas fa-edit"
        subtitle={`Modificando: ${form.title || 'Sin título'}`}
      >        {/* Barra de progreso */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span className={styles.progressText}>
              Progreso: {Math.round(getProgressPercentage())}%
            </span>
            
            {/* Estadísticas del contenido */}
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span title="Palabras"><i className="fas fa-font"></i> {contentStats.words}</span>
              <span title="Tiempo de lectura"><i className="fas fa-clock"></i> {contentStats.readingTime} min</span>
              <span title="Encabezados"><i className="fas fa-heading"></i> {contentStats.headers}</span>
              {autoSaving && <span style={{ color: 'var(--primary-color)' }}><i className="fas fa-spinner fa-spin"></i> Auto-guardando...</span>}
              {lastSaved && !autoSaving && (
                <span title={`Última vez guardado: ${lastSaved.toLocaleTimeString()}`}>
                  <i className="fas fa-check-circle" style={{ color: 'var(--success-color)' }}></i> Guardado
                </span>
              )}
            </div>
          </div>
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
              
              {/* Herramientas avanzadas de contenido */}
              <div className={styles.contentTools} style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: 'var(--md-sys-color-surface-container)',
                borderRadius: '8px',
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  className={styles.toolButton}                  onClick={() => {
                    const smartData = generateSmartTemplate('portfolio');
                    const portfolioTemplate = `# ${smartData.title}: ${smartData.isArticle ? 'Análisis y Perspectivas' : 'Un Proyecto Innovador'}

## Tabla de Contenidos

- [${smartData.title}: ${smartData.isArticle ? 'Análisis y Perspectivas' : 'Un Proyecto Innovador'}](#${smartData.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}-${smartData.isArticle ? 'análisis-y-perspectivas' : 'un-proyecto-innovador'})
- [Introducción](#introducción)
- [Características Principales](#características-principales)
- [${smartData.projectCategory === 'web' ? 'Desarrollo Web Avanzado' : smartData.projectCategory === 'mobile' ? 'Desarrollo Mobile' : smartData.projectCategory === 'ai' ? 'Inteligencia Artificial' : 'Desarrollo de Software'}](#${smartData.projectCategory === 'web' ? 'desarrollo-web-avanzado' : smartData.projectCategory === 'mobile' ? 'desarrollo-mobile' : smartData.projectCategory === 'ai' ? 'inteligencia-artificial' : 'desarrollo-de-software'})
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Casos de Uso](#casos-de-uso)
- [Desarrollo Futuro](#desarrollo-futuro)
- [Conclusión](#conclusión)

## Introducción

${smartData.description}

${smartData.isArticle ? 'Este análisis explora los aspectos clave, implementación y lecciones aprendidas durante el desarrollo.' : 'Este proyecto representa una solución innovadora que combina tecnologías modernas con una experiencia de usuario excepcional.'}

## Características Principales

### ${smartData.projectCategory === 'web' ? 'Desarrollo Web Moderno' : smartData.projectCategory === 'mobile' ? 'Aplicación Móvil Nativa' : smartData.projectCategory === 'ai' ? 'Solución de IA' : 'Software Especializado'}

${smartData.hasReact ? 'Este proyecto utiliza React para crear una interfaz de usuario moderna y reactiva, aprovechando el ecosistema de componentes y hooks para una experiencia fluida.' : 
  smartData.projectCategory === 'mobile' ? 'Desarrollado con tecnologías nativas para garantizar el máximo rendimiento y integración con las características del dispositivo.' :
  smartData.projectCategory === 'ai' ? 'Implementa algoritmos de machine learning y procesamiento de datos para proporcionar insights valiosos y automatización inteligente.' :
  'Construido con un enfoque en la escalabilidad, mantenibilidad y rendimiento óptimo.'}

### Funcionalidades Clave

${smartData.hasReact && smartData.hasNode ? '- **Full Stack JavaScript**: Ecosistema unificado con React en frontend y Node.js en backend\n' : ''}
${smartData.hasTypescript ? '- **TypeScript**: Desarrollo tipado que mejora la calidad del código y reduce errores\n' : ''}
${smartData.hasDatabase ? '- **Gestión de Datos**: Sistema robusto de almacenamiento y consulta de información\n' : ''}
- **Responsive Design**: Adaptable a todos los dispositivos y tamaños de pantalla
- **Performance Optimizada**: Tiempos de carga mínimos y experiencia fluida
- **Seguridad**: Implementación de mejores prácticas de seguridad

## ${smartData.projectCategory === 'web' ? 'Desarrollo Web Avanzado' : smartData.projectCategory === 'mobile' ? 'Desarrollo Mobile' : smartData.projectCategory === 'ai' ? 'Inteligencia Artificial' : 'Desarrollo de Software'}

### Stack Tecnológico

${smartData.techSection}

### Arquitectura del Sistema

${smartData.hasReact && smartData.hasNode ? 
  'La aplicación sigue una arquitectura full-stack moderna con React en el frontend y Node.js en el backend, proporcionando una experiencia de desarrollo unificada y eficiente.' :
  smartData.projectCategory === 'mobile' ? 
  'Arquitectura móvil optimizada que aprovecha las capacidades nativas del dispositivo mientras mantiene un código limpio y mantenible.' :
  smartData.projectCategory === 'ai' ?
  'Pipeline de datos y modelos de ML estructurado para procesar información de manera eficiente y generar predicciones precisas.' :
  'Diseño modular que permite escalabilidad horizontal y facilita el mantenimiento del código.'
}

${smartData.hasDatabase ? '\n#### Base de Datos\n\nSistema de gestión de datos diseñado para escalabilidad y rendimiento, con esquemas optimizados para las consultas más frecuentes.' : ''}

## Casos de Uso

Este ${smartData.isArticle ? 'enfoque' : 'proyecto'} es ideal para:

${smartData.projectCategory === 'web' ? 
  '- **Empresas**: Que necesitan una presencia web moderna y eficiente\n- **Startups**: Buscando un MVP robusto y escalable\n- **Desarrolladores**: Que requieren una base sólida para personalizar' :
  smartData.projectCategory === 'mobile' ?
  '- **Usuarios móviles**: Que demandan funcionalidad nativa y rendimiento óptimo\n- **Empresas**: Buscando alcanzar a su audiencia móvil\n- **Desarrolladores**: Interesados en mejores prácticas móviles' :
  smartData.projectCategory === 'ai' ?
  '- **Analistas de datos**: Que necesitan insights automatizados\n- **Empresas**: Buscando optimizar procesos con IA\n- **Investigadores**: Interesados en aplicaciones prácticas de ML' :
  '- **Profesionales**: Que requieren herramientas especializadas\n- **Equipos de desarrollo**: Buscando soluciones robustas\n- **Organizaciones**: Que necesitan sistemas personalizados'
}

## Desarrollo Futuro

### Roadmap Planeado

${smartData.hasReact ? '- **Componentes Avanzados**: Expansión de la biblioteca de componentes UI\n' : ''}
${smartData.hasNode ? '- **API Enhancements**: Nuevos endpoints y optimizaciones de rendimiento\n' : ''}
${smartData.projectCategory === 'ai' ? '- **Modelos Mejorados**: Implementación de algoritmos más sofisticados\n' : ''}
- **Integración de Terceros**: Conexión con servicios externos populares
- **Análisis Avanzado**: Dashboard de métricas y analytics integrado
- **Colaboración**: Funcionalidades de trabajo en equipo

### Escalabilidad

${smartData.title} está diseñado para crecer con las necesidades del usuario, permitiendo:

- Expansión de funcionalidades sin refactoring mayor
- Integración con sistemas existentes
- Personalización según requisitos específicos

## Conclusión

${smartData.title} ${smartData.isArticle ? 'demuestra' : 'representa'} un enfoque moderno para ${smartData.projectCategory === 'web' ? 'el desarrollo web' : smartData.projectCategory === 'mobile' ? 'las aplicaciones móviles' : smartData.projectCategory === 'ai' ? 'la inteligencia artificial' : 'el desarrollo de software'}, combinando las mejores prácticas de la industria con tecnologías de vanguardia.

${smartData.hasTypescript ? 'El uso de TypeScript garantiza un código más robusto y mantenible, ' : ''}${smartData.hasReact ? 'mientras que React proporciona una base sólida para la interfaz de usuario. ' : ''}Este proyecto ${smartData.isArticle ? 'ilustra' : 'demuestra'} cómo la elección correcta de tecnologías puede resultar en una solución escalable y eficiente.

---

**${smartData.isArticle ? 'Recursos relacionados' : 'Enlaces del proyecto'}:**
${form.github_url ? `- [${smartData.isArticle ? 'Código fuente' : 'Repositorio en GitHub'}](${form.github_url})` : ''}
${form.live_url ? `- [${smartData.isArticle ? 'Demostración' : 'Demo en vivo'}](${form.live_url})` : ''}
${form.article_url ? `- [${smartData.isArticle ? 'Documentación completa' : 'Artículo detallado'}](${form.article_url})` : ''}

*Desarrollado con ❤️ ${smartData.hasReact ? 'y React' : smartData.hasPython ? 'y Python' : 'y tecnologías modernas'}*`;
                    
                    handleFormChange('article_content', portfolioTemplate);
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--md-sys-color-primary)',
                    color: 'var(--md-sys-color-on-primary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Crear estructura de artículo profesional con tabla de contenidos"
                >
                  <i className="fas fa-file-alt"></i> Plantilla Portfolio
                </button>

                <button
                  type="button"
                  className={styles.toolButton}                  onClick={() => {
                    const smartData = generateSmartTemplate('technical');
                    const techArticleTemplate = `# ${smartData.title}: Documentación Técnica ${smartData.isArticle ? 'y Análisis' : 'Completa'}

## Resumen Ejecutivo

${smartData.description}

${smartData.isArticle ? 'Este documento analiza la implementación técnica, decisiones de arquitectura y lecciones aprendidas.' : 'Esta documentación proporciona una guía completa para entender, instalar y contribuir al proyecto.'}

## Especificaciones Técnicas

### Stack Tecnológico

${smartData.techSection}

### Arquitectura del Sistema

${smartData.hasReact && smartData.hasNode ? 
  '#### Arquitectura Full-Stack\n\n```\n┌─────────────┐    ┌─────────────┐    ┌─────────────┐\n│   React     │───▶│   Node.js   │───▶│  Database   │\n│  Frontend   │    │   Backend   │    │             │\n└─────────────┘    └─────────────┘    └─────────────┘\n```\n\nLa aplicación utiliza una arquitectura de separación de responsabilidades donde React maneja la interfaz de usuario, Node.js gestiona la lógica de negocio y las APIs, y la base de datos almacena la información persistente.' :
  
  smartData.projectCategory === 'mobile' ? 
  '#### Arquitectura Móvil\n\n```\n┌─────────────┐    ┌─────────────┐\n│   Mobile    │───▶│   Backend   │\n│     App     │    │   Services  │\n└─────────────┘    └─────────────┘\n```\n\nArquitectura cliente-servidor optimizada para dispositivos móviles con sincronización offline y manejo eficiente de recursos.' :
  
  smartData.projectCategory === 'ai' ?
  '#### Pipeline de ML\n\n```\n┌─────────────┐    ┌─────────────┐    ┌─────────────┐\n│ Data Input  │───▶│ Processing  │───▶│ ML Models   │\n│             │    │ Pipeline    │    │ & Output    │\n└─────────────┘    └─────────────┘    └─────────────┘\n```\n\nArquitectura de datos diseñada para procesamiento eficiente y entrenamiento de modelos de machine learning.' :
  
  '#### Arquitectura Modular\n\n```\n┌─────────────┐    ┌─────────────┐    ┌─────────────┐\n│  Presentation│───▶│  Business   │───▶│    Data     │\n│    Layer     │    │   Logic     │    │   Layer     │\n└─────────────┘    └─────────────┘    └─────────────┘\n```\n\nDiseño en capas que facilita el mantenimiento y testing del código.'
}

### Tecnologías Clave

${smartData.hasReact ? '#### React\n\n- **Versión**: React 18+ con hooks y concurrent features\n- **State Management**: Context API / Redux según complejidad\n- **Componentes**: Arquitectura de componentes reutilizables\n- **Performance**: Lazy loading y code splitting\n\n' : ''}
${smartData.hasNode ? '#### Node.js\n\n- **Runtime**: Node.js 18+ con soporte para ES modules\n- **Framework**: Express.js para APIs RESTful\n- **Autenticación**: JWT para manejo de sesiones\n- **Validación**: Middleware de validación de datos\n\n' : ''}
${smartData.hasTypescript ? '#### TypeScript\n\n- **Tipado**: Interfaces y tipos estrictos\n- **Configuración**: tsconfig.json optimizado\n- **Linting**: ESLint con reglas TypeScript\n- **Build**: Compilación optimizada para producción\n\n' : ''}
${smartData.hasDatabase ? '#### Base de Datos\n\n- **Esquema**: Normalizado para eficiencia\n- **Indexación**: Índices optimizados para consultas frecuentes\n- **Migrations**: Control de versiones del esquema\n- **Backup**: Estrategia de respaldo automatizada\n\n' : ''}

## Instalación y Configuración

### Requisitos Previos

${smartData.hasNode ? '- Node.js 18+ y npm/yarn\n' : ''}
${smartData.hasPython ? '- Python 3.8+ con pip\n' : ''}
${smartData.hasDatabase ? '- Base de datos compatible (PostgreSQL/MongoDB/MySQL)\n' : ''}
- Git para control de versiones
${smartData.projectCategory === 'mobile' ? '- Android Studio / Xcode para desarrollo móvil\n' : ''}

### Instalación Paso a Paso

#### 1. Clonar el Repositorio

\`\`\`bash
git clone ${form.github_url || 'https://github.com/usuario/repositorio.git'}
cd ${smartData.title.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

#### 2. Instalar Dependencias

${smartData.hasNode ? 
  '```bash\n# Instalar dependencias del proyecto\nnpm install\n\n# O con yarn\nyarn install\n```' :
  smartData.hasPython ?
  '```bash\n# Crear entorno virtual\npython -m venv venv\nsource venv/bin/activate  # Linux/Mac\nvenv\\Scripts\\activate     # Windows\n\n# Instalar dependencias\npip install -r requirements.txt\n```' :
  '```bash\n# Seguir instrucciones específicas del proyecto\n# Ver README.md para detalles\n```'
}

#### 3. Configuración del Entorno

\`\`\`bash
# Copiar archivo de configuración
cp .env.example .env

# Editar variables de entorno
${smartData.hasDatabase ? '# DATABASE_URL=tu_url_de_base_de_datos\n' : ''}
${smartData.hasNode ? '# PORT=3000\n# JWT_SECRET=tu_secreto_jwt\n' : ''}
# API_KEY=tu_api_key
\`\`\`

#### 4. Ejecutar el Proyecto

${smartData.hasNode && smartData.hasReact ?
  '```bash\n# Desarrollo (frontend y backend)\nnpm run dev\n\n# O ejecutar por separado\nnpm run dev:frontend  # Puerto 3000\nnpm run dev:backend   # Puerto 5000\n```' :
  smartData.hasPython ?
  '```bash\n# Ejecutar aplicación Python\npython app.py\n\n# O con Flask\nflask run\n```' :
  '```bash\n# Ejecutar en modo desarrollo\nnpm start\n\n# Build para producción\nnpm run build\n```'
}

## Uso y Ejemplos

### Características Principales

${smartData.projectCategory === 'web' ? 
  '- **Interfaz Responsiva**: Adaptable a todos los dispositivos\n- **Performance Optimizada**: Carga rápida y experiencia fluida\n- **SEO Friendly**: Optimizado para motores de búsqueda' :
  smartData.projectCategory === 'mobile' ?
  '- **Interfaz Nativa**: Aprovecha las capacidades del dispositivo\n- **Offline Support**: Funcionalidad sin conexión\n- **Push Notifications**: Notificaciones en tiempo real' :
  smartData.projectCategory === 'ai' ?
  '- **Procesamiento Inteligente**: Análisis automatizado de datos\n- **Predicciones Precisas**: Modelos entrenados y validados\n- **Visualización de Datos**: Dashboards interactivos' :
  '- **Funcionalidad Robusta**: Características principales del software\n- **Interfaz Intuitiva**: Diseño centrado en el usuario\n- **Escalabilidad**: Preparado para crecimiento'
}

### Ejemplos de Código

${smartData.hasReact ? 
  '#### Componente React Básico\n\n```tsx\nimport React, { useState, useEffect } from \'react\';\nimport { ${smartData.title.replace(/\s+/g, \'\')}Service } from \'../services\';\n\nconst ${smartData.title.replace(/\s+/g, \'\')}Component: React.FC = () => {\n  const [data, setData] = useState([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    const fetchData = async () => {\n      try {\n        const result = await ${smartData.title.replace(/\s+/g, \'\')}Service.getData();\n        setData(result);\n      } catch (error) {\n        console.error(\'Error fetching data:\', error);\n      } finally {\n        setLoading(false);\n      }\n    };\n\n    fetchData();\n  }, []);\n\n  if (loading) return <div>Cargando...</div>;\n\n  return (\n    <div className="component-container">\n      {data.map(item => (\n        <div key={item.id}>{item.name}</div>\n      ))}\n    </div>\n  );\n};\n\nexport default ${smartData.title.replace(/\s+/g, \'\')}Component;\n```\n\n' : ''
}

${smartData.hasNode ? 
  '#### API Endpoint (Node.js)\n\n```javascript\nconst express = require(\'express\');\nconst router = express.Router();\nconst ${smartData.title.replace(/\s+/g, \'\').toLowerCase()}Service = require(\'../services/${smartData.title.replace(/\s+/g, \'\').toLowerCase()}Service\');\n\n// GET /api/${smartData.title.replace(/\s+/g, \'\').toLowerCase()}\nrouter.get(\'/${smartData.title.replace(/\s+/g, \'\').toLowerCase()}\', async (req, res) => {\n  try {\n    const data = await ${smartData.title.replace(/\s+/g, \'\').toLowerCase()}Service.getAll();\n    res.json({\n      success: true,\n      data\n    });\n  } catch (error) {\n    res.status(500).json({\n      success: false,\n      message: error.message\n    });\n  }\n});\n\n// POST /api/${smartData.title.replace(/\s+/g, \'\').toLowerCase()}\nrouter.post(\'/${smartData.title.replace(/\s+/g, \'\').toLowerCase()}\', async (req, res) => {\n  try {\n    const newItem = await ${smartData.title.replace(/\s+/g, \'\').toLowerCase()}Service.create(req.body);\n    res.status(201).json({\n      success: true,\n      data: newItem\n    });\n  } catch (error) {\n    res.status(400).json({\n      success: false,\n      message: error.message\n    });\n  }\n});\n\nmodule.exports = router;\n```\n\n' : ''
}

## Testing

### Estrategia de Testing

${smartData.hasReact ? '- **Unit Tests**: Jest + React Testing Library\n' : ''}
${smartData.hasNode ? '- **Integration Tests**: Supertest para APIs\n' : ''}
- **E2E Tests**: ${smartData.projectCategory === 'web' ? 'Cypress/Playwright' : 'Detox para mobile'}
${smartData.hasTypescript ? '- **Type Checking**: TypeScript compiler\n' : ''}

### Ejecutar Tests

\`\`\`bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:coverage

# Tests E2E
npm run test:e2e

# Linting
npm run lint
\`\`\`

## Despliegue

### Producción

#### Build del Proyecto

\`\`\`bash
# Crear build optimizado
npm run build

# Verificar build
npm run preview
\`\`\`

#### Configuración del Servidor

${smartData.hasNode ? 
  '```bash\n# Variables de entorno de producción\nNODE_ENV=production\nPORT=3000\nDATABASE_URL=postgresql://...\nJWT_SECRET=production_secret\n\n# Ejecutar en producción\nnpm start\n```' :
  '```bash\n# Servir archivos estáticos\n# Configurar servidor web (Nginx/Apache)\n# Configurar SSL/HTTPS\n```'
}

#### Docker (Opcional)

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

## Contribución

### Flujo de Desarrollo

1. **Fork** del repositorio
2. **Crear** rama para nueva funcionalidad
3. **Implementar** cambios con tests
4. **Commit** con mensajes descriptivos
5. **Push** y crear **Pull Request**

### Estándares de Código

${smartData.hasTypescript ? '- **TypeScript**: Tipado estricto obligatorio\n' : ''}
- **ESLint**: Configuración estricta
- **Prettier**: Formato automático de código
- **Conventional Commits**: Formato de commits semántico

### Testing Obligatorio

- Tests unitarios para nuevas funcionalidades
- Coverage mínimo del 80%
- Tests E2E para flujos críticos

## Performance y Optimización

### Métricas Clave

${smartData.hasReact ? '- **First Contentful Paint**: < 1.5s\n- **Time to Interactive**: < 3.0s\n' : ''}
${smartData.hasNode ? '- **API Response Time**: < 200ms\n- **Throughput**: > 1000 req/s\n' : ''}
- **Lighthouse Score**: > 90
- **Bundle Size**: Optimizado y tree-shaken

### Optimizaciones Implementadas

${smartData.hasReact ? '- **Code Splitting**: Carga lazy de componentes\n- **Memoization**: React.memo y useMemo\n' : ''}
${smartData.hasNode ? '- **Caching**: Redis para datos frecuentes\n- **Compression**: Gzip en respuestas\n' : ''}
- **CDN**: Recursos estáticos distribuidos
- **Minificación**: CSS y JS optimizados

## Seguridad

### Implementaciones de Seguridad

${smartData.hasNode ? '- **Autenticación**: JWT con refresh tokens\n- **Autorización**: RBAC (Role-Based Access Control)\n' : ''}
- **Validación**: Sanitización de inputs
- **HTTPS**: Encriptación de datos en tránsito
${smartData.hasDatabase ? '- **Database**: Prepared statements (SQL injection prevention)\n' : ''}
- **Headers**: Security headers (CSP, HSTS, etc.)

## Licencia

${smartData.title} está licenciado bajo la **Licencia MIT**.

Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## Recursos Adicionales

**Documentación:**
${form.github_url ? `- [Código fuente](${form.github_url})` : ''}
${form.live_url ? `- [Demo en vivo](${form.live_url})` : ''}
${form.article_url ? `- [Documentación extendida](${form.article_url})` : ''}

**Soporte:**
- Issues: Reportar bugs en GitHub
- Discussions: Preguntas y ideas
- Wiki: Documentación adicional

---

*Documentación técnica actualizada el ${new Date().toLocaleDateString('es-ES')}*`;
                    
                    handleFormChange('article_content', techArticleTemplate);
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--md-sys-color-secondary)',
                    color: 'var(--md-sys-color-on-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Crear documentación técnica completa"
                >
                  <i className="fas fa-code"></i> Plantilla Técnica
                </button>

                <button
                  type="button"
                  className={styles.toolButton}                  onClick={() => {
                    const smartData = generateSmartTemplate('blog');
                    const blogPostTemplate = `# ${smartData.title}${smartData.isArticle ? ': Análisis y Reflexiones' : ': Del Concepto a la Realidad'}

> ${smartData.description}

![${smartData.title}](${form.image_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'})

## ${smartData.isArticle ? '¿Por qué es relevante este análisis?' : '¿Por qué surgió este proyecto?'}

En el mundo del ${smartData.projectCategory === 'web' ? 'desarrollo web' : smartData.projectCategory === 'mobile' ? 'desarrollo móvil' : smartData.projectCategory === 'ai' ? 'machine learning y la inteligencia artificial' : 'desarrollo de software'}, constantemente nos enfrentamos a nuevos desafíos que requieren soluciones innovadoras. ${smartData.title} ${smartData.isArticle ? 'representa un caso de estudio fascinante' : 'nació de la necesidad de'} ${smartData.projectCategory === 'web' ? 'crear experiencias web más eficientes y atractivas' : smartData.projectCategory === 'mobile' ? 'desarrollar aplicaciones móviles nativas de alta calidad' : smartData.projectCategory === 'ai' ? 'implementar soluciones de IA prácticas y escalables' : 'resolver problemas específicos con tecnología moderna'}.

## El problema que ${smartData.isArticle ? 'se analiza' : 'resuelve'}

### Contexto actual

${smartData.projectCategory === 'web' ? 
  'El desarrollo web moderno exige herramientas que no solo sean funcionales, sino que también ofrezcan una experiencia de usuario excepcional. Muchas soluciones existentes presentan limitaciones en términos de rendimiento, usabilidad o escalabilidad.' :
  smartData.projectCategory === 'mobile' ?
  'El mercado móvil actual demanda aplicaciones que aprovechen al máximo las capacidades nativas del dispositivo, pero que mantengan un desarrollo eficiente y código mantenible.' :
  smartData.projectCategory === 'ai' ?
  'La implementación de soluciones de inteligencia artificial en entornos de producción presenta desafíos únicos en términos de rendimiento, precisión y escalabilidad.' :
  'Los desarrolladores necesitan herramientas que les permitan crear soluciones robustas sin comprometer la velocidad de desarrollo o la calidad del código.'
}

### Nuestra propuesta

${smartData.hasReact && smartData.hasNode ? 
  '**Full-Stack JavaScript** nos permite mantener consistencia en todo el stack tecnológico, reduciendo la curva de aprendizaje y mejorando la productividad del equipo.' :
  smartData.hasTypescript ?
  '**TypeScript** garantiza un código más robusto y mantenible, reduciendo significativamente los errores en tiempo de ejecución.' :
  'Un enfoque moderno que prioriza la **experiencia del desarrollador** sin sacrificar el **rendimiento del usuario final**.'
}

## El proceso de desarrollo

### Fase 1: Investigación y Planificación

${smartData.isArticle ? 'Durante el análisis inicial' : 'Antes de escribir la primera línea de código'}, dedicamos tiempo considerable a:

- **Análisis de competencia**: Estudiar soluciones existentes y sus limitaciones
- **Definición de requisitos**: Establecer objetivos claros y medibles
- **Selección tecnológica**: Evaluar opciones basándose en criterios objetivos

### Fase 2: Diseño de la Arquitectura

${smartData.hasReact ? 
  '#### Frontend con React\n\nLa elección de React se basó en varios factores clave:\n\n- **Ecosistema maduro**: Amplia comunidad y herramientas disponibles\n- **Performance**: Virtual DOM y optimizaciones automáticas\n- **Mantenibilidad**: Componentes reutilizables y código predecible\n\n```jsx\n// Ejemplo de componente optimizado\nconst OptimizedComponent = React.memo(({ data }) => {\n  const memoizedValue = useMemo(() => {\n    return expensiveCalculation(data);\n  }, [data]);\n\n  return (\n    <div className="component">\n      {memoizedValue}\n    </div>\n  );\n});\n```\n\n' : ''
}

${smartData.hasNode ? 
  '#### Backend con Node.js\n\nNode.js nos permitió:\n\n- **Unificación del lenguaje**: JavaScript en todo el stack\n- **Performance**: Event loop no bloqueante para I/O intensivo\n- **NPM Ecosystem**: Acceso a miles de paquetes quality\n\n```javascript\n// API endpoint optimizado\napp.get(\'/api/data\', async (req, res) => {\n  try {\n    const cachedData = await cache.get(\'data-key\');\n    if (cachedData) {\n      return res.json(cachedData);\n    }\n    \n    const freshData = await dataService.fetch();\n    await cache.set(\'data-key\', freshData, 300); // 5 min TTL\n    \n    res.json(freshData);\n  } catch (error) {\n    res.status(500).json({ error: error.message });\n  }\n});\n```\n\n' : ''
}

### Fase 3: Implementación Iterativa

${form.technologies && form.technologies.length > 0 ? 
  `El stack tecnológico final incluyó:\n\n${form.technologies.map((tech: string) => {
    const techLower = tech.toLowerCase();
    if (techLower.includes('react')) {
      return `- **${tech}**: Para una interfaz de usuario moderna y reactiva`;
    } else if (techLower.includes('node')) {
      return `- **${tech}**: Backend escalable con excelente rendimiento`;
    } else if (techLower.includes('typescript')) {
      return `- **${tech}**: Tipado estático para código más robusto`;
    } else if (techLower.includes('database') || techLower.includes('sql') || techLower.includes('mongo')) {
      return `- **${tech}**: Gestión eficiente de datos persistentes`;
    } else {
      return `- **${tech}**: Herramienta especializada para funcionalidades específicas`;
    }
  }).join('\n')}` :
  'Cada tecnología fue seleccionada cuidadosamente para maximizar la eficiencia y mantenibilidad del código.'
}

## Resultados y métricas

### Logros técnicos

${smartData.hasReact ? '✅ **Performance de Frontend**\n- First Contentful Paint: < 1.5s\n- Time to Interactive: < 3.0s\n- Lighthouse Score: 95+\n\n' : ''}
${smartData.hasNode ? '✅ **Eficiencia del Backend**\n- Response time: < 200ms\n- Throughput: 1000+ req/s\n- Uptime: 99.9%\n\n' : ''}
✅ **Experiencia de Desarrollo**
- Tiempo de build reducido en 40%
- Errores en producción reducidos en 60%
- Velocidad de desarrollo aumentada en 35%

### Métricas de usuario

${smartData.projectCategory === 'web' ? 
  '- **Engagement**: +45% tiempo en página\n- **Conversión**: +30% tasa de conversión\n- **Satisfacción**: 4.8/5 rating promedio' :
  smartData.projectCategory === 'mobile' ?
  '- **Retención**: +50% usuarios activos diarios\n- **Performance**: 4.9/5 rating en stores\n- **Adoption**: 10K+ descargas en primer mes' :
  smartData.projectCategory === 'ai' ?
  '- **Precisión**: 94% accuracy en predicciones\n- **Eficiencia**: 3x más rápido que solución anterior\n- **Adopción**: 85% de usuarios migrados exitosamente' :
  '- **Usabilidad**: +40% reducción en tiempo de tareas\n- **Satisfacción**: 90% feedback positivo\n- **Productividad**: +25% mejora en workflows'
}

## Lecciones aprendidas

### Desafíos técnicos superados

1. **${smartData.hasReact ? 'Optimización de re-renders' : smartData.hasNode ? 'Manejo de concurrencia' : smartData.projectCategory === 'ai' ? 'Optimización de modelos' : 'Escalabilidad del sistema'}**
   
   ${smartData.hasReact ? 
     'Inicialmente experimentamos problemas de rendimiento con re-renders innecesarios. La solución incluyó el uso estratégico de React.memo, useMemo y useCallback, junto con una arquitectura de estado más granular.' :
     smartData.hasNode ?
     'El manejo de múltiples requests concurrentes requirió implementar un sistema de queues y workers, además de optimizar las consultas a la base de datos.' :
     smartData.projectCategory === 'ai' ?
     'Los modelos iniciales eran demasiado pesados para producción. Implementamos técnicas de model compression y caching inteligente.' :
     'La escalabilidad horizontal requirió rediseñar la arquitectura para ser completamente stateless y implementar load balancing efectivo.'
   }

2. **${smartData.hasTypescript ? 'Adopción gradual de TypeScript' : smartData.hasDatabase ? 'Optimización de consultas' : 'Testing strategy'}**
   
   ${smartData.hasTypescript ?
     'La migración a TypeScript se realizó gradualmente, priorizando los módulos críticos. Esto nos permitió mantener la productividad mientras mejorábamos la calidad del código.' :
     smartData.hasDatabase ?
     'Las consultas iniciales eran ineficientes. Implementamos índices estratégicos y queries optimizadas, reduciendo el tiempo de respuesta en 70%.' :
     'Desarrollamos una estrategia de testing integral que incluye unit tests, integration tests y E2E tests, alcanzando 95% de code coverage.'
   }

### Mejores prácticas identificadas

#### Desarrollo
- **Code Reviews**: Obligatorios para todos los PRs, mejorando la calidad del código
- **Documentación**: README detallado y comentarios inline para facilitar onboarding
- **Versionado**: Semantic versioning y changelog automático

#### Despliegue
- **CI/CD**: Pipeline automatizado con tests y deployment
- **Monitoring**: Logs centralizados y métricas en tiempo real
- **Rollback**: Estrategia de rollback automático en caso de errores

## Impacto y evolución futura

### Roadmap a corto plazo

${smartData.hasReact ? '- **React 18 Features**: Adopción completa de concurrent features\n' : ''}
${smartData.hasNode ? '- **API v2**: Nueva versión con GraphQL support\n' : ''}
${smartData.projectCategory === 'ai' ? '- **Model Improvements**: Nuevos algoritmos y mejor precisión\n' : ''}
- **Mobile App**: ${smartData.projectCategory === 'mobile' ? 'Nuevas funcionalidades nativas' : 'Desarrollo de app móvil complementaria'}
- **Analytics Dashboard**: Panel de métricas avanzado para usuarios

### Visión a largo plazo

${smartData.title} ${smartData.isArticle ? 'sirve como base para' : 'tiene el potencial de convertirse en'} una plataforma que:

- **Escale globalmente**: Soporte multi-región y multi-idioma
- **Integre IA**: ${smartData.projectCategory === 'ai' ? 'Modelos más sofisticados' : 'Funcionalidades inteligentes automáticas'}
- **Fomente comunidad**: Marketplace de plugins y extensiones

## Para la comunidad dev

### ¿Cómo puedes aplicar estos aprendizajes?

Si estás ${smartData.projectCategory === 'web' ? 'desarrollando aplicaciones web' : smartData.projectCategory === 'mobile' ? 'creando apps móviles' : smartData.projectCategory === 'ai' ? 'implementando soluciones de IA' : 'trabajando en proyectos similares'}, considera:

1. **Stack tecnológico**: ${smartData.hasReact && smartData.hasNode ? 'Full-stack JavaScript puede simplificar tu desarrollo' : smartData.hasTypescript ? 'TypeScript te ayudará a escalar tu código' : 'Evalúa cada tecnología basándose en tus necesidades específicas'}

2. **Arquitectura**: ${smartData.projectCategory === 'web' ? 'Componentes reutilizables y estado centralizado' : smartData.projectCategory === 'mobile' ? 'Arquitectura nativa con código compartido estratégico' : 'Diseño modular y testeable desde el inicio'}

3. **Performance**: ${smartData.hasReact ? 'Optimización proactiva de renders y bundle size' : 'Monitoring constante y optimización basada en datos reales'}

### Código abierto y contribuciones

${form.github_url ? 
  `El código fuente está disponible en [GitHub](${form.github_url}) bajo licencia MIT. Las contribuciones son bienvenidas, especialmente en:` :
  'Consideramos liberar partes del código como open source, especialmente:'
}

- Componentes UI reutilizables
- Utilities y helpers comunes
- Documentación y ejemplos

## Reflexiones finales

${smartData.title} ${smartData.isArticle ? 'demuestra que' : 'ha sido más que un proyecto - es una validación de que'} con la combinación correcta de tecnologías, metodología y equipo, es posible crear soluciones que no solo resuelven problemas técnicos, sino que también ${smartData.projectCategory === 'web' ? 'mejoran significativamente la experiencia web' : smartData.projectCategory === 'mobile' ? 'establecen nuevos estándares en desarrollo móvil' : smartData.projectCategory === 'ai' ? 'hacen la IA más accesible y práctica' : 'innovan en su campo específico'}.

### ¿Qué sigue?

La tecnología evoluciona constantemente, y proyectos como este nos recuerdan la importancia de:

- **Mantenerse actualizado** con las últimas tendencias y herramientas
- **Experimentar** con nuevas tecnologías en proyectos personales
- **Compartir conocimiento** con la comunidad de desarrolladores

---

## ¿Quieres saber más?

**🔗 Enlaces útiles:**
${form.github_url ? `- [Ver código fuente](${form.github_url})` : ''}
${form.live_url ? `- [Probar demo interactiva](${form.live_url})` : ''}
${form.article_url ? `- [Documentación completa](${form.article_url})` : ''}

**💬 Conecta conmigo:**
- LinkedIn: [Tu perfil profesional]
- Twitter: [@tu_usuario]
- GitHub: [Tu perfil de GitHub]

**❓ Preguntas frecuentes:**
- ¿Cómo puedo contribuir al proyecto?
- ¿Hay planes de crear un curso/tutorial?
- ¿Qué recursos recomiendas para aprender estas tecnologías?

---

*¿Te ha resultado útil este ${smartData.isArticle ? 'análisis' : 'caso de estudio'}? ¡Compártelo con otros developers que puedan beneficiarse! Y si tienes preguntas o sugerencias, no dudes en dejar un comentario.*

**#${smartData.projectCategory}development** **#${smartData.hasReact ? 'react' : smartData.hasNode ? 'nodejs' : smartData.hasPython ? 'python' : 'coding'}** **#opensource** ${smartData.hasTypescript ? '**#typescript**' : ''} **#devlife**`;
                    
                    handleFormChange('article_content', blogPostTemplate);
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--md-sys-color-tertiary)',
                    color: 'var(--md-sys-color-on-tertiary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Crear artículo de blog con estructura narrativa"
                >
                  <i className="fas fa-blog"></i> Plantilla Blog
                </button>

                <button
                  type="button"
                  className={styles.toolButton}
                  onClick={() => {
                    const currentContent = form.article_content || '';
                    
                    // Generar tabla de contenidos automática basada en headers
                    const headers = currentContent.match(/^(#{1,6})\s+(.+)$/gm);
                    
                    if (!headers) {
                      showError('Sin encabezados', 'No se encontraron encabezados para generar la tabla de contenidos. Agrega encabezados usando # ## ### etc.');
                      return;
                    }

                    let toc = "## Tabla de Contenidos\n\n";
                    
                    headers.forEach(header => {
                      const match = header.match(/^(#{1,6})\s+(.+)$/);
                      if (match) {
                        const level = match[1].length;
                        const text = match[2].trim();
                        const anchor = text.toLowerCase()
                          .replace(/[^\w\s-]/g, '')
                          .replace(/\s+/g, '-')
                          .replace(/-+/g, '-')
                          .replace(/^-|-$/g, '');
                        
                        const indent = '  '.repeat(Math.max(0, level - 1));
                        toc += `${indent}- [${text}](#${anchor})\n`;
                      }
                    });
                    
                    toc += "\n";
                    
                    // Insertar TOC al principio después del título principal
                    const titleMatch = currentContent.match(/^#\s+.+$/m);
                    if (titleMatch) {
                      const titleEnd = currentContent.indexOf('\n', currentContent.indexOf(titleMatch[0]));
                      const newContent = currentContent.substring(0, titleEnd + 1) + '\n' + toc + currentContent.substring(titleEnd + 1);
                      handleFormChange('article_content', newContent);
                      showSuccess('Tabla de contenidos generada', 'Se ha añadido automáticamente una tabla de contenidos basada en los encabezados del documento.');
                    } else {
                      // Si no hay título principal, agregar al principio
                      const newContent = toc + currentContent;
                      handleFormChange('article_content', newContent);
                      showSuccess('Tabla de contenidos generada', 'Se ha añadido la tabla de contenidos al principio del documento.');
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Generar tabla de contenidos automática"
                >
                  <i className="fas fa-list-alt"></i> Generar TOC
                </button>

                <button
                  type="button"
                  className={styles.toolButton}
                  onClick={() => {
                    const currentContent = form.article_content || '';
                    const stats = {
                      words: currentContent.split(/\s+/).filter(w => w.length > 0).length,
                      characters: currentContent.length,
                      paragraphs: currentContent.split('\n\n').filter(p => p.trim().length > 0).length,
                      headers: (currentContent.match(/^#{1,6}\s+.+$/gm) || []).length,
                      links: (currentContent.match(/\[.+\]\(.+\)/g) || []).length,
                      images: (currentContent.match(/!\[.*\]\(.+\)/g) || []).length,
                      codeBlocks: (currentContent.match(/```[\s\S]*?```/g) || []).length,
                      readingTime: Math.ceil(currentContent.split(/\s+/).filter(w => w.length > 0).length / 200) // 200 WPM promedio
                    };

                    const statsMessage = `📊 **Estadísticas del Contenido:**

📝 **Texto:**
• ${stats.words} palabras
• ${stats.characters} caracteres
• ${stats.paragraphs} párrafos
• ⏱️ ${stats.readingTime} min de lectura

📋 **Estructura:**
• ${stats.headers} encabezados
• ${stats.links} enlaces
• ${stats.images} imágenes
• ${stats.codeBlocks} bloques de código

💡 **Recomendaciones:**
${stats.words < 300 ? '• Considera expandir el contenido (mínimo 300 palabras)\n' : ''}
${stats.headers === 0 ? '• Agrega encabezados para mejorar la estructura\n' : ''}
${stats.images === 0 ? '• Considera añadir imágenes para mejorar el engagement\n' : ''}
${stats.words > 2000 ? '• El artículo es largo, considera dividirlo en secciones\n' : ''}`;

                    alert(statsMessage);
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--md-sys-color-secondary-container)',
                    color: 'var(--md-sys-color-on-secondary-container)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Analizar estadísticas del contenido"
                >
                  <i className="fas fa-chart-bar"></i> Estadísticas
                </button>

                <button
                  type="button"
                  className={styles.toolButton}
                  onClick={() => {
                    const currentContent = form.article_content || '';
                    
                    // Limpiar y optimizar el contenido Markdown
                    let optimized = currentContent;
                    
                    // Normalizar espaciado de encabezados
                    optimized = optimized.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');
                    
                    // Remover espacios en blanco al final de líneas
                    optimized = optimized.replace(/[ \t]+$/gm, '');
                    
                    // Normalizar líneas vacías múltiples
                    optimized = optimized.replace(/\n{3,}/g, '\n\n');
                    
                    // Normalizar enlaces
                    optimized = optimized.replace(/\[\s*([^\]]+)\s*\]\s*\(\s*([^)]+)\s*\)/g, '[$1]($2)');
                    
                    // Normalizar código inline
                    optimized = optimized.replace(/`\s+([^`]+)\s+`/g, '`$1`');
                    
                    // Normalizar listas
                    optimized = optimized.replace(/^(\s*)([-*+])\s+(.+)$/gm, '$1- $3');
                    optimized = optimized.replace(/^(\s*)(\d+\.)\s+(.+)$/gm, '$1$2 $3');
                    
                    // Trim general
                    optimized = optimized.trim();
                    
                    if (optimized !== currentContent) {
                      handleFormChange('article_content', optimized);
                      showSuccess('Contenido optimizado', 'Se ha limpiado y normalizado el formato del contenido Markdown.');
                    } else {
                      showSuccess('Ya optimizado', 'El contenido ya tiene un formato óptimo.');
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--md-sys-color-surface-container-high)',
                    color: 'var(--md-sys-color-on-surface)',
                    border: '1px solid var(--md-sys-color-outline)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Limpiar y optimizar formato Markdown"
                >
                  <i className="fas fa-broom"></i> Optimizar
                </button>
              </div>              <div className={styles.editorContainer}>
                <LexicalEditor
                  content={form.article_content || ''}
                  onChange={(content: string) => handleFormChange('article_content', content)}
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
            {saving ? 'Guardando...' : 'Actualizar Proyecto'}
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

export default EditArticle;
