import React from "react";
import type { Experience } from "../../../services/api";
import { formatDateRange, calculateDuration } from "../../../utils/dateUtils";

interface ExperienceCardProps {
  experience: Experience;
  index: number;
  animationDelay?: number;
  showDuration?: boolean;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  index,
  animationDelay = 0.1,
  showDuration = true,
}) => {


  return (
    <div
      className="timeline-item"
      style={{ animationDelay: `${index * animationDelay}s` }}
    >
      <div className="timeline-marker">
        <div className="marker-dot"></div>
      </div>
      <div className="timeline-content">
        <div className="timeline-header">
          <h4 className="timeline-title">{experience.title}</h4>
          <div className="timeline-period">
            <i className="fas fa-calendar-alt"></i>
            <span>{formatDateRange(experience.start_date, experience.end_date)}</span>
          </div>
        </div>
        
        <p className="timeline-company">
          <i className="fas fa-building"></i>
          {experience.company}
        </p>
        
        {showDuration && (
          <div className="timeline-duration">
            <i className="fas fa-clock"></i>
            <span>{calculateDuration(experience.start_date, experience.end_date)}</span>
          </div>
        )}
        
        <p className="timeline-description">
          {experience.description}
        </p>
        
        {experience.technologies && experience.technologies.length > 0 && (
          <div className="timeline-skills">
            <div className="skills-label">
              <i className="fas fa-tools"></i>
              <span>Tecnologías:</span>
            </div>
            <div className="skills-tags">
              {experience.technologies.map((tech, idx) => (
                <span className="timeline-skill" key={idx}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Indicador de experiencia actual */}
        {experience.end_date.toLowerCase() === 'presente' && (
          <div className="current-position-badge">
            <i className="fas fa-star"></i>
            <span>Posición Actual</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceCard;
