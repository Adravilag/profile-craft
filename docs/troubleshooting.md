# 🛠️ Solución de Problemas Comunes

Esta guía te ayuda a resolver los problemas más frecuentes que puedes encontrar al desarrollar con CV Maker.

## 🚨 Problemas de Instalación

### Error: "Cannot find module" después de npm install

**Síntomas:**
```bash
Error: Cannot find module '@cv-maker/shared'
Module not found: Can't resolve '@cv-maker/ui'
```

**Soluciones:**

1. **Limpiar y reinstalar dependencias:**
```bash
# Limpiar node_modules y lock files
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json
rm -rf packages/*/node_modules packages/*/package-lock.json

# Reinstalar
npm install
npm run setup:packages
```

2. **Verificar workspaces:**
```bash
# Verificar configuración de workspaces
npm ls --workspaces
```

3. **Construir paquetes compartidos:**
```bash
npm run build --workspace=@cv-maker/shared
npm run build --workspace=@cv-maker/ui
```

### Error: "EACCES: permission denied"

**Síntomas:**
```bash
npm ERR! Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Soluciones:**

1. **Usar nvm (recomendado):**
```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar Node.js
nvm install 20
nvm use 20
```

2. **Cambiar directorio global de npm:**
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Error: "Node version incompatible"

**Síntomas:**
```bash
npm ERR! engine Unsupported engine
npm ERR! Required: {"node":">=20.0.0"}
```

**Solución:**
```bash
# Verificar versión actual
node --version

# Actualizar Node.js
nvm install 20
nvm use 20

# O descargar desde nodejs.org
```

## 🗄️ Problemas de Base de Datos

### Error: "MongoServerError: Authentication failed"

**Síntomas:**
```bash
MongoServerError: Authentication failed.
Error: Could not connect to MongoDB
```

**Soluciones:**

1. **Verificar string de conexión:**
```env
# ✅ Formato correcto
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# ❌ Formato incorrecto (espacios, caracteres especiales)
MONGODB_URI=mongodb+srv://user name:pass@word@cluster.mongodb.net/database
```

2. **Verificar credenciales en MongoDB Atlas:**
- Ve a Database Access en MongoDB Atlas
- Verifica usuario y contraseña
- Asegúrate de que el usuario tenga permisos

3. **Verificar whitelist de IP:**
- Ve a Network Access en MongoDB Atlas
- Agrega tu IP actual o usa 0.0.0.0/0 para desarrollo

4. **Testear conexión:**
```bash
# Usar MongoDB Compass o mongosh para probar
mongosh "mongodb+srv://cluster.mongodb.net/database" --username your-username
```

### Error: "Connection timeout"

**Síntomas:**
```bash
MongooseError: Could not connect to any servers in your MongoDB Atlas cluster
```

**Soluciones:**

1. **Verificar conectividad:**
```bash
# Ping al cluster
ping cluster-name.mongodb.net
```

2. **Verificar firewall/VPN:**
- Desactivar VPN temporalmente
- Verificar firewall corporativo
- Probar desde otra red

3. **Usar string de conexión alternativo:**
```env
# Probar sin opciones adicionales
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Error: "Database not found"

**Síntomas:**
```bash
Database 'cv-maker-dev' not found
Collection does not exist
```

**Solución:**
```javascript
// La base de datos se crea automáticamente al insertar datos
// Verificar que el nombre sea correcto en .env
MONGODB_URI=mongodb://localhost:27017/cv-maker-dev

// Para MongoDB Atlas, la base de datos se especifica en la URI
```

## 🌐 Problemas de Red y CORS

### Error: "CORS policy has blocked the request"

**Síntomas:**
```bash
Access to fetch at 'http://localhost:3001/api/users' from origin 'http://localhost:5174' has been blocked by CORS policy
```

**Soluciones:**

1. **Verificar configuración CORS en backend:**
```typescript
// apps/backend/src/config/index.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  credentials: true
}))
```

2. **Verificar variables de entorno:**
```env
# Backend .env
CORS_ORIGIN=http://localhost:5174

# Frontend .env
VITE_API_URL=http://localhost:3001
```

3. **Verificar puertos:**
```bash
# Verificar que los servicios estén corriendo
lsof -i :3001  # Backend
lsof -i :5174  # Frontend
```

### Error: "Network Error" en requests

**Síntomas:**
```bash
AxiosError: Network Error
fetch: TypeError: Failed to fetch
```

**Soluciones:**

1. **Verificar URL de API:**
```typescript
// Verificar configuración en frontend
console.log('API URL:', import.meta.env.VITE_API_URL)

// Debería mostrar: http://localhost:3001
```

2. **Verificar que el backend esté corriendo:**
```bash
curl http://localhost:3001/api/health
# Debería retornar: {"status":"OK"}
```

3. **Verificar proxy en Vite (si aplica):**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

## 🔐 Problemas de Autenticación

### Error: "JWT malformed"

**Síntomas:**
```bash
JsonWebTokenError: jwt malformed
Error: Invalid token format
```

**Soluciones:**

1. **Verificar formato del token:**
```typescript
// ✅ Formato correcto
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// ❌ Formato incorrecto
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Authorization: Bearer Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. **Verificar JWT_SECRET:**
```env
# Backend .env - debe ser el mismo en todos los entornos
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
```

3. **Limpiar token corrupto:**
```typescript
// En el frontend
localStorage.removeItem('token')
// O
localStorage.clear()
```

### Error: "Token expired"

**Síntomas:**
```bash
TokenExpiredError: jwt expired
401 Unauthorized
```

**Soluciones:**

1. **Implementar refresh token:**
```typescript
// Interceptor para renovar tokens automáticamente
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        await authService.refreshToken()
        return axios.request(error.config)
      } catch (refreshError) {
        authService.logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
```

2. **Configurar tiempo de expiración:**
```env
# Backend .env
JWT_EXPIRES_IN=7d  # 7 días
JWT_REFRESH_EXPIRES_IN=30d  # 30 días
```

### Error: "User not found" después del login

**Síntomas:**
```bash
Error: User not found
Usuario no existe en la base de datos
```

**Soluciones:**

1. **Verificar creación de usuario:**
```bash
# Conectar a MongoDB y verificar
use cv-maker-dev
db.users.find().pretty()
```

2. **Verificar hash de contraseña:**
```typescript
// Verificar que bcrypt esté funcionando
const bcrypt = require('bcrypt')
const password = 'testpassword'
const hash = await bcrypt.hash(password, 10)
const isValid = await bcrypt.compare(password, hash)
console.log('Password valid:', isValid)
```

## 📦 Problemas de Build y Deployment

### Error: "Type errors" en build

**Síntomas:**
```bash
Type 'string | undefined' is not assignable to type 'string'
Property 'user' does not exist on type '{}'
```

**Soluciones:**

1. **Verificar tipos en variables de entorno:**
```typescript
// ✅ Correcto - con validación
const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) {
  throw new Error('VITE_API_URL is required')
}

// ✅ Correcto - con default
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
```

2. **Verificar tipos en Context:**
```typescript
// ✅ Correcto - con tipos adecuados
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

3. **Verificar configuración TypeScript:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Error: "Module not found" en producción

**Síntomas:**
```bash
Module not found: Error: Can't resolve '@cv-maker/shared'
Error: Cannot resolve dependency
```

**Soluciones:**

1. **Verificar paths en tsconfig:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@cv-maker/shared": ["../../packages/shared/src"],
      "@cv-maker/ui": ["../../packages/ui/src"]
    }
  }
}
```

2. **Verificar configuración de Vite:**
```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@cv-maker/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@cv-maker/ui': path.resolve(__dirname, '../../packages/ui/src')
    }
  }
})
```

3. **Build en orden correcto:**
```bash
# Construir dependencias primero
npm run build --workspace=@cv-maker/shared
npm run build --workspace=@cv-maker/ui
npm run build:frontend
```

## 🔄 Problemas de Development Server

### Error: "Port already in use"

**Síntomas:**
```bash
Error: listen EADDRINUSE: address already in use :::3001
Port 5174 is already in use
```

**Soluciones:**

1. **Encontrar y matar proceso:**
```bash
# Para Puerto 3001 (Backend)
lsof -ti:3001 | xargs kill -9

# Para Puerto 5174 (Frontend)
lsof -ti:5174 | xargs kill -9

# En Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

2. **Cambiar puerto:**
```env
# Backend .env
PORT=3002

# Frontend vite.config.ts
export default defineConfig({
  server: {
    port: 5175
  }
})
```

3. **Usar script helper:**
```bash
# Agregar a package.json
"scripts": {
  "kill-ports": "npx kill-port 3001 5174",
  "dev:clean": "npm run kill-ports && npm run dev:all"
}
```

### Error: "Hot reload not working"

**Síntomas:**
- Los cambios no se reflejan automáticamente
- Necesitas refrescar manualmente el navegador

**Soluciones:**

1. **Verificar configuración Vite:**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    hmr: true,
    watch: {
      usePolling: true // Para WSL/Docker
    }
  }
})
```

2. **Verificar extensiones de archivos:**
```typescript
// Asegúrate de usar .tsx para componentes React
// Asegúrate de usar .ts para utilidades
```

3. **Reiniciar servidor de desarrollo:**
```bash
# Parar servidor (Ctrl+C) y reiniciar
npm run dev:frontend
```

## 🧪 Problemas de Testing

### Error: "ReferenceError: TextEncoder is not defined"

**Síntomas:**
```bash
ReferenceError: TextEncoder is not defined
ReferenceError: fetch is not defined
```

**Soluciones:**

1. **Configurar polyfills en Jest:**
```javascript
// jest.setup.js
import { TextEncoder, TextDecoder } from 'util'
import fetch from 'node-fetch'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.fetch = fetch
```

2. **Usar @testing-library/jest-dom:**
```javascript
// jest.setup.js
import '@testing-library/jest-dom'
```

3. **Configurar environment en package.json:**
```json
{
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"]
  }
}
```

### Error: "Cannot find module" en tests

**Síntomas:**
```bash
Cannot find module '@cv-maker/shared' from 'src/components/Test.tsx'
```

**Soluciones:**

1. **Configurar moduleNameMapping en Jest:**
```json
{
  "jest": {
    "moduleNameMapping": {
      "^@cv-maker/shared/(.*)$": "<rootDir>/../../packages/shared/src/$1",
      "^@cv-maker/ui/(.*)$": "<rootDir>/../../packages/ui/src/$1"
    }
  }
}
```

2. **Usar transform para TypeScript:**
```json
{
  "jest": {
    "transform": {
      "^.+\\.(ts|tsx)$": "ts-jest"
    }
  }
}
```

## 💡 Consejos Generales de Debugging

### 1. **Logs efectivos:**
```typescript
// ✅ Logs útiles
console.log('API Request:', { url, method, data })
console.log('User state:', user)
console.error('Error details:', { error, stack: error.stack })

// ❌ Logs inútiles
console.log('here')
console.log('test')
```

### 2. **Usar herramientas de desarrollo:**
```bash
# React Developer Tools
# Redux DevTools (si usas Redux)
# VS Code Debugger

# Chrome DevTools:
# - Network tab para requests
# - Console para logs
# - Application tab para localStorage
```

### 3. **Verificar paso a paso:**
```bash
# 1. ¿Están corriendo los servicios?
npm run dev:all

# 2. ¿Responde el backend?
curl http://localhost:3001/api/health

# 3. ¿Carga el frontend?
curl http://localhost:5174

# 4. ¿Están las variables de entorno?
echo $NODE_ENV
```

### 4. **Aislar el problema:**
```typescript
// Comenta código progresivamente para encontrar el error
// Usa try-catch para capturar errores específicos
// Crea casos de prueba mínimos
```

## 🆘 Cuándo Pedir Ayuda

Si después de seguir estos pasos aún tienes problemas:

1. **Crea un issue en GitHub** con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs de error completos
   - Tu sistema operativo y versiones

2. **Incluye información del entorno:**
```bash
node --version
npm --version
git --version
```

3. **Adjunta archivos relevantes:**
   - package.json
   - .env (sin datos sensibles)
   - Logs de error completos

Recuerda: la mayoría de problemas tienen soluciones simples. Mantén la calma y debug paso a paso. 🚀
