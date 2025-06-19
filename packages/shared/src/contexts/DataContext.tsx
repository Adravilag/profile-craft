// src/contexts/DataContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserProfile, getExperiences, getArticles } from '../services/api';
import type { UserProfile, Experience, Article } from '../services/api';
import { debugLog } from '../utils/debugConfig';

interface DataContextType {
  // Datos
  profile: UserProfile | null;
  experiences: Experience[];
  articles: Article[];
  
  // Estados de carga
  profileLoading: boolean;
  experiencesLoading: boolean;
  articlesLoading: boolean;
  
  // Errores
  profileError: string | null;
  experiencesError: string | null;
  articlesError: string | null;
  
  // Funciones de precarga
  preloadProfile: () => Promise<void>;
  preloadExperiences: () => Promise<void>;
  preloadArticles: () => Promise<void>;
  preloadSection: (sectionId: string) => Promise<void>;
  
  // Estado general
  isAnyLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Estados de datos
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  
  // Estados de carga
  const [profileLoading, setProfileLoading] = useState(false);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [articlesLoading, setArticlesLoading] = useState(false);
  
  // Estados de error
  const [profileError, setProfileError] = useState<string | null>(null);
  const [experiencesError, setExperiencesError] = useState<string | null>(null);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  
  // Cache flags para evitar múltiples cargas
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [experiencesLoaded, setExperiencesLoaded] = useState(false);
  const [articlesLoaded, setArticlesLoaded] = useState(false);

  // Función para precargar el perfil
  const preloadProfile = useCallback(async () => {
    if (profileLoaded || profileLoading) return;
    
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      const data = await getUserProfile();
      setProfile(data);
      setProfileLoaded(true);
      
      if (process.env.NODE_ENV === 'development') {
        debugLog.dataLoading('DataContext: Perfil de usuario cargado');
      }
    } catch (error) {
      setProfileError('No se pudo cargar el perfil.');
      debugLog.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [profileLoaded, profileLoading]);

  // Función para precargar experiencias
  const preloadExperiences = useCallback(async () => {
    if (experiencesLoaded || experiencesLoading) return;
    
    setExperiencesLoading(true);
    setExperiencesError(null);
    
    try {
      const data = await getExperiences();
      setExperiences(data);
      setExperiencesLoaded(true);
      
      if (process.env.NODE_ENV === 'development') {
        debugLog.dataLoading('DataContext: Experiencias cargadas');
      }
    } catch (error) {
      setExperiencesError('No se pudo cargar las experiencias.');
      debugLog.error('Error loading experiences:', error);
    } finally {
      setExperiencesLoading(false);
    }
  }, [experiencesLoaded, experiencesLoading]);

  // Función para precargar artículos
  const preloadArticles = useCallback(async () => {
    if (articlesLoaded || articlesLoading) return;
    
    setArticlesLoading(true);
    setArticlesError(null);
    
    try {
      const data = await getArticles();
      setArticles(data);
      setArticlesLoaded(true);
      
      if (process.env.NODE_ENV === 'development') {
        debugLog.dataLoading('DataContext: Artículos cargados');
      }
    } catch (error) {
      setArticlesError('No se pudo cargar los artículos.');
      debugLog.error('Error loading articles:', error);
    } finally {
      setArticlesLoading(false);
    }
  }, [articlesLoaded, articlesLoading]);

  // Función para precargar datos específicos de una sección
  const preloadSection = useCallback(async (sectionId: string) => {
    const promises: Promise<void>[] = [];
    
    switch (sectionId) {
      case 'about':
        promises.push(preloadProfile());
        break;
      case 'experience':
        promises.push(preloadExperiences());
        break;
      case 'articles':
        promises.push(preloadArticles());
        break;
      case 'contact':
        // La sección de contacto también usa el perfil para mostrar información
        promises.push(preloadProfile());
        break;
      default:
        // Para otras secciones, precargar al menos el perfil
        promises.push(preloadProfile());
        break;
    }
    
    await Promise.all(promises);
  }, [preloadProfile, preloadExperiences, preloadArticles]);

  // Escuchar eventos de precarga desde NavigationContext
  useEffect(() => {
    const handlePreload = (event: CustomEvent) => {
      const { sectionId } = event.detail;
      
      if (process.env.NODE_ENV === 'development') {
        debugLog.dataLoading(`DataContext: Precargando datos para sección "${sectionId}"`);
      }
      
      preloadSection(sectionId);
    };

    document.addEventListener('sectionPreload', handlePreload as EventListener);
    
    return () => {
      document.removeEventListener('sectionPreload', handlePreload as EventListener);
    };
  }, [preloadSection]);

  // Cargar datos iniciales (perfil siempre se carga al inicio)
  useEffect(() => {
    preloadProfile();
  }, [preloadProfile]);

  // Estado general de carga
  const isAnyLoading = profileLoading || experiencesLoading || articlesLoading;

  const value = {
    // Datos
    profile,
    experiences,
    articles,
    
    // Estados de carga
    profileLoading,
    experiencesLoading,
    articlesLoading,
    
    // Errores
    profileError,
    experiencesError,
    articlesError,
    
    // Funciones de precarga
    preloadProfile,
    preloadExperiences,
    preloadArticles,
    preloadSection,
    
    // Estado general
    isAnyLoading
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
