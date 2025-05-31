import React, { useEffect, useState } from "react";
import { getUserProfile } from "../../../services/api";
import type { UserProfile } from "../../../services/api";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { useOptimizedCallback } from "../../../hooks/useOptimizedCallback";
import "./AboutSection.css";

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
      <section className="cv-section">
        <div className="about-loading">
          <div className="loading-spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="cv-section">
        <div className="about-error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      </section>
    );

  if (!profile) return null;

  return (
    <section
      className="cv-section"
      ref={elementRef as React.RefObject<HTMLElement>}
    >
      {/* Header estandarizado */}
      <div className="section-header">
        <div className="section-title">
          <div className="title-icon">
            <i className="fas fa-user"></i>
          </div>
          <span className="title-text">Sobre Mí</span>
        </div>
        <p className="section-subtitle">
          Conoce mi historia, filosofía y lo que me motiva como desarrollador
        </p>
      </div>
      <div className="section-container">
        <div className="about-description">
          {profile.about_me ? (
            <div
              className="about-text enhanced-text"
              dangerouslySetInnerHTML={{ __html: profile.about_me }}
            />
          ) : (
            <div className="about-text enhanced-text">
              <p className="intro-paragraph">
                Soy <strong className="role-highlight">Adrián</strong>,
                Desarrollador Full Stack con una profunda pasión por crear
                <span className="highlight-text">
                  {" "}
                  soluciones digitales innovadoras
                </span>
                . Mi enfoque se centra en desarrollar aplicaciones web modernas
                que no solo cumplen con los requisitos técnicos, sino que
                también ofrecen experiencias excepcionales a los usuarios
                finales.
              </p>

              <div className="journey-section">
                <h3 className="journey-title">🚀 Mi trayectoria profesional</h3>
                <p className="journey-text">
                  Mi carrera comenzó con una curiosidad natural hacia la
                  tecnología y se ha desarrollado a través de proyectos
                  desafiantes en diversos sectores. He trabajado tanto en{" "}
                  <em>startups dinámicas</em> como en{" "}
                  <em>empresas establecidas</em>, siempre manteniendo mi
                  compromiso con <strong>la excelencia técnica</strong> y{" "}
                  <strong>la innovación constante</strong>. Cada proyecto me ha
                  permitido perfeccionar mis habilidades y adoptar nuevas
                  tecnologías.
                </p>
              </div>

              {/* Información real: Impacto y Logros */}
              <div className="impact-section">
                <h3 className="section-title">🎯 Impacto y Logros Reales</h3>
                <div className="impact-grid">
                  <div className="impact-item">
                    <div className="impact-icon">💯</div>
                    <div className="impact-content">
                      <h4>100% compromiso con cada proyecto</h4>
                      <p>
                        Buscando siempre la mejor solución técnica y funcional,
                        sin comprometer la calidad.
                      </p>
                    </div>
                  </div>
                  <div className="impact-item">
                    <div className="impact-icon">⚡</div>
                    <div className="impact-content">
                      <h4>Reducción de tiempos de carga +40%</h4>
                      <p>
                        Implementando estrategias avanzadas de optimización en
                        aplicaciones web.
                      </p>
                    </div>
                  </div>
                  <div className="impact-item">
                    <div className="impact-icon">🤝</div>
                    <div className="impact-content">
                      <h4>Colaboración multidisciplinaria</h4>
                      <p>
                        Gestionando proyectos integrales que combinan desarrollo
                        backend, frontend y UX/UI.
                      </p>
                    </div>
                  </div>
                  <div className="impact-item">
                    <div className="impact-icon">🏗️</div>
                    <div className="impact-content">
                      <h4>Buenas prácticas implementadas</h4>
                      <p>
                        CI/CD, arquitectura limpia y principios SOLID en todos
                        mis desarrollos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información real: Especialización Técnica */}
              <div className="technical-section">
                <h3 className="section-title">⚙️ Mi Especialización Técnica</h3>
                <div className="technical-grid">
                  <div className="tech-category">
                    <h4>🌐 Desarrollo Full Stack Moderno</h4>
                    <p>
                      Enfoque especializado en tecnologías modernas y
                      arquitecturas escalables para proyectos de cualquier
                      envergadura.
                    </p>
                  </div>
                  <div className="tech-category">
                    <h4>🔗 Sistemas Distribuidos</h4>
                    <p>
                      Experiencia sólida en APIs RESTful y microservicios
                      escalables con alta disponibilidad y rendimiento.
                    </p>
                  </div>
                  <div className="tech-category">
                    <h4>🗄️ Bases de Datos Avanzadas</h4>
                    <p>
                      Integración y optimización de queries especializadas en
                      SQL Server y PostgreSQL para máximo rendimiento.
                    </p>
                  </div>
                  <div className="tech-category">
                    <h4>🔐 Seguridad y Performance</h4>
                    <p>
                      Desarrollo de aplicaciones web siguiendo rigurosamente los
                      estándares OWASP y mejores prácticas de seguridad.
                    </p>
                  </div>
                </div>
              </div>

              <div className="expertise-section">
                <h3 className="expertise-title">
                  ⚡ Stack Tecnológico Principal
                </h3>
                <div className="expertise-grid">
                  <div className="expertise-item">
                    <span className="tech-badge">React & TypeScript</span>
                    <span className="tech-badge">Node.js & Express</span>
                    <span className="tech-badge">Python & Django</span>
                  </div>
                  <div className="expertise-item">
                    <span className="tech-badge">SQL Server & PostgreSQL</span>
                    <span className="tech-badge">Azure & Docker</span>
                    <span className="tech-badge">Git & DevOps</span>
                  </div>
                </div>
              </div>

              {/* Información real: Soft Skills */}
              <div className="soft-skills-section">
                <h3 className="section-title">🧠 Mis Fortalezas Personales</h3>
                <div className="skills-grid">
                  <div className="skill-item">
                    <div className="skill-icon">🔍</div>
                    <div className="skill-content">
                      <h4>Pensamiento analítico y resolución de problemas</h4>
                      <p>
                        Encuentro soluciones eficientes y elegantes para cada
                        desafío técnico que enfrento.
                      </p>
                    </div>
                  </div>
                  <div className="skill-item">
                    <div className="skill-icon">🔄</div>
                    <div className="skill-content">
                      <h4>Adaptabilidad tecnológica</h4>
                      <p>
                        Aprendo rápidamente nuevas tecnologías y metodologías,
                        manteniéndome siempre actualizado.
                      </p>
                    </div>
                  </div>
                  <div className="skill-item">
                    <div className="skill-icon">💬</div>
                    <div className="skill-content">
                      <h4>Comunicación efectiva</h4>
                      <p>
                        Colaboro estrechamente con equipos y clientes para
                        asegurar el éxito en cada entrega.
                      </p>
                    </div>
                  </div>
                  <div className="skill-item">
                    <div className="skill-icon">📚</div>
                    <div className="skill-content">
                      <h4>Pasión por el aprendizaje continuo</h4>
                      <p>
                        Estoy siempre en búsqueda de mejorar, experimentar y
                        crecer en el mundo del desarrollo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="philosophy-paragraph">
                <span className="philosophy-icon">💎</span>
                <strong>Mi filosofía de trabajo:</strong> Creo firmemente que la
                tecnología debe servir para mejorar la vida de las personas.
                Cada línea de código que escribo tiene un propósito claro: crear
                valor real, optimizar procesos, mejorar la productividad y hacer
                que las experiencias digitales sean más humanas y accesibles.
              </p>

              <div className="personal-note">
                <p>
                  Cuando no estoy desarrollando, me dedico a explorar nuevas
                  tecnologías emergentes, contribuir a proyectos de código
                  abierto, y mantenerme al día con las últimas tendencias en
                  arquitectura de software. También disfruto compartiendo
                  conocimiento con la comunidad de desarrolladores.
                  <span className="fun-fact">
                    🚀 La innovación constante es mi combustible diario.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="about-highlights">
          <div className="highlight-card">
            <div className="highlight-icon">
              <i className="fas fa-laptop-code"></i>
            </div>
            <h3>Arquitectura Escalable</h3>
            <p>
              Diseño y desarrollo sistemas robustos pensados para crecer. Desde
              APIs RESTful hasta microservicios, cada solución está
              arquitecturada para el futuro y la escalabilidad.
            </p>
            <div className="highlight-tech">
              React • Node.js • SQL Server • Azure
            </div>
            <div className="card-accent"></div>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">
              <i className="fas fa-mobile-alt"></i>
            </div>
            <h3>Experiencias de Usuario Excepcionales</h3>
            <p>
              Creo interfaces intuitivas que combinan funcionalidad y estética.
              Cada interacción está cuidadosamente diseñada para proporcionar
              experiencias memorables y eficientes.
            </p>
            <div className="highlight-tech">
              UX/UI • TypeScript • CSS3 • Responsive
            </div>
            <div className="card-accent"></div>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">
              <i className="fas fa-rocket"></i>
            </div>
            <h3>Optimización de Alto Rendimiento</h3>
            <p>
              Especialista en mejorar el rendimiento de aplicaciones. He logrado
              reducciones de más del 40% en tiempos de carga mediante técnicas
              avanzadas de optimización.
            </p>
            <div className="highlight-tech">
              Performance • SEO • DevOps • Monitoring
            </div>
            <div className="card-accent"></div>
          </div>
        </div>

        <div className="personal-touch">
          <div className="collaboration-note">
            <div className="collab-icon">🤝</div>
            <div className="collab-content">
              <h4>¿Tienes un proyecto desafiante?</h4>
              <p>
                Me especializo en transformar ideas complejas en soluciones
                digitales efectivas. Si buscas un desarrollador comprometido con
                la excelencia técnica, ¡conversemos sobre tu próximo proyecto!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
