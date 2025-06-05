export const formatDateRange = (startDate: string, endDate: string): string => {
  const end = endDate.toLowerCase();
  if (end === 'presente' || end === 'current') {
    return `${startDate} - Presente`;
  }
  return `${startDate} - ${endDate}`;
};

export const calculateDuration = (startDate: string, endDate: string): string => {
  const parseDate = (dateString: string): number => {
    const lower = dateString.toLowerCase();
    if (lower === 'presente' || lower === 'current') {
      const now = new Date();
      return now.getFullYear() * 12 + now.getMonth();
    }

    if (/^\d{4}$/.test(dateString)) {
      return parseInt(dateString) * 12;
    }

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
