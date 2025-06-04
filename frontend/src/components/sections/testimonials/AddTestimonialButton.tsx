// src/components/sections/testimonials/AddTestimonialButton.tsx

import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useScrollVisibility } from "../../../hooks/useScrollVisibility";
import { useNavigation } from "../../../contexts/NavigationContext";
import FloatingActionButton from "../../common/FloatingActionButton";

interface AddTestimonialButtonProps {
  onClick: () => void;
  debug?: boolean; // Prop para activar el modo debug
}

const AddTestimonialButton: React.FC<AddTestimonialButtonProps> = ({
  onClick,
  debug = false,
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const isScrollVisible = useScrollVisibility(true, 300);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Hooks para detección dual: URL y NavigationContext
  const location = useLocation();
  const { currentSection } = useNavigation();

  // Detección dual: URL o NavigationContext
  const isOnTestimonialsURL = location.pathname === "/testimonials";
  const isInTestimonialsSection = currentSection === "testimonials";
  const shouldShowByNavigation = isOnTestimonialsURL || isInTestimonialsSection;

  // Usar Intersection Observer para detectar cuando la sección de testimonios está visible
  useEffect(() => {
    const testimonialsSectionElem = document.getElementById("testimonials");

    if (!testimonialsSectionElem) {
      if (debug)
        console.log("[TESTIMONIO_DEBUG] Sección de testimonios no encontrada");
      return;
    }

    // Crear el Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.5; // Visible al menos 50%

        setShouldShow(isVisible);

        // Añadir/quitar clase del body
        if (isVisible) {
          document.body.classList.add("in-testimonials-section");
        } else {
          document.body.classList.remove("in-testimonials-section");
        }

        // Log para desarrollo
        if (debug) {
          console.log(`[TESTIMONIO_DEBUG] Sección visible: ${isVisible}`);
          console.log(
            `[TESTIMONIO_DEBUG] Intersection ratio: ${entry.intersectionRatio}`
          );
          console.log(`[TESTIMONIO_DEBUG] Mostrar botón: ${isVisible}`);
        }
      },
      {
        // Configuración del observer - MÁS RESTRICTIVA
        root: null, // viewport
        rootMargin: "-20% 0px -40% 0px", // Solo cuando esté bien centrada en viewport
        threshold: [0, 0.5, 0.8, 1], // Umbrales más altos
      }
    );

    // Observar la sección de testimonios
    observerRef.current.observe(testimonialsSectionElem);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      document.body.classList.remove("in-testimonials-section");
    };
  }, [debug]);

  const isVisible = shouldShowByNavigation && shouldShow && isScrollVisible;

  return (
    <>
      {shouldShowByNavigation && (
        <FloatingActionButton
          onClick={onClick}
          icon="fas fa-plus"
          label="Añadir Testimonio"
          color="primary"
          position="bottom-right"
          className={`add-testimonial ${isVisible ? "visible" : ""}`}
          usePortal={true}
          ariaLabel="Añadir nuevo testimonio"
        />
      )}
    </>
  );
};

export default AddTestimonialButton;
