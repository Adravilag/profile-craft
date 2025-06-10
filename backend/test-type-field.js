// test-type-field.js - Script para probar el nuevo campo type
import Database from 'better-sqlite3';

try {
  const db = new Database('./data/profilecraft-database.db');
  
  console.log('🔍 Verificando el campo type en la base de datos...\n');
  
  // Verificar la estructura de la tabla
  const tableInfo = db.prepare('PRAGMA table_info(projects)').all();
  const typeColumn = tableInfo.find(col => col.name === 'type');
  
  if (typeColumn) {
    console.log('✅ Columna type encontrada:', typeColumn);
  } else {
    console.log('❌ Columna type NO encontrada');
  }
  
  // Obtener todos los proyectos con su type
  const projects = db.prepare(`
    SELECT id, title, type, 
           LENGTH(COALESCE(article_content, '')) as content_length 
    FROM projects 
    ORDER BY id
  `).all();
  
  console.log('\n📊 Proyectos en la base de datos:');
  projects.forEach(project => {
    console.log(`- ID ${project.id}: "${project.title}"`);
    console.log(`  Tipo: ${project.type || 'NULL'}`);
    console.log(`  Contenido: ${project.content_length} caracteres`);
    console.log('');
  });
  
  // Estadísticas
  console.log('📈 Estadísticas:');
  const stats = db.prepare("SELECT type, COUNT(*) as count FROM projects GROUP BY type").all();
  stats.forEach(stat => {
    console.log(`- ${stat.type || 'NULL'}: ${stat.count} registros`);
  });
  
  db.close();
  console.log('\n✅ Verificación completada');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
