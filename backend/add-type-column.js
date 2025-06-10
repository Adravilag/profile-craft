// Migración para agregar columna 'type' a la tabla projects
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('./data/profilecraft-database.db');

console.log('🔧 Agregando columna type a la tabla projects...');

try {
    // Agregar la nueva columna
    db.exec("ALTER TABLE projects ADD COLUMN type TEXT DEFAULT 'proyecto'");
    console.log('✅ Columna type agregada exitosamente');
    
    // Verificar que se agregó correctamente
    const tableInfo = db.prepare('PRAGMA table_info(projects)').all();
    const typeColumn = tableInfo.find(col => col.name === 'type');
    if (typeColumn) {
        console.log('✅ Verificación exitosa: columna type existe');
        console.log(`- type: ${typeColumn.type} (DEFAULT: proyecto)`);
    }

    // Actualizar registros existentes basado en la lógica actual
    console.log('\n📝 Actualizando registros existentes...');
    const updateStmt = db.prepare(`UPDATE projects SET type = CASE 
        WHEN article_content IS NULL OR LENGTH(article_content) < 500 THEN 'proyecto' 
        ELSE 'articulo' 
    END`);
    const result = updateStmt.run();
    console.log(`✅ Actualizados ${result.changes} registros`);

    // Mostrar algunos ejemplos
    const examples = db.prepare(`SELECT id, title, type, LENGTH(COALESCE(article_content, '')) as content_length FROM projects LIMIT 5`).all();
    console.log('\n📊 Ejemplos de registros actualizados:');
    examples.forEach(row => {
        console.log(`- ID ${row.id}: ${row.title} -> ${row.type} (contenido: ${row.content_length} chars)`);
    });

    // Mostrar estadísticas
    console.log('\n📈 Estadísticas:');
    const stats = db.prepare("SELECT type, COUNT(*) as count FROM projects GROUP BY type").all();
    stats.forEach(stat => {
        console.log(`- ${stat.type}: ${stat.count} registros`);
    });

} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('ℹ️  La columna type ya existe');
        
        // Si ya existe, mostrar estadísticas
        console.log('\n📈 Estadísticas actuales:');
        const stats = db.prepare("SELECT type, COUNT(*) as count FROM projects GROUP BY type").all();
        stats.forEach(stat => {
            console.log(`- ${stat.type}: ${stat.count} registros`);
        });
    } else {
        console.error('❌ Error:', error.message);
    }
}

db.close();
console.log('\n🎉 Proceso completado');
