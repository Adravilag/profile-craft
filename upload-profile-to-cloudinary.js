// Script para subir la foto de perfil a Cloudinary
const { v2: cloudinary } = require('cloudinary');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

console.log('🔧 Variables de entorno:');
console.log('Cloud Name:', process.env.VITE_CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.VITE_CLOUDINARY_API_KEY ? '***configurado***' : 'NO CONFIGURADO');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
});

async function uploadProfileImage() {
  try {
    console.log('📸 Subiendo foto de perfil a Cloudinary...');
    
    const imagePath = path.join(__dirname, 'public', 'assets', 'images', 'foto-perfil.jpg');
    console.log('📂 Ruta de imagen:', imagePath);
    
    const result = await cloudinary.uploader.upload(imagePath, {
      public_id: 'perfil/foto-perfil-adrian',
      folder: 'perfil',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    
    console.log('✅ Imagen subida exitosamente:');
    console.log('📱 URL:', result.secure_url);
    console.log('🆔 Public ID:', result.public_id);
    
    return result.secure_url;
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error);
    throw error;
  }
}

uploadProfileImage()
  .then(url => {
    console.log('\n🎉 Proceso completado!');
    console.log('🔗 URL para actualizar en la base de datos:', url);
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Error:', err);
    process.exit(1);
  });
