// Test de formateo de fechas para verificar que funciona correctamente
import { formatDateFromInput, formatDateRange, calculateDuration } from '../src/utils/dateUtils';

console.log('=== PRUEBAS DE FORMATO DE FECHA ===');

// Pruebas de diferentes formatos de entrada
const testDates = [
  '2024-06',           // Formato HTML5 month
  '2024-06-15',        // Formato fecha completa
  '2023-12-01',        // Otra fecha completa
  'Enero 2024',        // Formato español antiguo
  'presente',          // Fecha actual
  'current',           // Fecha actual en inglés
  '',                  // Fecha vacía
  null,                // Fecha null
  undefined            // Fecha undefined
];

testDates.forEach(date => {
  console.log(`Entrada: "${date}" -> Resultado: "${formatDateFromInput(date)}"`);
});

console.log('\n=== PRUEBAS DE RANGO DE FECHAS ===');
console.log('Rango 1:', formatDateRange('2022-01-15', '2024-06-30'));
console.log('Rango 2:', formatDateRange('2023-03', 'presente'));
console.log('Rango 3:', formatDateRange('2020-12', '2022-05'));

console.log('\n=== PRUEBAS DE DURACIÓN ===');
console.log('Duración 1:', calculateDuration('2022-01', '2024-06'));
console.log('Duración 2:', calculateDuration('2023-03', 'presente'));
console.log('Duración 3:', calculateDuration('2020-12', '2022-05'));
