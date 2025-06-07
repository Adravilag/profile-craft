// src/components/article/DateIndicators.tsx
import React from 'react';
import { formatDistanceToNow, format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import styles from './DateIndicators.module.css';

interface DateIndicatorsProps {
  createdAt?: string;
  updatedAt?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  readingTime?: number;
  lastReadAt?: string;
  className?: string;
}

const DateIndicators: React.FC<DateIndicatorsProps> = ({
  createdAt,
  updatedAt,
  projectStartDate,
  projectEndDate,
  readingTime = 0,
  lastReadAt,
  className = ''
}) => {
  const formatDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
    try {
      const date = parseISO(dateString);
      return isValid(date) ? date : null;
    } catch {
      return null;
    }
  };

  const getRelativeTime = (dateString?: string): string => {
    const date = formatDate(dateString);
    if (!date) return '';
    
    try {
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: es 
      });
    } catch {
      return format(date, 'dd/MM/yyyy', { locale: es });
    }
  };

  const getFormattedDate = (dateString?: string): string => {
    const date = formatDate(dateString);
    if (!date) return '';
    
    return format(date, 'dd \'de\' MMMM \'de\' yyyy', { locale: es });
  };

  const getProjectDuration = (): string => {
    const startDate = formatDate(projectStartDate);
    const endDate = formatDate(projectEndDate);
    
    if (!startDate) return '';
    
    if (!endDate) {
      return `Desde ${format(startDate, 'MMM yyyy', { locale: es })} - En curso`;
    }
    
    const diffInMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth());
    
    if (diffInMonths < 1) {
      return `${format(startDate, 'MMM yyyy', { locale: es })}`;
    } else if (diffInMonths === 1) {
      return `${format(startDate, 'MMM', { locale: es })} - ${format(endDate, 'MMM yyyy', { locale: es })} (1 mes)`;
    } else if (diffInMonths < 12) {
      return `${format(startDate, 'MMM', { locale: es })} - ${format(endDate, 'MMM yyyy', { locale: es })} (${diffInMonths} meses)`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      const months = diffInMonths % 12;
      const duration = years > 0 
        ? `${years} año${years > 1 ? 's' : ''}${months > 0 ? ` y ${months} mes${months > 1 ? 'es' : ''}` : ''}`
        : `${months} mes${months > 1 ? 'es' : ''}`;
      
      return `${format(startDate, 'MMM yyyy', { locale: es })} - ${format(endDate, 'MMM yyyy', { locale: es })} (${duration})`;
    }
  };

  const getReadingTimeText = (): string => {
    if (readingTime <= 0) return '';
    
    if (readingTime === 1) return '1 minuto de lectura';
    if (readingTime < 60) return `${readingTime} minutos de lectura`;
    
    const hours = Math.floor(readingTime / 60);
    const minutes = readingTime % 60;
    
    if (hours === 1 && minutes === 0) return '1 hora de lectura';
    if (hours === 1) return `1 hora y ${minutes} minutos de lectura`;
    if (minutes === 0) return `${hours} horas de lectura`;
    
    return `${hours} horas y ${minutes} minutos de lectura`;
  };

  const isRecentlyUpdated = (): boolean => {
    const updated = formatDate(updatedAt);
    const created = formatDate(createdAt);
    
    if (!updated || !created) return false;
    
    const diffInHours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffInHours > 24; // Actualizado más de 24 horas después de creación
  };

  const hasValidDates = createdAt || updatedAt || projectStartDate || projectEndDate;

  if (!hasValidDates && readingTime <= 0) {
    return null;
  }

  return (
    <div className={`${styles.dateIndicators} ${className}`}>
      {/* Información principal de fechas */}
      <div className={styles.mainDateInfo}>
        {/* Fecha de creación */}
        {createdAt && (
          <div className={styles.dateItem}>
            <div className={styles.dateIcon}>
              <i className="fas fa-calendar-plus"></i>
            </div>
            <div className={styles.dateContent}>
              <span className={styles.dateLabel}>Publicado</span>
              <span className={styles.dateValue} title={getFormattedDate(createdAt)}>
                {getRelativeTime(createdAt)}
              </span>
            </div>
          </div>
        )}

        {/* Fecha de actualización */}
        {updatedAt && isRecentlyUpdated() && (
          <div className={`${styles.dateItem} ${styles.updated}`}>
            <div className={styles.dateIcon}>
              <i className="fas fa-edit"></i>
            </div>
            <div className={styles.dateContent}>
              <span className={styles.dateLabel}>Actualizado</span>
              <span className={styles.dateValue} title={getFormattedDate(updatedAt)}>
                {getRelativeTime(updatedAt)}
              </span>
            </div>
          </div>
        )}

        {/* Tiempo de lectura */}
        {readingTime > 0 && (
          <div className={styles.dateItem}>
            <div className={styles.dateIcon}>
              <i className="fas fa-clock"></i>
            </div>
            <div className={styles.dateContent}>
              <span className={styles.dateLabel}>Lectura</span>
              <span className={styles.dateValue}>
                {getReadingTimeText()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Información del proyecto */}
      {(projectStartDate || projectEndDate) && (
        <div className={styles.projectDateInfo}>
          <div className={styles.projectDuration}>
            <div className={styles.dateIcon}>
              <i className="fas fa-project-diagram"></i>
            </div>
            <div className={styles.dateContent}>
              <span className={styles.dateLabel}>Duración del proyecto</span>
              <span className={styles.dateValue}>
                {getProjectDuration()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Última lectura */}
      {lastReadAt && (
        <div className={styles.lastReadInfo}>
          <div className={styles.dateItem}>
            <div className={styles.dateIcon}>
              <i className="fas fa-eye"></i>
            </div>
            <div className={styles.dateContent}>
              <span className={styles.dateLabel}>Última lectura</span>
              <span className={styles.dateValue} title={getFormattedDate(lastReadAt)}>
                {getRelativeTime(lastReadAt)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline visual para proyectos largos */}
      {projectStartDate && projectEndDate && (
        <div className={styles.projectTimeline}>
          <div className={styles.timelineBar}>
            <div className={styles.timelineProgress}></div>
          </div>
          <div className={styles.timelineLabels}>
            <span className={styles.timelineStart}>
              {format(formatDate(projectStartDate)!, 'MMM yyyy', { locale: es })}
            </span>
            <span className={styles.timelineEnd}>
              {format(formatDate(projectEndDate)!, 'MMM yyyy', { locale: es })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateIndicators;
