// Test para verificar las funciones de fecha corregidas
import { calculateDuration, formatDateRange, formatDateFromInput } from '../utils/dateUtils.js';

console.log('=== TESTING DATE UTILS ===');

// Test 1: Cálculo de duración con formato HTML5 (YYYY-MM)
console.log('\n1. Test calculateDuration con formato HTML5:');
const result1 = calculateDuration('2024-06', '2024-11');
console.log(`calculateDuration('2024-06', '2024-11') = "${result1}"`);
console.log(`Esperado: "5 meses"`);

// Test 2: Cálculo de duración con "presente"
console.log('\n2. Test calculateDuration con presente:');
const result2 = calculateDuration('2024-01', 'presente');
console.log(`calculateDuration('2024-01', 'presente') = "${result2}"`);

// Test 3: Formato de rango de fechas
console.log('\n3. Test formatDateRange con formato HTML5:');
const result3 = formatDateRange('2024-06', '2024-11');
console.log(`formatDateRange('2024-06', '2024-11') = "${result3}"`);
console.log(`Esperado: "Junio 2024 - Noviembre 2024"`);

// Test 4: Conversión de fecha HTML5 a formato legible
console.log('\n4. Test formatDateFromInput:');
const result4 = formatDateFromInput('2024-06');
console.log(`formatDateFromInput('2024-06') = "${result4}"`);
console.log(`Esperado: "Junio 2024"`);

// Test 5: Test con formato español existente
console.log('\n5. Test calculateDuration con formato español:');
const result5 = calculateDuration('Junio 2024', 'Noviembre 2024');
console.log(`calculateDuration('Junio 2024', 'Noviembre 2024') = "${result5}"`);
console.log(`Esperado: "5 meses"`);

console.log('\n=== TESTS COMPLETED ===');
