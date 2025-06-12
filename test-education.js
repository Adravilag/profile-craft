// Script de prueba para verificar getEducation
// Ejecutar en la consola del navegador: node test-education.js

import { getEducation } from './src/services/api.js';

async function testEducation() {
  try {
    console.log('🧪 Probando getEducation...');
    const data = await getEducation();
    console.log('✅ Datos obtenidos:', data);
    console.log('📊 Número de registros:', data.length);
    
    data.forEach((edu, index) => {
      console.log(`${index + 1}. ${edu.title} - ${edu.institution}`);
      console.log(`   ID: ${edu._id}`);
      console.log(`   Fechas: ${edu.start_date} - ${edu.end_date}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEducation();
