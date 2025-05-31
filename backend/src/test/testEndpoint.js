// Script para probar el endpoint de contacto
const testContactEndpoint = async () => {
    console.log('🧪 Probando endpoint de contacto...\n');
    
    const testData = {
        name: 'Juan Pérez',
        email: 'adrian.davilaguerra@gmail.com',
        subject: 'Prueba del Sistema de Email',
        message: 'Este es un mensaje de prueba para verificar que el servicio de email funciona correctamente desde el endpoint del backend.'
    };
    
    try {
        console.log('📤 Enviando solicitud POST a /api/contact...');
        console.log('Datos:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('\n📥 Respuesta recibida:');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        
        const result = await response.json();
        console.log('Body:', JSON.stringify(result, null, 2));
        
        if (response.ok) {
            console.log('\n✅ ¡Email enviado correctamente!');
            console.log('🎉 El servicio de email está funcionando perfectamente.');
        } else {
            console.log('\n❌ Error al enviar email');
            console.log('Revisar la configuración del servidor');
        }
        
    } catch (error) {
        console.error('\n❌ Error al hacer la solicitud:', error.message);
        console.log('\n📝 Posibles causas:');
        console.log('1. El servidor no está ejecutándose en puerto 3000');
        console.log('2. Problema de red o conectividad');
        console.log('3. Error en la configuración del endpoint');
    }
};

// Ejecutar la prueba
testContactEndpoint();
