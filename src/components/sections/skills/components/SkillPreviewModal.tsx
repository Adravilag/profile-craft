// src/components/sections/skills/components/SkillPreviewModal.tsx
import { getResourcesForSkill, filterResourcesByLevel, groupResourcesByCategory, categoryConfig, type SkillResource } from '../../../../data/skillResources';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ModalPortal from '../../../common/ModalPortal';
import type { SkillPreviewModalProps } from '../types/skills';
import type { Project } from '../../../../services/api';
import { getSkillSvg, getSkillCssClass, getDifficultyStars } from '../utils/skillUtils';
import { getProjects } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { getStateClassName, normalizeState } from '../../../../constants/projectStates';
import styles from './SkillPreviewModal.module.css';

const SkillPreviewModal: React.FC<SkillPreviewModalProps> = ({
  isOpen,
  onClose,
  skill,
  skillsIcons,
  externalData,
  loadingExternalData
}) => {
  const { isAuthenticated } = useAuth();
  const [projectsWithSkill, setProjectsWithSkill] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'resources'>('overview');
  const [error, setError] = useState<string | null>(null);
  const [resourceFilter, setResourceFilter] = useState<'todos' | 'basico' | 'intermedio' | 'avanzado'>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Memoized calculations
  const skillInfo = useMemo(() => 
    skillsIcons.find(s => s.name.toLowerCase() === skill?.name.toLowerCase()),
    [skillsIcons, skill?.name]
  );

  const skillData = useMemo(() => {
    if (!skill) return null;
    
    const svgPath = getSkillSvg(skill.name, skill.icon_class, skillsIcons);
    const skillColor = skillInfo?.color || "#007acc";
    const skillCssClass = getSkillCssClass(skill.name);
    const externalInfo = externalData[skill.name];
    const difficultySource = externalInfo?.difficulty || skillInfo?.difficulty_level;
    const difficultyStars = getDifficultyStars(difficultySource);
    const yearsExp = skill.years_experience || skill.experience || 0;

    return {
      svgPath,
      skillColor,
      skillCssClass,
      externalInfo,
      difficultySource,
      difficultyStars,
      yearsExp
    };
  }, [skill, skillInfo, skillsIcons, externalData]);

  // Enhanced project loading with error handling
  const loadProjectsWithSkill = useCallback(async () => {
    if (!skill) return;
    
    setLoadingProjects(true);
    setError(null);
    
    try {
      const projects = await getProjects();
      const filteredProjects = projects.filter((project: Project) => 
        project.technologies && 
        project.technologies.some((tech: string) => 
          tech.toLowerCase().includes(skill.name.toLowerCase()) ||
          skill.name.toLowerCase().includes(tech.toLowerCase())
        )
      );
      setProjectsWithSkill(filteredProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('No se pudieron cargar los proyectos');
      setProjectsWithSkill([]);
    } finally {
      setLoadingProjects(false);
    }
  }, [skill]);

  useEffect(() => {
    if (isOpen && skill) {
      loadProjectsWithSkill();
    }
  }, [isOpen, skill, loadProjectsWithSkill]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Tab') {
        // Handle tab navigation within modal
        const focusableElements = document.querySelectorAll(
          '.skill-modal [tabindex]:not([tabindex="-1"]), .skill-modal button, .skill-modal a'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Get resources for current skill
  const skillResources = useMemo(() => {
    if (!skill) return [];
    return getResourcesForSkill(skill.name);
  }, [skill]);

  // Filter resources based on level and category
  const filteredResources = useMemo(() => {
    let filtered = filterResourcesByLevel(skillResources, resourceFilter);
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((resource: SkillResource) => resource.category === selectedCategory);
    }
    
    return filtered;
  }, [skillResources, resourceFilter, selectedCategory]);

  // Group resources by category for organized display
  const groupedResources = useMemo(() => {
    return groupResourcesByCategory(filteredResources);
  }, [filteredResources]);

  // Get available categories for this skill
  const availableCategories = useMemo(() => {
    const categories = [...new Set(skillResources.map((r: SkillResource) => r.category))];
    return categories.map(cat => ({
      key: cat,
      ...categoryConfig[cat as keyof typeof categoryConfig]
    }));
  }, [skillResources]);
  const getPopularityLevel = useCallback((popularity: string) => {
    const level = popularity.toLowerCase();
    const configs = {
      'very_high': { stars: 5, label: 'Muy Alta', color: '#10b981', icon: 'fa-fire' },
      'high': { stars: 4, label: 'Alta', color: '#3b82f6', icon: 'fa-arrow-up' },
      'medium': { stars: 3, label: 'Media', color: '#f59e0b', icon: 'fa-minus' },
      'low': { stars: 2, label: 'Baja', color: '#ef4444', icon: 'fa-arrow-down' },
      'very_low': { stars: 1, label: 'Muy Baja', color: '#6b7280', icon: 'fa-arrow-down' }
    };

    const matchedKey = Object.keys(configs).find(key => 
      level.includes(key) || level.includes(key.replace('_', ' '))
    );
    
    return configs[matchedKey as keyof typeof configs] || configs.very_low;
  }, []);

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div className={styles.loadingSkeleton} role="status" aria-label="Cargando información">
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonAvatar}></div>
        <div className={styles.skeletonTitle}></div>
      </div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine}></div>
        <div className={styles.skeletonLine}></div>
        <div className={styles.skeletonLine}></div>
      </div>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className={styles.errorState} role="alert">
      <div className={styles.errorIcon}>
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <h3>Error al cargar información</h3>
      <p>{error}</p>
      <button 
        className={styles.retryButton}
        onClick={loadProjectsWithSkill}
        disabled={loadingProjects}
      >
        <i className="fas fa-redo"></i>
        Reintentar
      </button>
    </div>
  );

  // Enhanced competencies system for technical breakdown
  const getSkillCompetencies = (skillName: string, level: number) => {
    const baseCompetencies = {
      // Frontend Technologies
      'CSS3': [
        { name: 'Selectores y Especificidad', icon: 'fa-search', category: 'Core', color: '#1572B6' },
        { name: 'Flexbox y Grid Layout', icon: 'fa-th-large', category: 'Layout', color: '#FF6B35' },
        { name: 'Responsive Design', icon: 'fa-mobile-alt', category: 'Design', color: '#4CAF50' },
        { name: 'Animaciones y Transiciones', icon: 'fa-magic', category: 'Animation', color: '#9C27B0' },
        { name: 'Preprocesadores (Sass/Less)', icon: 'fa-code', category: 'Tools', color: '#FF9800' }
      ],
      'JavaScript': [
        { name: 'Sintaxis y Fundamentos ES6+', icon: 'fa-code-branch', category: 'Core', color: '#F7DF1E' },
        { name: 'DOM Manipulation', icon: 'fa-sitemap', category: 'Web API', color: '#FF6B35' },
        { name: 'Programación Asíncrona', icon: 'fa-clock', category: 'Async', color: '#4CAF50' },
        { name: 'Módulos y Bundling', icon: 'fa-cubes', category: 'Module', color: '#9C27B0' },
        { name: 'Testing y Debugging', icon: 'fa-bug', category: 'Quality', color: '#FF5722' }
      ],
      'React': [
        { name: 'Componentes y JSX', icon: 'fa-puzzle-piece', category: 'Core', color: '#61DAFB' },
        { name: 'State Management (Hooks)', icon: 'fa-database', category: 'State', color: '#FF6B35' },
        { name: 'Ciclo de Vida y Effects', icon: 'fa-recycle', category: 'Lifecycle', color: '#4CAF50' },
        { name: 'Context API y Props', icon: 'fa-share-alt', category: 'Data', color: '#9C27B0' },
        { name: 'Performance y Optimización', icon: 'fa-tachometer-alt', category: 'Performance', color: '#FF9800' }
      ],
      'TypeScript': [
        { name: 'Sistema de Tipos', icon: 'fa-tags', category: 'Core', color: '#3178C6' },
        { name: 'Interfaces y Generics', icon: 'fa-layer-group', category: 'Advanced', color: '#FF6B35' },
        { name: 'Decoradores y Metadata', icon: 'fa-at', category: 'Meta', color: '#4CAF50' },
        { name: 'Configuración y Tooling', icon: 'fa-cog', category: 'Config', color: '#9C27B0' },
        { name: 'Integration con Frameworks', icon: 'fa-plug', category: 'Integration', color: '#FF9800' }
      ],
      // Backend Technologies
      'Node.js': [
        { name: 'Runtime y Event Loop', icon: 'fa-circle-notch', category: 'Core', color: '#339933' },
        { name: 'NPM y Package Management', icon: 'fa-box', category: 'Package', color: '#FF6B35' },
        { name: 'APIs RESTful y GraphQL', icon: 'fa-exchange-alt', category: 'API', color: '#4CAF50' },
        { name: 'File System y Streams', icon: 'fa-file-code', category: 'I/O', color: '#9C27B0' },
        { name: 'Testing y Deployment', icon: 'fa-rocket', category: 'Deploy', color: '#FF9800' }
      ],
      'Python': [
        { name: 'Sintaxis y Estructuras de Datos', icon: 'fa-code', category: 'Core', color: '#3776AB' },
        { name: 'OOP y Programación Funcional', icon: 'fa-object-group', category: 'Paradigm', color: '#FF6B35' },
        { name: 'Librerías y Frameworks', icon: 'fa-cubes', category: 'Framework', color: '#4CAF50' },
        { name: 'Data Science y ML', icon: 'fa-chart-line', category: 'Data', color: '#9C27B0' },
        { name: 'Web Development (Django/Flask)', icon: 'fa-globe', category: 'Web', color: '#FF9800' }
      ],
      // Database Technologies
      'SQL': [
        { name: 'Consultas y Joins', icon: 'fa-search', category: 'Query', color: '#336791' },
        { name: 'Diseño de Base de Datos', icon: 'fa-sitemap', category: 'Design', color: '#FF6B35' },
        { name: 'Índices y Optimización', icon: 'fa-tachometer-alt', category: 'Performance', color: '#4CAF50' },
        { name: 'Stored Procedures', icon: 'fa-cogs', category: 'Advanced', color: '#9C27B0' },
        { name: 'Backup y Seguridad', icon: 'fa-shield-alt', category: 'Security', color: '#FF9800' }
      ],
      'MongoDB': [
        { name: 'Documentos y Colecciones', icon: 'fa-file-alt', category: 'Core', color: '#47A248' },
        { name: 'Queries y Aggregation', icon: 'fa-filter', category: 'Query', color: '#FF6B35' },
        { name: 'Indexing y Performance', icon: 'fa-tachometer-alt', category: 'Performance', color: '#4CAF50' },
        { name: 'Replication y Sharding', icon: 'fa-network-wired', category: 'Scale', color: '#9C27B0' },
        { name: 'Security y Authentication', icon: 'fa-lock', category: 'Security', color: '#FF9800' }
      ],
      // DevOps and Tools
      'Git': [
        { name: 'Control de Versiones', icon: 'fa-code-branch', category: 'Core', color: '#F05032' },
        { name: 'Branching y Merging', icon: 'fa-code-branch', category: 'Workflow', color: '#FF6B35' },
        { name: 'Colaboración y Pull Requests', icon: 'fa-users', category: 'Collaboration', color: '#4CAF50' },
        { name: 'Resolución de Conflictos', icon: 'fa-exclamation-triangle', category: 'Advanced', color: '#9C27B0' },
        { name: 'Git Hooks y Automation', icon: 'fa-robot', category: 'Automation', color: '#FF9800' }
      ],
      'Docker': [
        { name: 'Containers y Images', icon: 'fa-box', category: 'Core', color: '#2496ED' },
        { name: 'Dockerfile y Building', icon: 'fa-hammer', category: 'Build', color: '#FF6B35' },
        { name: 'Docker Compose', icon: 'fa-layer-group', category: 'Orchestration', color: '#4CAF50' },
        { name: 'Networking y Volumes', icon: 'fa-network-wired', category: 'Network', color: '#9C27B0' },
        { name: 'Production y Deployment', icon: 'fa-rocket', category: 'Deploy', color: '#FF9800' }
      ]
    };

    // Get competencies for the skill or use default
    const skillCompetencies = baseCompetencies[skillName as keyof typeof baseCompetencies] || [
      { name: 'Fundamentos', icon: 'fa-book', category: 'Core', color: '#6C757D' },
      { name: 'Implementación', icon: 'fa-code', category: 'Practice', color: '#28A745' },
      { name: 'Optimización', icon: 'fa-tachometer-alt', category: 'Performance', color: '#FFC107' },
      { name: 'Mejores Prácticas', icon: 'fa-star', category: 'Best Practice', color: '#17A2B8' },
      { name: 'Troubleshooting', icon: 'fa-wrench', category: 'Debug', color: '#DC3545' }
    ];

    // Calculate levels based on overall skill level
    return skillCompetencies.map((comp, index) => {
      // More sophisticated level calculation
      const baseLevel = Math.max(0, level - (index * 15)); // Decrease by 15% for each subsequent competency
      const variation = Math.random() * 20 - 10; // ±10% variation
      const finalLevel = Math.min(100, Math.max(0, baseLevel + variation));
      
      return {
        ...comp,
        level: Math.round(finalLevel),
        description: getCompetencyDescription(Math.round(finalLevel))
      };
    });
  };

  const getCompetencyDescription = (level: number): string => {
    const descriptions = {
      high: [
        'Dominio completo con capacidad de enseñar a otros',
        'Implementación experta en proyectos complejos',
        'Optimización avanzada y mejores prácticas',
        'Liderazgo técnico en esta área'
      ],
      medium: [
        'Implementación sólida en proyectos medianos',
        'Comprensión profunda de los conceptos',
        'Capacidad de resolver problemas complejos',
        'Experiencia práctica demostrable'
      ],
      low: [
        'Conocimientos básicos y fundamentos sólidos',
        'Implementación en proyectos simples',
        'En proceso de desarrollo y mejora',
        'Base sólida para crecimiento futuro'
      ]
    };

    const categoryDescriptions = descriptions[level >= 80 ? 'high' : level >= 50 ? 'medium' : 'low'];
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  };

  // Enhanced project card rendering
  const renderProjectCard = (project: Project) => (
    <article key={project.id} className={styles.projectCard}>
      <div className={styles.projectImageContainer}>
        {project.image_url ? (
          <img 
            src={project.image_url} 
            alt={`Captura de ${project.title}`}
            className={styles.projectImage}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.add(styles.visible);
            }}
          />
        ) : null}
        <div className={styles.projectImageFallback}>
          <i className="fas fa-code"></i>
        </div>
      </div>
      
      <div className={styles.projectContent}>
        <header className={styles.projectHeader}>
          <h4 className={styles.projectTitle}>{project.title}</h4>
          <span className={`${styles.statusBadge} ${styles[getStateClassName(normalizeState(project.status))]}`}>
            {normalizeState(project.status)}
          </span>
        </header>
        
        <p className={styles.projectDescription}>
          {project.description.length > 120 
            ? `${project.description.substring(0, 120)}...` 
            : project.description}
        </p>
        
        <div className={styles.projectTechnologies}>
          {project.technologies.slice(0, 4).map((tech, index) => (
            <span 
              key={index} 
              className={`${styles.techTag} ${
                tech.toLowerCase() === skill?.name.toLowerCase() ? styles.highlighted : ''
              }`}
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span 
              className={styles.moreTech}
              title={`Tecnologías adicionales: ${project.technologies.slice(4).join(', ')}`}
            >
              +{project.technologies.length - 4} más
            </span>
          )}
        </div>
        
        <nav className={styles.projectLinks} aria-label="Enlaces del proyecto">
          {project.github_url && (
            <a 
              href={project.github_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.projectLink}
              title="Ver código fuente en GitHub"
              aria-label={`Ver código fuente de ${project.title}`}
            >
              <i className="fab fa-github"></i>
            </a>
          )}
          {project.live_url && (
            <a 
              href={project.live_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.projectLink}
              title="Ver demo en vivo"
              aria-label={`Ver demo en vivo de ${project.title}`}
            >
              <i className="fas fa-external-link-alt"></i>
            </a>
          )}
          {project.article_url && (
            <a 
              href={project.article_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.projectLink}
              title="Leer artículo relacionado"
              aria-label={`Leer artículo sobre ${project.title}`}
            >
              <i className="fas fa-newspaper"></i>
            </a>
          )}
        </nav>
      </div>
    </article>
  );

  if (!isOpen || !skill || !skillData) return null;

  const { svgPath, skillColor, skillCssClass, externalInfo, difficultySource, difficultyStars, yearsExp } = skillData;

  return (
    <ModalPortal>
      <div 
        className={`${styles.skillPreviewOverlay} ${styles.blurOverlay}`} 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-modal-title"
      >
        <div 
          className={`${styles.skillPreviewModal} skill-modal`} 
          onClick={(e) => e.stopPropagation()}
          role="document"
        >
          {/* Enhanced Header */}
          <header className={styles.skillPreviewHeader}>
            <div className={styles.skillHeaderMain}>
              <div 
                className={`${styles.skillPreviewIcon} ${skillCssClass}`} 
                style={{ '--skill-color': skillColor } as React.CSSProperties}
              >
                <img 
                  src={svgPath} 
                  alt=""
                  role="presentation"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/svg/generic-code.svg';
                  }}
                />
              </div>
              <div className={styles.skillHeaderInfo}>
                <h1 id="skill-modal-title" className={styles.skillPreviewTitle}>
                  {skill.name}
                </h1>
                <div className={styles.skillHeaderMeta}>
                  <span className={styles.skillCategoryChip} style={{marginLeft: 8}}>
                    {skill.category}
                  </span>
                  <span className={styles.skillLevelValue}>{skill.level} %</span>
                  <span className={styles.skillLevelDominioBadge}>Dominio</span>
                  {yearsExp > 0 && (
                    <span className={styles.skillExperienceChip}>
                      <i className="fas fa-calendar-alt" aria-hidden="true"></i>
                      <span className="sr-only">Experiencia: </span>
                      {yearsExp} {yearsExp === 1 ? 'año' : 'años'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button 
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Cerrar modal"
              title="Cerrar (Esc)"
            >
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
          </header>

          {/* Tab Navigation */}
          <nav className={styles.tabNavigation} role="tablist">
            {[
              { id: 'overview', label: 'Resumen', icon: 'fa-chart-bar' },
              { id: 'projects', label: 'Proyectos', icon: 'fa-folder', badge: projectsWithSkill.length },
              { id: 'resources', label: 'Recursos', icon: 'fa-external-link-alt', badge: skillResources.length }
            ].map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                <i className={`fas ${tab.icon}`}></i>
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={styles.tabBadge}>{tab.badge}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Main Content with Tabs */}
          <main className={styles.skillPreviewBody}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div 
                id="overview-panel" 
                role="tabpanel" 
                aria-labelledby="overview-tab"
                className={styles.tabPanel}
              >
                {/* Enhanced Overview Section with Circular Progress */}
                <section className={styles.overviewHeroSection} aria-label="Resumen principal de la habilidad">
                  <div className={styles.overviewGrid}>
                    {/* Circular Progress Indicator */}
                    <div className={styles.circularProgressContainer}>
                      <div className={styles.circularProgressWrapper}>
                        <svg className={styles.circularProgress} width="160" height="160" viewBox="0 0 160 160">
                          <circle
                            cx="80"
                            cy="80"
                            r="72"
                            fill="none"
                            stroke="var(--md-sys-color-outline-variant)"
                            strokeWidth="8"
                            className={styles.progressBackground}
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="72"
                            fill="none"
                            stroke={skillColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${(skill.level / 100) * 452.389} 452.389`}
                            className={styles.progressFill}
                            transform="rotate(-90 80 80)"
                          />
                        </svg>
                        <div className={styles.progressContent}>
                          <span className={styles.progressValue}>{skill.level}%</span>
                          <span className={styles.progressLabel}>Dominio</span>
                        </div>
                      </div>
                      
                      {/* Experience Ring */}
                      {yearsExp > 0 && (
                        <div className={styles.experienceRing}>
                          <div className={styles.experienceIndicator}>
                            <i className="fas fa-calendar-alt"></i>
                            <span>{yearsExp} {yearsExp === 1 ? 'año' : 'años'}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Technical Competencies Breakdown */}
                    <div className={styles.competenciesBreakdown}>
                      <h3 className={styles.competenciesTitle}>
                        <i className="fas fa-chart-bar"></i>
                        Competencias Técnicas
                      </h3>
                      
                      <div className={styles.competenciesList}>
                        {getSkillCompetencies(skill.name, skill.level).map((competency, index) => (
                          <div key={index} className={styles.competencyItem}>
                            <div className={styles.competencyHeader}>
                              <div className={styles.competencyInfo}>
                                <i className={`fas ${competency.icon}`}></i>
                                <span className={styles.competencyName}>{competency.name}</span>
                              </div>
                              <div className={styles.competencyLevel}>
                                <span className={styles.competencyPercentage}>{competency.level}%</span>
                                <div className={`${styles.competencyBadge} ${styles[competency.category.toLowerCase()]}`}>
                                  {competency.category}
                                </div>
                              </div>
                            </div>
                            
                            <div className={styles.competencyProgress}>
                              <div 
                                className={styles.competencyProgressFill}
                                style={{ 
                                  width: `${competency.level}%`,
                                  backgroundColor: competency.color
                                }}
                              />
                            </div>
                            
                            <p className={styles.competencyDescription}>{competency.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Enhanced Stats Section */}
                <section className={styles.skillStatsSection} aria-label="Estadísticas de la habilidad">

                  {/* Enhanced Difficulty Card */}
                  {difficultySource && difficultyStars > 0 && (
                    <div className={`${styles.skillStatCard} ${styles.difficultyCard}`}>
                      <div className={styles.statHeader}>
                        <h2>Dificultad</h2>
                        {externalInfo?.difficulty && (
                          <div className={`${styles.statBadge} ${styles.live}`} title="Dificultad calculada en tiempo real según actividades recientes">
                            <i className="fas fa-wifi" aria-hidden="true"></i>
                            <span className="sr-only">Datos en vivo</span>
                            Live
                          </div>
                        )}
                      </div>
                      <div className={styles.difficultyVisual}>
                        <div 
                          className={styles.starsDisplay}
                          role="img"
                          aria-label={`Dificultad: ${difficultyStars} de 5 estrellas`}
                        >
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i 
                              key={i}
                              className={`${styles.star} ${i < difficultyStars ? styles.filled : styles.empty} ${i < difficultyStars ? 'fas fa-star' : 'far fa-star'}`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <span className={styles.difficultyLabel}>
                          ({difficultySource === 'Advanced' ? 'Avanzado' : 
                            difficultySource === 'Intermediate' ? 'Intermedio' : 
                            difficultySource === 'intermediate' ? 'Intermedio' :
                            difficultySource === 'Beginner' ? 'Básico' : 
                            difficultySource})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Popularity Card */}
                  {(externalInfo?.popularity || loadingExternalData[skill.name]) && (
                    <div className={`${styles.skillStatCard} ${styles.popularityCard}`}>
                      <div className={styles.statHeader}>
                        <h2>Popularidad</h2>
                        {loadingExternalData[skill.name] ? (
                          <div className={`${styles.statBadge} ${styles.loading}`}>
                            <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                            <span className="sr-only">Cargando...</span>
                          </div>
                        ) : (
                          <div className={`${styles.statBadge} ${styles.live}`} title="Popularidad obtenida de fuente externa en tiempo real">
                            <i className="fas fa-chart-line" aria-hidden="true"></i>
                            Live
                          </div>
                        )}
                      </div>
                      
                      {loadingExternalData[skill.name] ? (
                        renderLoadingSkeleton()
                      ) : (
                        (() => {
                          const popLevel = getPopularityLevel(externalInfo?.popularity || '');
                          return (
                            <div className={styles.popularityVisual}>
                              <div 
                                className={styles.popularityMeter}
                                role="progressbar"
                                aria-valuenow={popLevel.stars}
                                aria-valuemin={1}
                                aria-valuemax={5}
                                aria-label={`Popularidad: ${popLevel.label}`}
                              >
                                <div 
                                  className={styles.popularityFill}
                                  style={{ 
                                    width: `${(popLevel.stars / 5) * 100}%`,
                                    backgroundColor: popLevel.color 
                                  }}
                                />
                              </div>
                              <div className={styles.popularityInfo}>
                                <span 
                                  className={styles.popularityLabel} 
                                  style={{ color: popLevel.color }}
                                >
                                  <i className={`fas ${popLevel.icon}`} aria-hidden="true"></i>
                                  {popLevel.label}
                                </span>
                                {/* Solo mostrar el raw si está en español */}
                                {externalInfo?.popularity && (
                                  <span className={styles.popularityRaw}>
                                    ({externalInfo?.popularity === 'very_high' ? 'Muy Alta' : 
                                      externalInfo?.popularity === 'high' ? 'Alta' : 
                                      externalInfo?.popularity === 'medium' ? 'Media' : 
                                      externalInfo?.popularity === 'low' ? 'Baja' : 
                                      externalInfo?.popularity === 'very_low' ? 'Muy Baja' : 
                                      externalInfo?.popularity})
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  )}
                </section>

                {/* Additional Info Section - Solo visible para usuarios autenticados */}
                {isAuthenticated && (
                  <section className={styles.skillAdditionalInfo} aria-label="Información adicional">
                    <h2>Detalles Técnicos</h2>
                    <div className={styles.infoGrid}>
                      {[
                        { condition: skill.latest_version, icon: 'fa-tag', label: 'Última versión', value: skill.latest_version },
                        { condition: externalInfo?.first_appeared, icon: 'fa-calendar-plus', label: 'Primera aparición', value: externalInfo?.first_appeared },
                        { condition: externalInfo?.paradigm, icon: 'fa-sitemap', label: 'Paradigma', value: externalInfo?.paradigm },
                        { condition: externalInfo?.license, icon: 'fa-balance-scale', label: 'Licencia', value: externalInfo?.license },
                        { condition: skill.projects_count && skill.projects_count > 0, icon: 'fa-folder-open', label: 'Proyectos utilizados', value: skill.projects_count },
                        { condition: skill.last_used, icon: 'fa-clock', label: 'Último uso', value: skill.last_used }
                      ].filter(item => item.condition).map((item, index) => (
                        <div key={index} className={styles.infoItem}>
                          <i className={`fas ${item.icon}`} aria-hidden="true"></i>
                          <span className={styles.infoLabel}>{item.label}:</span>
                          <span className={styles.infoValue}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div 
                id="projects-panel" 
                role="tabpanel" 
                aria-labelledby="projects-tab"
                className={styles.tabPanel}
              >
                <section className={styles.projectsWorkedSection}>
                  <header className={styles.sectionHeader}>
                    <h2>
                      <i className="fas fa-briefcase" aria-hidden="true"></i>
                      Proyectos desarrollados con {skill.name}
                    </h2>
                    {projectsWithSkill.length > 0 && (
                      <span className={styles.projectCount}>
                        {projectsWithSkill.length} {projectsWithSkill.length === 1 ? 'proyecto' : 'proyectos'}
                      </span>
                    )}
                  </header>
                  
                  {error ? (
                    renderError()
                  ) : loadingProjects ? (
                    <div className={styles.projectsLoading} role="status" aria-label="Cargando proyectos">
                      <div className={styles.loadingSpinner}></div>
                      <p>Cargando proyectos...</p>
                    </div>
                  ) : projectsWithSkill.length > 0 ? (
                    <div className={styles.projectsGrid}>
                      {projectsWithSkill.map(renderProjectCard)}
                    </div>
                  ) : (
                    <div className={styles.noProjectsFound}>
                      <div className={styles.noProjectsIcon}>
                        <i className="fas fa-folder-open" aria-hidden="true"></i>
                      </div>
                      <h3>No hay proyectos registrados</h3>
                      <p>Aún no se han desarrollado proyectos utilizando {skill.name}</p>
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div 
                id="resources-panel" 
                role="tabpanel" 
                aria-labelledby="resources-tab"
                className={styles.tabPanel}
              >
                {skillResources.length > 0 ? (
                  <section className={styles.skillResourcesSection} aria-label="Recursos de aprendizaje">
                    {/* Resources Header with Filters */}
                    <header className={styles.resourcesHeader}>
                      <div className={styles.resourcesTitle}>
                        <h2>
                          <i className="fas fa-graduation-cap" aria-hidden="true"></i>
                          Recursos de {skill.name}
                        </h2>
                        <span className={styles.resourceCount}>
                          {filteredResources.length} recursos disponibles
                        </span>
                      </div>
                      
                      {/* Filters */}
                      <div className={styles.resourceFilters}>
                        {/* Level Filter */}
                        <div className={styles.filterGroup}>
                          <label htmlFor="level-filter" className={styles.filterLabel}>
                            <i className="fas fa-layer-group" aria-hidden="true"></i>
                            Nivel:
                          </label>
                          <select 
                            id="level-filter"
                            value={resourceFilter} 
                            onChange={(e) => setResourceFilter(e.target.value as typeof resourceFilter)}
                            className={styles.filterSelect}
                          >
                            <option value="todos">Todos los niveles</option>
                            <option value="basico">Básico</option>
                            <option value="intermedio">Intermedio</option>
                            <option value="avanzado">Avanzado</option>
                          </select>
                        </div>

                        {/* Category Filter */}
                        {availableCategories.length > 1 && (
                          <div className={styles.filterGroup}>
                            <label htmlFor="category-filter" className={styles.filterLabel}>
                              <i className="fas fa-tags" aria-hidden="true"></i>
                              Tipo:
                            </label>
                            <select 
                              id="category-filter"
                              value={selectedCategory} 
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className={styles.filterSelect}
                            >
                              <option value="all">Todos los tipos</option>
                              {availableCategories.map(cat => (
                                <option key={cat.key} value={cat.key}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </header>

                    {/* Resources Content */}
                    {filteredResources.length > 0 ? (
                      <div className={styles.resourcesContent}>
                        {/* Category Badges */}
                        <div className={styles.categoryBadges}>
                          {availableCategories.map(cat => {
                            const count = skillResources.filter((r: SkillResource) => r.category === cat.key).length;
                            return (
                              <button
                                key={cat.key}
                                onClick={() => setSelectedCategory(selectedCategory === cat.key ? 'all' : cat.key)}
                                className={`${styles.categoryBadge} ${selectedCategory === cat.key ? styles.active : ''}`}
                                style={{ '--category-color': cat.color } as React.CSSProperties}
                              >
                                <i className={`fas ${cat.icon}`} aria-hidden="true"></i>
                                {cat.label}
                                <span className={styles.categoryCount}>{count}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Resources Grid */}
                        <div className={styles.resourcesGrid}>
                          {Object.entries(groupedResources).map(([category, resources]) => (
                            <div key={category} className={styles.categorySection}>
                              <h3 className={styles.categoryTitle}>
                                <i 
                                  className={`fas ${categoryConfig[category as keyof typeof categoryConfig]?.icon || 'fa-link'}`} 
                                  aria-hidden="true"
                                ></i>
                                {categoryConfig[category as keyof typeof categoryConfig]?.label || category}
                                <span className={styles.categoryCount}>({(resources as SkillResource[]).length})</span>
                              </h3>
                              
                              <div className={styles.resourcesList}>
                                {(resources as SkillResource[]).map((resource: SkillResource) => (
                                  <article key={resource.id} className={styles.resourceCard}>
                                    <a 
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={styles.resourceLink}
                                      aria-label={`${resource.title} - ${resource.description}`}
                                    >
                                      <div className={styles.resourceHeader}>
                                        <div 
                                          className={styles.resourceIcon}
                                          style={{ 
                                            '--resource-color': categoryConfig[resource.category]?.color || '#6b7280' 
                                          } as React.CSSProperties}
                                        >
                                          <i 
                                            className={`fas ${categoryConfig[resource.category]?.icon || 'fa-external-link-alt'}`} 
                                            aria-hidden="true"
                                          ></i>
                                        </div>
                                        
                                        <div className={styles.resourceMeta}>
                                          <div className={styles.resourceBadges}>
                                            <span className={`${styles.levelBadge} ${styles[resource.level]}`}>
                                              {resource.level.charAt(0).toUpperCase() + resource.level.slice(1)}
                                            </span>
                                            {resource.language === 'es' && (
                                              <span className={styles.languageBadge}>
                                                🇪🇸 Español
                                              </span>
                                            )}
                                            {resource.isPremium && (
                                              <span className={styles.premiumBadge}>
                                                <i className="fas fa-crown" aria-hidden="true"></i>
                                                Premium
                                              </span>
                                            )}
                                          </div>
                                          
                                          {resource.rating && (
                                            <div className={styles.resourceRating}>
                                              {[...Array(5)].map((_, i) => (
                                                <i 
                                                  key={i}
                                                  className={`fas fa-star ${i < resource.rating! ? styles.filled : styles.empty}`}
                                                  aria-hidden="true"
                                                ></i>
                                              ))}
                                              <span className="sr-only">
                                                {resource.rating} de 5 estrellas
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className={styles.resourceContent}>
                                        <h4 className={styles.resourceTitle}>{resource.title}</h4>
                                        <p className={styles.resourceDescription}>{resource.description}</p>
                                        
                                        {(resource.author || resource.duration) && (
                                          <div className={styles.resourceDetails}>
                                            {resource.author && (
                                              <span className={styles.resourceAuthor}>
                                                <i className="fas fa-user" aria-hidden="true"></i>
                                                {resource.author}
                                              </span>
                                            )}
                                            {resource.duration && (
                                              <span className={styles.resourceDuration}>
                                                <i className="fas fa-clock" aria-hidden="true"></i>
                                                {resource.duration}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className={styles.resourceFooter}>
                                        <span className={styles.resourceCta}>
                                          {resource.category === 'documentation' ? 'Ver documentación' :
                                           resource.category === 'tutorial' ? 'Ver tutorial' :
                                           resource.category === 'course' ? 'Ir al curso' :
                                           resource.category === 'book' ? 'Leer libro' :
                                           resource.category === 'video' ? 'Ver video' :
                                           resource.category === 'tool' ? 'Usar herramienta' :
                                           'Ver recurso'}
                                        </span>
                                        <i className="fas fa-external-link-alt" aria-hidden="true"></i>
                                      </div>
                                    </a>
                                  </article>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={styles.noFilteredResources}>
                        <div className={styles.noResourcesIcon}>
                          <i className="fas fa-filter" aria-hidden="true"></i>
                        </div>
                        <h3>No hay recursos para esta combinación</h3>
                        <p>Intenta cambiar los filtros de nivel o categoría</p>
                        <button 
                          onClick={() => {
                            setResourceFilter('todos');
                            setSelectedCategory('all');
                          }}
                          className={styles.resetFiltersBtn}
                        >
                          <i className="fas fa-undo" aria-hidden="true"></i>
                          Restablecer filtros
                        </button>
                      </div>
                    )}
                  </section>
                ) : (
                  <div className={styles.noResourcesFound}>
                    <div className={styles.noResourcesIcon}>
                      <i className="fas fa-graduation-cap" aria-hidden="true"></i>
                    </div>
                    <h3>Recursos próximamente</h3>
                    <p>Estamos trabajando en recopilar los mejores recursos para {skill.name}</p>
                    <div className={styles.suggestResource}>
                      <p>¿Conoces un buen recurso? ¡Ayúdanos a mejorar!</p>
                      <button className={styles.suggestBtn}>
                        <i className="fas fa-plus" aria-hidden="true"></i>
                        Sugerir recurso
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Enhanced Footer */}
          <footer className={styles.skillModalFooter}>
            <div className={styles.dataSources}>
              <span className={styles.sourceLabel}>Fuentes de datos:</span>
              <div className={styles.sourceBadges}>
                <span className={`${styles.sourceBadge} ${styles.local}`}>
                  <i className="fas fa-database" aria-hidden="true"></i>
                  Local
                </span>
                {externalInfo && (
                  <span className={`${styles.sourceBadge} ${styles.external}`}>
                    <i className="fas fa-cloud" aria-hidden="true"></i>
                    API Externa
                  </span>
                )}
              </div>
            </div>
            {externalInfo?.last_updated && (
              <div className={styles.lastUpdated}>
                <i className="fas fa-sync-alt" aria-hidden="true"></i>
                <span>
                  Actualizado: {new Date(externalInfo.last_updated).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
          </footer>
        </div>
      </div>
    </ModalPortal>
  );
};

export default SkillPreviewModal;