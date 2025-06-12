// Script para probar el endpoint de perfil autenticado con token de desarrollo
const fetch = require('node-fetch');

async function testAuthProfile() {
  try {
    console.log('🔍 Obteniendo token de desarrollo...');
    
    // Obtener token de desarrollo
    const tokenResponse = await fetch('http://localhost:3000/api/auth/dev-token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!tokenResponse.ok) {
      console.error('❌ Error obteniendo token:', tokenResponse.status);
      return;
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ Token obtenido exitosamente');
    console.log('👤 Usuario:', tokenData.user.name);
    
    // Probar endpoint de perfil autenticado
    console.log('📡 Probando endpoint de perfil autenticado...');
    const profileResponse = await fetch('http://localhost:3000/api/profile/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.token}`,
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
    console.log('💼 Título:', profileData.role_title);
    console.log('📝 Acerca de:', profileData.about_me?.substring(0, 50) + '...');
    console.log('🖼️ Imagen:', profileData.profile_image);
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testAuthProfile();
