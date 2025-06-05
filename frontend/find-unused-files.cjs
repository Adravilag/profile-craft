/**
 * find-unused-files.cjs
 *
 * Detecta qué ficheros (.ts, .tsx, .js, .jsx) dentro de src/ NO
 * aparecen en ningún import (ES6) ni require (CommonJS).  
 * 
 * Incluye lógica extra para:
 *   - Archivos index.ts(x) que se importan como "./components" en lugar
 *     de "./components/index".
 *   - Omitir deliberadamente archivos “entry” convencionales de Vite/React,
 *     como main.tsx o App.tsx, que no se importan desde otro archivo JS/TS
 *     sino que los carga index.html/bundler.
 *
 * Ejecución:
 *   cd D:\Profesional\cv-maker\frontend
 *   node find-unused-files.cjs
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');

// ------------- CONFIGURACIÓN ---------------

// Carpeta raíz donde buscar los ficheros “target” (los que queremos ver si están sin usar)
const SRC_DIR = path.resolve(__dirname, 'src');

// Extensiones a considerar como “archivos de código” en src y en el resto del proyecto:
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Carpetas que NO queremos explorar al buscar “todos los archivos fuente”
// (para extraer imports/require)
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', '.git'];

// Archivos “especiales” que sabemos que Vite/React cargan desde index.html
// (no se importan en ningún otro `.ts(x)` o `.js(x)`, pero sí los usa la app).
// Por ejemplo, main.tsx y App.tsx son entry points en React + Vite.
const ENTRY_POINTS = [
  path.normalize('src/main.tsx'),
  path.normalize('src/App.tsx'),
];



// -------------- FUNCIONES AUXILIARES ------------------

/**
 * 1) Lista absoluta de todos los archivos de código dentro de src/
 *    (ficheros .ts, .tsx, .js o .jsx).
 */
function getAllFilesInSrc() {
  return glob
    .sync(`**/*{${EXTENSIONS.join(',')}}`, { cwd: SRC_DIR, absolute: true })
    .filter((f) => fs.statSync(f).isFile());
}

/**
 * 2) Lista absoluta de todos los archivos de código de TODO el proyecto,
 *    excluyendo node_modules/, dist/, build/, .git/ (para extraer imports).
 */
function getAllSourceFiles() {
  const ROOT = path.resolve(__dirname);
  return glob
    .sync(`**/*{${EXTENSIONS.join(',')}}`, { cwd: ROOT, absolute: true })
    .filter((f) => {
      const rel = path.relative(ROOT, f).replace(/\\/g, '/');
      if (!fs.statSync(f).isFile()) return false;
      // Si empieza por alguna carpeta a excluir, saltamos
      for (const ex of EXCLUDE_DIRS) {
        if (rel.startsWith(ex + '/')) return false;
      }
      return true;
    });
}

/**
 * 3) Lee un archivo y extrae todas las rutas literales que aparecen
 *    en `import X from '...'` o en `require('...')` con @babel/parser.
 *    Devuelve un array de cadenas: cada cadena es el valor exacto que
 *    estaba entre comillas del import/require.
 */
function extractImportsFromFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'typescript',
        'jsx',
        'dynamicImport', // para capturar import(…) dinámicos (si los hubiera)
      ],
    });
  } catch (err) {
    // Si no puede parsear (p.ej. sintaxis rara), devolvemos []
    return [];
  }

  const imports = new Set();

  for (const node of ast.program.body) {
    // ------ Import ES6 -------
    if (node.type === 'ImportDeclaration') {
      imports.add(node.source.value);
    }
    // ------ Require CommonJS dentro de VariableDeclaration -------
    if (node.type === 'VariableDeclaration') {
      for (const decl of node.declarations) {
        const init = decl.init;
        if (
          init &&
          init.type === 'CallExpression' &&
          init.callee.type === 'Identifier' &&
          init.callee.name === 'require' &&
          init.arguments.length === 1 &&
          init.arguments[0].type === 'StringLiteral'
        ) {
          imports.add(init.arguments[0].value);
        }
      }
    }
    // ------ Require CommonJS como ExpressionStatement -------
    if (
      node.type === 'ExpressionStatement' &&
      node.expression.type === 'CallExpression' &&
      node.expression.callee.type === 'Identifier' &&
      node.expression.callee.name === 'require' &&
      node.expression.arguments.length === 1 &&
      node.expression.arguments[0].type === 'StringLiteral'
    ) {
      imports.add(node.expression.arguments[0].value);
    }
  }

  return Array.from(imports);
}

/**
 * 4) Comprueba si “targetFile” (ruta absoluta) aparece en la lista de imports
 *    de cualquiera de los “sourceFiles”. 
 *
 *  - Construye varias “formas” de la ruta que caben en un import:
 *      • relNoExt básico: carpeta/archivoSinExt
 *      • con prefijos “./” o “/”
 *      • si el archivo se llama index.*, también permite carpeta (sin “/index”)
 *
 *  - Además, detecta si el import se resuelve (require.resolve) exactamente a targetFile.
 */
function isReferenced(targetFile, sourceFiles) {
  // 4.1) Ruta relativa SIN extensión desde SRC_DIR.
  //     Ej: C:\…\src\components\Header.tsx  → relNoExt = "components/Header"
  const relNoExt = path
    .relative(SRC_DIR, targetFile)
    .replace(/\\/g, '/')
    .replace(/\.[^.]+$/, '');

  // 4.2) Preparamos todas las variantes posibles que podría usar el import.
  //      - "./components/Header"
  //      - "components/Header"
  //      - "/components/Header"
  //      - Si el archivo se llama index.ts(x) por ej: "components/index",
  //        a veces se importa como "./components" → añadimos “components” (sin /index).
  const candidatePaths = new Set([
    `./${relNoExt}`,
    `${relNoExt}`,
    `/${relNoExt}`,
  ]);

  // Si el nombre de fichero es “index.xxx”, entonces otra forma común de importarlo
  // es usando la carpeta padre sin “/index”. Ej: index.tsx en carpeta /components →
  // import X from "./components"
  if (path.basename(relNoExt).toLowerCase() === 'index') {
    const parent = path.dirname(relNoExt); // ej: "components"
    if (parent && parent !== '.') {
      candidatePaths.add(`./${parent}`);  // "./components"
      candidatePaths.add(parent);         // "components"
      candidatePaths.add(`/${parent}`);   // "/components"
    }
  }

  // 4.3) Recorremos todos los sourceFiles y vemos si alguno “importa” este targetFile
  for (const file of sourceFiles) {
    const imports = extractImportsFromFile(file);
    for (const imp of imports) {
      // Si la cadena del import coincide con alguna de las variantes, podemos
      // darlo por referenciado. Pero, para mayor seguridad, intentamos resolver
      // esa ruta sobre Windows con createRequire y path.resolve:
      if (candidatePaths.has(imp)) {
        // 4.3.1) Si el import empieza por '.', hacemos un require.resolve para ver si
        //        apunta exactamente a targetFile.
        if (imp.startsWith('.')) {
          try {
            const createRequire = require('module').createRequire;
            const r = createRequire(file);
            // Resolvemos la ruta relativa a la carpeta de “file”
            const absoluteImport = r(path.resolve(path.dirname(file), imp));
            if (absoluteImport === targetFile) {
              return true;
            }
          } catch {
            // Si falla (p.ej. porque no hay extensión), pero coincide el string,
            // asumimos que sí es referencia.
            return true;
          }
        } else {
          // 4.3.2) Si el import NO empieza por '.', podría ser que sea absoluto
          //         dentro de src/ (p.ej. "components/Header" sin "./").
          //         En ese caso, ya que coincide el string relNoExt, lo contamos.
          return true;
        }
      }
    }
  }

  // Si nunca encontramos ninguna coincidencia, devolvemos false (no referenciado).
  return false;
}



/* ======= EJECUCIÓN PRINCIPAL ======= */
console.log('Buscando todos los ficheros dentro de src/ …');
const targetFiles = getAllFilesInSrc();

console.log('Buscando todos los ficheros fuente (para extraer imports) …');
const sourceFiles = getAllSourceFiles();

console.log(`Total de ficheros a comprobar dentro de src/: ${targetFiles.length}`);
console.log(`Total de ficheros fuente (para analizar imports): ${sourceFiles.length}`);
console.log('---------------------------------------------');

let unusedCount = 0;
for (const absFile of targetFiles) {
  // Normalizamos la ruta relativa para compararla con ENTRY_POINTS
  const relPath = path.relative(process.cwd(), absFile).replace(/\\/g, '/');

  // Si es un entry point (p.ej "src/main.tsx" o "src/App.tsx"), lo omitimos intencionadamente:
  if (ENTRY_POINTS.includes(path.normalize(relPath))) {
    continue;
  }

  // Si no está referenciado en NINGÚN sourceFile, lo marcamos como no usado:
  if (!isReferenced(absFile, sourceFiles)) {
    console.log('⚠️  No referenciado:', relPath);
    unusedCount++;
  }
}

if (unusedCount === 0) {
  console.log('✔️  ¡No se encontraron archivos huérfanos dentro de src/!');
} else {
  console.log(`\nTotal archivos no referenciados: ${unusedCount}`);
  console.log('(Revisa manualmente cada uno antes de borrar)');
}
