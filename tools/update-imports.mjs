#!/usr/bin/env node

/**
 * Script para actualizar imports de shared components a @cv-maker/ui
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const FRONTEND_SRC = 'apps/frontend/src';

// Mapeo de imports antiguos a nuevos
const IMPORT_MAPPINGS = {
  // Common components
  'from "../../shared/common/': 'from "@cv-maker/ui";',
  'from "../shared/common/': 'from "@cv-maker/ui";',
  'from "./shared/common/': 'from "@cv-maker/ui";',
  
  // UI components
  'from "../../shared/ui/': 'from "@cv-maker/ui";',
  'from "../shared/ui/': 'from "@cv-maker/ui";',
  'from "./shared/ui/': 'from "@cv-maker/ui";',
  
  // Navigation components
  'from "../../shared/navigation/': 'from "@cv-maker/ui";',
  'from "../shared/navigation/': 'from "@cv-maker/ui";',
  'from "./shared/navigation/': 'from "@cv-maker/ui";',
  
  // Debug components
  'from "../../shared/debug/': 'from "@cv-maker/ui";',
  'from "../shared/debug/': 'from "@cv-maker/ui";',
  'from "./shared/debug/': 'from "@cv-maker/ui";',
};

console.log('🔄 Actualizando imports de shared components...\n');

// Buscar todos los archivos TypeScript/React
const files = glob.sync(`${FRONTEND_SRC}/**/*.{ts,tsx}`, { ignore: ['**/node_modules/**'] });

let updatedFiles = 0;

for (const filePath of files) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Aplicar cada mapeo
    for (const [oldImport, newImport] of Object.entries(IMPORT_MAPPINGS)) {
      if (content.includes(oldImport)) {
        // Extraer el componente del import
        const regex = new RegExp(`import\\s+([^\\s]+)\\s+${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^"']+)["'];`, 'g');
        content = content.replace(regex, (match, componentName) => {
          return `import { ${componentName} } ${newImport}`;
        });
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Actualizado: ${path.relative(process.cwd(), filePath)}`);
      updatedFiles++;
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

console.log(`\n🎉 Actualizados ${updatedFiles} archivos!`);
console.log('\n📝 Nota: Verifica que no haya imports duplicados y ajusta manualmente si es necesario.');
