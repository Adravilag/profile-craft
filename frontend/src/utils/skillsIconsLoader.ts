/**
 * Utilidad para cargar y procesar el archivo skills-icons.csv
 */

export interface SkillIconData {
  name: string;
  icon_class: string;
  type: string;
  category: string;
  color: string;
  docs_url: string;
  official_repo: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  popularity: 'very_high' | 'high' | 'medium' | 'low';
  tags: string;
}

export interface ProcessedSkillData {
  name: string;
  icon_class: string;
  category: string;
  color: string;
  docs_url: string;
  official_repo: string;
  difficulty_level: string;
  popularity: string;
  tags: string[];
  suggested_level: number;
  suggested_experience: number;
}

/**
 * Convierte el nivel de dificultad a un porcentaje sugerido
 */
const getDifficultyLevel = (difficulty: string): number => {
  switch (difficulty) {
    case 'beginner': return 40;
    case 'intermediate': return 70;
    case 'advanced': return 90;
    default: return 50;
  }
};

/**
 * Convierte la popularidad a años de experiencia sugeridos
 */
const getExperienceFromPopularity = (popularity: string): number => {
  switch (popularity) {
    case 'very_high': return 3;
    case 'high': return 2;
    case 'medium': return 1;
    case 'low': return 1;
    default: return 1;
  }
};

/**
 * Parsea una línea CSV considerando comillas y comas dentro de campos
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

/**
 * Carga y procesa el archivo skills-icons.csv
 */
export const loadSkillsIcons = async (): Promise<ProcessedSkillData[]> => {
  try {
    const response = await fetch('/skills-icons.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim() && !line.startsWith('//'));
    
    if (lines.length === 0) {
      throw new Error('El archivo CSV está vacío');
    }
    
    // Obtener headers
    const headers = parseCSVLine(lines[0]);
    
    // Procesar cada línea de datos
    const skills: ProcessedSkillData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length !== headers.length) {
        console.warn(`Línea ${i + 1} tiene número incorrecto de columnas, omitiendo`);
        continue;
      }
      
      const skillData: any = {};
      headers.forEach((header, index) => {
        skillData[header] = values[index];
      });
      
      // Procesar tags
      const tags = skillData.tags 
        ? skillData.tags.replace(/"/g, '').split(',').map((tag: string) => tag.trim())
        : [];
      
      const processedSkill: ProcessedSkillData = {
        name: skillData.name,
        icon_class: skillData.icon_class,
        category: skillData.category,
        color: skillData.color,
        docs_url: skillData.docs_url,
        official_repo: skillData.official_repo,
        difficulty_level: skillData.difficulty_level,
        popularity: skillData.popularity,
        tags,
        suggested_level: getDifficultyLevel(skillData.difficulty_level),
        suggested_experience: getExperienceFromPopularity(skillData.popularity)
      };
      
      skills.push(processedSkill);
    }
    
    return skills;
  } catch (error) {
    console.error('Error cargando skills-icons.csv:', error);
    throw error;
  }
};

/**
 * Busca una habilidad específica por nombre
 */
export const findSkillByName = async (name: string): Promise<ProcessedSkillData | null> => {
  try {
    const skills = await loadSkillsIcons();
    return skills.find(skill => 
      skill.name.toLowerCase() === name.toLowerCase()
    ) || null;
  } catch (error) {
    console.error('Error buscando habilidad:', error);
    return null;
  }
};

/**
 * Obtiene habilidades por categoría
 */
export const getSkillsByCategory = async (category: string): Promise<ProcessedSkillData[]> => {
  try {
    const skills = await loadSkillsIcons();
    return skills.filter(skill => 
      skill.category.toLowerCase() === category.toLowerCase()
    );
  } catch (error) {
    console.error('Error filtrando por categoría:', error);
    return [];
  }
};

/**
 * Obtiene todas las categorías disponibles
 */
export const getAvailableCategories = async (): Promise<string[]> => {
  try {
    const skills = await loadSkillsIcons();
    const categories = [...new Set(skills.map(skill => skill.category))];
    return categories.sort();
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return [];
  }
};

/**
 * Enriquece una habilidad existente con datos del CSV
 */
export const enrichSkillWithIconData = async (skillName: string): Promise<Partial<ProcessedSkillData> | null> => {
  const iconData = await findSkillByName(skillName);
  if (!iconData) return null;
  
  return {
    icon_class: iconData.icon_class,
    color: iconData.color,
    docs_url: iconData.docs_url,
    official_repo: iconData.official_repo,
    suggested_level: iconData.suggested_level,
    suggested_experience: iconData.suggested_experience,
    tags: iconData.tags
  };
};
