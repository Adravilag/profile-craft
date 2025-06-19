// src/components/sections/skills/hooks/useSkillsIcons.ts

import { useState, useEffect, useCallback } from 'react';
import type { SkillIconData, ExternalSkillData } from '../types/skills';
import { parseSkillsIcons, getSkillSvg } from '../utils/skillUtils';
import type { Skill } from '../../../../services/api';
import { debugLog } from '../../../../utils/debugConfig';

// Crear un singleton para almacenar los iconos de habilidades cargados
// y evitar múltiples peticiones fetch del CSV
let cachedIcons: SkillIconData[] | null = null;
let cachedNames: string[] | null = null;

export const useSkillsIcons = () => {
  const [skillsIcons, setSkillsIcons] = useState<SkillIconData[]>(cachedIcons || []);
  const [skillNames, setSkillNames] = useState<string[]>(cachedNames || []);
  const [externalData, setExternalData] = useState<Record<string, ExternalSkillData>>({});
  const [loadingExternalData, setLoadingExternalData] = useState<Record<string, boolean>>({});

  // Cargar iconos CSV
  useEffect(() => {
    // Si ya tenemos la información en caché, usarla
    if (cachedIcons && cachedIcons.length > 0) {
      debugLog.dataLoading(`[SkillsIcons] Usando caché: ${cachedIcons.length} habilidades`);
      setSkillsIcons(cachedIcons);
      setSkillNames(cachedNames || []);
      return;
    }
    
    // Función para obtener la URL correcta del CSV
    const getCSVUrl = () => {
      // En desarrollo con base path, usar la ruta completa
      if (import.meta.env.DEV) {
        return "/profile-craft/data/skills-icons.csv";
      }
      // En producción, usar ruta relativa al base
      return "./data/skills-icons.csv";
    };

    debugLog.dataLoading('[SkillsIcons] Cargando CSV de iconos...');
    fetch(getCSVUrl())
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
      })
      .then((csv) => {
        const icons = parseSkillsIcons(csv);
        debugLog.dataLoading(`[SkillsIcons] CSV cargado: ${icons.length} habilidades`);
        debugLog.dataLoading('[SkillsIcons] Primeras 5 habilidades:', icons.slice(0, 5));
        
        // Actualizar el estado local
        setSkillsIcons(icons);
        setSkillNames(icons.map((icon) => icon.name));
        
        // Guardar en la caché global
        cachedIcons = icons;
        cachedNames = icons.map((icon) => icon.name);
      })
      .catch((error) => {
        console.error("[SkillsIcons] Error loading CSV:", error);
      });
  }, []);

  // Función mejorada para obtener datos de popularidad de APIs externas
  const fetchSkillPopularity = async (skillName: string): Promise<ExternalSkillData> => {
    try {
      // Limpiar el nombre de la skill para mejores resultados
      const cleanSkillName = skillName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      
      // Mapeo de nombres de skills para mejores búsquedas
      const skillMapping: Record<string, string> = {
        'react': 'facebook/react',
        'vue': 'vuejs/vue',
        'angular': 'angular/angular',
        'nodejs': 'nodejs/node',
        'node.js': 'nodejs/node',
        'typescript': 'microsoft/TypeScript',
        'javascript': 'javascript',
        'python': 'python/cpython',
        'java': 'openjdk/jdk',
        'c#': 'dotnet/core',
        'php': 'php/php-src',
        'rust': 'rust-lang/rust',
        'go': 'golang/go',
        'swift': 'apple/swift',
        'kotlin': 'JetBrains/kotlin',
        'docker': 'docker/docker-ce',
        'kubernetes': 'kubernetes/kubernetes',
        'mongodb': 'mongodb/mongo',
        'postgresql': 'postgres/postgres',
        'mysql': 'mysql/mysql-server',
        'redis': 'redis/redis',
        'nginx': 'nginx/nginx',
        'apache': 'apache/httpd',
        'git': 'git/git',
        'webpack': 'webpack/webpack',
        'vite': 'vitejs/vite',
        'next.js': 'vercel/next.js',
        'nuxt': 'nuxt/nuxt',
        'express': 'expressjs/express',
        'django': 'django/django',
        'flask': 'pallets/flask',
        'laravel': 'laravel/laravel',
        'symfony': 'symfony/symfony',
        'spring': 'spring-projects/spring-framework',
        'bootstrap': 'twbs/bootstrap',
        'tailwind': 'tailwindlabs/tailwindcss',
        'sass': 'sass/sass',
        'less': 'less/less.js',
        'jquery': 'jquery/jquery',
        'lodash': 'lodash/lodash',
        'jest': 'facebook/jest',
        'cypress': 'cypress-io/cypress',
        'electron': 'electron/electron',
        'flutter': 'flutter/flutter',
        'react native': 'facebook/react-native',
        'vue native': 'GeekyAnts/vue-native-core',
        'ionic': 'ionic-team/ionic-framework',
        'cordova': 'apache/cordova',
        'xamarin': 'xamarin/xamarin-forms'
      };

      // Buscar el repositorio específico o usar el nombre de la skill
      const searchQuery = skillMapping[cleanSkillName] || cleanSkillName;
      
      // Primero intentar búsqueda específica por repositorio
      let response;
      if (skillMapping[cleanSkillName]) {
        response = await fetch(`https://api.github.com/repos/${searchQuery}`);
      } else {
        response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=1`);
      }
      
      if (response.ok) {
        const data = await response.json();
        let repoData;
        
        if (skillMapping[cleanSkillName]) {
          repoData = data;
        } else if (data.items && data.items.length > 0) {
          repoData = data.items[0];
        }
        
        if (repoData) {
          const stars = repoData.stargazers_count || 0;
          const forks = repoData.forks_count || 0;
          const issues = repoData.open_issues_count || 0;
          const description = repoData.description;
          
          // Calcular popularidad basada en múltiples métricas
          let popularity = 'low';
          let difficulty = 'intermediate';
          
          // Clasificación de popularidad más sofisticada
          const totalActivity = stars + (forks * 2) + (issues * 0.1);
          
          if (totalActivity > 100000) popularity = 'very_high';
          else if (totalActivity > 30000) popularity = 'high';
          else if (totalActivity > 10000) popularity = 'medium';
          else if (totalActivity > 1000) popularity = 'medium_low';
          else popularity = 'low';
          
          // Estimar dificultad basada en el tipo de tecnología y actividad
          const complexLanguages = ['rust', 'c++', 'c', 'assembly', 'haskell', 'erlang', 'scala'];
          const intermediateLanguages = ['java', 'c#', 'go', 'kotlin', 'swift', 'typescript'];
          const beginnerLanguages = ['python', 'javascript', 'ruby', 'php', 'html', 'css'];
          
          if (complexLanguages.includes(cleanSkillName) || issues > 1000) {
            difficulty = 'advanced';
          } else if (intermediateLanguages.includes(cleanSkillName) || (stars > 20000 && issues > 500)) {
            difficulty = 'intermediate';
          } else if (beginnerLanguages.includes(cleanSkillName)) {
            difficulty = 'beginner';
          }
          
          return { 
            popularity, 
            difficulty,
            description: description?.substring(0, 100) + (description?.length > 100 ? '...' : '')
          };
        }
      }
      
      // Fallback: intentar con Stack Overflow API para obtener popularidad por tags
      try {
        const soResponse = await fetch(`https://api.stackexchange.com/2.3/tags/${encodeURIComponent(cleanSkillName)}/info?site=stackoverflow`);
        if (soResponse.ok) {
          const soData = await soResponse.json();
          if (soData.items && soData.items.length > 0) {
            const tagCount = soData.items[0].count;
            let popularity = 'low';
            
            if (tagCount > 500000) popularity = 'very_high';
            else if (tagCount > 200000) popularity = 'high';
            else if (tagCount > 50000) popularity = 'medium';
            else if (tagCount > 10000) popularity = 'medium_low';
            
            return { popularity };
          }
        }
      } catch (soError) {
        console.warn('Stack Overflow API no disponible:', soError);
      }
      
    } catch (error) {
      console.warn('No se pudo obtener datos de popularidad externos:', error);
    }
    
    return {};
  };

  // Función para enriquecer skill con datos externos
  const enrichSkillWithExternalData = async (skillName: string) => {
    if (!externalData[skillName] && !loadingExternalData[skillName]) {
      setLoadingExternalData(prev => ({ ...prev, [skillName]: true }));
      try {
        const data = await fetchSkillPopularity(skillName);
        setExternalData(prev => ({
          ...prev,
          [skillName]: data
        }));
      } finally {
        setLoadingExternalData(prev => ({ ...prev, [skillName]: false }));
      }
    }
  };  // Función para enriquecer skills existentes que no tienen iconos o que necesitan actualizarse
  const enrichExistingSkills = useCallback((_skills: Skill[], setSkills: React.Dispatch<React.SetStateAction<Skill[]>>) => {
    if (skillsIcons.length > 0) {
      debugLog.dataLoading('[SkillsIcons] Enriqueciendo skills existentes con iconos CSV');
      
      setSkills((prevSkills) =>
        prevSkills.map((skill) => {
          // Siempre intentar obtener el mejor icono disponible del CSV
          const bestIconSvg = getSkillSvg(skill.name, skill.icon_class, skillsIcons);
          
          // Si no tiene icono o es diferente al que obtuvimos del CSV, actualizarlo
          if (!skill.icon_class || skill.icon_class.trim() === "" || 
              (bestIconSvg && bestIconSvg !== skill.icon_class)) {
            debugLog.dataLoading(`[SkillsIcons] Actualizando icono para: ${skill.name}`);
            return { ...skill, icon_class: bestIconSvg };
          }
          return skill;
        })
      );
    } else {
      console.warn('[SkillsIcons] No hay iconos cargados para enriquecer skills existentes');
    }
  }, [skillsIcons]);

  return {
    // State
    skillsIcons,
    skillNames,
    externalData,
    loadingExternalData,
    
    // Functions
    enrichSkillWithExternalData,
    enrichExistingSkills,
  };
};
