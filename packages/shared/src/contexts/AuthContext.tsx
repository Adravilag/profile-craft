// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { debugLog } from '../utils/debugConfig';
import type { User } from '../types/user.types';
import { silentAuthFetch } from '../utils/authFetch';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000/api";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [authCheckInProgress, setAuthCheckInProgress] = useState(false);

  // debugLog.auth('🔄 AuthProvider: Render - isAuthenticated:', isAuthenticated, ', loading:', loading, ', initialCheckDone:', initialCheckDone, ', authCheckInProgress:', authCheckInProgress);  // Verificar si hay una sesión guardada al cargar la aplicación
  useEffect(() => {
    const checkStoredAuth = async () => {
      if (authCheckInProgress) {
        debugLog.auth('🔄 AuthContext: Verificación ya en progreso, omitiendo...');
        return;
      }

      setAuthCheckInProgress(true);
      debugLog.auth('🔍 AuthContext: Verificando autenticación almacenada...');
      
      // Usar fetch silencioso para evitar ruido en consola con errores 401 esperados
      const result = await silentAuthFetch(`${API_BASE_URL}/auth/verify`);
      
      debugLog.auth('🔑 AuthContext: Respuesta de verificación:', result.status);
      
      if (result.ok && result.data) {
        debugLog.auth('✅ AuthContext: Usuario autenticado:', result.data.user);
        setIsAuthenticated(true);
        setUser(result.data.user);
      } else if (result.status === 401) {
        // 401 es esperado cuando no hay sesión - no es un error real
        debugLog.auth('ℹ️ AuthContext: Sin sesión activa (esperado)');
        setIsAuthenticated(false);
        setUser(null);
      } else if (result.status === 0) {
        // Error de conexión
        debugLog.auth('❌ AuthContext: Error de conexión:', result.error);
        setIsAuthenticated(false);
        setUser(null);
      } else {
        // Otros códigos de error
        debugLog.auth(`❌ AuthContext: Error de verificación: ${result.status} - ${result.error}`);
        setIsAuthenticated(false);
        setUser(null);
      }
      
      // Finally - siempre ejecutar cleanup
      debugLog.auth('🏁 AuthContext: Verificación completada, loading = false');
      setLoading(false);
      setInitialCheckDone(true);
      setAuthCheckInProgress(false);
    };
    if (!initialCheckDone && !authCheckInProgress) {
      checkStoredAuth();
    }
  }, [initialCheckDone, authCheckInProgress]);

  // Efecto para monitorear cambios en el estado de autenticación
  useEffect(() => {
    debugLog.auth('🔄 AuthContext: Estado de autenticación cambió:', {
      isAuthenticated,
      user: user ? user.name : null,
      loading,
      initialCheckDone
    });
  }, [isAuthenticated, user, loading, initialCheckDone]);
  const login = async (username: string, password: string): Promise<boolean> => {
    const result = await silentAuthFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: username,
        password: password,
      }),
    });

    if (result.ok && result.data) {
      setIsAuthenticated(true);
      setUser(result.data.user);
      debugLog.auth('✅ Login exitoso:', result.data.user);
      return true;
    } else {
      debugLog.auth('❌ Login fallido:', result.error || `Error ${result.status}`);
      return false;
    }
  };
  const logout = async () => {
    debugLog.auth('🚪 Iniciando logout...');
    setIsAuthenticated(false);
    setUser(null);
    
    // Llamar al backend para limpiar la cookie
    const result = await silentAuthFetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
    
    if (result.ok) {
      debugLog.auth('✅ Logout completado exitosamente');
    } else {
      debugLog.auth('ℹ️ Logout procesado (el estado local ya fue limpiado)');
    }
  };  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    loading: loading || !initialCheckDone || authCheckInProgress
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
