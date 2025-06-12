// utils/skillUtils.ts
import type { SkillIconData } from '../types/skills';

// Función para convertir nombre de skill a clase CSS válida
export const getSkillCssClass = (skillName: string): string => {
  return `skill-${skillName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')}`;
};

// Función para obtener el SVG de una skill
export const getSkillSvg = (
  skillName: string,
  existingSvg: string | null | undefined,
  skillsIcons: SkillIconData[]
): string => {
  // Primero buscar en el CSV por nombre (prioridad alta)
  const csvIcon = skillsIcons.find(
    (icon) => icon.name.toLowerCase() === skillName.toLowerCase()
  );
  if (csvIcon && csvIcon.svg_path) {
    return csvIcon.svg_path;
  }

  // Si ya tiene un SVG válido (no FontAwesome), usarlo
  if (existingSvg && existingSvg.trim() !== "" && existingSvg.includes('.svg')) {
    return existingSvg;
  }

  // Fallback por defecto (icono genérico SVG)
  return "/assets/svg/generic-code.svg";
};

// Función para convertir el nivel de dificultad del CSV a número de estrellas
export const getDifficultyStars = (difficultyLevel: string | undefined): number => {
  if (!difficultyLevel) return 0;
  
  const level = difficultyLevel.toLowerCase().trim();
  switch (level) {
    case 'beginner':
    case 'basic':
      return 1;
    case 'intermediate':
    case 'medium':
      return 3;
    case 'advanced':
    case 'expert':
      return 4;
    case 'master':
    case 'guru':
      return 5;
    default:
      // Si es un número, intentar parsearlo
      const numLevel = parseInt(level);
      if (!isNaN(numLevel) && numLevel >= 1 && numLevel <= 5) {
        return numLevel;
      }
      return 0;
  }
};

// Función para calcular la popularidad de una tecnología
export const getPopularityLevel = (skill: any, skillInfo: any, externalData?: any): { level: number; label: string; color: string } => {
  // Priorizar datos externos si están disponibles
  if (externalData?.popularity) {
    const popularity = externalData.popularity.toLowerCase();
    if (popularity.includes('very_high') || popularity.includes('muy_alta')) {
      return { level: 5, label: 'Muy Alta', color: '#10b981' };
    }
    if (popularity.includes('high') || popularity.includes('alta')) {
      return { level: 4, label: 'Alta', color: '#3b82f6' };
    }
    if (popularity.includes('medium') || popularity.includes('media')) {
      return { level: 3, label: 'Media', color: '#f59e0b' };
    }
    if (popularity.includes('low') || popularity.includes('baja')) {
      return { level: 2, label: 'Baja', color: '#ef4444' };
    }
    return { level: 1, label: 'Muy Baja', color: '#6b7280' };
  }

  // Normalizar valores para el cálculo
  const level = Math.min(parseFloat(skill.level || 0), 5); // Máximo 5
  const experience = Math.min(parseFloat(skill.years_experience || skill.experience || 0), 10); // Máximo 10 años
  const difficulty = getDifficultyStars(skillInfo?.difficulty_level || ''); // 1-5 estrellas
  
  // Normalizar a escala 0-1
  const normalizedLevel = level / 5; // 0-1
  const normalizedExperience = experience / 10; // 0-1  
  const normalizedDifficulty = difficulty / 5; // 0-1
  
  // Algoritmo ajustado: dar más peso a la experiencia práctica
  // y menos a la dificultad teórica
  const popularityScore = (
    (normalizedLevel * 0.5) + 
    (normalizedExperience * 0.4) + 
    (normalizedDifficulty * 0.1)
  ) * 5; // Escalar de vuelta a 1-5
  
  // Umbrales más realistas con distribución más equilibrada
  if (popularityScore >= 4.2) return { level: 5, label: 'Muy Alta', color: '#10b981' };
  if (popularityScore >= 3.2) return { level: 4, label: 'Alta', color: '#3b82f6' };
  if (popularityScore >= 2.0) return { level: 3, label: 'Media', color: '#f59e0b' };
  if (popularityScore >= 1.0) return { level: 2, label: 'Baja', color: '#ef4444' };
  return { level: 1, label: 'Muy Baja', color: '#6b7280' };
};

// Función para parsear el CSV de iconos de skills
export function parseSkillsIcons(csv: string): SkillIconData[] {
  const lines = csv.split('\n').map(line => line.trim()).filter(Boolean);
  
  if (lines.length === 0) {
    console.warn('CSV file is empty');
    return [];
  }
  
  // Verificar si hay encabezado y obtener índices de columnas
  const headers = lines[0].split(',').map(h => h.trim());
  const nameIdx = headers.indexOf('name');
  const svgIdx = headers.indexOf('svg_path');
  
  // Si no encontramos las columnas requeridas, retornar array vacío
  if (nameIdx === -1 || svgIdx === -1) {
    console.error('CSV format error: required columns "name" and/or "svg_path" not found');
    console.error('Available headers:', headers);
    console.error('Looking for: name, svg_path');
    return [];
  }
  
  // Procesar el resto de las líneas (saltando el encabezado)
  return lines.slice(1).map(line => {
    const values = line.split(',');
    
    // Crear objeto con los valores disponibles
    const data: SkillIconData = {
      name: values[nameIdx]?.trim() || '',
      svg_path: values[svgIdx]?.trim() || ''
    };
    
    // Añadir campos opcionales si están disponibles
    const typeIdx = headers.indexOf('type');
    if (typeIdx !== -1 && values[typeIdx]) data.type = values[typeIdx].trim();
    
    const catIdx = headers.indexOf('category');
    if (catIdx !== -1 && values[catIdx]) data.category = values[catIdx].trim();
    
    const colorIdx = headers.indexOf('color');
    if (colorIdx !== -1 && values[colorIdx]) data.color = values[colorIdx].trim();
    
    const docsIdx = headers.indexOf('docs_url');
    if (docsIdx !== -1 && values[docsIdx]) data.docs_url = values[docsIdx].trim();
    
    const repoIdx = headers.indexOf('official_repo');
    if (repoIdx !== -1 && values[repoIdx]) data.official_repo = values[repoIdx].trim();
    
    const diffIdx = headers.indexOf('difficulty_level');
    if (diffIdx !== -1 && values[diffIdx]) data.difficulty_level = values[diffIdx].trim();
    
    return data;
  }).filter(item => item.name && item.svg_path); // Filtrar elementos sin nombre o SVG
}
