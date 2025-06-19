// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { debugLog } from '../utils/debugConfig';
import type { User } from '../types/user.types';

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
      try {
        // Petición al backend para verificar sesión usando cookie httpOnly
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: 'GET',
          credentials: 'include', // Importante para enviar cookies
        });
        debugLog.auth('🔑 AuthContext: Respuesta de verificación:', response.status);
        if (response.ok) {
          const data = await response.json();
          debugLog.auth('✅ AuthContext: Usuario autenticado:', data.user);
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          debugLog.auth('❌ AuthContext: Sesión inválida o expirada');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('❌ AuthContext: Error general checking stored authentication:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        debugLog.auth('🏁 AuthContext: Verificación completada, loading = false');
        setLoading(false);
        setInitialCheckDone(true);
        setAuthCheckInProgress(false);
      }
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
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para recibir la cookie
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
        // Ya no se guarda el token en localStorage
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData.error);
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };
  const logout = async () => {
    try {
      debugLog.auth('🚪 Iniciando logout...');
      setIsAuthenticated(false);
      setUser(null);
      // Llamar al backend para limpiar la cookie
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      debugLog.auth('✅ Logout completado exitosamente');
    } catch (error) {
      console.error('❌ Error durante logout:', error);
      setIsAuthenticated(false);
      setUser(null);
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
