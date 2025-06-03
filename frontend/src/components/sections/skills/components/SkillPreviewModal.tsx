// src/components/sections/skills/components/SkillPreviewModal.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ModalPortal from '../../../common/ModalPortal';
import type { SkillPreviewModalProps } from '../types/skills';
import type { Project } from '../../../../services/api';
import { getSkillSvg, getSkillCssClass, getDifficultyStars } from '../utils/skillUtils';
import { getProjects } from '../../../../services/api';
import styles from './SkillPreviewModal.module.css';

const SkillPreviewModal: React.FC<SkillPreviewModalProps> = ({
  isOpen,
  onClose,
  skill,
  skillsIcons,
  externalData,
  loadingExternalData
}) => {
  const [projectsWithSkill, setProjectsWithSkill] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'resources'>('overview');
  const [error, setError] = useState<string | null>(null);

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

  // Enhanced popularity calculation
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
          <span className={`${styles.statusBadge} ${styles[project.status.toLowerCase().replace(/\s+/g, '-')]}`}>
            {project.status}
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
            <span className={styles.moreTech}>
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
              { id: 'resources', label: 'Recursos', icon: 'fa-external-link-alt' }
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
                {/* Enhanced Stats Section */}
                <section className={styles.skillStatsSection} aria-label="Estadísticas de la habilidad">
                  <div className={`${styles.skillStatCard} ${styles.skillLevelCard}`}>
                    <div className={styles.statHeader}>
                      <h2>Nivel de Dominio</h2>
                      <div className={`${styles.statBadge} ${styles.primary}`}>
                        {skill.level}%
                      </div>
                    </div>
                    {/* Nivel de Dominio - Slider y etiquetas */}
                    <div className={styles.skillLevelVisual}>
                      <div 
                        className={styles.skillProgressTrack}
                        role="progressbar"
                        aria-valuenow={skill.level}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Nivel de dominio: ${skill.level}%`}
                      >
                        <div 
                          className={styles.skillProgressFill}
                          style={{ 
                            width: `${skill.level}%`,
                            background: `linear-gradient(90deg, ${skillColor}33 0%, ${skillColor} 100%)`
                          }}
                        />
                      </div>
                      <div className={styles.levelLabels}>
                        <span>Básico</span>
                        <span style={{marginLeft: '8%'}}>Intermedio</span>
                        <span style={{marginLeft: '24%'}}>Avanzado</span>
                        <span style={{marginLeft: '24%'}}>Experto</span>
                      </div>
                    </div>
                  </div>

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

                {/* Demo Repository Section */}
                {skill.demo_url && (
                  <section className={styles.skillDemoSection} aria-label="Repositorio de demostración">
                    <h2>Repositorio de Demostración</h2>
                    <a 
                      href={skill.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.demoLinkCard}
                      aria-label={`Ver proyecto de demostración de ${skill.name} en GitHub`}
                    >
                      <div className={styles.demoIcon}>
                        <i className="fab fa-github" aria-hidden="true"></i>
                      </div>
                      <div className={styles.demoInfo}>
                        <span className={styles.demoTitle}>Ver proyecto de demostración</span>
                        <span className={styles.demoDescription}>
                          Explora una implementación práctica de {skill.name}
                        </span>
                      </div>
                      <i className={`fas fa-external-link-alt ${styles.demoArrow}`} aria-hidden="true"></i>
                    </a>
                  </section>
                )}

                {/* Additional Info Section */}
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
                {externalInfo?.links && externalInfo.links.length > 0 ? (
                  <section className={styles.skillLinksSection} aria-label="Enlaces útiles">
                    <h2>Enlaces útiles</h2>
                    <div className={styles.linksGrid}>
                      {externalInfo.links.map((link: any, index: number) => (
                        <a 
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.skillLinkCard}
                          aria-label={`${link.title} - ${link.type}`}
                        >
                          <div className={styles.linkIcon}>
                            <i className={`fas ${
                              link.type === 'documentation' ? 'fa-book' :
                              link.type === 'tutorial' ? 'fa-play-circle' :
                              link.type === 'github' ? 'fa-code-branch' :
                              link.type === 'official' ? 'fa-home' :
                              'fa-external-link-alt'
                            }`} aria-hidden="true"></i>
                          </div>
                          <div className={styles.linkInfo}>
                            <span className={styles.linkTitle}>{link.title}</span>
                            <span className={styles.linkType}>{link.type}</span>
                          </div>
                          <i className={`fas fa-arrow-right ${styles.linkArrow}`} aria-hidden="true"></i>
                        </a>
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className={styles.noResourcesFound}>
                    <div className={styles.noResourcesIcon}>
                      <i className="fas fa-link" aria-hidden="true"></i>
                    </div>
                    <h3>No hay recursos disponibles</h3>
                    <p>No se encontraron enlaces útiles para {skill.name}</p>
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