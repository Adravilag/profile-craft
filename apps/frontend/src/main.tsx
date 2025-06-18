import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Marcar el entorno como desarrollo para debugging visual
if (import.meta.env.DEV) {
  document.documentElement.setAttribute('data-development', 'true');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)




