// analyze.ts

import { promises as fs } from 'fs';
import * as path from 'path';
import fg from 'fast-glob';

interface FileMap {
  [filePath: string]: Set<string>;
}

/**
 * Obtiene todos los archivos que coincidan con las extensiones indicadas,
 * partiendo de los directorios raíz pasados en `roots`, y excluyendo node_modules.
 */
async function getAllFiles(
  roots: string[],
  exts: string[]
): Promise<string[]> {
  // Construimos patrones de búsqueda para fast-glob:
  //   - Cada root + /**/*ext
  //   - Excluir node_modules con ignore
  const patterns = roots
    .map((r) => exts.map((ext) => path.posix.join(r.replace(/\\/g, '/'), `**/*${ext}`)))
    .flat();

  return fg(patterns, {
    dot: true,
    onlyFiles: true,
    unique: true,
    ignore: ['**/node_modules/**']
  });
}

async function readFileSafe(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return '';
  }
}

/**
 * Extrae rutas de import (estáticos y básicos dinámicos) de un fichero de texto.
 */
function extractImports(content: string): string[] {
  const importPaths: string[] = [];
  const staticRe = /import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g;
  const dynamicRe = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match: RegExpExecArray | null;
  while ((match = staticRe.exec(content))) {
    importPaths.push(match[1]);
  }
  while ((match = dynamicRe.exec(content))) {
    importPaths.push(match[1]);
  }
  return importPaths;
}

/**
 * Construye un grafo de dependencias donde cada clave es la ruta absoluta
 * de un fichero real (TSX/JS/TS/JSX/etc.) o un nodo "__BROKEN_IMPORT__:<ruta>",
 * y el valor es el set de ficheros que lo importan.
 */
async function buildImportGraph(
  tsxFiles: string[],
  jsFiles: string[]
): Promise<FileMap> {
  const graph: FileMap = {};
  const allFiles = [...tsxFiles, ...jsFiles];
  for (const file of allFiles) {
    graph[file] = new Set();
  }

  for (const file of allFiles) {
    const text = await readFileSafe(file);
    const imports = extractImports(text);
    for (let imp of imports) {
      // Solo procesamos imports locales (./ o ../ o /)
      if (imp.startsWith('.') || imp.startsWith('/')) {
        const dir = path.dirname(file);
        let resolved = '';
        // Probamos varias extensiones/combinaciones para resolver el import local
        const candidates = [
          `${imp}.tsx`,
          `${imp}.ts`,
          `${imp}.jsx`,
          `${imp}.js`,
          `${imp}.json`,
          `${imp}.css`,
          path.join(imp, 'index.tsx'),
          path.join(imp, 'index.ts'),
          path.join(imp, 'index.jsx'),
          path.join(imp, 'index.js'),
        ];
        for (const c of candidates) {
          const full = path.resolve(dir, c);
          try {
            await fs.access(full);
            resolved = full;
            break;
          } catch {
            continue;
          }
        }
        if (resolved) {
          graph[resolved]?.add(file);
        } else {
          // Si no se resolvió ningún fichero, lo marcamos como broken
          const fakeKey = `__BROKEN_IMPORT__:${path.resolve(dir, imp)}`;
          if (!graph[fakeKey]) graph[fakeKey] = new Set();
          graph[fakeKey].add(file);
        }
      }
      // Imports a paquetes npm (sin ./ ni ../) se ignoran
    }
  }
  return graph;
}

/**
 * Encuentra aquellos ficheros “reales” (no "__BROKEN_IMPORT__") sin entradas
 * en el grafo (i.e. sin que ningún otro fichero los importe).
 */
async function findUnusedFiles(graph: FileMap): Promise<string[]> {
  return Object.entries(graph)
    .filter(([file, parents]) => {
      if (file.startsWith('__BROKEN_IMPORT__')) return false;
      return parents.size === 0;
    })
    .map(([file]) => file);
}

/**
 * Extrae todas las clases CSS de un contenido de fichero .css.
 */
function extractCssClasses(cssContent: string): Set<string> {
  const classRe = /\.([\w-]+)/g;
  const classes = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = classRe.exec(cssContent))) {
    classes.add(match[1]);
  }
  return classes;
}

/**
 * Para cada clase CSS definida en los cssFiles, indica si aparece (uso) en
 * alguno de los ficheros TSX/JS/TS/JSX.
 */
async function findCssClassesUsage(
  cssFiles: string[],
  tsxFiles: string[],
  jsFiles: string[]
): Promise<{ [cls: string]: boolean }> {
  // 1) Recolectar todas las clases definidas
  const defined = new Set<string>();
  for (const cssFile of cssFiles) {
    const text = await readFileSafe(cssFile);
    const classesInFile = extractCssClasses(text);
    for (const cls of classesInFile) defined.add(cls);
  }

  // 2) Inicializar mapa de uso en falso
  const usageMap: { [cls: string]: boolean } = {};
  defined.forEach((cls) => (usageMap[cls] = false));

  // 3) Leer todos los TSX/JS/TS/JSX y buscar si aparece la clase
  const codeFiles = [...tsxFiles, ...jsFiles];
  for (const file of codeFiles) {
    const text = await readFileSafe(file);
    for (const cls of defined) {
      // Buscamos en: className="... cls ..." , `... cls ...` o .cls en strings/plantillas
      const regex = new RegExp(
        `(?:class(Name)?\\s*=\\s*["'\`][^"'\\\`]*\\b${cls}\\b[^"'\\\`]*["'\`])|(\`.*\\b${cls}\\b.*\`)|(\\.${cls}\\b)`,
        'g'
      );
      if (regex.test(text)) {
        usageMap[cls] = true;
      }
    }
  }
  return usageMap;
}

async function main() {
  // Tomamos argumentos desde CLI, p.ej.: ts-node analyze.ts src otro-dir
  const args = process.argv.slice(2);
  const roots = args.length > 0 ? args : ['src'];

  // 1) Colectamos archivos TSX/TS/JS/JSX y CSS, excluyendo node_modules
  const tsxFiles = await getAllFiles(roots, ['.tsx', '.ts', '.jsx', '.js']);
  const cssFiles = await getAllFiles(roots, ['.css']);

  // 2) Construimos grafo de imports (pasamos tsxFiles tanto a “tsx” como a “js” para simplificar)
  console.log('🛠️  Construyendo grafo de imports...');
  const importGraph = await buildImportGraph(tsxFiles, tsxFiles);

  // 3) Detectamos imports rotos
  const brokenImports = Object.entries(importGraph)
    .filter(([file]) => file.startsWith('__BROKEN_IMPORT__'))
    .map(([file, parents]) => ({
      importPath: file.replace('__BROKEN_IMPORT__:', ''),
      fromFiles: Array.from(parents),
    }));
  if (brokenImports.length > 0) {
    console.log('\n❌ Imports rotos detectados:');
    brokenImports.forEach((bi) => {
      console.log(`- Ruta no encontrada: ${bi.importPath}`);
      bi.fromFiles.forEach((f) =>
        console.log(`    importado en ➜ ${path.relative(process.cwd(), f)}`)
      );
    });
  } else {
    console.log('\n✅ No se detectaron imports rotos.');
  }

  // 4) Detectamos archivos TS/TSX/JS/JSX “sin usar” (sin dependencias entrantes)
  const unusedFiles = await findUnusedFiles(importGraph);
  if (unusedFiles.length > 0) {
    console.log('\n🗑️  Archivos TS/TSX/JS/JSX sin importar en ningún otro:');
    unusedFiles.forEach((f) => {
      console.log(`- ${path.relative(process.cwd(), f)}`);
    });
  } else {
    console.log('\n✅ No se detectaron archivos sin uso.');
  }

  // 5) Detectamos clases CSS sin uso en el código
  console.log('\n🔍 Analizando clases CSS...');
  const cssUsage = await findCssClassesUsage(cssFiles, tsxFiles, tsxFiles);
  const unusedCss = Object.entries(cssUsage)
    .filter(([_, used]) => !used)
    .map(([cls]) => cls);

  if (unusedCss.length > 0) {
    console.log('\n🎨 Clases CSS sin uso detectadas:');
    unusedCss.forEach((cls) => console.log(`- .${cls}`));
  } else {
    console.log('\n✅ No se encontraron clases CSS huérfanas.');
  }
}

main().catch((err) => {
  console.error('❗ Error en ejecución:', err);
  process.exit(1);
});
