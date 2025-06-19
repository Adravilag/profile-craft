import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthenticatedUserProfile } from '../services/api';
import type { UserProfile } from '../services/api';
import { debugLog } from '../utils/debugConfig';

interface InitialSetupData {
  name: string;
  email: string;
  role_title: string;
  role_subtitle: string;
  about_me: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
}

interface InitialSetupContextType {
  isFirstTime: boolean;
  isLoading: boolean;
  hasBasicData: boolean;
  profile: UserProfile | null;
  saveInitialSetup: (data: InitialSetupData) => Promise<void>;
  checkSetupStatus: () => Promise<void>;
}

const InitialSetupContext = createContext<InitialSetupContextType | undefined>(undefined);

interface InitialSetupProviderProps {
  children: ReactNode;
}

export const InitialSetupProvider: React.FC<InitialSetupProviderProps> = ({ children }) => {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Cambiar a false por defecto
  const [hasBasicData, setHasBasicData] = useState(true); // Cambiar a true por defecto
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Verificar si es la primera vez o si faltan datos básicos
  const checkSetupStatus = async () => {
    try {
      setIsLoading(true);
      
      // Solo verificar el perfil si hay un token de autenticación
      const token = localStorage.getItem('portfolio_auth_token');
      if (!token) {
        // Sin token, no es primera vez, solo un usuario no autenticado
        setIsFirstTime(false);
        setHasBasicData(true);
        setProfile(null);
        return;
      }
      
      const profileData = await getAuthenticatedUserProfile();
      
      if (!profileData) {
        setIsFirstTime(true);
        setHasBasicData(false);
        setProfile(null);
        return;
      }      setProfile(profileData);
      
      // Verificar si tiene los datos básicos mínimos
      const hasMinimumData = Boolean(
        profileData.name && 
        profileData.email && 
        profileData.role_title && 
        profileData.about_me
      );

      setHasBasicData(hasMinimumData);
      setIsFirstTime(!hasMinimumData);    } catch (error) {
      debugLog.error('Error verificando estado de configuración:', error);
      // Si hay error cargando el perfil, no es necesariamente primera vez
      // Podría ser simplemente que no está autenticado
      setIsFirstTime(false);
      setHasBasicData(true);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };
  // Guardar configuración inicial
  const saveInitialSetup = async (data: InitialSetupData) => {
    try {
      setIsLoading(true);      
      debugLog.dataLoading('🎯 Usando endpoint de configuración inicial del wizard');
      debugLog.dataLoading('📝 Datos a enviar:', data);
      
      // Usar el nuevo endpoint especial del wizard
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000/api";
      
      const response = await fetch(`${API_BASE_URL}/wizard/initial-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }      
      const result = await response.json();
      debugLog.dataLoading('✅ Respuesta del wizard:', result);
      
      // Guardar el token recibido
      if (result.token) {
        localStorage.setItem('portfolio_auth_token', result.token);
        debugLog.dataLoading('🔑 Token guardado en localStorage');
      }
      
      // Actualizar estado del contexto
      setProfile(result.profile);
      setHasBasicData(true);
      setIsFirstTime(false);      debugLog.dataLoading('✅ Configuración inicial guardada exitosamente');
      
    } catch (error) {
      debugLog.error('❌ Error guardando configuración inicial:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar estado al montar el componente
  useEffect(() => {
    checkSetupStatus();
  }, []);

  const value: InitialSetupContextType = {
    isFirstTime,
    isLoading,
    hasBasicData,
    profile,
    saveInitialSetup,
    checkSetupStatus
  };

  return (
    <InitialSetupContext.Provider value={value}>
      {children}
    </InitialSetupContext.Provider>
  );
};

export const useInitialSetup = (): InitialSetupContextType => {
  const context = useContext(InitialSetupContext);
  if (context === undefined) {
    throw new Error('useInitialSetup debe ser usado dentro de un InitialSetupProvider');
  }
  return context;
};
