import React from "react";

interface Education {
  id: number;
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
