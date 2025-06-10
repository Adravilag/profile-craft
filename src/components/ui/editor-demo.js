// Demostración de las nuevas funcionalidades del editor
// Este script puede ser usado para testing y demostración

console.log('🚀 Iniciando demostración del Editor HTML Avanzado');
console.log('📝 Funcionalidades implementadas:');
console.log('  ✅ Vista dividida horizontal');
console.log('  ✅ Vista dividida vertical');
console.log('  ✅ Ventana externa de vista previa');
console.log('  ✅ Diseño responsivo mejorado');
console.log('  ✅ Indicadores de estado');

// Función para simular cambios en el editor
function simulateEditorChanges() {
  const sampleContent = [
    '<h1>Título Principal</h1><p>Contenido de ejemplo para demostrar las vistas divididas.</p>',
    '<h2>Subtítulo</h2><p>Las vistas divididas permiten ver el código y el resultado simultáneamente.</p>',
    '<h3>Lista de características</h3><ul><li>Vista horizontal</li><li>Vista vertical</li><li>Ventana externa</li></ul>',
    '<blockquote>La ventana externa es perfecta para configuraciones de doble monitor.</blockquote>',
    '<p>El editor se adapta automáticamente a diferentes tamaños de pantalla.</p>'
  ];

  return sampleContent[Math.floor(Math.random() * sampleContent.length)];
}

// Función para testing de responsividad
function testResponsiveBreakpoints() {
  const breakpoints = [
    { width: 1200, description: 'Escritorio grande' },
    { width: 768, description: 'Tablet' },
    { width: 480, description: 'Móvil' },
    { width: 320, description: 'Móvil pequeño' }
  ];

  console.log('📱 Testing responsive breakpoints:');
  breakpoints.forEach(bp => {
    console.log(`  ${bp.width}px: ${bp.description}`);
  });
}

// Función para simular apertura de ventana externa
function simulateExternalWindow() {
  console.log('🖥️ Simulando apertura de ventana externa...');
  console.log('  - Ventana configurada con estilos CSS integrados');
  console.log('  - Función de actualización automática establecida');
  console.log('  - Listener de cierre de ventana activado');
  console.log('  - Indicador de estado activo');
}

// Demostración de modos de vista
function demonstrateViewModes() {
  const modes = [
    { id: 'edit', name: 'Solo Edición', icon: 'fas fa-edit' },
    { id: 'preview', name: 'Solo Vista Previa', icon: 'fas fa-eye' },
    { id: 'split-horizontal', name: 'Dividido Horizontal', icon: 'fas fa-window-minimize' },
    { id: 'split-vertical', name: 'Dividido Vertical', icon: 'fas fa-columns' },
    { id: 'external', name: 'Ventana Externa', icon: 'fas fa-external-link-alt' }
  ];

  console.log('🎛️ Modos de vista disponibles:');
  modes.forEach(mode => {
    console.log(`  ${mode.icon} ${mode.name} (${mode.id})`);
  });
}

// Función principal de demostración
function runDemo() {
  console.log('\n🎬 Ejecutando demostración completa...\n');
  
  demonstrateViewModes();
  console.log('');
  
  testResponsiveBreakpoints();
  console.log('');
  
  simulateExternalWindow();
  console.log('');
  
  console.log('📄 Contenido de ejemplo:');
  console.log(`"${simulateEditorChanges()}"`);
  console.log('');
  
  console.log('✨ Demostración completada. El editor está listo para usar!');
}

// Exportar funciones para uso en testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    simulateEditorChanges,
    testResponsiveBreakpoints,
    simulateExternalWindow,
    demonstrateViewModes,
    runDemo
  };
}

// Ejecutar demostración si se carga directamente
if (typeof window !== 'undefined') {
  // En el navegador
  runDemo();
} else if (typeof process !== 'undefined' && process.argv[1] === __filename) {
  // En Node.js
  runDemo();
}
