// Test directo de la API de educación desde el navegador
// Pegar en la consola del navegador (F12) cuando esté en localhost:5174

async function testEducationAPI() {
  console.log("🧪 Probando API de educación...");
  
  try {
    // 1. Obtener el ID del primer usuario admin
    const adminResponse = await fetch('http://localhost:3000/api/auth/first-admin-user');
    const adminData = await adminResponse.json();
    console.log("👤 Usuario admin:", adminData);
    
    if (!adminData.success) {
      throw new Error("No se pudo obtener el usuario admin");
    }
    
    const userId = adminData.user.id;
    console.log("🆔 ID de usuario:", userId);
    
    // 2. Obtener los datos de educación
    const educationResponse = await fetch(`http://localhost:3000/api/education?userId=${userId}`);
    const educationData = await educationResponse.json();
    console.log("🎓 Datos de educación:", educationData);
    
    console.log("📊 Total de registros:", educationData.length);
    
    if (educationData.length > 0) {
      console.log("✅ ¡API funcionando correctamente!");
      console.table(educationData);
    } else {
      console.warn("⚠️ No hay datos de educación");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Ejecutar el test
testEducationAPI();
