// Date formatting utilities

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
  });
};

export const formatDateRange = (
  startDate: string | Date, 
  endDate?: string | Date, 
  current = false
): string => {
  const start = formatDate(startDate);
  if (current) return `${start} - Presente`;
  if (!endDate) return start;
  return `${start} - ${formatDate(endDate)}`;
};

export const formatDateShort = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const isDateInFuture = (date: string | Date): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return targetDate > new Date();
};

export const getDateDifference = (
  startDate: string | Date,
  endDate: string | Date = new Date()
): { years: number; months: number } => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  
  let years = yearDiff;
  let months = monthDiff;
  
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  
  return { years, months };
};
