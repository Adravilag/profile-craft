#!/usr/bin/env node

/**
 * Script completo para migrar shared components
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

console.log('🚀 Iniciando migración de shared components...\n');

// 1. Construir packages
console.log('📦 Construyendo packages compartidos...');
try {
  execSync('npm run build --workspace=@cv-maker/shared', { stdio: 'inherit' });
  console.log('✅ @cv-maker/shared construido exitosamente');
} catch (error) {
  console.error('❌ Error construyendo @cv-maker/shared:', error.message);
}

try {
  execSync('npm run build --workspace=@cv-maker/ui', { stdio: 'inherit' });
  console.log('✅ @cv-maker/ui construido exitosamente');
} catch (error) {
  console.error('❌ Error construyendo @cv-maker/ui:', error.message);
}

// 2. Instalar dependencias
console.log('\n📥 Instalando dependencias...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias instaladas');
} catch (error) {
  console.error('❌ Error instalando dependencias:', error.message);
}

console.log('\n✨ Migración completada!');
console.log('\n📝 Próximos pasos manuales:');
console.log('1. Actualizar imports en archivos TypeScript/React');
console.log('2. Verificar que no hay errores de compilación');
console.log('3. Probar la aplicación');
console.log('4. Eliminar carpetas shared/components antiguas');

console.log('\n🎯 Comandos útiles:');
console.log('npm run dev:frontend  - Probar frontend');
console.log('npm run type-check    - Verificar tipos');
console.log('npm run build         - Construir todo');
