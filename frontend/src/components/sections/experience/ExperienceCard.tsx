import React from "react";
import type { Experience } from "../../../services/api";

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
  const formatDateRange = (startDate: string, endDate: string) => {
    if (endDate.toLowerCase() === 'presente' || endDate.toLowerCase() === 'current') {
      return `${startDate} - Presente`;
    }
    return `${startDate} - ${endDate}`;
  };
  const calculateDuration = (startDate: string, endDate: string) => {
    const parseDate = (dateString: string): number => {
      if (dateString.toLowerCase() === 'presente') {
        return new Date().getFullYear() * 12 + new Date().getMonth();
      }
      
      // Si es solo año (formato legacy)
      if (/^\d{4}$/.test(dateString)) {
        return parseInt(dateString) * 12;
      }
      
      // Si es formato "Mes Año"
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      
      const [monthStr, yearStr] = dateString.split(' ');
      const monthIndex = months.indexOf(monthStr);
      const year = parseInt(yearStr);
      
      if (monthIndex !== -1 && !isNaN(year)) {
        return year * 12 + monthIndex;
      }
      
      // Fallback: intentar parsear como año
      const fallbackYear = parseInt(dateString);
      return !isNaN(fallbackYear) ? fallbackYear * 12 : 0;
    };

    const startMonths = parseDate(startDate);
    const endMonths = parseDate(endDate);
    const totalMonths = endMonths - startMonths;
    
    if (totalMonths < 0) return "Duración inválida";
    if (totalMonths === 0) return "Menos de 1 mes";
    if (totalMonths < 12) {
      return totalMonths === 1 ? "1 mes" : `${totalMonths} meses`;
    }
    
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    
    if (remainingMonths === 0) {
      return years === 1 ? "1 año" : `${years} años`;
    } else {
      const yearPart = years === 1 ? "1 año" : `${years} años`;
      const monthPart = remainingMonths === 1 ? "1 mes" : `${remainingMonths} meses`;
      return `${yearPart} y ${monthPart}`;
    }
  };

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
