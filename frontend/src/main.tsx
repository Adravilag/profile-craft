import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { NavigationProvider } from './contexts/NavigationContext'
import { AuthProvider } from './contexts/AuthContext'

// Marcar el entorno como desarrollo para debugging visual
if (import.meta.env.DEV) {
  document.documentElement.setAttribute('data-development', 'true');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </AuthProvider>
  </StrictMode>,
)
