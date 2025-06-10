// Script para probar la funcionalidad de edición de artículos
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testEditArticle() {
  console.log('🧪 Probando funcionalidad de edición de artículos...\n');

  try {
    // 1. Obtener un artículo existente para editar
    console.log('1. Obteniendo lista de artículos...');
    const articlesResponse = await fetch(`${API_BASE}/admin/articles?userId=1`);
    
    if (!articlesResponse.ok) {
      console.log('❌ Error al obtener artículos:', articlesResponse.status);
      return;
    }
    
    const articles = await articlesResponse.json();
    console.log('✅ Obtenidos', articles.length, 'artículos');
    
    if (articles.length === 0) {
      console.log('❌ No hay artículos para probar');
      return;
    }
    
    const testArticle = articles[0];
    console.log('📄 Artículo a editar:', testArticle.id, '-', testArticle.title);
    
    // 2. Probar actualización del artículo
    console.log('\n2. Probando actualización...');
    
    const updateData = {
      ...testArticle,
      title: testArticle.title + ' (EDITADO)',
      description: testArticle.description + ' - Actualizado en ' + new Date().toLocaleString(),
      type: testArticle.type || 'proyecto'
    };
    
    console.log('📤 Datos a enviar:', JSON.stringify(updateData, null, 2));
    
    const updateResponse = await fetch(`${API_BASE}/admin/articles/${testArticle.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    if (updateResponse.ok) {
      const updatedArticle = await updateResponse.json();
      console.log('✅ Artículo actualizado exitosamente');
      console.log('📝 Título actualizado:', updatedArticle.title);
      console.log('📝 Descripción actualizada:', updatedArticle.description);
    } else {
      const errorText = await updateResponse.text();
      console.log('❌ Error al actualizar artículo:', updateResponse.status);
      console.log('❌ Mensaje de error:', errorText);
    }
    
    // 3. Verificar que el cambio se guardó
    console.log('\n3. Verificando cambios...');
    const verifyResponse = await fetch(`${API_BASE}/articles/${testArticle.id}`);
    
    if (verifyResponse.ok) {
      const verifiedArticle = await verifyResponse.json();
      console.log('✅ Verificación exitosa');
      console.log('📄 Título actual:', verifiedArticle.title);
      console.log('📄 Descripción actual:', verifiedArticle.description);
    } else {
      console.log('❌ Error al verificar:', verifyResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar prueba
testEditArticle();
