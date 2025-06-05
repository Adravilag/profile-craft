const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando análisis de archivos...');

// Lista simple de algunos archivos para probar
const testFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/components/VideoPlayer.tsx'
];

console.log('Archivos a analizar:', testFiles);

const srcDir = './src';

function getAllFiles(dir, files = []) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        getAllFiles(fullPath, files);
      } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error('Error leyendo directorio:', error.message);
  }
  return files;
}

const allFiles = getAllFiles(srcDir);
console.log(`Found ${allFiles.length} files in src directory`);

for (const testFile of testFiles) {
  const exists = fs.existsSync(testFile);
  console.log(`${testFile}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
}

console.log('Análisis completado.');
