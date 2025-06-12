// Test script para verificar la carga de educación en el frontend
// Ejecutar desde la consola del navegador

(async function testEducationLoad() {
  console.log("🧪 Test: Verificando carga de educación...");
  
  try {
    // Importar el servicio de API
    const { getEducation } = await import('/src/services/api.ts');
    
    console.log("📡 Llamando a getEducation()...");
    const educationData = await getEducation();
    
    console.log("✅ Datos de educación recibidos:");
    console.table(educationData);
    
    console.log("📊 Estadísticas:");
    console.log(`- Total de registros: ${educationData.length}`);
    console.log(`- Primer registro:`, educationData[0]);
    
    if (educationData.length > 0) {
      console.log("🎉 ¡La API de educación funciona correctamente!");
    } else {
      console.warn("⚠️ No se recibieron datos de educación");
    }
    
  } catch (error) {
    console.error("❌ Error en test de educación:", error);
  }
})();
