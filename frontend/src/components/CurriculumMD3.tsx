// src/components/CurriculumMD3.tsx

import React, { useState } from "react";
import "./Curriculum.css"
import AboutSection from "./sections/about/AboutSection";
import ExperienceSection from "./sections/experience/ExperienceSection";
import ArticlesSection from "./sections/articles/ArticlesSection";
import ArticleView from "./sections/articles/ArticleView";
import ArticlesAdmin from "./sections/articles/ArticlesAdmin";
import CreateArticle from "./sections/articles/CreateArticle";
import SkillsSection from "./sections/skills/SkillsSection";
import CertificationsSection from "./sections/certifications/CertificationsSection";
import TestimonialsSection from "./sections/testimonials/TestimonialsSection";
import TestimonialsAdmin from "./sections/testimonials/TestimonialsAdmin";
import ContactSection from "./sections/contact/ContactSection";
import Header from "./header/Header";
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
import type { Testimonial } from "../services/api";
import md5 from "blueimp-md5";

const CurriculumMD3: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { currentSection, currentSubPath, navigateToSection } = useNavigation();
  const { isAuthenticated } = useAuth();
  
  // Debug logging
  console.log('CurriculumMD3: isAuthenticated =', isAuthenticated);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null
  );
  
  const { showSuccess: notifySuccess, showError: notifyError } =
    useNotificationContext();

  React.useEffect(() => {
    getTestimonials().then((testimonials) => {
      // Mapear testimonials para incluir avatares de Gravatar
      const testimonialsWithAvatars = testimonials.map((testimonial) => ({
        ...testimonial,
        avatar: getAvatarForTestimonial(testimonial),
      }));
      setTestimonials(testimonialsWithAvatars);
    });
  }, []);

  // Función para obtener avatar de Gravatar o por defecto
  const getAvatarForTestimonial = (testimonial: Testimonial) => {
    if (testimonial.email && testimonial.email.includes("@")) {
      const hash = md5(testimonial.email.toLowerCase().trim());
      return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=150`;
    }
    return "/assets/images/foto-perfil.jpg";  };

  // —————————————————————————————————————————
  // Handlers y utilidades
  // —————————————————————————————————————————

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      // Usar nuestro servicio de backend en lugar de EmailJS
      const response = await contactService.sendMessage(data);
      
      if (response.success) {
        notifySuccess(
          "Mensaje enviado",
          response.message || "¡Gracias por contactarme! Te responderé pronto."
        );
        
        // No es necesario resetear aquí, ContactSection maneja su propio estado
      } else {
        throw new Error(response.message || "Error al enviar el mensaje");
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      notifyError(
        "Error",
        error instanceof Error 
          ? error.message 
          : "Hubo un problema al enviar tu mensaje. Por favor, inténtalo más tarde."
      );
      throw error; // Re-throw para que ContactSection maneje el loading state
    }
  };

  // Handlers para artículos
  const handleViewArticle = (articleId: number) => {
    setSelectedArticleId(articleId);
    navigateToSection("article-view");
  };

  const handleBackToArticles = () => {
    setSelectedArticleId(null);
    navigateToSection("articles");
  };

  const handleShowArticlesAdmin = () => {
    navigateToSection("articles-admin");
  };
  const handleBackFromArticlesAdmin = () => {
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
      // No agregamos al estado local ya que va a pending y se necesita aprobación
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
      <div id="curriculum-container" className="curriculum-container">
        {/* Header mejorado */}
        <Header darkMode={isDark} onToggleDarkMode={toggleTheme} />
        {/* Navegación por pestañas */}
        <nav className="header-portfolio-nav">
          <div className="header-nav-container">
            {" "}
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`header-nav-item ${
                  currentSection === item.id ? "active" : ""
                }`}
                onClick={() => navigateToSection(item.id)}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
        {/* Contenido dinámico por secciones */}
        <main>
          {currentSection === "about" && <AboutSection />}
          {currentSection === "experience" && <ExperienceSection />}          {currentSection === "articles" && currentSubPath !== "new" && (
            <ArticlesSection
              onArticleClick={handleViewArticle}
              showAdminButton={isAuthenticated}
              onAdminClick={handleShowArticlesAdmin}
            />
          )}
          {currentSection === "articles" && currentSubPath === "new" && (
            <AdminProtection>
              <CreateArticle />
            </AdminProtection>
          )}
          {currentSection === "article-view" && selectedArticleId && (
            <ArticleView
              articleId={selectedArticleId}
              onBack={handleBackToArticles}
            />
          )}{" "}
          {currentSection === "articles-admin" && (
            <AdminProtection>
              <ArticlesAdmin onClose={handleBackFromArticlesAdmin} />
            </AdminProtection>          )}          {currentSection === "skills" && <SkillsSection />}          {currentSection === "certifications" && (
            <CertificationsSection 
              isAdminMode={false}
              showAdminFAB={isAuthenticated}
              onAdminClick={() => console.log('Admin click en certificaciones')}
            />
          )}
          {currentSection === "testimonials" && (
            <>
              <TestimonialsSection
                testimonials={testimonials.map((t) => ({
                  id: t.id,
                  name: t.name,
                  position: t.position,
                  avatar: getAvatarForTestimonial(t),
                  text: t.text,
                  company: t.company,
                  website: t.website,
                }))}                onAdd={handleAddTestimonial}
                onEdit={handleEditTestimonial}
                onDelete={handleDeleteTestimonial}
                isAdminMode={false}
                showAdminFAB={isAuthenticated}
                onAdminClick={() => setShowAdminPanel(true)}
              />
              {showAdminPanel && (
                <AdminProtection>
                  <TestimonialsAdmin
                    onClose={() => {
                      setShowAdminPanel(false);
                      // Recargar testimonios aprobados
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
              )}
            </>
          )}
          {currentSection === "contact" && (
            <ContactSection onSubmit={handleContactSubmit} />
          )}        </main>        
        {/* Acceso discreto de administrador */}
        <DiscreteAdminAccess />
      </div>
    </div>
  );
};

export default CurriculumMD3;
