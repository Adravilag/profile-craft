// src/contexts/NavigationContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationContextType {
  currentSection: string;
  currentSubPath: string | null;
  navigateToSection: (section: string, subPath?: string) => void;
  getCurrentPath: () => string;
  setPathFromUrl: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentSection, setCurrentSection] = useState('about');
  const [currentSubPath, setCurrentSubPath] = useState<string | null>(null);

  // Función para navegar a una sección y actualizar la URL
  const navigateToSection = (section: string, subPath?: string) => {
    setCurrentSection(section);
    setCurrentSubPath(subPath || null);
    
    // Construir la nueva ruta
    let newPath = '/';
    if (section !== 'about') {
      newPath = `/${section}`;
      if (subPath) {
        newPath += `/${subPath}`;
      }
    }
    
    // Actualizar la URL sin recargar la página
    window.history.pushState({}, '', newPath);
  };

  // Función para obtener la ruta actual
  const getCurrentPath = () => {
    return window.location.pathname;
  };

  // Función para establecer la sección desde la URL
  const setPathFromUrl = () => {
    const path = window.location.pathname;
    
    if (path === '/' || path === '') {
      setCurrentSection('about');
      setCurrentSubPath(null);
    } else {
      const pathParts = path.substring(1).split('/'); // Remover el '/' inicial y dividir
      const section = pathParts[0];
      const subPath = pathParts[1] || null;
      
      setCurrentSection(section);
      setCurrentSubPath(subPath);
    }
  };

  // Configurar el listener para el botón atrás del navegador
  useEffect(() => {
    const handlePopState = () => {
      setPathFromUrl();
    };

    // Establecer la sección inicial desde la URL
    setPathFromUrl();

    // Escuchar cambios en el historial del navegador
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  const value = {
    currentSection,
    currentSubPath,
    navigateToSection,
    getCurrentPath,
    setPathFromUrl
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
