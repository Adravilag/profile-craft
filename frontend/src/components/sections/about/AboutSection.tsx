import React, { useEffect, useState } from "react";
import { getUserProfile } from "../../../services/api";
import type { UserProfile } from "../../../services/api";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { useOptimizedCallback } from "../../../hooks/useOptimizedCallback";
import HeaderSection from "../header/HeaderSection";
import styles from "./AboutSection.module.css";

const AboutSection: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  // Hook de Intersection Observer para animaciones
  const { isIntersecting, elementRef } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px 0px",
  });

  // Hook de callback optimizado para animaciones
  const triggerAnimation = useOptimizedCallback(
    () => {
      if (isIntersecting && !isAnimated) {
        setIsAnimated(true);
      }
    },
    [isIntersecting, isAnimated],
    { type: "raf" }
  );

  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar el perfil.");
        setLoading(false);
      });
  }, []);

  // Activar animación cuando la sección es visible
  useEffect(() => {
    triggerAnimation();
  }, [triggerAnimation]);

  if (loading)
    return (
      <section className="section-cv">
        <div className={styles.aboutLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando perfil...</p>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="section-cv">
        <div className={styles.aboutError}>
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      </section>
    );

  if (!profile) return null;

  return (
    <section
      className="section-cv"
      ref={elementRef as React.RefObject<HTMLElement>}
    >
      <HeaderSection
        icon="fas fa-user"
        title="Sobre Mí"
        subtitle="Conoce mi historia, filosofía y lo que me motiva como desarrollador"
        className="about"
      />
      <div className="section-container">
        <div className={styles.aboutDescription}>
          <div
            className="about-text"
            dangerouslySetInnerHTML={{ __html: profile.about_me ?? "" }}
          />
        </div>

        <div className={styles.aboutHighlights}>
          <div className={styles.highlightCard}>
            <div className={styles.highlightIcon}>
              <i className="fas fa-laptop-code"></i>
            </div>
            <h3>Arquitectura Escalable</h3>
            <p>
              Diseño y desarrollo sistemas robustos pensados para crecer. Desde
              APIs RESTful hasta microservicios, cada solución está
              arquitecturada para el futuro y la escalabilidad.
            </p>
            <div className={styles.highlightTech}>
              React • Node.js • SQL Server • Azure
            </div>
            <div className={styles.cardAccent}></div>
          </div>

          <div className={styles.highlightCard}>
            <div className={styles.highlightIcon}>
              <i className="fas fa-mobile-alt"></i>
            </div>
            <h3>Experiencias de Usuario Excepcionales</h3>
            <p>
              Creo interfaces intuitivas que combinan funcionalidad y estética.
              Cada interacción está cuidadosamente diseñada para proporcionar
              experiencias memorables y eficientes.
            </p>
            <div className={styles.highlightTech}>
              UX/UI • TypeScript • CSS3 • Responsive
            </div>
          </div>

          <div className={styles.highlightCard}>
            <div className={styles.highlightIcon}>
              <i className="fas fa-rocket"></i>
            </div>
            <h3>Optimización de Alto Rendimiento</h3>
            <p>
              Especialista en mejorar el rendimiento de aplicaciones. He logrado
              reducciones de más del 40% en tiempos de carga mediante técnicas
              avanzadas de optimización.
            </p>
            <div className={styles.highlightTech}>
              Performance • SEO • DevOps • Monitoring
            </div>
            <div className={styles.cardAccent}></div>
          </div>
        </div>

        <div className={styles.aboutCollaborationNote}>
          <div className={styles.aboutCollabIcon}>🤝</div>
          <div className={styles.aboutCollabContent}>
            <h4>¿Tienes un proyecto desafiante?</h4>
            <p>
              Me especializo en transformar ideas complejas en soluciones
              digitales efectivas. Si buscas un desarrollador comprometido con
              la excelencia técnica, ¡conversemos sobre tu próximo proyecto!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
