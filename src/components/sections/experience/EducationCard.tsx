import React from "react";
import { formatDateRange, calculateDuration } from "../../../utils/dateUtils";

interface Education {
  _id?: string;
  id?: number | string;
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
}

interface EducationCardProps {
  education: Education;
  index: number;
  animationDelay?: number;
  showDuration?: boolean;
}

const EducationCard: React.FC<EducationCardProps> = ({
  education,
  index,
  animationDelay = 0.1,
  showDuration = true,
}) => {


  return (
    <div
      className="timeline-item education-item"
      style={{ animationDelay: `${index * animationDelay}s` }}
    >
      <div className="timeline-marker education-marker">
        <div className="marker-dot"></div>
      </div>
      <div className="timeline-content">
        <div className="timeline-header">
          <h4 className="timeline-title">{education.title}</h4>
          <div className="timeline-period">
            <i className="fas fa-calendar-alt"></i>
            <span>{formatDateRange(education.start_date, education.end_date)}</span>
          </div>
        </div>
        
        <p className="timeline-company">
          <i className="fas fa-university"></i>
          {education.institution}
        </p>
        
        {showDuration && (
          <div className="timeline-duration">
            <i className="fas fa-clock"></i>
            <span>{calculateDuration(education.start_date, education.end_date)}</span>
          </div>
        )}
        
        {education.description && (
          <p className="timeline-description">
            {education.description}
          </p>
        )}
        
        {education.grade && (
          <div className="education-grade">
            <i className="fas fa-medal"></i>
            <span>Calificación: {education.grade}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationCard;
