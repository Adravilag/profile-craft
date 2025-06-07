// src/components/CurriculumMD3.tsx

import { useState, useEffect, lazy, type FC, type FormEvent } from "react";
import "./Curriculum.css";
import Header from "./header/Header";
import SmartNavigation from "./navigation/SmartNavigation";
import AdminProtection from "./common/AdminProtection";
import DiscreteAdminAccess from "./common/DiscreteAdminAccess";
import contactService from "../services/contactService";
import {
  getTestimonials,
  createTestimonial,
  updateAdminTestimonial,
  deleteTestimonial,
} from "../services/api";
import { useNotificationContext } from "../contexts/NotificationContext";
import { useNavigation } from "../contexts/NavigationContext";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import ScrollToTopButton from "./common/ScrollToTopButton";
import type { Testimonial } from "../services/api";
import md5 from "blueimp-md5";

// Lazy loading de componentes
const AboutSection = lazy(() => import("./sections/about/AboutSection"));
const ExperienceSection = lazy(
  () => import("./sections/experience/ExperienceSection")
);
const ArticlesSection = lazy(
  () => import("./sections/articles/ArticlesSection")
);
const SkillsSection = lazy(() => import("./sections/skills/SkillsSection"));
const CertificationsSection = lazy(
  () => import("./sections/certifications/CertificationsSection")
);
const TestimonialsSection = lazy(
  () => import("./sections/testimonials/TestimonialsSection")
);
const ContactSection = lazy(() => import("./sections/contact/ContactSection"));

// Componentes de vistas especiales (no lazy porque se cargan bajo demanda)
import ArticleView from "./sections/articles/ArticleView";
import CreateArticle from "./sections/articles/CreateArticle";
import TestimonialsAdmin from "./sections/testimonials/TestimonialsAdmin";

const CurriculumMD3: FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { currentSection, currentSubPath, navigateToSection } = useNavigation();
  const { isAuthenticated } = useAuth();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null
  );

  const { showSuccess: notifySuccess, showError: notifyError } =
    useNotificationContext();
  useEffect(() => {
    getTestimonials()
      .then((testimonials) => {
        // Verificar que testimonials sea un array antes de usar map
        if (Array.isArray(testimonials)) {
          const testimonialsWithAvatars = testimonials.map((testimonial) => ({
            ...testimonial,
            avatar: getAvatarForTestimonial(testimonial),
          }));
          setTestimonials(testimonialsWithAvatars);
        } else {
          console.warn("getTestimonials() no retornó un array:", testimonials);
          setTestimonials([]);
        }
      })
      .catch((error) => {
        console.error("Error al cargar testimonios:", error);
        setTestimonials([]);
      });
  }, []);

  const getAvatarForTestimonial = (testimonial: Testimonial) => {
    if (testimonial.email && testimonial.email.includes("@")) {
      const hash = md5(testimonial.email.toLowerCase().trim());
      return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=150`;
    }
    return "/assets/images/foto-perfil.jpg";
  };

  // Handlers y utilidades
  const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const response = await contactService.sendMessage(data);
      if (response.success) {
        notifySuccess(
          "Mensaje enviado",
          response.message || "¡Gracias por contactarme! Te responderé pronto."
        );
      } else {
        throw new Error(response.message || "Error al enviar el mensaje");
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      notifyError(
        "Error",
        error instanceof Error
          ? error.message
          : "Hubo un problema al enviar tu mensaje."
      );
      throw error;
    }
  };

  const handleBackToArticles = () => {
    setSelectedArticleId(null);
    navigateToSection("articles");
  };



  // CRUD handlers para testimonios
  const handleAddTestimonial = async (t: {
    name: string;
    position: string;
    text: string;
    email?: string;
    company?: string;
    website?: string;
    user_id: number;
    order_index: number;
  }) => {
    try {
      const nuevo = await createTestimonial(t);
      notifySuccess(
        "Testimonio enviado",
        `Gracias ${nuevo.name}! Tu testimonio está pendiente de aprobación.`
      );
    } catch (e) {
      notifyError("Error al enviar", "No se pudo enviar el testimonio");
    }
  };

  const handleEditTestimonial = async (id: number, t: Partial<Testimonial>) => {
    try {
      const actualizado = await updateAdminTestimonial(id, t);
      setTestimonials((prev) =>
        prev.map((item) => (item.id === id ? actualizado : item))
      );
      notifySuccess(
        "Testimonio actualizado",
        `Se actualizó el testimonio de ${actualizado.name}`
      );
    } catch (e) {
      notifyError("Error al actualizar", "No se pudo actualizar el testimonio");
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    try {
      await deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((item) => item.id !== id));
      notifySuccess(
        "Testimonio eliminado",
        "El testimonio fue eliminado correctamente"
      );
    } catch (e) {
      notifyError("Error al eliminar", "No se pudo eliminar el testimonio");
    }
  };

  const navItems = [
    { id: "about", label: "Sobre mí", icon: "fas fa-user" },
    { id: "experience", label: "Experiencia", icon: "fas fa-briefcase" },
    { id: "articles", label: "Proyectos", icon: "fas fa-project-diagram" },
    { id: "skills", label: "Habilidades", icon: "fas fa-tools" },
    {
      id: "certifications",
      label: "Certificaciones",
      icon: "fas fa-certificate",
    },
    { id: "testimonials", label: "Testimonios", icon: "fas fa-comments" },
    { id: "contact", label: "Contacto", icon: "fas fa-envelope" },
  ];
  return (
    <div className="curriculum-wrapper" data-theme={isDark ? "dark" : "light"}>
      {" "}
      {/* Panel de debug temporal para testing de navegación */}
      <div id="curriculum-container" className="curriculum-container">
        {/* Indicador de scroll inteligente */}
        {/* <SmartScrollIndicator /> */}
        {/* Header mejorado */}
        <Header darkMode={isDark} onToggleDarkMode={toggleTheme} />
        {/* Navegación inteligente con scroll */}
        <SmartNavigation navItems={navItems} />
        {/* Contenedor de secciones */}
        <main className="sections-container">
          {" "}
          <section id="about" className="seccion-a">
            <AboutSection />
          </section>
          <div className="section-intersection"></div>
          {/* Secciones del currículum */}
          <section id="experience"  className="seccion-b">
            <ExperienceSection
              showAdminFAB={isAuthenticated && currentSection === "experience"}
              onAdminClick={() => {}}
            />
          </section>
          <div className="section-intersection"></div>
          <section id="articles" className="seccion-a">
            <ArticlesSection
              showAdminButton={isAuthenticated && currentSection === "articles"}
              onAdminClick={() => {}}
            />
          </section>
          <div className="section-intersection"></div>
          <section id="skills" className="seccion-b">
            <SkillsSection
              showAdminFAB={isAuthenticated && currentSection === "skills"}
            />
          </section>
          <div className="section-intersection"></div>
          <section id="certifications" className="seccion-a">
            <CertificationsSection
              isAdminMode={false}
              showAdminFAB={
                isAuthenticated && currentSection === "certifications"
              }
            />
          </section>
          <div className="section-intersection"></div>
          <section id="testimonials"  className="seccion-b">
            <TestimonialsSection
              testimonials={testimonials.map((t) => ({
                id: t.id,
                name: t.name,
                position: t.position,
                avatar: getAvatarForTestimonial(t),
                text: t.text,
                company: t.company,
                website: t.website,
              }))}
              onAdd={handleAddTestimonial}
              onEdit={handleEditTestimonial}
              onDelete={handleDeleteTestimonial}
              isAdminMode={false}
              showAdminFAB={
                isAuthenticated && currentSection === "testimonials"
              }
              onAdminClick={() => {
                if (isAuthenticated) {
                  setShowAdminPanel(true);
                }
              }}
            />
          </section>
          <div className="section-intersection"></div>
          <section id="contact" className="seccion-a">
            <ContactSection onSubmit={handleContactSubmit} />
          </section>
        </main>
        {/* Vistas especiales que se superponen */}
        {currentSection === "articles" && currentSubPath === "new" && (
          <div className="overlay-section active">
            <div id="articles-new" data-section="articles-new">
              <AdminProtection>
                <CreateArticle />
              </AdminProtection>
            </div>
          </div>
        )}
        {currentSection === "article-view" && selectedArticleId && (
          <div className="overlay-section active">
            <div id="article-view" data-section="article-view">
              <ArticleView
                articleId={selectedArticleId}
                onBack={handleBackToArticles}
              />
            </div>
          </div>
        )}
        {showAdminPanel && isAuthenticated && (
          <div className="overlay-section active">
            <AdminProtection>
              <TestimonialsAdmin
                onClose={() => {
                  setShowAdminPanel(false);
                  getTestimonials().then((testimonials) => {
                    const testimonialsWithAvatars = testimonials.map(
                      (testimonial) => ({
                        ...testimonial,
                        avatar: getAvatarForTestimonial(testimonial),
                      })
                    );
                    setTestimonials(testimonialsWithAvatars);
                  });
                }}
              />
            </AdminProtection>
          </div>
        )}
        <DiscreteAdminAccess />
        <ScrollToTopButton />
      </div>
    </div>
  );
};

export default CurriculumMD3;
