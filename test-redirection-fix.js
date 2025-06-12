// Test para verificar la solución del bucle de redirección
// Ejecutar en la consola del navegador

console.log('🔧 VERIFICACIÓN DE BUCLE DE REDIRECCIÓN');
console.log('=======================================');

// 1. Información del entorno actual
const checkEnvironment = () => {
  console.log('\n📍 INFORMACIÓN DEL ENTORNO:');
  console.log('• Hostname:', window.location.hostname);
  console.log('• URL completa:', window.location.href);
  console.log('• Pathname:', window.location.pathname);
  console.log('• Port:', window.location.port);
  
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const expectedBasename = isLocalDev ? '' : '/profile-craft';
  
  console.log('• Es desarrollo local:', isLocalDev);
  console.log('• Basename esperado:', expectedBasename || '(vacío)');
};

// 2. Verificar que no hay redirecciones infinitas
const checkRedirectionLoop = () => {
  console.log('\n🔄 VERIFICACIÓN DE REDIRECCIONES:');
  
  let redirectCount = 0;
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;
  
  // Interceptar cambios de historia
  window.history.pushState = function(...args) {
    redirectCount++;
    console.log(`• pushState #${redirectCount}:`, args[2]);
    if (redirectCount > 3) {
      console.error('⚠️ POSIBLE BUCLE DETECTADO: Más de 3 redirecciones');
    }
    return originalPushState.apply(this, args);
  };
  
  window.history.replaceState = function(...args) {
    redirectCount++;
    console.log(`• replaceState #${redirectCount}:`, args[2]);
    if (redirectCount > 3) {
      console.error('⚠️ POSIBLE BUCLE DETECTADO: Más de 3 redirecciones');
    }
    return originalReplaceState.apply(this, args);
  };
  
  // Restaurar después de 5 segundos
  setTimeout(() => {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    
    if (redirectCount === 0) {
      console.log('✅ NO SE DETECTARON REDIRECCIONES AUTOMÁTICAS');
    } else if (redirectCount <= 2) {
      console.log(`✅ REDIRECCIONES NORMALES: ${redirectCount} (acceptable)`);
    } else {
      console.log(`⚠️ MUCHAS REDIRECCIONES: ${redirectCount} (revisar)`);
    }
  }, 5000);
};

// 3. Verificar navegación manual
const testManualNavigation = () => {
  console.log('\n🧭 PRUEBA DE NAVEGACIÓN MANUAL:');
  console.log('Ejecuta estos comandos manualmente:');
  console.log('window.testNavigation.goToRoot()');
  console.log('window.testNavigation.goToExperience()');
  console.log('window.testNavigation.goToAbout()');
};

// Funciones de prueba de navegación
window.testNavigation = {
  goToRoot: () => {
    console.log('Navegando a raíz...');
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  },
  
  goToExperience: () => {
    console.log('Navegando a experience...');
    window.history.pushState({}, '', '/experience');
    window.dispatchEvent(new PopStateEvent('popstate'));
  },
  
  goToAbout: () => {
    console.log('Navegando a about...');
    window.history.pushState({}, '', '/about');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
};

// 4. Verificar estado del NavigationContext
const checkNavigationContext = () => {
  console.log('\n🔍 ESTADO DEL NAVIGATION CONTEXT:');
  
  const bodySection = document.body.getAttribute('data-active-section');
  console.log('• data-active-section:', bodySection);
  
  // Verificar que no hay bucles en scroll
  let scrollEvents = 0;
  const handleScroll = () => {
    scrollEvents++;
    if (scrollEvents > 50) {
      console.error('⚠️ DEMASIADOS EVENTOS DE SCROLL, posible bucle');
      window.removeEventListener('scroll', handleScroll);
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  setTimeout(() => {
    window.removeEventListener('scroll', handleScroll);
    console.log(`• Eventos de scroll en 3s: ${scrollEvents}`);
  }, 3000);
};

// Ejecutar todas las verificaciones
checkEnvironment();
checkRedirectionLoop();
testManualNavigation();
checkNavigationContext();

console.log('\n⏱️ Verificaciones ejecutándose... Resultados en 5 segundos');
