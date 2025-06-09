// Script de migración para estandarizar los estados de proyectos en la base de datos
// Este script actualiza los valores de estado antiguos a los nuevos valores estandarizados

import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "data/profilecraft-database.db"));

// Mapeo de estados antiguos a nuevos
const STATE_MIGRATION = {
  // Valores actuales que pueden existir en la BD
  'Completado': 'Completado',
  'En desarrollo': 'En Desarrollo',
  'En progreso': 'En Desarrollo', 
  'Borrador': 'Borrador',
  'Pausado': 'Pausado',
  
  // Valores en minúscula que pueden existir
  'completado': 'Completado',
  'en-progreso': 'En Desarrollo',
  'en-desarrollo': 'En Desarrollo',
  'pausado': 'Pausado',
  'borrador': 'Borrador'
};

function migrateProjectStates() {
  console.log('🔄 Iniciando migración de estados de proyectos...');
  
  try {
    // Obtener todos los proyectos con sus estados actuales
    const projects = db.prepare('SELECT id, status FROM projects').all();
    
    console.log(`📊 Encontrados ${projects.length} proyectos para revisar`);
    
    let updatedCount = 0;
    
    for (const project of projects) {
      const currentStatus = project.status;
      const newStatus = STATE_MIGRATION[currentStatus];
      
      if (newStatus && newStatus !== currentStatus) {
        // Actualizar el estado del proyecto
        db.prepare('UPDATE projects SET status = ? WHERE id = ?').run(newStatus, project.id);
        console.log(`✅ Proyecto ${project.id}: "${currentStatus}" → "${newStatus}"`);
        updatedCount++;
      } else if (!newStatus) {
        console.log(`⚠️  Proyecto ${project.id}: Estado no reconocido "${currentStatus}"`);
      }
    }
    
    console.log(`\n📈 Migración completada:`);
    console.log(`   - Proyectos revisados: ${projects.length}`);
    console.log(`   - Proyectos actualizados: ${updatedCount}`);
    console.log(`   - Sin cambios: ${projects.length - updatedCount}`);
    
    // Mostrar resumen de estados actuales
    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM projects 
      GROUP BY status 
      ORDER BY count DESC
    `).all();
    
    console.log(`\n📊 Estados actuales en la base de datos:`);
    for (const { status, count } of statusCounts) {
      console.log(`   - ${status}: ${count} proyecto(s)`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    db.close();
  }
}

// Ejecutar migración si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateProjectStates();
}

export { migrateProjectStates };
