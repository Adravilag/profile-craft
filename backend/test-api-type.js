// test-api-type.js - Script para probar las APIs con el nuevo campo type
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testAPIs() {
  console.log('🧪 Probando APIs con el nuevo campo type...\n');

  try {
    // 1. Probar GET /admin/articles
    console.log('1. Probando GET /admin/articles...');
    const articlesResponse = await fetch(`${API_BASE}/admin/articles?userId=1`);
    
    if (articlesResponse.ok) {
      const articles = await articlesResponse.json();
      console.log('✅ GET /admin/articles exitoso');
      console.log(`   Obtenidos ${articles.length} artículos`);
      
      if (articles.length > 0) {
        const firstArticle = articles[0];
        console.log(`   Primer artículo - ID: ${firstArticle.id}, Tipo: ${firstArticle.type || 'NULL'}`);
      }
    } else {
      console.log('❌ Error en GET /admin/articles:', articlesResponse.status);
    }

    // 2. Probar GET /articles/{id}
    console.log('\n2. Probando GET /articles/15...');
    const singleArticleResponse = await fetch(`${API_BASE}/articles/15`);
    
    if (singleArticleResponse.ok) {
      const article = await singleArticleResponse.json();
      console.log('✅ GET /articles/15 exitoso');
      console.log(`   Artículo: "${article.title}"`);
      console.log(`   Tipo: ${article.type || 'NULL'}`);
    } else {
      console.log('❌ Error en GET /articles/15:', singleArticleResponse.status);
    }

    console.log('\n✅ Pruebas de API completadas');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
testAPIs();
