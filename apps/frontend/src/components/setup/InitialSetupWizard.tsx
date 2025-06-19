import React, { useState, useEffect, useRef } from "react";
import { useInitialSetup } from '@cv-maker/shared';
import { useNotificationContext } from '@cv-maker/shared';
import styles from "./InitialSetupWizard.module.css";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role_title: string;
  role_subtitle: string;
  about_me: string;
  phone: string;
  location: string;
  linkedin_url: string;
  github_url: string;
}

interface FormErrors {
  [key: string]: string;
}

const InitialSetupWizard: React.FC = () => {
  const { saveInitialSetup, isLoading } = useInitialSetup();
  const { showSuccess, showError } = useNotificationContext();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role_title: "",
    role_subtitle: "",
    about_me: "",
    phone: "",
    location: "",
    linkedin_url: "",
    github_url: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const stepBodyRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  // Aplicar clases CSS globales para pantalla completa
  useEffect(() => {
    // Añadir clases al montar el componente
    document.body.classList.add("wizard-active");
    document.documentElement.classList.add("wizard-active");

    // Limpiar clases al desmontar el componente
    return () => {
      document.body.classList.remove("wizard-active");
      document.documentElement.classList.remove("wizard-active");
    };
  }, []);

  // Detectar contenido con scroll
  useEffect(() => {
    const checkScroll = () => {
      if (stepBodyRef.current) {
        const { scrollHeight, clientHeight } = stepBodyRef.current;
        setHasScroll(scrollHeight > clientHeight);
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);

    return () => {
      window.removeEventListener("resize", checkScroll);
    };
  }, [currentStep, formData]);

  const steps = [
    {
      id: "welcome",
      title: "¡Bienvenido a ProfileCraft!",
      subtitle:
        "Vamos a configurar tu perfil profesional en unos simples pasos",
      icon: "fas fa-rocket",
    },
    {
      id: "personal",
      title: "Crear Usuario y Datos Personales",
      subtitle: "Crea tu cuenta y cuéntanos sobre ti",
      icon: "fas fa-user-plus",
    },
    {
      id: "professional",
      title: "Información Profesional",
      subtitle: "Tu experiencia y especialización",
      icon: "fas fa-briefcase",
    },
    {
      id: "contact",
      title: "Información de Contacto",
      subtitle: "Cómo pueden contactarte",
      icon: "fas fa-address-book",
    },
    {
      id: "social",
      title: "Redes Profesionales",
      subtitle: "Conecta tus perfiles sociales",
      icon: "fab fa-linkedin",
    },
    {
      id: "review",
      title: "Revisión Final",
      subtitle: "Confirma tu información",
      icon: "fas fa-check-circle",
    },
  ];

  // Validar paso actual
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1: // Personal
        if (!formData.name.trim()) {
          newErrors.name = "El nombre es obligatorio";
        }
        if (!formData.email.trim()) {
          newErrors.email = "El email es obligatorio";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "El email no tiene un formato válido";
        }
        if (!formData.password.trim()) {
          newErrors.password = "La contraseña es obligatoria";
        } else if (formData.password.length < 6) {
          newErrors.password = "La contraseña debe tener al menos 6 caracteres";
        }
        if (!formData.confirmPassword.trim()) {
          newErrors.confirmPassword = "Confirma tu contraseña";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Las contraseñas no coinciden";
        }
        break;

      case 2: // Professional
        if (!formData.role_title.trim()) {
          newErrors.role_title = "El título profesional es obligatorio";
        }
        if (!formData.about_me.trim()) {
          newErrors.about_me = "La descripción profesional es obligatoria";
        } else if (formData.about_me.length < 50) {
          newErrors.about_me =
            "La descripción debe tener al menos 50 caracteres";
        }
        break;

      case 4: // Social
        if (
          formData.linkedin_url &&
          !formData.linkedin_url.includes("linkedin.com")
        ) {
          newErrors.linkedin_url = "URL de LinkedIn no válida";
        }
        if (
          formData.github_url &&
          !formData.github_url.includes("github.com")
        ) {
          newErrors.github_url = "URL de GitHub no válida";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error del campo si está siendo editado
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Navegar entre pasos
  const nextStep = () => {
    if (currentStep === 0 || validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }; // Finalizar configuración
  const handleFinish = async () => {
    // Validar todos los campos obligatorios antes de finalizar
    const personalValid = validateStep(1); // Información Personal
    const professionalValid = validateStep(2); // Información Profesional

    if (!personalValid || !professionalValid) {
      showError(
        "Error de validación",
        "Por favor, completa todos los campos obligatorios marcados con *"
      );
      return;
    }

    try {
      setIsSubmitting(true);

      console.log(
        "🔄 Iniciando registro de usuario y configuración inicial..."
      );
      console.log("📝 Datos a enviar:", formData);

      // Paso 1: Registrar el usuario
      console.log("👤 Registrando nuevo usuario...");

      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "user", // Por defecto, los usuarios que se registran son role 'user'
      };

      const registerResponse = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000/api"
        }/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
        }
      );

      const registerResult = await registerResponse.json();

      if (!registerResponse.ok) {
        if (
          registerResult.error &&
          registerResult.error.includes("ya existe")
        ) {
          showError(
            "Usuario ya existe",
            "Ya existe un usuario con este email. Por favor, usa un email diferente o inicia sesión."
          );
        } else {
          showError(
            "Error de registro",
            registerResult.error ||
              "No se pudo crear el usuario. Intenta de nuevo."
          );
        }
        return;
      }

      console.log("✅ Usuario registrado exitosamente");
      console.log("🔑 Token recibido:", !!registerResult.token);

      // Guardar el token de autenticación
      if (registerResult.token) {
        localStorage.setItem("portfolio_auth_token", registerResult.token);
      }

      // Paso 2: Actualizar el perfil con el resto de información
      console.log("📝 Actualizando perfil con información adicional...");

      const profileData = {
        name: formData.name,
        email: formData.email,
        role_title: formData.role_title,
        role_subtitle: formData.role_subtitle,
        about_me: formData.about_me,
        phone: formData.phone,
        location: formData.location,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
      };

      await saveInitialSetup(profileData);

      console.log("✅ Configuración completada exitosamente");
      showSuccess(
        "¡Cuenta creada y configuración completada!",
        "Tu cuenta ha sido creada y tu perfil configurado exitosamente"
      );
    } catch (error: any) {
      console.error("❌ Error en el proceso:", error);

      // Análisis detallado del error
      let errorMessage = "Error desconocido";
      let detailedInfo = "";

      if (error.response) {
        // Error de respuesta HTTP
        const status = error.response.status;
        const data = error.response.data;

        console.error("📊 Error HTTP:", {
          status,
          data,
          headers: error.response.headers,
        });

        switch (status) {
          case 401:
            errorMessage = "Error de autenticación";
            detailedInfo =
              "Las credenciales no son válidas. Verifica los datos e intenta de nuevo.";
            break;
          case 404:
            errorMessage = "Endpoint no encontrado (404)";
            detailedInfo =
              "El servidor no puede encontrar la ruta solicitada. Verifica que el backend esté funcionando correctamente.";
            break;
          case 400:
            errorMessage = data?.error || "Datos inválidos";
            detailedInfo =
              "Verifica que todos los campos estén correctamente completados.";
            break;
          case 500:
            errorMessage = "Error interno del servidor";
            detailedInfo =
              "Hay un problema en el backend. Intenta de nuevo en unos momentos.";
            break;
          default:
            errorMessage = `Error HTTP ${status}`;
            detailedInfo = data?.error || "Error desconocido del servidor.";
        }
      } else if (error.request) {
        // Error de red
        console.error("🌐 Error de red:", error.request);
        errorMessage = "Error de conexión";
        detailedInfo =
          "No se pudo conectar al servidor. Verifica tu conexión a internet y que el backend esté funcionando.";
      } else {
        // Otro tipo de error
        errorMessage = error.message || "Error desconocido";
        detailedInfo = "Error inesperado durante el proceso.";
      }

      console.error("📋 Resumen del error:", { errorMessage, detailedInfo });

      showError("Error al procesar", `${errorMessage}. ${detailedInfo}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className={styles.welcomeStep}>
            <div className={styles.welcomeIcon}>
              <i className="fas fa-user-cog"></i>
            </div>
            <h2>¡Vamos a crear tu perfil profesional!</h2>
            <p>
              ProfileCraft te ayudará a crear un CV profesional impactante. Este
              proceso tomará solo unos minutos.
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <i className="fas fa-magic"></i>
                <span>Diseño profesional automático</span>
              </div>
              <div className={styles.feature}>
                <i className="fas fa-mobile-alt"></i>
                <span>Optimizado para todos los dispositivos</span>
              </div>
              <div className={styles.feature}>
                <i className="fas fa-share-alt"></i>
                <span>Fácil de compartir</span>
              </div>
            </div>
          </div>
        );
      case 1: // Personal
        return (
          <div className={styles.stepContent}>
            <div className={styles.sectionTitle}>
              <i className="fas fa-user-plus"></i>
              <span>Crear tu cuenta</span>
            </div>

            <div className={styles.formColumns}>
              {" "}
              {/* Columna izquierda - Información Personal */}
              <div className={styles.formColumn}>
                <div className={styles.columnTitle}>
                  <i className="fas fa-user"></i>
                  <span>Información Personal</span>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.name ? styles.inputError : ""
                    }`}
                    placeholder="Tu nombre completo"
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.name && (
                    <span className={styles.errorText}>{errors.name}</span>
                  )}
                </div>{" "}
                <div className={styles.formGroup}>
                  <div className={styles.infoMessage}>
                    <i className="fas fa-info-circle"></i>
                    <span>
                      Completa tu información de acceso en la columna derecha
                    </span>
                  </div>
                </div>
              </div>{" "}
              {/* Columna derecha - Datos de Acceso */}
              <div className={styles.formColumn}>
                <div className={styles.columnTitle}>
                  <i className="fas fa-key"></i>
                  <span>Datos de Acceso</span>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email profesional *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.email ? styles.inputError : ""
                    }`}
                    placeholder="tu.email@ejemplo.com"
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.email && (
                    <span className={styles.errorText}>{errors.email}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.password ? styles.inputError : ""
                    }`}
                    placeholder="Mínimo 6 caracteres"
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.password && (
                    <span className={styles.errorText}>{errors.password}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirmar contraseña *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.confirmPassword ? styles.inputError : ""
                    }`}
                    placeholder="Repite tu contraseña"
                    disabled={isSubmitting || isLoading}
                  />{" "}
                  {errors.confirmPassword && (
                    <span className={styles.errorText}>
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Professional
        return (
          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label htmlFor="role_title" className={styles.label}>
                Título profesional *
              </label>
              <input
                type="text"
                id="role_title"
                name="role_title"
                value={formData.role_title}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  errors.role_title ? styles.inputError : ""
                }`}
                placeholder="ej. Full Stack Developer"
                disabled={isSubmitting || isLoading}
              />
              {errors.role_title && (
                <span className={styles.errorText}>{errors.role_title}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="role_subtitle" className={styles.label}>
                Especialidad
              </label>
              <input
                type="text"
                id="role_subtitle"
                name="role_subtitle"
                value={formData.role_subtitle}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="ej. Especialista en React y Node.js"
                disabled={isSubmitting || isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="about_me" className={styles.label}>
                Descripción profesional *
              </label>
              <textarea
                id="about_me"
                name="about_me"
                value={formData.about_me}
                onChange={handleInputChange}
                className={`${styles.textarea} ${
                  errors.about_me ? styles.inputError : ""
                }`}
                placeholder="Describe tu experiencia, habilidades y objetivos profesionales..."
                rows={4}
                disabled={isSubmitting || isLoading}
              />
              <div className={styles.charCounter}>
                {formData.about_me.length}/50 mínimo
              </div>
              {errors.about_me && (
                <span className={styles.errorText}>{errors.about_me}</span>
              )}
            </div>
          </div>
        );

      case 3: // Contact
        return (
          <div className={styles.stepContent}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="+34 123 456 789"
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="location" className={styles.label}>
                  Ubicación
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Madrid, España"
                  disabled={isSubmitting || isLoading}
                />
              </div>
            </div>
          </div>
        );

      case 4: // Social
        return (
          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label htmlFor="linkedin_url" className={styles.label}>
                LinkedIn
              </label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  errors.linkedin_url ? styles.inputError : ""
                }`}
                placeholder="https://linkedin.com/in/tu-perfil"
                disabled={isSubmitting || isLoading}
              />
              {errors.linkedin_url && (
                <span className={styles.errorText}>{errors.linkedin_url}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="github_url" className={styles.label}>
                GitHub
              </label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  errors.github_url ? styles.inputError : ""
                }`}
                placeholder="https://github.com/tu-usuario"
                disabled={isSubmitting || isLoading}
              />
              {errors.github_url && (
                <span className={styles.errorText}>{errors.github_url}</span>
              )}
            </div>
          </div>
        );

      case 5: // Review
        return (
          <div className={styles.reviewStep}>
            <h3>Revisa tu información</h3>
            <div className={styles.reviewGrid}>
              <div className={styles.reviewSection}>
                <h4>
                  <i className="fas fa-user"></i> Personal
                </h4>
                <p>
                  <strong>Nombre:</strong> {formData.name}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
              </div>

              <div className={styles.reviewSection}>
                <h4>
                  <i className="fas fa-briefcase"></i> Profesional
                </h4>
                <p>
                  <strong>Título:</strong> {formData.role_title}
                </p>
                {formData.role_subtitle && (
                  <p>
                    <strong>Especialidad:</strong> {formData.role_subtitle}
                  </p>
                )}
                <p>
                  <strong>Descripción:</strong>{" "}
                  {formData.about_me.substring(0, 100)}...
                </p>
              </div>

              <div className={styles.reviewSection}>
                <h4>
                  <i className="fas fa-address-book"></i> Contacto
                </h4>
                {formData.phone && (
                  <p>
                    <strong>Teléfono:</strong> {formData.phone}
                  </p>
                )}
                {formData.location && (
                  <p>
                    <strong>Ubicación:</strong> {formData.location}
                  </p>
                )}
              </div>

              <div className={styles.reviewSection}>
                <h4>
                  <i className="fab fa-linkedin"></i> Redes
                </h4>
                {formData.linkedin_url && (
                  <p>
                    <strong>LinkedIn:</strong> ✓
                  </p>
                )}
                {formData.github_url && (
                  <p>
                    <strong>GitHub:</strong> ✓
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.wizardContent}>
        {" "}
        {/* Progress Bar */}
        <div className={styles.progressBar}>
          {/* Barra de progreso animada */}
          <div
            className={styles.progressLine}
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>

          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`${styles.progressStep} ${
                index <= currentStep ? styles.completed : ""
              } ${index === currentStep ? styles.active : ""}`}
            >
              <div className={styles.progressIcon}>
                <i className={step.icon}></i>
              </div>
              <span className={styles.progressLabel}>{step.title}</span>
            </div>
          ))}

          {/* Indicador de progreso */}
          <div className={styles.progressIndicatorTop}>
            {currentStep + 1} de {steps.length} •{" "}
            {Math.round((currentStep / (steps.length - 1)) * 100)}% completado
          </div>
        </div>{" "}
        {/* Step Content */}
        <div className={styles.stepContainer}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>
              {String(currentStep + 1).padStart(2, "0")}
            </div>
            <h1 className={styles.stepTitle}>{steps[currentStep].title}</h1>
            <p className={styles.stepSubtitle}>{steps[currentStep].subtitle}</p>
            <div className={styles.stepDivider}></div>
          </div>{" "}
          <div
            ref={stepBodyRef}
            className={`${styles.stepBody} ${
              hasScroll ? styles.scrollable : ""
            }`}
          >
            {renderStepContent()}
          </div>
        </div>
        {/* Navigation */}
        <div className={styles.navigation}>
          <button
            type="button"
            onClick={prevStep}
            className={`${styles.navButton} ${styles.prevButton}`}
            disabled={currentStep === 0 || isSubmitting}
          >
            <i className="fas fa-arrow-left"></i>
            Anterior
          </button>

          <div className={styles.stepIndicator}>
            {currentStep + 1} de {steps.length}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className={`${styles.navButton} ${styles.nextButton}`}
              disabled={isSubmitting}
            >
              Siguiente
              <i className="fas fa-arrow-right"></i>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className={`${styles.navButton} ${styles.finishButton}`}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinner}></span>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  Finalizar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InitialSetupWizard;




