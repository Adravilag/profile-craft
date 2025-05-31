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

const API_BASE_URL = 'http://localhost:3000/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);  // Verificar si hay una sesión guardada al cargar la aplicación
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem('portfolio_auth_token');
        console.log('AuthContext: Checking stored token:', storedToken ? 'Found' : 'Not found');
        
        if (storedToken) {
          // Verificar token con el backend
          console.log('AuthContext: Verifying token with backend...');
          const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('AuthContext: Backend response status:', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('AuthContext: Token verified, user:', data.user);
            setIsAuthenticated(true);
            setUser(data.user);
            console.log('AuthContext: Setting isAuthenticated to true');
          } else {
            // Token inválido o expirado
            console.log('AuthContext: Token invalid, removing from storage');
            localStorage.removeItem('portfolio_auth_token');
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          console.log('AuthContext: No token found');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Error checking stored authentication:', error);
        localStorage.removeItem('portfolio_auth_token');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };    checkStoredAuth();
  }, []);

  // Efecto para monitorear cambios en el estado de autenticación
  useEffect(() => {
    console.log('AuthContext: Authentication state changed - isAuthenticated:', isAuthenticated, 'user:', user);
  }, [isAuthenticated, user]);
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
      const token = localStorage.getItem('portfolio_auth_token');
      if (token) {
        // Opcional: notificar al backend del logout
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('portfolio_auth_token');
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
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
