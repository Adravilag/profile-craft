// Script para actualizar el usuario con la URL de Cloudinary
const { User } = require('../backend/dist-server/src/models/index.js');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });

async function updateUserProfileImage() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    const cloudinaryUrl = 'https://res.cloudinary.com/dtdnfd2ku/image/upload/v1749674157/perfil/perfil/foto-perfil-adrian.jpg';
    
    console.log('👤 Actualizando usuario con URL de Cloudinary...');
    const result = await User.findOneAndUpdate(
      { email: 'adravilag-contact@gmail.com' },
      { 
        profile_image: cloudinaryUrl,
        updated_at: new Date()
      },
      { new: true }
    );
    
    if (result) {
      console.log('✅ Usuario actualizado exitosamente:');
      console.log('📧 Email:', result.email);
      console.log('👤 Nombre:', result.name);
      console.log('🖼️ Imagen:', result.profile_image);
    } else {
      console.log('❌ Usuario no encontrado');
    }
    
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateUserProfileImage()
  .then(() => {
    console.log('\n🎉 Proceso completado!');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Error:', err);
    process.exit(1);
  });
