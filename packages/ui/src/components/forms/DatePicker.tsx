// Componente de selector de fecha para certificaciones
import React, { useState, useRef, useEffect } from 'react';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
  id?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  required = false,
  name,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [inputValue, setInputValue] = useState(value);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inicializar fecha si viene un valor
  useEffect(() => {
    if (value) {
      // Intentar parsear diferentes formatos de fecha
      const parseDate = (dateStr: string): Date | null => {
        // Formato: "2024", "Enero 2024", "March 2024", etc.
        const yearMatch = dateStr.match(/(\d{4})/);
        if (!yearMatch) return null;
        
        const year = parseInt(yearMatch[1]);
        
        // Buscar mes en español
        const monthsEs = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        // Buscar mes en inglés
        const monthsEn = ['january', 'february', 'march', 'april', 'may', 'june',
                         'july', 'august', 'september', 'october', 'november', 'december'];
        
        const lowerStr = dateStr.toLowerCase();
        let month = 0; // Por defecto enero
        
        monthsEs.forEach((mes, index) => {
          if (lowerStr.includes(mes)) month = index;
        });
        
        monthsEn.forEach((mes, index) => {
          if (lowerStr.includes(mes)) month = index;
        });
        
        return new Date(year, month, 1);
      };

      const parsed = parseDate(value);
      if (parsed) {
        setSelectedDate(parsed);
        setCurrentMonth(parsed);
      }
      setInputValue(value);
    }
  }, [value]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date): string => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const formatted = formatDate(date);
    setInputValue(formatted);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días vacíos del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isSelectedDate = (date: Date | null): boolean => {
    if (!date || !selectedDate) return false;
    return date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className={styles.datePickerContainer} ref={containerRef}>
      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          name={name}
          id={id}
          className={styles.dateInput}
        />
        <button
          type="button"
          className={styles.calendarButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className="fas fa-calendar-alt"></i>
        </button>
      </div>

      {isOpen && (
        <div className={styles.calendarDropdown}>
          <div className={styles.calendarHeader}>
            <button
              type="button"
              className={styles.navButton}
              onClick={prevMonth}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <span className={styles.monthYear}>
              {formatDate(currentMonth)}
            </span>
            
            <button
              type="button"
              className={styles.navButton}
              onClick={nextMonth}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <div className={styles.calendarGrid}>
            <div className={styles.weekDays}>
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className={styles.weekDay}>{day}</div>
              ))}
            </div>
            
            <div className={styles.daysGrid}>
              {getDaysInMonth(currentMonth).map((date, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${styles.dayButton} ${
                    date ? styles.validDay : styles.emptyDay
                  } ${
                    date && isSelectedDate(date) ? styles.selected : ''
                  } ${
                    date && isToday(date) ? styles.today : ''
                  }`}
                  onClick={() => date && handleDateSelect(date)}
                  disabled={!date}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.calendarFooter}>
            <button
              type="button"
              className={styles.todayButton}
              onClick={() => handleDateSelect(new Date())}
            >
              Hoy
            </button>
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setSelectedDate(null);
                setInputValue('');
                onChange('');
                setIsOpen(false);
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
