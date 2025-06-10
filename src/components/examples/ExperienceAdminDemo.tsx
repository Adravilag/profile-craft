// src/components/examples/ExperienceAdminDemo.tsx
import React, { useState } from 'react';
import ExperienceAdmin from '../sections/experience/ExperienceAdmin';
import './ExperienceAdminDemo.css';

const ExperienceAdminDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="experience-admin-demo">
      <div className="demo-container">
        <header className="demo-header">
          <h1>
            <i className="fas fa-rocket"></i>
            ExperienceAdmin - Diseño Mejorado
          </h1>
          <p className="demo-subtitle">
            Formulario moderno para gestión de experiencia laboral y educación
          </p>
        </header>

        <div className="demo-content">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-tags"></i>
              </div>
              <h3>Etiquetas Fijas</h3>
              <p>Las etiquetas permanecen siempre visibles con indicadores de campos obligatorios</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-th"></i>
              </div>
              <h3>Diseño en Rejilla</h3>
              <p>Grid responsivo que se adapta automáticamente a cualquier tamaño de pantalla</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3>Date-Range Picker</h3>
              <p>Selector de fechas unificado con toggle para trabajo/estudios actuales</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-code"></i>
              </div>
              <h3>Chips Inteligentes</h3>
              <p>Input de tecnologías con autocompletado y 40+ sugerencias predefinidas</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-anchor"></i>
              </div>
              <h3>Footer Sticky</h3>
              <p>Acciones siempre visibles sin conflictos con el scroll del contenido</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3>Responsive</h3>
              <p>Totalmente adaptado para dispositivos móviles y navegación por teclado</p>
            </div>
          </div>

          <div className="demo-actions">
            <button 
              className="demo-btn primary"
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-play"></i>
              Probar Formulario Mejorado
            </button>
            
            <div className="demo-info">
              <div className="info-item">
                <i className="fas fa-palette"></i>
                <span>Material Design 3</span>
              </div>
              <div className="info-item">
                <i className="fas fa-moon"></i>
                <span>Modo Día/Noche</span>
              </div>
              <div className="info-item">
                <i className="fas fa-universal-access"></i>
                <span>Accesible</span>
              </div>
            </div>
          </div>
        </div>

        <div className="improvements-summary">
          <h2>
            <i className="fas fa-chart-line"></i>
            Mejoras Implementadas
          </h2>
          <div className="improvements-list">
            <div className="improvement-item completed">
              <i className="fas fa-check-circle"></i>
              <span>Etiquetas fijas y campos obligatorios</span>
            </div>
            <div className="improvement-item completed">
              <i className="fas fa-check-circle"></i>
              <span>Diseño en rejilla responsivo</span>
            </div>
            <div className="improvement-item completed">
              <i className="fas fa-check-circle"></i>
              <span>Inputs mejorados con Material Design 3</span>
            </div>
            <div className="improvement-item completed">
              <i className="fas fa-check-circle"></i>
              <span>Date-range picker unificado</span>
            </div>
            <div className="improvement-item completed">
              <i className="fas fa-check-circle"></i>
              <span>Input de chips con autocompletado</span>
            </div>
            <div className="improvement-item completed">
              <i className="fas fa-check-circle"></i>
              <span>Footer sticky para acciones</span>
            </div>
            <div className="improvement-item completed">
              <i className="fas fa-check-circle"></i>
              <span>Consistencia de estilos</span>
            </div>
            <div className="improvement-item completed">
              <i className="fas fa-check-circle"></i>
              <span>Agrupación visual con tarjetas</span>
            </div>
            <div className="improvement-item completed">
              <i className="fas fa-check-circle"></i>
              <span>Microinteracciones y animaciones</span>
            </div>
            <div className="improvement-item completed">
              <i className="fas fa-check-circle"></i>
              <span>Responsive design completo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal mejorado */}
      {showModal && (
        <ExperienceAdmin onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default ExperienceAdminDemo;
