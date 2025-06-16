// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

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

  // console.log('🔄 AuthProvider: Render - isAuthenticated:', isAuthenticated, ', loading:', loading, ', initialCheckDone:', initialCheckDone, ', authCheckInProgress:', authCheckInProgress);  // Verificar si hay una sesión guardada al cargar la aplicación
  useEffect(() => {
    const checkStoredAuth = async () => {
      if (authCheckInProgress) {
        console.log('🔄 AuthContext: Verificación ya en progreso, omitiendo...');
        return;
      }

      setAuthCheckInProgress(true);
      console.log('🔍 AuthContext: Verificando autenticación almacenada...');
      
      try {
        const storedToken = localStorage.getItem('portfolio_auth_token');
        console.log('🔑 AuthContext: Token encontrado en localStorage:', storedToken ? 'Sí' : 'No');
        
        if (storedToken) {
          console.log('📡 AuthContext: Verificando token con backend...');
          
          // Añadir timeout para evitar cuelgues
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
          
          try {
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal
            });

            clearTimeout(timeoutId);
            console.log('📡 AuthContext: Respuesta del backend:', response.status, response.statusText);

            if (response.ok) {
              const data = await response.json();
              console.log('✅ AuthContext: Token válido, usuario autenticado:', data.user);
              setIsAuthenticated(true);
              setUser(data.user);
            } else {
              console.log('❌ AuthContext: Token inválido o expirado');
              localStorage.removeItem('portfolio_auth_token');
              setIsAuthenticated(false);
              setUser(null);
            }
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
              console.log('⏰ AuthContext: Timeout en verificación de token');
            } else {
              console.error('❌ AuthContext: Error en fetch:', fetchError);
            }
            // En caso de error de red, no eliminar el token inmediatamente
            // El usuario puede estar offline temporalmente
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          console.log('🚫 AuthContext: No hay token almacenado');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('❌ AuthContext: Error general checking stored authentication:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        console.log('🏁 AuthContext: Verificación completada, loading = false');
        setLoading(false);
        setInitialCheckDone(true);
        setAuthCheckInProgress(false);
      }
    };

    // Solo ejecutar si no se ha hecho la verificación inicial
    if (!initialCheckDone && !authCheckInProgress) {
      checkStoredAuth();
    }
  }, [initialCheckDone, authCheckInProgress]);

  // Efecto para monitorear cambios en el estado de autenticación
  useEffect(() => {
    console.log('🔄 AuthContext: Estado de autenticación cambió:', {
      isAuthenticated,
      user: user?.name,
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
        body: JSON.stringify({
          email: username, // El backend espera email, pero permitimos usar "admin"
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setIsAuthenticated(true);
        setUser(data.user);

        // Guardar token en localStorage
        localStorage.setItem('portfolio_auth_token', data.token);

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
      console.log('🚪 Iniciando logout...');
      
      // Deshabilitar auto-autenticación durante el logout
      // Importamos dinámicamente la función para evitar dependencias circulares
      try {
        const { disableAutoAuth } = await import('../hooks/useAutoAuthInDev');
        disableAutoAuth();
      } catch (importError) {
        console.warn('⚠️ No se pudo deshabilitar auto-auth:', importError);
      }
      
      // Obtener el token antes de eliminarlo para notificar al backend
      const token = localStorage.getItem('portfolio_auth_token');
      
      // Primero actualizamos el estado local inmediatamente
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('portfolio_auth_token');
      
      console.log('✅ Estado local limpiado');
      
      // Luego notificamos al backend (opcional)
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          console.log('✅ Backend notificado del logout');
        } catch (backendError) {
          console.warn('⚠️ Error notificando logout al backend:', backendError);
          // No relanzamos el error porque el logout local ya funcionó
        }
      }
      
      console.log('✅ Logout completado exitosamente');
    } catch (error) {
      console.error('❌ Error durante logout:', error);
      // Asegurar que el estado local siempre se limpie, incluso si hay errores
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('portfolio_auth_token');
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
