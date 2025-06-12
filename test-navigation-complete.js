// Script para probar la navegación con base path
console.log('🧪 Test de Navegación con Base Path /ProfileCraft/');

// Función para probar diferentes URLs
const testNavigationURLs = () => {
  console.group('📍 PRUEBAS DE NAVEGACIÓN');
  
  // URLs a probar
  const testUrls = [
    'http://localhost:5173/ProfileCraft/',
    'http://localhost:5173/ProfileCraft/about',
    'http://localhost:5173/ProfileCraft/experience',
    'http://localhost:5173/ProfileCraft/#experience',
    'http://localhost:5173/ProfileCraft/articles'
  ];
  
  console.log('🌐 URL actual:', window.location.href);
  console.log('🌐 Pathname:', window.location.pathname);
  console.log('🌐 Hash:', window.location.hash);
  
  // Verificar router basename
  console.log('📍 Base path esperado: /ProfileCraft');
  
  // Verificar sección actual del contexto
  const body = document.body;
  const currentSectionAttr = body.getAttribute('data-active-section');
  console.log('📍 Sección actual (data-active-section):', currentSectionAttr);
  
  // Verificar clases del body
  const bodyClasses = Array.from(body.classList).filter(cls => cls.includes('section'));
  console.log('📍 Clases de sección en body:', bodyClasses);
  
  console.groupEnd();
};

// Función para probar navegación programática
const testProgrammaticNavigation = () => {
  console.group('🤖 NAVEGACIÓN PROGRAMÁTICA');
  
  // Simular click en botón de navegación
  const testNavigateToExperience = () => {
    console.log('🎯 Probando navegación a experience...');
    
    // Simular cambio de hash
    window.location.hash = '#experience';
    console.log('🔗 Hash cambiado a:', window.location.hash);
    
    setTimeout(() => {
      const experienceSection = document.getElementById('experience');
      if (experienceSection) {
        console.log('✅ Sección experience encontrada');
        experienceSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.log('❌ Sección experience NO encontrada');
      }
    }, 100);
  };
  
  // Probar navegación a different sections
  const testSections = ['about', 'experience', 'skills', 'contact'];
  
  testSections.forEach((section, index) => {
    setTimeout(() => {
      console.log(`🎯 Navegando a ${section}...`);
      
      // Method 1: Hash navigation
      window.location.hash = `#${section}`;
      
      // Method 2: Path navigation (should work with basename)
      // history.pushState({}, '', `/ProfileCraft/${section}`);
      
      // Method 3: Scroll to section
      setTimeout(() => {
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
          console.log(`✅ Sección ${section} encontrada y visible`);
        } else {
          console.log(`❌ Sección ${section} NO encontrada`);
        }
      }, 100);
      
    }, index * 2000); // 2 seconds between tests
  });
  
  console.groupEnd();
};

// Función para verificar el estado del router
const testRouterState = () => {
  console.group('🛣️ ESTADO DEL ROUTER');
  
  // Verificar si React Router está funcionando
  const routerElements = document.querySelectorAll('[data-testid], [data-router]');
  console.log('🔍 Elementos del router encontrados:', routerElements.length);
  
  // Verificar navegación links
  const navLinks = document.querySelectorAll('nav a, button[aria-label*="Navegar"]');
  console.log('🔗 Links de navegación encontrados:', navLinks.length);
  
  navLinks.forEach((link, index) => {
    if (index < 5) { // Solo los primeros 5 para no spam
      console.log(`  ${index + 1}. ${link.tagName} - ${link.textContent?.trim()} - ${link.getAttribute('href') || 'No href'}`);
    }
  });
  
  console.groupEnd();
};

// Función para verificar el botón admin
const testAdminButton = () => {
  console.group('🔧 BOTÓN ADMIN - ESTADO ACTUAL');
  
  // Verificar autenticación
  const token = localStorage.getItem('portfolio_auth_token');
  console.log('🔑 Token presente:', !!token);
  
  if (token) {
    console.log('🔑 Token (primeros 20 chars):', token.substring(0, 20) + '...');
  }
  
  // Verificar sección actual
  const currentSection = document.body.getAttribute('data-active-section');
  console.log('📍 Sección actual:', currentSection);
  
  // Verificar condición showAdminFAB
  const isAuthenticated = !!token;
  const inExperienceSection = currentSection === 'experience';
  const showAdminFAB = isAuthenticated && inExperienceSection;
  
  console.log('🎯 Condiciones para botón admin:');
  console.log('  • isAuthenticated:', isAuthenticated);
  console.log('  • currentSection === "experience":', inExperienceSection);
  console.log('  • showAdminFAB:', showAdminFAB);
  
  // Buscar botón admin en el DOM
  const adminButtons = document.querySelectorAll('[class*="admin"], [class*="fab"], [class*="floating"], button[aria-label*="Admin"]');
  console.log('🔍 Botones admin encontrados:', adminButtons.length);
  
  adminButtons.forEach((btn, index) => {
    const isVisible = btn.offsetParent !== null;
    console.log(`  ${index + 1}. ${btn.tagName} - ${btn.className} - Visible: ${isVisible}`);
  });
  
  console.groupEnd();
};

// Función principal de testing
const runFullNavigationTest = async () => {
  console.log('🚀 Iniciando test completo de navegación...\n');
  
  // Test 1: URLs
  testNavigationURLs();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Router state
  testRouterState();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Admin button
  testAdminButton();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 4: Programmatic navigation
  testProgrammaticNavigation();
  
  console.log('\n✅ Test completo finalizado. Revisa los logs para identificar problemas.');
};

// Funciones de utilidad para testing manual
window.navigationTest = {
  testURLs: testNavigationURLs,
  testRouter: testRouterState,
  testAdmin: testAdminButton,
  testNavigation: testProgrammaticNavigation,
  runAll: runFullNavigationTest,
  
  // Función para navegar manualmente a una sección
  goTo: (section) => {
    console.log(`🎯 Navegando manualmente a ${section}...`);
    window.location.hash = `#${section}`;
    setTimeout(() => {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  },
  
  // Función para probar autenticación
  testAuth: async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/dev-token');
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('portfolio_auth_token', data.token);
        console.log('✅ Token obtenido y guardado');
        window.location.reload();
      }
    } catch (error) {
      console.log('❌ Error obteniendo token:', error);
    }
  }
};

// Ejecutar test automáticamente
runFullNavigationTest();

console.log('\n📋 Funciones disponibles para testing manual:');
console.log('  • navigationTest.testURLs() - Probar URLs');
console.log('  • navigationTest.testRouter() - Probar router');
console.log('  • navigationTest.testAdmin() - Probar botón admin');
console.log('  • navigationTest.testNavigation() - Probar navegación');
console.log('  • navigationTest.runAll() - Ejecutar todo');
console.log('  • navigationTest.goTo("section") - Ir a sección');
console.log('  • navigationTest.testAuth() - Probar autenticación');
