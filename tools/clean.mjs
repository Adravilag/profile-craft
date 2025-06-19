#!/usr/bin/env node

/**
 * Script para limpiar archivos build en todo el monorepo
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import path from 'path';

const CLEAN_PATHS = [
  'packages/shared/dist',
  'packages/ui/dist',
  'apps/frontend/dist',
  'apps/backend/dist-server',
  'node_modules/.cache'
];

console.log('🧹 Limpiando archivos build...\n');

for (const cleanPath of CLEAN_PATHS) {
  const fullPath = path.join(process.cwd(), cleanPath);
  if (existsSync(fullPath)) {
    console.log(`🗑️  Eliminando ${cleanPath}`);
    rmSync(fullPath, { recursive: true, force: true });
  }
}

console.log('\n✨ Limpieza completada!');
