// src/components/CurriculumMD3.tsx

import { useState, useEffect, lazy, type FC, type FormEvent } from "react";
import "./Curriculum.css";
import Header from "./header/Header";
import { SmartNavigation, AdminProtection, DiscreteAdminAccess, BackendStatusIndicator, ScrollToTopButton, Footer, NavigationOverlay } from "@cv-maker/ui";
import contactService from "../services/contactService";
import {
  getTestimonials,
  createTestimonial,
  updateAdminTestimonial,
  deleteTestimonial,
  getUserProfile,
  hasRegisteredUser,
} from "../services/api";
import { useNotificationContext, useNavigation, useUnifiedTheme, useAuth, useInitialSetup } from "@cv-maker/shared";
import InitialSetupWizard from "./setup/InitialSetupWizard";
import type { Testimonial, UserProfile } from "../services/api";
import { generateAvatarUrl } from "../utils/avatarUtils";
import { debugLog } from "../utils/debugConfig";

// Lazy loading de componentes
const AboutSection = lazy(() => import("./sections/about/AboutSection"));
// Debug component (temporal)
import useAutoAuthInDev from "../hooks/useAutoAuthInDev";
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
import ArticleView from "./sections/articles/components/views/ArticleView";
import CreateArticle from "./sections/articles/components/forms/CreateArticle";

interface CurriculumMD3Props {
  initialSection?: string;
}

const CurriculumMD3: FC<CurriculumMD3Props> = ({ initialSection }) => {
  const { currentGlobalTheme, toggleGlobalTheme } = useUnifiedTheme();
  const {
    currentSection,
    currentSubPath,
    navigateToSection,
    isNavigating,
    targetSection,
  } = useNavigation();
  const { isAuthenticated } = useAuth();
  const { isFirstTime, isLoading: setupLoading } = useInitialSetup();

  // Auto-autenticación en desarrollo (con control de deshabilitación)
  useAutoAuthInDev();

  // Estado para verificar usuarios registrados
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  const [isCheckingUsers, setIsCheckingUsers] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const { showSuccess: notifySuccess, showError: notifyError } =
    useNotificationContext();

  // Debug navigation state
  useEffect(() => {
    debugLog.navigation("CurriculumMD3 navigation state:", {
      isNavigating,
      targetSection,
      currentSection,
    });
  }, [isNavigating, targetSection, currentSection]);

  // Log de la sección inicial para debugging
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && initialSection) {
      debugLog.navigation(
        `CurriculumMD3: Inicializando con sección "${initialSection}"`
      );
    }
  }, [initialSection]);

  // Verificar si hay usuarios registrados
  useEffect(() => {
    const checkUsers = async () => {
      try {
        setIsCheckingUsers(true);
        debugLog.dataLoading("🔍 Iniciando verificación de usuarios...");
        const response = await hasRegisteredUser();
        debugLog.dataLoading("📋 Respuesta de hasRegisteredUser:", response);
        debugLog.dataLoading("📋 Tipo de respuesta:", typeof response);
        // La función retorna directamente un boolean
        setHasUsers(response || false);
        debugLog.dataLoading("✅ hasUsers establecido a:", response || false);
      } catch (error) {
        debugLog.error("❌ Error verificando usuarios:", error);
        setHasUsers(false);
      } finally {
        setIsCheckingUsers(false);
      }
    };

    checkUsers();
  }, []);

  // Load profile data for Footer
  useEffect(() => {
    // Solo cargar perfil si hay usuarios registrados
    if (hasUsers) {
      getUserProfile()
        .then((data) => {
          setProfile(data);
        })
        .catch((error) => {
          console.error("Error al cargar perfil para footer:", error);
        });
    }
  }, [hasUsers]);

  // Load testimonials
  useEffect(() => {
    // Solo cargar testimonios si hay usuarios registrados
    if (hasUsers) {
      getTestimonials()
        .then((testimonials) => {
          // Verificar que testimonials sea un array antes de usar map
          if (Array.isArray(testimonials)) {
            debugLog.dataLoading('🔍 DEBUG: Testimonials del API:', testimonials.map(t => ({ name: t.name, rating: t.rating })));
            const testimonialsWithAvatars = testimonials.map((testimonial) => ({
              ...testimonial,
              avatar: getAvatarForTestimonial(testimonial),
            }));
            setTestimonials(testimonialsWithAvatars);
          } else {
            debugLog.warn(
              "getTestimonials() no retornó un array:",
              testimonials
            );
            setTestimonials([]);
          }
        })
        .catch((error) => {
          debugLog.error("Error al cargar testimonios:", error);
          setTestimonials([]);
        });
    }
  }, [hasUsers]);

  // Debug temporal para verificar la condición showAdminFAB
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const showAdminFAB = isAuthenticated && currentSection === "experience";
      debugLog.admin("🔍 Debug showAdminFAB:", {
        isAuthenticated,
        currentSection,
        showAdminFAB,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  }, [isAuthenticated, currentSection]);

  // Mostrar loading mientras verifica usuarios
  if (isCheckingUsers) {
    return (
      <div className="curriculum-wrapper" data-theme={currentGlobalTheme}>
        <div className="curriculum-container setup-loading">
          <div className="setup-loading-content">
            <div className="setup-loading-spinner"></div>
            <p>Verificando sistema...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay usuarios, mostrar wizard de configuración inicial
  if (!hasUsers) {
    return (
      <div className="curriculum-wrapper" data-theme={currentGlobalTheme}>
        <InitialSetupWizard />
      </div>
    );
  }

  // Si hay usuarios registrados, mostrar loading del setup solo si es necesario
  if (setupLoading) {
    return (
      <div className="curriculum-wrapper" data-theme={currentGlobalTheme}>
        <div className="curriculum-container setup-loading">
          <div className="setup-loading-content">
            <div className="setup-loading-spinner"></div>
            <p>Verificando configuración...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si hay usuarios registrados pero el usuario actual necesita configuración inicial
  // Solo mostrar wizard si no hay usuarios registrados O si es un usuario específico que necesita setup
  // Comentamos esta lógica para permitir acceso a la página aunque el usuario no esté autenticado
  /*
  if (isFirstTime && !hasBasicData) {
    return (
      <div className="curriculum-wrapper" data-theme={currentGlobalTheme}>
        <InitialSetupWizard />
      </div>
    );
  }
  */

  const getAvatarForTestimonial = (testimonial: Testimonial) => {
    // Usar la función utilitaria centralizada para generar avatares
    return generateAvatarUrl({
      name: testimonial.name,
      email: testimonial.email,
      avatar: testimonial.avatar_url || testimonial.avatar,
    });
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
    rating?: number;
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
      const actualizado = await updateAdminTestimonial(id.toString(), t);
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
      await deleteTestimonial(id.toString());
      setTestimonials((prev) => prev.filter((item) => item.id !== id));
      notifySuccess(
        "Testimonio eliminado",
        "El testimonio fue eliminado correctamente"
      );
    } catch (e) {
      notifyError("Error al eliminar", "No se pudo eliminar el testimonio");
    }
  };

  // Función para recargar testimonios cuando hay cambios en el modal de administración
  const refreshTestimonials = async () => {
    try {
      const data = await getTestimonials();
      if (Array.isArray(data)) {
        const testimonialsWithAvatars = data.map((testimonial) => ({
          ...testimonial,
          avatar: getAvatarForTestimonial(testimonial),
        }));
        setTestimonials(testimonialsWithAvatars);
      }
    } catch (error) {
      console.error("Error al recargar testimonios:", error);
    }
  };

  const navItems = [
    { id: "home", label: "Inicio", icon: "fas fa-home" },
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
    <div className="curriculum-wrapper" data-theme={currentGlobalTheme}>
      {/* Panel de debug temporal para testing de navegación */}
      <div id="curriculum-container" className="curriculum-container">
        {/* Indicador de scroll inteligente */}
        {/* <SmartScrollIndicator /> */}
        {/* Header mejorado */}
        <Header
          darkMode={currentGlobalTheme === "dark"}
          onToggleDarkMode={toggleGlobalTheme}
          isFirstTime={isFirstTime}
        />
        {/* Navegación inteligente con scroll - solo si no es primera vez */}
        {!isFirstTime && <SmartNavigation navItems={navItems} />}
        {/* Contenedor de secciones - solo si no es primera vez */}
        {!isFirstTime && (
          <main className="sections-container">
            <div id="about" className="seccion-a">
              <AboutSection />
            </div>
            {/* Secciones del currículum */}
            <div id="experience" className="seccion-b">
              <ExperienceSection
                showAdminFAB={
                  isAuthenticated && currentSection === "experience"
                }
                onAdminClick={() => {}}
              />
            </div>
            <div id="articles" className="seccion-a">
              <ArticlesSection
                showAdminButton={
                  isAuthenticated && currentSection === "articles"
                }
                onAdminClick={() => {}}
              />
            </div>
            <div id="skills" className="seccion-b">
              <SkillsSection
                showAdminFAB={isAuthenticated && currentSection === "skills"}
              />
            </div>
            <div id="certifications" className="seccion-a">
              <CertificationsSection
                isAdminMode={false}
                showAdminFAB={
                  isAuthenticated && currentSection === "certifications"
                }
              />
            </div>
            <div id="testimonials" className="seccion-b">
              <TestimonialsSection
                testimonials={testimonials.map((t) => ({
                  id: t.id || 0,
                  name: t.name,
                  position: t.position,
                  avatar: getAvatarForTestimonial(t),
                  text: t.text,
                  company: t.company,
                  website: t.website,
                  rating: t.rating, // Agregamos el campo rating
                  email: t.email, // Agregamos el campo email para avatares
                  avatar_url: t.avatar_url, // Agregamos el campo avatar_url
                  created_at: t.created_at, // Agregamos la fecha de creación
                }))}
                onAdd={handleAddTestimonial}
                onEdit={handleEditTestimonial}
                onDelete={handleDeleteTestimonial}
                onTestimonialsChange={refreshTestimonials}
                isAdminMode={false}
                showAdminFAB={
                  isAuthenticated && currentSection === "testimonials"
                }
              />
            </div>
            <div id="contact" className="seccion-a">
              <ContactSection onSubmit={handleContactSubmit} />
            </div>
          </main>
        )}
        {/* Footer Component */}
        <Footer
          darkMode={currentGlobalTheme === "dark"}
          className="curriculum-footer"
          profile={profile}
        />

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
                articleId={selectedArticleId.toString()}
                onBack={handleBackToArticles}
              />
            </div>
          </div>
        )}
        <DiscreteAdminAccess />
        <ScrollToTopButton />
        <BackendStatusIndicator
          showWhenOnline={false}
          position="bottom-right"
        />

        {/* Navigation Overlay */}
        <NavigationOverlay />
      </div>
    </div>
  );
};

export default CurriculumMD3;
