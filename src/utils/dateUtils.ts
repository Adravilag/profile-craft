export const formatDateRange = (startDate: string, endDate: string): string => {
  const formattedStart = formatDateFromInput(startDate);
  const formattedEnd = formatDateFromInput(endDate);
  
  if (formattedEnd.toLowerCase() === 'presente') {
    return `${formattedStart} - Presente`;
  }
  return `${formattedStart} - ${formattedEnd}`;
};

export const calculateDuration = (startDate: string, endDate: string): string => {
  const parseDate = (dateString: string): number => {
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

    // Handle Spanish month format (e.g., "Junio 2024")
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

export const formatDateFromInput = (dateString: string): string => {
  if (!dateString) return '';
  
  const lower = dateString.toLowerCase();
  if (lower === 'presente' || lower === 'current') {
    return 'Presente';
  }

  // Handle HTML5 month input format (YYYY-MM)
  if (/^\d{4}-\d{2}$/.test(dateString)) {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const [yearStr, monthStr] = dateString.split('-');
    const year = parseInt(yearStr);
    const monthIndex = parseInt(monthStr) - 1; // Convert 1-based to 0-based
    
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${months[monthIndex]} ${year}`;
    }
  }

  // Return as-is for other formats
  return dateString;
};
