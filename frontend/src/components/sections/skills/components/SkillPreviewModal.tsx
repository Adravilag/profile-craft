// src/components/sections/skills/components/SkillPreviewModal.tsx

import React from 'react';
import ModalPortal from '../../../common/ModalPortal';
import type { SkillPreviewModalProps } from '../types/skills';
import { getSkillSvg, getSkillCssClass, getDifficultyStars } from '../utils/skillUtils';

const SkillPreviewModal: React.FC<SkillPreviewModalProps> = ({
  isOpen,
  onClose,
  skill,
  skillsIcons,
  externalData,
  loadingExternalData
}) => {
  if (!isOpen || !skill) return null;

  const skillInfo = skillsIcons.find(
    (s) => s.name.toLowerCase() === skill.name.toLowerCase()
  );
  const svgPath = getSkillSvg(skill.name, skill.icon_class, skillsIcons);
  const skillColor = skillInfo?.color || "#007acc";
  const skillCssClass = getSkillCssClass(skill.name);
  const externalInfo = externalData[skill.name];

  // Priorizar dificultad de API externa sobre CSV
  const difficultySource = externalInfo?.difficulty || skillInfo?.difficulty_level;
  const difficultyStars = getDifficultyStars(difficultySource);

  // Calcular años de experiencia si existe
  const yearsExp = skill.years_experience || skill.experience || 0;

  // Función para obtener nivel de popularidad
  const getPopularityLevel = (popularity: string) => {
    const level = popularity.toLowerCase();
    if (level.includes('very_high') || level.includes('muy_alta')) return { stars: 5, label: 'Muy Alta', color: '#10b981' };
    if (level.includes('high') || level.includes('alta')) return { stars: 4, label: 'Alta', color: '#3b82f6' };
    if (level.includes('medium') || level.includes('media')) return { stars: 3, label: 'Media', color: '#f59e0b' };
    if (level.includes('low') || level.includes('baja')) return { stars: 2, label: 'Baja', color: '#ef4444' };
    return { stars: 1, label: 'Muy Baja', color: '#6b7280' };
  };

  return (
    <ModalPortal>
      <div className="modal-overlay skill-preview-overlay" onClick={onClose}>
        <div className="modal-content skill-preview-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header mejorado */}
          <div className="skill-preview-header">
            <div className="skill-header-main">
              <div className={`skill-preview-icon ${skillCssClass}`} style={{ '--skill-color': skillColor }}>
                <img 
                  src={svgPath} 
                  alt={`${skill.name} icon`}
                  onError={(e) => {
                    e.currentTarget.src = '/assets/svg/generic-code.svg';
                  }}
                />
              </div>
              <div className="skill-header-info">
                <h2 className="skill-preview-title">{skill.name}</h2>
                <div className="skill-header-meta">
                  <span className="skill-category-chip">{skill.category}</span>
                  {yearsExp > 0 && (
                    <span className="skill-experience-chip">
                      <i className="fas fa-calendar-alt"></i>
                      {yearsExp} {yearsExp === 1 ? 'año' : 'años'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button className="skill-preview-close" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Contenido principal */}
          <div className="skill-preview-body">
            {/* Sección de estadísticas principales */}
            <div className="skill-stats-section">
              <div className="skill-stat-card skill-level-card">
                <div className="stat-header">
                  <h3>Nivel de Dominio</h3>
                  <div className="stat-badge primary">{skill.level}%</div>
                </div>
                <div className="skill-level-visual">
                  <div className="skill-progress-track">
                    <div 
                      className="skill-progress-fill"
                      style={{ 
                        width: `${skill.level}%`,
                        background: `linear-gradient(90deg, ${skillColor}22 0%, ${skillColor} 100%)`
                      }}
                    />
                  </div>
                  <div className="level-labels">
                    <span>Básico</span>
                    <span>Intermedio</span>
                    <span>Avanzado</span>
                    <span>Experto</span>
                  </div>
                </div>
              </div>

              {difficultySource && difficultyStars > 0 && (
                <div className="skill-stat-card difficulty-card">
                  <div className="stat-header">
                    <h3>Dificultad</h3>
                    {externalInfo?.difficulty && (
                      <div className="stat-badge live">
                        <i className="fas fa-wifi"></i>
                        Live
                      </div>
                    )}
                  </div>
                  <div className="difficulty-visual">
                    <div className="stars-display">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i 
                          key={i}
                          className={`star ${i < difficultyStars ? 'filled' : 'empty'}`}
                        />
                      ))}
                    </div>
                    <span className="difficulty-label">({difficultySource})</span>
                  </div>
                </div>
              )}

              {(externalInfo?.popularity || loadingExternalData[skill.name]) && (
                <div className="skill-stat-card popularity-card">
                  <div className="stat-header">
                    <h3>Popularidad</h3>
                    {loadingExternalData[skill.name] ? (
                      <div className="stat-badge loading">
                        <i className="fas fa-spinner fa-spin"></i>
                      </div>
                    ) : (
                      <div className="stat-badge live">
                        <i className="fas fa-chart-line"></i>
                        Live
                      </div>
                    )}
                  </div>
                  
                  {loadingExternalData[skill.name] ? (
                    <div className="loading-skeleton">
                      <div className="skeleton-stars"></div>
                      <div className="skeleton-text"></div>
                    </div>
                  ) : (
                    (() => {
                      const popLevel = getPopularityLevel(externalInfo?.popularity || '');
                      return (
                        <div className="popularity-visual">
                          <div className="popularity-meter">
                            <div 
                              className="popularity-fill"
                              style={{ 
                                width: `${(popLevel.stars / 5) * 100}%`,
                                backgroundColor: popLevel.color 
                              }}
                            />
                          </div>
                          <div className="popularity-info">
                            <span className="popularity-label" style={{ color: popLevel.color }}>
                              {popLevel.label}
                            </span>
                            <span className="popularity-raw">({externalInfo?.popularity})</span>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}
            </div>

            {/* Sección de descripción */}
            {(skill.description || externalInfo?.description) && (
              <div className="skill-description-section">
                <h3>Descripción</h3>
                <div className="description-content">
                  {skill.description && (
                    <div className="personal-description">
                      <h4>Mi experiencia</h4>
                      <p>{skill.description}</p>
                    </div>
                  )}
                  {externalInfo?.description && (
                    <div className="tech-description">
                      <h4>Información técnica</h4>
                      <p>{externalInfo.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sección de enlaces útiles */}
            {externalInfo?.links && externalInfo.links.length > 0 && (
              <div className="skill-links-section">
                <h3>Enlaces útiles</h3>
                <div className="links-grid">
                  {externalInfo.links.map((link: any, index: number) => (
                    <a 
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="skill-link-card"
                    >
                      <div className="link-icon">
                        <i className={`fas ${
                          link.type === 'documentation' ? 'fa-book' :
                          link.type === 'tutorial' ? 'fa-play-circle' :
                          link.type === 'github' ? 'fa-code-branch' :
                          link.type === 'official' ? 'fa-home' :
                          'fa-external-link-alt'
                        }`}></i>
                      </div>
                      <div className="link-info">
                        <span className="link-title">{link.title}</span>
                        <span className="link-type">{link.type}</span>
                      </div>
                      <i className="fas fa-arrow-right link-arrow"></i>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Sección de información adicional */}
            <div className="skill-additional-info">
              <div className="info-grid">
                {skill.latest_version && (
                  <div className="info-item">
                    <i className="fas fa-tag"></i>
                    <span className="info-label">Última versión:</span>
                    <span className="info-value">{skill.latest_version}</span>
                  </div>
                )}
                
                {externalInfo?.first_appeared && (
                  <div className="info-item">
                    <i className="fas fa-calendar-plus"></i>
                    <span className="info-label">Primera aparición:</span>
                    <span className="info-value">{externalInfo.first_appeared}</span>
                  </div>
                )}

                {externalInfo?.paradigm && (
                  <div className="info-item">
                    <i className="fas fa-sitemap"></i>
                    <span className="info-label">Paradigma:</span>
                    <span className="info-value">{externalInfo.paradigm}</span>
                  </div>
                )}

                {externalInfo?.license && (
                  <div className="info-item">
                    <i className="fas fa-balance-scale"></i>
                    <span className="info-label">Licencia:</span>
                    <span className="info-value">{externalInfo.license}</span>
                  </div>
                )}

                {skill.projects_count && skill.projects_count > 0 && (
                  <div className="info-item">
                    <i className="fas fa-folder-open"></i>
                    <span className="info-label">Proyectos utilizados:</span>
                    <span className="info-value">{skill.projects_count}</span>
                  </div>
                )}

                {skill.last_used && (
                  <div className="info-item">
                    <i className="fas fa-clock"></i>
                    <span className="info-label">Último uso:</span>
                    <span className="info-value">{skill.last_used}</span>
                  </div>
                )}
              </div>

              {/* Footer con metadatos */}
              <div className="skill-modal-footer">
                <div className="data-sources">
                  <span className="source-label">Fuentes de datos:</span>
                  <div className="source-badges">
                    <span className="source-badge local">
                      <i className="fas fa-database"></i>
                      Local
                    </span>
                    {externalInfo && (
                      <span className="source-badge external">
                        <i className="fas fa-cloud"></i>
                        API Externa
                      </span>
                    )}
                  </div>
                </div>
                
                {externalInfo?.last_updated && (
                  <div className="last-updated">
                    <i className="fas fa-sync-alt"></i>
                    <span>Actualizado: {new Date(externalInfo.last_updated).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default SkillPreviewModal;