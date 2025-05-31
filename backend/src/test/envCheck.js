import { config } from 'dotenv';

// Cargar variables de entorno
config();

console.log('🧪 Iniciando pruebas del servicio de email...\n');

// Verificar variables de entorno
console.log('📋 Variables de entorno configuradas:');
console.log('SMTP_HOST:', process.env.SMTP_HOST || 'No configurado');
console.log('SMTP_PORT:', process.env.SMTP_PORT || 'No configurado');
console.log('SMTP_USER:', process.env.SMTP_USER || 'No configurado');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Configurado' : '❌ No configurado');
console.log('CONTACT_EMAIL:', process.env.CONTACT_EMAIL || 'No configurado');

console.log('\n✅ Test básico completado');
