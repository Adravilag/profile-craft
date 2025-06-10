import React, { useState, useRef, useEffect } from 'react';
import styles from './MonthYearPicker.module.css';

interface MonthYearPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowPresent?: boolean;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  value,
  onChange,
  placeholder = "Selecciona mes y año",
  allowPresent = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const pickerRef = useRef<HTMLDivElement>(null);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Generar años (desde 1990 hasta 5 años en el futuro)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 6 }, (_, i) => 1990 + i);

  // Parsear valor inicial
  useEffect(() => {
    if (value && value !== 'Presente') {
      const [monthStr, yearStr] = value.split(' ');
      const monthIndex = months.indexOf(monthStr);
      const year = parseInt(yearStr);
      
      if (monthIndex !== -1 && !isNaN(year)) {
        setSelectedMonth(monthIndex);
        setSelectedYear(year);
      }
    }
  }, [value]);
  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // CNC: Prevenir scroll del body
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSelectDate = () => {
    const monthYear = `${months[selectedMonth]} ${selectedYear}`;
    onChange(monthYear);
    setIsOpen(false);
  };

  const handlePresentClick = () => {
    onChange('Presente');
    setIsOpen(false);
  };

  const displayValue = value || placeholder;
  return (
    <div className={styles.monthYearPicker} ref={pickerRef}>
      <div 
        className={`${styles.monthYearInput} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`${styles.inputValue} ${!value ? styles.placeholder : ''}`}>
          {displayValue}
        </span>
        <i className={`fas fa-chevron-down ${styles.inputIcon} ${isOpen ? styles.rotated : ''}`}></i>
      </div>      {isOpen && (
        <>
          {/* CNC: Backdrop modal con sombra degradado radial */}
          <div className={styles.modalBackdrop} onClick={() => setIsOpen(false)}></div>
          <div className={styles.monthYearDropdown}>
            <div className={styles.pickerHeader}>
              <span>Seleccionar Fecha</span>
            </div>

          <div className={styles.pickerContent}>
            {/* Selector de Año */}
            <div className={styles.yearSelector}>
              <label className={styles.pickerLabel}>Año</label>
              <div className={styles.yearGrid}>
                {years.map(year => (
                  <button
                    key={year}
                    type="button"
                    className={`${styles.yearBtn} ${selectedYear === year ? styles.selected : ''}`}
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Mes */}
            <div className={styles.monthSelector}>
              <label className={styles.pickerLabel}>Mes</label>
              <div className={styles.monthGrid}>
                {months.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    className={`${styles.monthBtn} ${selectedMonth === index ? styles.selected : ''}`}
                    onClick={() => setSelectedMonth(index)}
                  >
                    {month.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.pickerActions}>
            {allowPresent && (
              <button
                type="button"
                className={styles.btnPresent}
                onClick={handlePresentClick}
              >
                <i className="fas fa-clock"></i>
                Presente
              </button>
            )}
            <button
              type="button"
              className={styles.btnConfirm}
              onClick={handleSelectDate}
            >
              <i className="fas fa-check"></i>
              Confirmar            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default MonthYearPicker;
