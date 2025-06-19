# 🚀 Guía de Instalación

Esta guía te ayudará a configurar el entorno de desarrollo para CV Maker.

## 📋 Prerrequis# Frontend en `http://localhost:5174`
- Backend en `http://localhost:3001`os

### # En desarrollo debería ser `http://localhost:5174`oftware Requerido

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0 (incluido con Node.js)
- **Git** >= 2.0.0

### Software Recomendado

- **VS Code** con las siguientes extensiones:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag

## 🔧 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd cv-maker
```

### 2. Instalar Dependencias

```bash
# Instalar todas las dependencias del monorepo
npm install
```

Este comando instalará automáticamente las dependencias de todos los paquetes y aplicaciones.

### 3. Configurar Variables de Entorno

#### Frontend (.env)
Crea un archivo `.env` en `apps/frontend/`:

```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001/api

# Environment
VITE_NODE_ENV=development

# Analytics (opcional)
VITE_GA_TRACKING_ID=your-ga-id
```

#### Backend (.env)
Crea un archivo `.env` en `apps/backend/`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/cv-maker-dev
# o usar MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cv-maker

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5174

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Email Configuration (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Configurar Base de Datos

#### Opción A: MongoDB Local

1. Instalar MongoDB Community Edition
2. Iniciar el servicio MongoDB
3. La base de datos se creará automáticamente

#### Opción B: MongoDB Atlas (Recomendado)

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crear un nuevo cluster
3. Obtener la cadena de conexión
4. Actualizar `MONGODB_URI` en el archivo `.env`

### 5. Inicializar el Proyecto

```bash
# Construir paquetes compartidos
npm run setup:packages

# Verificar que todo funcione
npm run type-check
```

## 🏃‍♂️ Ejecutar en Desarrollo

### Opción 1: Todos los Servicios (Recomendado)

```bash
npm run dev:all
```

Esto iniciará:
- Frontend en `http://localhost:5173`
- Backend en `http://localhost:3001`
- Paquetes compartidos en modo watch

### Opción 2: Servicios Individuales

```bash
# Solo frontend
npm run dev:frontend

# Solo backend
npm run dev:backend

# Solo paquetes compartidos
npm run dev:packages
```

## ✅ Verificar Instalación

### 1. Verificar Frontend
Abre `http://localhost:5174` en tu navegador. Deberías ver la página principal del CV Maker.

### 2. Verificar Backend
Abre `http://localhost:3001/api/health` en tu navegador. Deberías ver:

```json
{
  "status": "OK",
  "timestamp": "2025-06-19T...",
  "uptime": "..."
}
```

### 3. Verificar Base de Datos
En la consola del backend deberías ver:
```
✅ Connected to MongoDB successfully
🚀 Server running on port 3001
```

## 🔧 Comandos Útiles

```bash
# Limpiar node_modules y reinstalar
npm run clean
npm install

# Verificar tipos TypeScript
npm run type-check

# Ejecutar linter
npm run lint

# Ejecutar tests
npm run test

# Construir para producción
npm run build
```

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"
```bash
# Cambiar puerto en el archivo .env correspondiente
# o matar el proceso que usa el puerto
npx kill-port 3001
npx kill-port 5174
```

### Error de Base de Datos
- Verificar que MongoDB esté ejecutándose
- Comprobar la cadena de conexión en `.env`
- Verificar permisos de red (si usas Atlas)

### Error de CORS
- Verificar que `CORS_ORIGIN` en backend coincida con la URL del frontend
- En desarrollo debería ser `http://localhost:5173`

## 📚 Próximos Pasos

Una vez completada la instalación:

1. Lee la [Guía de Primeros Pasos](./getting-started.md)
2. Explora la [Arquitectura del Sistema](./architecture.md)
3. Revisa los [Estándares de Código](./code-standards.md)

## 🆘 Obtener Ayuda

Si encuentras problemas:

1. Consulta el [Troubleshooting](./troubleshooting.md)
2. Revisa las [FAQ](./faq.md)
3. Abre un [issue en GitHub](https://github.com/tu-usuario/cv-maker/issues)
