import React, { useState, useRef, useEffect } from 'react';
import './MonthYearPicker.css';

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="month-year-picker" ref={pickerRef}>
      <div 
        className={`month-year-input ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`input-value ${!value ? 'placeholder' : ''}`}>
          {displayValue}
        </span>
        <i className={`fas fa-chevron-down input-icon ${isOpen ? 'rotated' : ''}`}></i>
      </div>

      {isOpen && (
        <div className="month-year-dropdown">
          <div className="picker-header">
            <span>Seleccionar Fecha</span>
          </div>

          <div className="picker-content">
            {/* Selector de Año */}
            <div className="year-selector">
              <label className="picker-label">Año</label>
              <div className="year-grid">
                {years.map(year => (
                  <button
                    key={year}
                    type="button"
                    className={`year-btn ${selectedYear === year ? 'selected' : ''}`}
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Mes */}
            <div className="month-selector">
              <label className="picker-label">Mes</label>
              <div className="month-grid">
                {months.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    className={`month-btn ${selectedMonth === index ? 'selected' : ''}`}
                    onClick={() => setSelectedMonth(index)}
                  >
                    {month.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="picker-actions">
            {allowPresent && (
              <button
                type="button"
                className="btn-present"
                onClick={handlePresentClick}
              >
                <i className="fas fa-clock"></i>
                Presente
              </button>
            )}
            <button
              type="button"
              className="btn-confirm"
              onClick={handleSelectDate}
            >
              <i className="fas fa-check"></i>
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthYearPicker;
