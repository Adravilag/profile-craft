// Script para probar el fix del botón admin step by step
console.log('🧪 Testing Admin Button Fix - Step by Step');

// Paso 1: Verificar el estado inicial
console.log('\n📍 PASO 1: Estado inicial');
const initialState = {
  url: window.location.href,
  pathname: window.location.pathname,
  hash: window.location.hash,
  hasToken: !!localStorage.getItem('portfolio_auth_token')
};
console.table(initialState);

// Paso 2: Obtener token si no existe
const getTokenIfNeeded = async () => {
  console.log('\n🔑 PASO 2: Verificación de token');
  
  const currentToken = localStorage.getItem('portfolio_auth_token');
  if (currentToken) {
    console.log('✅ Token ya existe:', currentToken.substring(0, 20) + '...');
    return currentToken;
  }
  
  console.log('⚠️ No hay token, intentando obtener token de desarrollo...');
  
  try {    const response = await fetch('http://localhost:3000/api/auth/dev-token');
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('portfolio_auth_token', data.token);
      console.log('✅ Token de desarrollo obtenido:', data.token.substring(0, 20) + '...');
      return data.token;
    } else {
      console.log('❌ Error obteniendo token:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.log('❌ Error de red obteniendo token:', error.message);
    return null;
  }
};

// Paso 3: Navegar a la sección de experiencia
const navigateToExperience = () => {
  console.log('\n📍 PASO 3: Navegando a la sección de experiencia');
  
  // Intentar con hash
  window.location.hash = '#experience';
  console.log('🔗 Hash establecido a:', window.location.hash);
  
  // También intentar scroll manual a la sección
  setTimeout(() => {
    const experienceSection = document.getElementById('experience');
    if (experienceSection) {
      experienceSection.scrollIntoView({ behavior: 'smooth' });
      console.log('📜 Scroll a sección experience ejecutado');
    } else {
      console.log('❌ Sección experience no encontrada en el DOM');
    }
  }, 500);
};

// Paso 4: Verificar elementos admin en el DOM
const checkAdminElements = () => {
  console.log('\n🔍 PASO 4: Verificando elementos admin en el DOM');
  
  // Buscar todos los posibles botones admin
  const selectors = [
    '[class*="admin"]',
    '[id*="admin"]',
    'button[title*="Admin"]',
    'button[aria-label*="Admin"]',
    '[class*="fab"]',
    '[class*="floating"]',
    '.floating-action-button',
    'button[class*="float"]'
  ];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    console.log(`  ${selector}:`, elements.length, 'elementos');
    elements.forEach((el, i) => {
      console.log(`    ${i + 1}.`, {
        tag: el.tagName,
        className: el.className,
        id: el.id,
        visible: el.offsetParent !== null,
        text: el.textContent?.trim() || el.title || el.ariaLabel || 'Sin texto'
      });
    });
  });
};

// Paso 5: Verificar contextos React (si están disponibles en window para debug)
const checkReactContexts = () => {
  console.log('\n⚛️ PASO 5: Verificando contextos React');
  
  // Buscar el debug info component
  const debugInfo = document.querySelector('div[style*="position: fixed"][style*="top: 10px"]');
  if (debugInfo) {
    console.log('✅ DebugInfo component encontrado');
    console.log('📝 Contenido:', debugInfo.textContent);
  } else {
    console.log('❌ DebugInfo component NO encontrado');
  }
  
  // Verificar si hay algún log de React en la consola
  console.log('📋 Revisar logs anteriores para información de contextos React...');
};

// Función principal que ejecuta todos los pasos
const runFullTest = async () => {
  console.log('🚀 Ejecutando test completo del fix del botón admin...\n');
  
  // Paso 1 ya se ejecutó arriba
  
  // Paso 2: Token
  const token = await getTokenIfNeeded();
  
  if (token) {
    // Paso 3: Navegar
    navigateToExperience();
    
    // Esperar un poco para que React se actualice
    setTimeout(() => {
      // Paso 4: Verificar DOM
      checkAdminElements();
      
      // Paso 5: Verificar contextos
      checkReactContexts();
      
      console.log('\n✅ Test completo finalizado. Si no ves el botón admin, revisar los logs de React en la consola.');
    }, 2000);
  } else {
    console.log('\n❌ No se pudo obtener token, saltando pasos siguientes.');
    console.log('💡 Asegúrate de que el backend esté corriendo en localhost:3001');
  }
};

// Exportar funciones para uso manual
window.adminButtonTest = {
  getToken: getTokenIfNeeded,
  navigate: navigateToExperience,
  checkDOM: checkAdminElements,
  checkContexts: checkReactContexts,
  runAll: runFullTest
};

// Ejecutar test automáticamente
runFullTest();

console.log('\n📋 Funciones disponibles para testing manual:');
console.log('  • adminButtonTest.getToken() - Obtener token');
console.log('  • adminButtonTest.navigate() - Navegar a experiencia');
console.log('  • adminButtonTest.checkDOM() - Verificar elementos DOM');
console.log('  • adminButtonTest.checkContexts() - Verificar contextos React');
console.log('  • adminButtonTest.runAll() - Ejecutar test completo');
