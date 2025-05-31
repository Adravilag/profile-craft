// Hook personalizado para manejo del modo oscuro/claro
import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useTheme = (): UseThemeReturn => {
  // Leer tema guardado o usar 'auto' por defecto
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('cv-theme');
    return (saved as Theme) || 'auto';
  });

  // Detectar preferencia del sistema
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Determinar si debe aplicarse modo oscuro
  const isDark = theme === 'dark' || (theme === 'auto' && systemPrefersDark);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Aplicar tema al DOM
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Aplicar atributo data-theme
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Aplicar clase para compatibilidad
    if (isDark) {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }

    // Actualizar meta theme-color para navegadores móviles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        isDark ? '#101418' : '#fdfcff'
      );
    }
  }, [isDark]);

  // Función para cambiar tema
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('cv-theme', newTheme);
  };

  // Función para alternar entre claro/oscuro
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme
  };
};
