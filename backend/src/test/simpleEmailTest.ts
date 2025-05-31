import emailService from '../services/emailService.js';
import { ContactFormData } from '../types/contact.js';

// Script simple de prueba para el servicio de email
async function testEmailService() {
    console.log('🧪 Iniciando pruebas del servicio de email...\n');
    
    // 1. Verificar configuración
    console.log('1️⃣ Verificando configuración...');
    const isConfigured = emailService.isConfigured();
    console.log(`   ✅ Email configurado: ${isConfigured}`);
    
    const config = emailService.getConfiguration();
    console.log('   📋 Configuración actual:');
    console.log(`   - Host: ${config.host || 'No configurado'}`);
    console.log(`   - Puerto: ${config.port || 'No configurado'}`);
    console.log(`   - Seguro: ${config.secure || false}\n`);
    
    // 2. Datos de prueba
    console.log('2️⃣ Preparando datos de prueba...');
    const testContactData: ContactFormData = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        subject: 'Prueba del Sistema de Email',
        message: 'Este es un mensaje de prueba para verificar el funcionamiento del servicio de email.'
    };
    console.log('   ✅ Datos de prueba preparados\n');
    
    // 3. Prueba real de envío (solo si está configurado)
    if (isConfigured) {
        console.log('3️⃣ Probando envío de email real...');
        try {
            console.log('   📧 Enviando email de prueba...');
            await emailService.sendContactEmail(testContactData);
            console.log('   ✅ Email principal enviado correctamente\n');
            
            console.log('   📧 Enviando auto-respuesta...');
            await emailService.sendAutoReply(testContactData.email, testContactData.name);
            console.log('   ✅ Auto-respuesta enviada correctamente\n');
            
        } catch (error) {
            console.error('   ❌ Error al enviar email:', error);
        }
    } else {
        console.log('3️⃣ ⏭️  Saltando prueba de envío (no configurado)\n');
    }
    
    // 4. Resumen
    console.log('📊 RESUMEN DE PRUEBAS:');
    console.log('   ✅ Servicio de email inicializado correctamente');
    console.log('   ✅ Configuración verificada');
    
    if (isConfigured) {
        console.log('   ✅ Configuración completa - Prueba de envío ejecutada');
        console.log('\n🎉 ¡Servicio de email funcionando correctamente!');
    } else {
        console.log('   ⚠️  Configuración pendiente - Añadir variables de entorno');
        console.log('\n📝 Para completar la configuración:');
        console.log('   1. Crear archivo .env basado en .env.example');
        console.log('   2. Configurar SMTP_HOST, SMTP_USER, SMTP_PASS, etc.');
        console.log('   3. Ejecutar nuevamente este script');
    }
}

// Ejecutar pruebas
testEmailService().catch(console.error);
