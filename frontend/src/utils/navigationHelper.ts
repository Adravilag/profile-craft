// Helper para navegación simple y confiable
export const simpleNavigateToSection = (sectionId: string): void => {
  const element = document.getElementById(sectionId);
  if (!element) {
    console.error(`Section ${sectionId} not found`);
    return;
  }

  // Usar scrollIntoView que es más confiable
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  console.log(`Navigated to section: ${sectionId}`);
};

// Helper alternativo con cálculo manual más simple
export const manualNavigateToSection = (sectionId: string): void => {
  const element = document.getElementById(sectionId);
  if (!element) {
    console.error(`Section ${sectionId} not found`);
    return;
  }

  const headerElement = document.querySelector('.header-curriculum') as HTMLElement;
  const headerHeight = headerElement?.offsetHeight || 0;
  
  let targetPosition: number;
  
  if (sectionId === 'about') {
    // Para about, posicionar justo después del header
    targetPosition = headerHeight;
  } else {
    // Para otras secciones, usar offsetTop menos un offset
    const sectionTop = element.offsetTop;
    const offset = 120; // Offset fijo
    targetPosition = Math.max(0, sectionTop - offset);
  }

  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });

  console.log(`Manual navigation to ${sectionId}, target: ${targetPosition}`);
};
