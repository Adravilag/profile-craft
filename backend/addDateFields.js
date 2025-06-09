// Script para agregar campos de fecha a la tabla projects
// Agrega campos para fechas de creación, actualización y fechas de proyecto

const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(process.cwd(), "data/profilecraft-database.db"));

function addDateFields() {
  console.log('🔄 Agregando campos de fecha a la tabla projects...');
  
  try {
    // Verificar si las columnas ya existen
    const tableInfo = db.prepare("PRAGMA table_info(projects)").all();
    const existingColumns = tableInfo.map(col => col.name);
    
    const newColumns = [
      { name: 'created_at', type: 'TEXT', default: "datetime('now')" },
      { name: 'updated_at', type: 'TEXT', default: "datetime('now')" },
      { name: 'project_start_date', type: 'TEXT' },
      { name: 'project_end_date', type: 'TEXT' },
      { name: 'last_read_at', type: 'TEXT' }
    ];
    
    let addedColumns = 0;
    
    // Agregar cada columna si no existe
    for (const column of newColumns) {
      if (!existingColumns.includes(column.name)) {
        const sql = `ALTER TABLE projects ADD COLUMN ${column.name} ${column.type}${column.default ? ` DEFAULT ${column.default}` : ''}`;
        console.log(`📅 Agregando columna: ${column.name}`);
        db.exec(sql);
        addedColumns++;
      } else {
        console.log(`✅ La columna ${column.name} ya existe`);
      }
    }
    
    // Actualizar campos created_at y updated_at para registros existentes que no los tengan
    if (addedColumns > 0) {
      console.log('🔄 Actualizando registros existentes...');
      
      const updateStmt = db.prepare(`
        UPDATE projects 
        SET created_at = datetime('now', '-' || (id * 7) || ' days'),
            updated_at = datetime('now', '-' || (id * 3) || ' days')
        WHERE created_at IS NULL OR updated_at IS NULL
      `);
      
      const result = updateStmt.run();
      console.log(`📊 Actualizados ${result.changes} registros con fechas estimadas`);
    }
    
    console.log(`\n✅ Migración completada:`);
    console.log(`   - Columnas agregadas: ${addedColumns}`);
    console.log(`   - Total de columnas de fecha: ${newColumns.length}`);
    
    // Mostrar estructura actualizada
    const updatedInfo = db.prepare("PRAGMA table_info(projects)").all();
    console.log(`\n📋 Estructura actual de la tabla projects:`);
    updatedInfo.forEach(col => {
      console.log(`   - ${col.name}: ${col.type}${col.dflt_value ? ` (default: ${col.dflt_value})` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    db.close();
  }
}

// Ejecutar migración
addDateFields();
