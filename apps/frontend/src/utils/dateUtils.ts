export const formatDateRange = (startDate: string | null | undefined, endDate: string | null | undefined): string => {
  const formattedStart = formatDateFromInput(startDate);
  
  // Handle empty or null end dates
  if (!endDate || endDate.trim() === '') {
    return `${formattedStart} - Presente`;
  }
  
  const formattedEnd = formatDateFromInput(endDate);
  
  if (!formattedEnd || formattedEnd.toLowerCase() === 'presente') {
    return `${formattedStart} - Presente`;
  }
  return `${formattedStart} - ${formattedEnd}`;
};

export const calculateDuration = (startDate: string, endDate: string): string => {
  const parseDate = (dateString: string | null | undefined): number => {
    if (!dateString) return 0;
    const lower = dateString.toLowerCase();
    if (lower === 'presente' || lower === 'current') {
      const now = new Date();
      return now.getFullYear() * 12 + now.getMonth();
    }

    // Handle year-only format (e.g., "2024")
    if (/^\d{4}$/.test(dateString)) {
      return parseInt(dateString) * 12;
    }

    // Handle HTML5 month input format (YYYY-MM)
    if (/^\d{4}-\d{2}$/.test(dateString)) {
      const [yearStr, monthStr] = dateString.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr) - 1; // Month input is 1-based, but we need 0-based for calculation
      return year * 12 + month;
    }

    // Handle ISO timestamp format (YYYY-MM-DDTHH:mm:ss.sssZ)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(dateString)) {
      const dateObj = new Date(dateString);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        return year * 12 + month;
      }
    }

    // Handle Spanish month format (e.g., "Junio 2024", "1 de junio del 2024")
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const monthsCapitalized = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Handle new Spanish format "mes del año"
    const newSpanishDateMatch = dateString.match(/^(\w+)\s+del\s+(\d{4})$/i);
    if (newSpanishDateMatch) {
      const monthName = newSpanishDateMatch[1].toLowerCase();
      const year = parseInt(newSpanishDateMatch[2]);
      const monthIndex = months.indexOf(monthName);
      
      if (monthIndex !== -1 && !isNaN(year)) {
        return year * 12 + monthIndex;
      }
    }

    // Handle old Spanish format "día de mes del año"
    const oldSpanishDateMatch = dateString.match(/^\d+\s+de\s+(\w+)\s+del\s+(\d{4})$/i);
    if (oldSpanishDateMatch) {
      const monthName = oldSpanishDateMatch[1].toLowerCase();
      const year = parseInt(oldSpanishDateMatch[2]);
      const monthIndex = months.indexOf(monthName);
      
      if (monthIndex !== -1 && !isNaN(year)) {
        return year * 12 + monthIndex;
      }
    }

    // Handle old format "Mes Año"
    const [monthStr, yearStr] = dateString.split(' ');
    let monthIndex = monthsCapitalized.indexOf(monthStr);
    if (monthIndex === -1) {
      monthIndex = months.indexOf(monthStr.toLowerCase());
    }
    const year = parseInt(yearStr);

    if (monthIndex !== -1 && !isNaN(year)) {
      return year * 12 + monthIndex;
    }

    // Fallback to year parsing
    const fallbackYear = parseInt(dateString);
    return !isNaN(fallbackYear) ? fallbackYear * 12 : 0;
  };

  const startMonths = parseDate(startDate);
  const endMonths = parseDate(endDate);
  const totalMonths = endMonths - startMonths;

  if (totalMonths < 0) return 'Duración inválida';
  if (totalMonths === 0) return 'Menos de 1 mes';
  if (totalMonths < 12) {
    return totalMonths === 1 ? '1 mes' : `${totalMonths} meses`;
  }

  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  if (remainingMonths === 0) {
    return years === 1 ? '1 año' : `${years} años`;
  }

  const yearPart = years === 1 ? '1 año' : `${years} años`;
  const monthPart = remainingMonths === 1 ? '1 mes' : `${remainingMonths} meses`;
  return `${yearPart} y ${monthPart}`;
};

export const formatDateFromInput = (dateString: string | null | undefined): string => {
  if (!dateString || dateString.trim() === '') return '';
  
  const lower = dateString.toLowerCase();
  if (lower === 'presente' || lower === 'current') {
    return 'Presente';
  }

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Manejar fechas ISO timestamp (YYYY-MM-DDTHH:mm:ss.sssZ o variaciones)
  if (dateString.includes('T')) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${months[monthIndex]} del ${year}`;
      }
    }
  }

  // Manejar formato HTML5 month (YYYY-MM)
  if (/^\d{4}-\d{2}$/.test(dateString)) {
    const [yearStr, monthStr] = dateString.split('-');
    const year = parseInt(yearStr);
    const monthIndex = parseInt(monthStr) - 1; // Convert 1-based to 0-based
    
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${months[monthIndex]} del ${year}`;
    }
  }

  // Manejar formato de fecha completa (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [yearStr, monthStr] = dateString.split('-');
    const year = parseInt(yearStr);
    const monthIndex = parseInt(monthStr) - 1;
    
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${months[monthIndex]} del ${year}`;
    }
  }

  // Intentar parsearlo como cualquier fecha válida
  const dateObj = new Date(dateString);
  if (!isNaN(dateObj.getTime())) {
    const monthIndex = dateObj.getMonth();
    const year = dateObj.getFullYear();
    
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${months[monthIndex]} del ${year}`;
    }
  }

  // Manejar formato español existente (e.g., "Enero 2024" -> "Enero del 2024")
  const spanishMonthMatch = dateString.match(/^(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)\s+(\d{4})$/i);
  if (spanishMonthMatch) {
    const monthName = spanishMonthMatch[1];
    const year = parseInt(spanishMonthMatch[2]);
    return `${monthName} del ${year}`;
  }

  // Return as-is for other formats
  return dateString;
};

// Función para convertir de formato español de vuelta a formato ISO para formularios
export const convertSpanishDateToISO = (spanishDate: string): string => {
  if (!spanishDate) return '';
  
  const lower = spanishDate.toLowerCase();
  if (lower === 'presente' || lower === 'current' || lower === 'actualmente') {
    return 'presente';
  }

  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const monthsCapitalized = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Handle Spanish format "mes del año" (both capitalized and lowercase)
  const spanishDateMatch = spanishDate.match(/^(\w+)\s+del\s+(\d{4})$/i);
  if (spanishDateMatch) {
    const monthName = spanishDateMatch[1];
    const year = parseInt(spanishDateMatch[2]);
    let monthIndex = monthsCapitalized.indexOf(monthName);
    if (monthIndex === -1) {
      monthIndex = months.indexOf(monthName.toLowerCase());
    }
    
    if (monthIndex !== -1) {
      return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    }
  }

  // Handle old Spanish format "día de mes del año"
  const oldSpanishDateMatch = spanishDate.match(/^(\d+)\s+de\s+(\w+)\s+del\s+(\d{4})$/i);
  if (oldSpanishDateMatch) {
    const day = parseInt(oldSpanishDateMatch[1]);
    const monthName = oldSpanishDateMatch[2].toLowerCase();
    const year = parseInt(oldSpanishDateMatch[3]);
    const monthIndex = months.indexOf(monthName);
    
    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      // For form inputs, if day is 1, we assume it's a month-only date
      if (day === 1) {
        return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      } else {
        return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  }

  // Handle old format "Mes Año" or "mes año"
  const oldFormatMatch = spanishDate.match(/^(\w+)\s+(\d{4})$/i);
  if (oldFormatMatch) {
    const monthName = oldFormatMatch[1];
    const year = parseInt(oldFormatMatch[2]);
    let monthIndex = monthsCapitalized.indexOf(monthName);
    if (monthIndex === -1) {
      monthIndex = months.indexOf(monthName.toLowerCase());
    }
    
    if (monthIndex !== -1) {
      return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    }
  }

  // If it's already in ISO format (including full timestamp), convert to simple format for forms
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(spanishDate)) {
    const dateObj = new Date(spanishDate);
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      // For form inputs, if day is 1, we assume it's a month-only date
      if (dateObj.getDate() === 1) {
        return `${year}-${month}`;
      } else {
        return `${year}-${month}-${day}`;
      }
    }
  }

  // If it's already in simple ISO format, return as-is
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(spanishDate)) {
    return spanishDate;
  }

  // Return as-is for unrecognized formats
  return spanishDate;
};
