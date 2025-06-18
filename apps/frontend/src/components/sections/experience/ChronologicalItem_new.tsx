import React from "react";
import type { Experience } from "../../../services/api";
import { formatDateRange, calculateDuration, formatDateFromInput } from "../../../utils/dateUtils";

interface Education {
  id?: number; // Para compatibilidad con código antiguo
  _id?: string; // ID de MongoDB
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
}

interface CombinedItem extends Partial<Experience & Education> {
  _id: string; // ID de MongoDB
  id?: number; // Para compatibilidad con código antiguo
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
          {formatDateFromInput(item.end_date) || "Presente"}
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




