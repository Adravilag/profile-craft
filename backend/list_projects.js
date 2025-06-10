const Database = require('better-sqlite3');

try {
  const db = new Database('./data/profilecraft-database.db');
  
  // Verificar cuántos proyectos hay
  const count = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  console.log('Total de proyectos:', count.count);
  
  // Obtener todos los proyectos
  const projects = db.prepare('SELECT id, title, video_demo_url FROM projects LIMIT 5').all();
  console.log('Proyectos existentes:', projects);
  
  db.close();
} catch (error) {
  console.error('Error:', error.message);
}
