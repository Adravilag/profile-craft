// Simulación del comportamiento de ExperienceAdmin en la consola del navegador
// Para copiar y pegar en la consola de desarrollo (F12) en localhost:5174

async function simulateExperienceAdminEducation() {
  console.log("🧪 Simulando carga de educación desde ExperienceAdmin...");
  
  try {
    // Simular la función getDynamicUserId como en el código real
    console.log("🔄 Simulando getDynamicUserId...");
    
    // 1. Verificar configuración de API
    console.log("API_CONFIG.IS_MONGODB:", true); // Como está configurado en el proyecto
    
    // 2. Obtener el primer usuario admin (como hace getFirstAdminUserId)
    const adminResponse = await fetch('http://localhost:3000/api/auth/first-admin-user');
    const adminData = await adminResponse.json();
    
    if (!adminData.success) {
      throw new Error('No admin user found');
    }
    
    const userId = adminData.user.id;
    console.log("✅ Usuario admin obtenido:", userId);
    
    // 3. Llamar a la API de educación como hace getEducation
    console.log("🔄 Llamando a API de educación para usuario:", userId);
    const educationResponse = await fetch(`http://localhost:3000/api/education?userId=${userId}`);
    const educationData = await educationResponse.json();
    
    console.log("✅ Respuesta de educación:", educationData);
    console.log("📊 Número de registros:", educationData?.length || 0);
    
    // 4. Verificar estructura de los datos
    if (educationData && educationData.length > 0) {
      console.log("🎯 Primer registro:");
      console.log(educationData[0]);
      
      console.log("🔍 Verificando campos requeridos del primer registro:");
      const firstRecord = educationData[0];
      console.log({
        _id: firstRecord._id,
        title: firstRecord.title,
        institution: firstRecord.institution,
        start_date: firstRecord.start_date,
        end_date: firstRecord.end_date
      });
      
      console.log("🎉 ¡Los datos se cargaron correctamente! Deberían mostrarse en la UI.");
    } else {
      console.warn("⚠️ No se encontraron datos de educación");
    }
    
  } catch (error) {
    console.error("❌ Error en simulación:", error);
  }
}

// Ejecutar la simulación
simulateExperienceAdminEducation();
