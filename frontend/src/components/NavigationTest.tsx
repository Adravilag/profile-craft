// Test component para verificar la navegación
import React from 'react';
import SmartNavigation from './navigation/SmartNavigation';
import { NavigationProvider } from '../contexts/NavigationContext';
import './navigation/SmartNavigation.module.css';

const NavigationTest: React.FC = () => {
  const testNavItems = [
    { id: "about", label: "Acerca de", icon: "fas fa-user" },
    { id: "experience", label: "Experiencia", icon: "fas fa-briefcase" },
    { id: "articles", label: "Proyectos", icon: "fas fa-project-diagram" },
    { id: "skills", label: "Habilidades", icon: "fas fa-tools" },
    { id: "certifications", label: "Certificaciones", icon: "fas fa-certificate" },
    { id: "testimonials", label: "Testimonios", icon: "fas fa-comments" },
    { id: "contact", label: "Contacto", icon: "fas fa-envelope" },
  ];

  return (
    <NavigationProvider>
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ height: '500px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <h1>Header de Prueba - Scroll para ver sticky nav</h1>
        </div>
        
        <SmartNavigation navItems={testNavItems} />
        
        <div style={{ height: '2000px', padding: '2rem', background: 'white' }}>
          <h2>Contenido de prueba</h2>
          <p>Haz scroll hacia arriba para ver si la navegación se vuelve sticky.</p>
          <div style={{ height: '1500px', background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)' }}>
            <p>Contenido largo para probar el scroll...</p>
          </div>
        </div>
      </div>
    </NavigationProvider>
  );
};

export default NavigationTest;
