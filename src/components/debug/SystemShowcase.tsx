import React, { useState } from 'react';
import ServiceUnavailable from '../common/ServiceUnavailable';
import ProgressBar from '../common/ProgressBar';
import SleepingServerIcon from '../common/icons/SleepingServerIcon';
import CoffeeIcon from '../common/icons/CoffeeIcon';
import styles from './SystemShowcase.module.css';

export const SystemShowcase: React.FC = () => {
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [progressValue, setProgressValue] = useState(75);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>ProfileCraft Design System</h1>
        <p className={styles.subtitle}>
          Pixel-perfect, accessible, and performant component system
        </p>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>Diseñado para Excelencia</h2>
          <p className={styles.heroDescription}>
            Sistema de diseño completamente accesible con WCAG 2.1 AA compliance,
            grid modular de 8px, y animaciones optimizadas para 60fps.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryButton}>
              Ver Documentación
            </button>
            <button className={styles.secondaryButton}>
              GitHub Repository
            </button>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.iconShowcase}>
            <SleepingServerIcon />
            <CoffeeIcon />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Características Principales</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📐</div>
            <h3 className={styles.featureTitle}>8px Modular Grid</h3>
            <p className={styles.featureDescription}>
              Sistema de espaciado matemáticamente preciso basado en múltiplos de 8px
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎨</div>
            <h3 className={styles.featureTitle}>Design Tokens</h3>
            <p className={styles.featureDescription}>
              Colores, tipografía y espaciado unificados en tokens CSS reutilizables
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>♿</div>
            <h3 className={styles.featureTitle}>WCAG AA Compliant</h3>
            <p className={styles.featureDescription}>
              Accesibilidad completa con contraste, navegación por teclado y ARIA
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3 className={styles.featureTitle}>60fps Animations</h3>
            <p className={styles.featureDescription}>
              Micro-animaciones optimizadas con aceleración GPU y motion preferences
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className={styles.demoSection}>
        <h2 className={styles.sectionTitle}>Demo Interactivo</h2>
        
        <div className={styles.demoControls}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={simulateOffline}
              onChange={(e) => setSimulateOffline(e.target.checked)}
              className={styles.toggle}
            />
            Simular Estado Offline
          </label>
          
          <div className={styles.progressControl}>
            <label htmlFor="progress-slider" className={styles.controlLabel}>
              Progress: {progressValue}%
            </label>
            <input
              id="progress-slider"
              type="range"
              min="0"
              max="100"
              value={progressValue}
              onChange={(e) => setProgressValue(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
        </div>

        <div className={styles.demoContent}>
          <ServiceUnavailable showWhenOffline={!simulateOffline} showTechnicalDetails={false}>
            <div className={styles.mockContent}>
              <h3>Portfolio Content</h3>
              <p>This is where your portfolio content would appear when the backend is online.</p>
              
              <div className={styles.progressDemo}>
                <h4>Progress Bar Demo</h4>
                <ProgressBar progress={progressValue} size="sm" variant="primary" />
                <ProgressBar progress={progressValue} size="md" variant="success" />
                <ProgressBar progress={progressValue} size="lg" variant="warning" />
              </div>
            </div>
          </ServiceUnavailable>
        </div>
      </section>

      {/* Design Principles */}
      <section className={styles.principlesSection}>
        <h2 className={styles.sectionTitle}>Principios de Diseño</h2>
        <div className={styles.principlesGrid}>
          <div className={styles.principleCard}>
            <h3>Consistencia</h3>
            <p>Patrones visuales y de interacción unificados en toda la aplicación</p>
          </div>
          <div className={styles.principleCard}>
            <h3>Accesibilidad</h3>
            <p>Diseño inclusivo que funciona para todos los usuarios</p>
          </div>
          <div className={styles.principleCard}>
            <h3>Performance</h3>
            <p>Optimización continua para experiencias fluidas</p>
          </div>
          <div className={styles.principleCard}>
            <h3>Escalabilidad</h3>
            <p>Sistema modular que crece con las necesidades del producto</p>
          </div>
        </div>
      </section>      <footer className={styles.footer}>
        <p>ProfileCraft Design System - Creado con ❤️ para desarrolladores</p>
      </footer>
    </div>
  );
};

export default SystemShowcase;
