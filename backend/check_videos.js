const Database = require('better-sqlite3');

try {
  const db = new Database('./data/profilecraft-database.db');
  
  // Verificar proyectos con video
  const projects = db.prepare(`
    SELECT id, title, video_demo_url 
    FROM projects 
    WHERE video_demo_url IS NOT NULL 
    AND video_demo_url != ''
  `).all();
  
  console.log('Proyectos con video:', projects);
  
  // Si no hay videos, crear uno de prueba
  if (projects.length === 0) {
    console.log('No hay proyectos con video. Voy a actualizar uno...');
    
    // Obtener un proyecto existente
    const existingProject = db.prepare('SELECT id, title FROM projects LIMIT 1').get();
    if (existingProject) {
      // Actualizar con una URL de YouTube de ejemplo
      const updateStmt = db.prepare(`
        UPDATE projects 
        SET video_demo_url = ? 
        WHERE id = ?
      `);
      
      updateStmt.run('https://www.youtube.com/watch?v=dQw4w9WgXcQ', existingProject.id);
      console.log(`Proyecto "${existingProject.title}" actualizado con video demo`);
    }
  }
  
  db.close();
} catch (error) {
  console.error('Error:', error.message);
}
