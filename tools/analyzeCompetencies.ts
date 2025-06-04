/**
 * analyzeCompetencies.ts
 *
 * Recorre recursivamente la carpeta indicada y busca patrones en archivos
 * .js, .jsx, .ts, .tsx para estimar “porcentajes de uso” de distintas
 * competencias React (JSX, Hooks, Ciclo de Vida, Context API, Performance…).
 *
 * Soporta:
 *   --dir <ruta>         Carpeta raíz a analizar (por defecto, cwd).
 *   --ignore <patrón1,patrón2,…>  Substrings a ignorar.
 *   --json                Imprime sólo JSON con el reporte.
 *   --help                Muestra esta ayuda y sale.
 *
 * Ejemplo de uso:
 *   npx ts-node analyzeCompetencies.ts --dir ./frontend --ignore utils,legacy --json
 */

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// ──────────────────────────────────────────────────────────────────────────────
// 1) CONFIGURACIÓN de PATTERNS por competencia (Context API mejorado)
// ──────────────────────────────────────────────────────────────────────────────

interface FeatureConfig {
  pattern: RegExp;
  extensionOverride?: string[];
}

const FEATURES: Record<string, FeatureConfig> = {
  "Componentes y JSX": {
    pattern: /<[A-Za-z]/,
    extensionOverride: [".jsx", ".tsx"],
  },
  "State Management (Hooks)": {
    pattern: /\b(useState|useReducer|useContext|useCallback|useMemo|useEffect)\b/,
  },
  "Ciclo de Vida y Effects": {
    pattern: /\b(componentDidMount|componentDidUpdate|componentWillUnmount|useEffect)\b/,
  },
  "Context API y Props": {
    /**
     * Mejor detección de Context API:
     * 1) cualquier uso de createContext o useContext
     * 2) nombres de hooks personalizados que terminen en Context (p. ej. useAuthContext)
     * 3) JSX con <AlgoContext.Provider> o <AlgoContext.Consumer>
     * 4) JSX con <AlgoProvider> (por si usan un Provider con otro nombre)
     * 5) importaciones de identificadores que contengan “Context” en su nombre
     */
    pattern: /\b(createContext|useContext|use\w*Context|useAuth|useNavigation|useNotification|useTheme)\b|<\w*Context\.(Provider|Consumer)>|<\w*Provider\b(?:\s|>)|Provider>|Consumer>|\bimport\s+[\w{}*,\s]*Context\b|\w+Context\s*=\s*createContext/,
    extensionOverride: [],
  },
  "Performance y Optimización": {
    pattern: /\b(React\.memo|PureComponent|shouldComponentUpdate|useMemo|useCallback)\b/,
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// 2) PARSEO DE ARGUMENTOS DE LÍNEA DE COMANDOS
// ──────────────────────────────────────────────────────────────────────────────

interface CLIOptions {
  dir: string;
  ignorePatterns: string[];
  outputJSON: boolean;
}

function printHelp(): void {
  const texto = `
Uso:
  npx ts-node analyzeCompetencies.ts [--dir <ruta>] [--ignore <pat1,pat2,...>] [--json] [--help]

Opciones:
  --dir <ruta>       Carpeta raíz a analizar (por defecto: cwd).
  --ignore <p1,p2>   Substrings separados por comas; si la ruta contiene alguno, se ignora.
  --json             Imprimir sólo JSON con el reporte (en lugar de texto formateado).
  --help             Mostrar esta ayuda.

Ejemplo:
  npx ts-node analyzeCompetencies.ts --dir ./frontend --ignore utils,legacy --json
`;
  console.log(texto);
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const opts: CLIOptions = {
    dir: process.cwd(),
    ignorePatterns: [],
    outputJSON: false,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    switch (a) {
      case "--dir":
        if (i + 1 < args.length) {
          opts.dir = path.resolve(args[i + 1]);
          i++;
        } else {
          console.error("❌  --dir requiere una ruta como argumento.");
          process.exit(1);
        }
        break;
      case "--ignore":
        if (i + 1 < args.length) {
          opts.ignorePatterns = args[i + 1]
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          i++;
        } else {
          console.error("❌  --ignore requiere una lista de patrones, separados por comas.");
          process.exit(1);
        }
        break;
      case "--json":
        opts.outputJSON = true;
        break;
      case "--help":
        printHelp();
        process.exit(0);
      default:
        console.error(`❌  Opción desconocida: ${a}`);
        printHelp();
        process.exit(1);
    }
  }

  return opts;
}

// ──────────────────────────────────────────────────────────────────────────────
// 3) LECTURA DE .analyzeignore (si existe)
// ──────────────────────────────────────────────────────────────────────────────

async function readIgnoreFile(rootDir: string): Promise<string[]> {
  const ignoreFilePath = path.join(rootDir, ".analyzeignore");
  const patterns: string[] = [];

  if (!fs.existsSync(ignoreFilePath)) {
    return patterns;
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(ignoreFilePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const texto = line.trim();
    if (texto === "" || texto.startsWith("#")) continue;
    patterns.push(texto);
  }

  return patterns;
}

// ──────────────────────────────────────────────────────────────────────────────
// 4) FUNCIONES AUXILIARES DE FILTRADO e IGNORADO
// ──────────────────────────────────────────────────────────────────────────────

function shouldIgnore(fileOrDirPath: string, ignorePatterns: string[]): boolean {
  const baseName = path.basename(fileOrDirPath);

  // Carpetas comunes a ignorar:
  const carpetasAExcluir = ["node_modules", ".git", "build", "dist", ".next", "out"];
  if (carpetasAExcluir.includes(baseName)) return true;

  // Archivos de test:
  if (baseName.includes(".test.") || baseName.includes(".spec.")) return true;

  // Substring match con patrones personalizados:
  for (const pat of ignorePatterns) {
    if (fileOrDirPath.includes(pat)) return true;
  }

  return false;
}

// ──────────────────────────────────────────────────────────────────────────────
// 5) RECORRIDO RECURSIVO DE ARCHIVOS .js/.jsx/.ts/.tsx
// ──────────────────────────────────────────────────────────────────────────────

function recorreCarpeta(ruta: string, ignorePatterns: string[]): string[] {
  const resultados: string[] = [];
  const entradas = fs.readdirSync(ruta, { withFileTypes: true });

  for (const entrada of entradas) {
    const rutaCompleta = path.join(ruta, entrada.name);

    if (shouldIgnore(rutaCompleta, ignorePatterns)) {
      continue;
    }

    if (entrada.isDirectory()) {
      resultados.push(...recorreCarpeta(rutaCompleta, ignorePatterns));
    } else if (entrada.isFile()) {
      const ext = path.extname(entrada.name).toLowerCase();
      if ([".js", ".jsx", ".ts", ".tsx"].includes(ext)) {
        resultados.push(rutaCompleta);
      }
    }
  }

  return resultados;
}

// ──────────────────────────────────────────────────────────────────────────────
// 6) ANÁLISIS DE CADA ARCHIVO PARA DETECTAR FEATURES
// ──────────────────────────────────────────────────────────────────────────────

function analizaArchivo(
  rutaArchivo: string,
  featureFiles: Record<string, Set<string>>
): void {
  let contenido: string;
  try {
    contenido = fs.readFileSync(rutaArchivo, "utf8");
  } catch (err) {
    console.warn(`⚠️  No se pudo leer "${rutaArchivo}": ${(err as Error).message}`);
    return;
  }

  const ext = path.extname(rutaArchivo).toLowerCase();
  for (const [featureName, config] of Object.entries(FEATURES)) {
    const { pattern, extensionOverride } = config;
    let coincide = false;

    if (Array.isArray(extensionOverride) && extensionOverride.includes(ext)) {
      coincide = true;
    } else if (pattern.test(contenido)) {
      coincide = true;
    }

    if (coincide) {
      featureFiles[featureName].add(rutaArchivo);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 7) CÁLCULO DE NIVELES Y DESCRIPCIONES
// ──────────────────────────────────────────────────────────────────────────────

interface NivelDescripcion {
  level: string;
  description: string;
}

function getNivelYDescripcion(
  featureName: string,
  percentage: number
): NivelDescripcion {
  let level = "";
  let description = "";

  if (percentage >= 80) {
    level = "Dominio";
  } else if (percentage >= 50) {
    level = "Competente";
  } else if (percentage >= 25) {
    level = "Básico";
  } else {
    level = "Novato";
  }

  switch (featureName) {
    case "Componentes y JSX":
      if (percentage >= 80)
        description = "Uso experto de JSX y componentes en múltiples archivos.";
      else if (percentage >= 50)
        description = "Uso regular de componentes; estructura clara en la mayoría de archivos.";
      else if (percentage >= 25)
        description = "Conocimiento inicial de JSX; requiere más práctica.";
      else description = "Necesita mayor práctica con JSX y componentes.";
      break;

    case "State Management (Hooks)":
      if (percentage >= 80)
        description = "Comprensión profunda de Hooks; uso avanzado de useState y useReducer.";
      else if (percentage >= 50)
        description = "Buen manejo de Hooks; se usan correctamente en varios archivos.";
      else if (percentage >= 25)
        description = "Conoce conceptos de Hooks; falta consolidar patrones.";
      else description = "Necesita estudiar las bases de Hooks y useState.";
      break;

    case "Ciclo de Vida y Effects":
      if (percentage >= 80)
        description = "Dominio de ciclos de vida y useEffect; manejo correcto de side-effects.";
      else if (percentage >= 50)
        description = "Buen manejo de useEffect y/o ciclos de vida en clases.";
      else if (percentage >= 25)
        description = "Conocimientos básicos de useEffect o métodos de ciclo de vida.";
      else description = "Necesita reforzar conceptos de ciclos de vida y efectos.";
      break;

    case "Context API y Props":
      if (percentage >= 80)
        description = "Manejo experto de Context API y Props entre componentes.";
      else if (percentage >= 50)
        description = "Uso correcto de Context o Props en varias partes del proyecto.";
      else if (percentage >= 25)
        description = "Comprende fundamentos de Context/Props; falta práctica.";
      else description = "Necesita practicar la transmisión de estado vía Context/Props.";
      break;

    case "Performance y Optimización":
      if (percentage >= 80)
        description = "Implementa optimizaciones avanzadas (React.memo, useMemo, useCallback).";
      else if (percentage >= 50)
        description = "Aplica memoización básica; conoce patrones de optimización.";
      else if (percentage >= 25)
        description = "Tiene nociones de performance; falta práctica en optimizaciones.";
      else description = "Necesita estudiar técnicas de optimización en React.";
      break;

    default:
      description = "";
      break;
  }

  return { level, description };
}

// ──────────────────────────────────────────────────────────────────────────────
// 8) GENERACIÓN DEL REPORTE (TEXTO CALIENTE o JSON)
// ──────────────────────────────────────────────────────────────────────────────

interface FeatureReport {
  count: number;
  totalFiles: number;
  percentage: number;
  level: string;
  description: string;
}

interface FullReport {
  [featureName: string]: FeatureReport;
}

function formatReportText(report: FullReport): void {
  console.log("\n📊  Resultados de Competencias:\n");

  for (const [featureName, data] of Object.entries(report)) {
    console.log(featureName);
    console.log("─".repeat(featureName.length));
    console.log(`${data.percentage}%   | Nivel: ${data.level}`);
    console.log(`Descripción: ${data.description}`);
    console.log(""); // línea en blanco
  }
}

function formatReportJSON(report: FullReport): void {
  console.log(JSON.stringify(report, null, 2));
}

// ──────────────────────────────────────────────────────────────────────────────
// 9) FUNCIÓN PRINCIPAL
// ──────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const opts = parseArgs();

  // 1) Lee patrones de .analyzeignore (si existe) y los añade a ignorePatterns
  const ignoreFromFile = await readIgnoreFile(opts.dir);
  const allIgnorePatterns = opts.ignorePatterns.concat(ignoreFromFile);

  // 2) Verifica que la carpeta exista y sea un directorio
  if (!fs.existsSync(opts.dir) || !fs.statSync(opts.dir).isDirectory()) {
    console.error("❌  La ruta especificada no es una carpeta válida:", opts.dir);
    process.exit(1);
  }

  console.log(`🔍  Analizando repositorio en: ${opts.dir}`);
  if (allIgnorePatterns.length > 0) {
    console.log(`🚫  Ignorando rutas que contengan: [${allIgnorePatterns.join(", ")}]`);
  }

  // 3) Recorre la carpeta y obtiene la lista de archivos a inspeccionar
  const todosLosArchivos = recorreCarpeta(opts.dir, allIgnorePatterns);
  const totalFiles = todosLosArchivos.length;

  if (totalFiles === 0) {
    console.warn("⚠️  No se encontraron archivos .js/.jsx/.ts/.tsx en esta carpeta.");
    process.exit(0);
  }

  // 4) Prepara estructura para recolectar archivos por feature
  const featureFiles: Record<string, Set<string>> = {};
  for (const featureName of Object.keys(FEATURES)) {
    featureFiles[featureName] = new Set<string>();
  }

  // 5) Analiza cada archivo
  for (const filePath of todosLosArchivos) {
    analizaArchivo(filePath, featureFiles);
  }

  // 6) Construye el reporte
  const fullReport: FullReport = {};
  for (const featureName of Object.keys(FEATURES)) {
    const count = featureFiles[featureName].size;
    const percentage = Math.round((count / totalFiles) * 100);
    const { level, description } = getNivelYDescripcion(featureName, percentage);
    fullReport[featureName] = {
      count,
      totalFiles,
      percentage,
      level,
      description,
    };
  }

  // 7) Imprime salida
  if (opts.outputJSON) {
    formatReportJSON(fullReport);
  } else {
    formatReportText(fullReport);
    console.log(`✅  Análisis completado. (Total de archivos analizados: ${totalFiles})`);
  }
}

main().catch((err) => {
  console.error("❌  Error en la ejecución:", (err as Error).message);
  process.exit(1);
});
