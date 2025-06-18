#!/usr/bin/env node

/**
 * Script para configurar el entorno de desarrollo del monorepo
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const PACKAGES = ['shared', 'ui'];
const APPS = ['frontend', 'backend'];

console.log('🚀 Configurando CV Maker Monorepo...\n');

// Instalar dependencias del root
console.log('📦 Instalando dependencias del workspace...');
execSync('npm install', { stdio: 'inherit' });

// Build packages compartidos
console.log('\n🔧 Construyendo packages compartidos...');
for (const pkg of PACKAGES) {
  const pkgPath = path.join(process.cwd(), 'packages', pkg);
  if (existsSync(pkgPath)) {
    console.log(`Building @cv-maker/${pkg}...`);
    execSync(`npm run build --workspace=@cv-maker/${pkg}`, { stdio: 'inherit' });
  }
}

// Verificar que las apps tengan sus dependencias
console.log('\n📱 Verificando aplicaciones...');
for (const app of APPS) {
  const appPath = path.join(process.cwd(), 'apps', app);
  if (existsSync(appPath)) {
    console.log(`✅ ${app} encontrada`);
  } else {
    console.log(`❌ ${app} no encontrada en apps/`);
  }
}

console.log('\n✨ ¡Configuración completada!');
console.log('\n🎯 Comandos disponibles:');
console.log('  npm run dev          - Ejecutar todo el stack');
console.log('  npm run dev:frontend - Solo frontend');
console.log('  npm run dev:backend  - Solo backend');
console.log('  npm run build        - Build todo');
console.log('  npm run test         - Ejecutar tests');
