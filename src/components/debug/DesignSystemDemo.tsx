import React from 'react';
import ServiceUnavailable from '../common/ServiceUnavailable';
import ProgressBar from '../common/ProgressBar';
import SleepingServerIcon from '../common/icons/SleepingServerIcon';
import CoffeeIcon from '../common/icons/CoffeeIcon';
import styles from './DesignSystemDemo.module.css';

export const DesignSystemDemo: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ProfileCraft Design System Demo</h1>
      
      {/* Spacing Grid Validation */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>8px Modular Grid System</h2>
        <div className={styles.spacingGrid}>
          {[1, 2, 3, 4, 6, 8, 10, 12].map(size => (
            <div key={size} className={styles.spacingBox} style={{ width: `var(--space-${size})`, height: `var(--space-${size})` }}>
              <span className={styles.spacingLabel}>{size}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Typography Scale */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Typography Scale</h2>
        <div className={styles.typographyScale}>
          <h1 className={styles.h1}>H1 - 32px/40px</h1>
          <h2 className={styles.h2}>H2 - 24px/32px</h2>
          <h3 className={styles.h3}>H3 - 20px/28px</h3>
          <p className={styles.body}>Body - 16px/24px</p>
          <p className={styles.small}>Small - 14px/20px</p>
          <p className={styles.caption}>Caption - 12px/16px</p>
        </div>
      </section>

      {/* Color Tokens */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Color System</h2>
        <div className={styles.colorGrid}>
          <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--brand-primary)' }}>
            <span>Primary</span>
          </div>
          <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--gray-900)' }}>
            <span style={{ color: 'white' }}>Gray 900</span>
          </div>
          <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--gray-700)' }}>
            <span style={{ color: 'white' }}>Gray 700</span>
          </div>
          <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--gray-500)' }}>
            <span style={{ color: 'white' }}>Gray 500</span>
          </div>
          <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--gray-300)' }}>
            <span>Gray 300</span>
          </div>
          <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--gray-100)' }}>
            <span>Gray 100</span>
          </div>
        </div>
      </section>

      {/* Icon Showcase */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>24x24 Icon Grid</h2>
        <div className={styles.iconGrid}>
          <div className={styles.iconContainer}>
            <SleepingServerIcon />
            <span>Sleeping Server</span>
          </div>
          <div className={styles.iconContainer}>
            <CoffeeIcon />
            <span>Coffee Break</span>
          </div>
        </div>
      </section>

      {/* Progress Bar Variants */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Progress Bar Components</h2>
        <div className={styles.progressGrid}>
          <div className={styles.progressItem}>
            <label>Small (24px height)</label>
            <ProgressBar progress={75} size="sm" />
          </div>
          <div className={styles.progressItem}>
            <label>Medium (32px height)</label>
            <ProgressBar progress={50} size="md" />
          </div>
          <div className={styles.progressItem}>
            <label>Large (40px height)</label>
            <ProgressBar progress={25} size="lg" />
          </div>
        </div>
      </section>

      {/* Touch Target Validation */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>44px Touch Targets</h2>
        <div className={styles.touchTargetGrid}>
          <button className={styles.touchButton}>Button 1</button>
          <button className={styles.touchButton}>Button 2</button>
          <button className={styles.touchButton}>Button 3</button>
        </div>
      </section>      {/* ServiceUnavailable Component */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Service Unavailable Component</h2>
        <div className={styles.componentDemo}>
          <ServiceUnavailable showTechnicalDetails={false}>
            <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--gray-600)' }}>
              Demo content (shown when backend is online)
            </div>
          </ServiceUnavailable>
        </div>
      </section>
    </div>
  );
};
