// Este archivo garantiza que dotenv cargue el .env ANTES de importar el test real
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, '../../.env') });

// Importa el test real después de cargar dotenv
import('./emailTest.js');
