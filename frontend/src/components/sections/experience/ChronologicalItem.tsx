import React from "react";
import type { Experience } from "../../../services/api";

interface Education {
  id: number;
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
}

interface CombinedItem extends Partial<Experience & Education> {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  description?: string;
  type: "experience" | "education";
  company?: string;
  institution?: string;
  technologies?: string[];
  grade?: string;
}

interface ChronologicalItemProps {
  item: CombinedItem;
  index: number;
  position: "left" | "right";
  animationDelay?: number;
}

const ChronologicalItem: React.FC<ChronologicalItemProps> = ({
  item,
  index,
  position,
  animationDelay = 0.15,
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
      className={`chronological-item ${item.type} ${position}`}
      style={{ animationDelay: `${index * animationDelay}s` }}
    >
      <div className="chronological-marker">
        <div className={`marker-dot ${item.type}`}>
          <i
            className={
              item.type === "experience"
                ? "fas fa-briefcase"
                : "fas fa-graduation-cap"
            }
          />
        </div>
        {/* Fecha de fin posicionada al lado del marcador */}
        <div className="chronological-year-external">
          {item.end_date}
        </div>
      </div>
      
      <div className="chronological-content">
        <div className="chronological-header">
          <div className={`chronological-type ${item.type}`}>
            {item.type === "experience" ? "Experiencia" : "Formación"}
          </div>
        </div>
        
        <h4 className="chronological-title">{item.title}</h4>
        
        <p className="chronological-company">
          <i
            className={
              item.type === "experience"
                ? "fas fa-building"
                : "fas fa-university"
            }
          />
          {item.type === "experience" ? item.company : item.institution}
        </p>
        
        <div className="chronological-period">
          <i className="fas fa-calendar-alt" />
          <span>{formatDateRange(item.start_date, item.end_date)}</span>
        </div>
        
        <div className="chronological-duration">
          <i className="fas fa-hourglass-half" />
          <span>{calculateDuration(item.start_date, item.end_date)}</span>
        </div>
        
        <p className="chronological-description">
          {item.description}
        </p>
        
        {/* Tecnologías para experiencias */}
        {item.type === "experience" &&
          item.technologies &&
          item.technologies.length > 0 && (
            <div className="chronological-skills">
              <div className="skills-label">
                <i className="fas fa-tools" />
                <span>Tecnologías:</span>
              </div>
              <div className="skills-tags">
                {item.technologies.map((tech: string, idx: number) => (
                  <span className="timeline-skill" key={idx}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        
        {/* Calificación para educación */}
        {item.type === "education" && item.grade && (
          <div className="education-grade">
            <i className="fas fa-medal" />
            <span>Calificación: {item.grade}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChronologicalItem;
