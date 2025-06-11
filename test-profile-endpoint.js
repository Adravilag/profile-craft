// Script de prueba para verificar el endpoint de perfil autenticado
async function testProfileEndpoint() {
  try {
    console.log('🔍 Probando endpoint de perfil autenticado...');
    
    // Primero hacer login para obtener token válido
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'adravilag-contact@gmail.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Error en login:', loginResponse.status);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso:', loginData);
    
    // Probar endpoint de perfil autenticado
    const profileResponse = await fetch('http://localhost:3000/api/profile/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!profileResponse.ok) {
      console.error('❌ Error obteniendo perfil:', profileResponse.status);
      const errorText = await profileResponse.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const profileData = await profileResponse.json();
    console.log('✅ Perfil obtenido exitosamente:');
    console.log('👤 Nombre:', profileData.name);
    console.log('📧 Email:', profileData.email);
    console.log('🖼️ Imagen:', profileData.profile_image);
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testProfileEndpoint();
