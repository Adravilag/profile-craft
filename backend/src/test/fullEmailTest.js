import { config } from 'dotenv';
import nodemailer from 'nodemailer';

// Cargar variables de entorno
config();

console.log('🧪 Iniciando pruebas completas del servicio de email...\n');

async function testEmailService() {
    try {
        // 1. Verificar configuración
        console.log('1️⃣ Verificando configuración...');
        console.log('SMTP_HOST:', process.env.SMTP_HOST || 'No configurado');
        console.log('SMTP_PORT:', process.env.SMTP_PORT || 'No configurado');
        console.log('SMTP_USER:', process.env.SMTP_USER || 'No configurado');
        console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Configurado' : '❌ No configurado');
        console.log('CONTACT_EMAIL:', process.env.CONTACT_EMAIL || 'No configurado');
        console.log();

        // 2. Crear transporter
        console.log('2️⃣ Creando transporter SMTP...');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log('✅ Transporter creado correctamente\n');

        // 3. Verificar conexión
        console.log('3️⃣ Verificando conexión SMTP...');
        try {
            await transporter.verify();
            console.log('✅ Conexión SMTP verificada correctamente\n');
        } catch (error) {
            console.error('❌ Error al verificar conexión SMTP:', error.message);
            return;
        }

        // 4. Enviar email de prueba
        console.log('4️⃣ Enviando email de prueba...');
        const testEmailOptions = {
            from: `"Test CV Maker" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_EMAIL,
            subject: 'Prueba del Sistema de Email CV Maker',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6750a4;">🧪 Prueba del Sistema de Email</h2>
                    <p>Este es un email de prueba para verificar que el servicio de email está funcionando correctamente.</p>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Información de la prueba:</h3>
                        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
                        <p><strong>Host SMTP:</strong> ${process.env.SMTP_HOST}</p>
                        <p><strong>Puerto:</strong> ${process.env.SMTP_PORT}</p>
                    </div>
                    <p>Si recibes este email, el sistema está funcionando perfectamente! 🎉</p>
                </div>
            `,
            text: `
                🧪 Prueba del Sistema de Email CV Maker
                
                Este es un email de prueba para verificar que el servicio de email está funcionando correctamente.
                
                Información de la prueba:
                Fecha: ${new Date().toLocaleString('es-ES')}
                Host SMTP: ${process.env.SMTP_HOST}
                Puerto: ${process.env.SMTP_PORT}
                
                Si recibes este email, el sistema está funcionando perfectamente! 🎉
            `
        };

        const info = await transporter.sendMail(testEmailOptions);
        console.log('✅ Email de prueba enviado correctamente!');
        console.log('📧 Message ID:', info.messageId);
        console.log();

        // 5. Resumen
        console.log('📊 RESUMEN DE PRUEBAS:');
        console.log('✅ Configuración correcta');
        console.log('✅ Conexión SMTP establecida');
        console.log('✅ Email de prueba enviado');
        console.log('\n🎉 ¡Servicio de email funcionando perfectamente!\n');
        
        console.log('📝 PRÓXIMOS PASOS:');
        console.log('1. ✅ Configuración de SMTP - COMPLETADO');
        console.log('2. ✅ Verificación de conexión - COMPLETADO');
        console.log('3. ✅ Envío de email - COMPLETADO');
        console.log('4. 🔄 Probar endpoint /api/contact desde el frontend');
        console.log('5. 🔄 Verificar integración completa');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
}

// Ejecutar pruebas
testEmailService();
