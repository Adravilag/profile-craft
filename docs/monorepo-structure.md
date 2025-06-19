# 🏗️ Estructura del Monorepo

CV Maker utiliza una arquitectura de monorepo que organiza el código en paquetes reutilizables y aplicaciones independientes. Esta estructura facilita el desarrollo, la reutilización de código y el mantenimiento.

## 📁 Estructura General

```
cv-maker/
├── 📁 apps/                    # Aplicaciones principales
│   ├── 📁 frontend/            # Aplicación React
│   └── 📁 backend/             # Servidor Node.js/Express
├── 📁 packages/                # Paquetes compartidos
│   ├── 📁 shared/              # Utilidades y tipos compartidos
│   └── 📁 ui/                  # Componentes UI reutilizables
├── 📁 docs/                    # Documentación del proyecto
├── 📁 tools/                   # Scripts y herramientas
├── 📄 package.json            # Configuración del workspace
└── 📄 README.md               # Documentación principal
```

## 🎯 Aplicaciones (apps/)

### Frontend (`apps/frontend/`)

Aplicación React que proporciona la interfaz de usuario del CV Maker.

```
apps/frontend/
├── 📁 public/                  # Archivos estáticos
│   ├── 📁 assets/             # Imágenes, iconos, etc.
│   └── 📁 data/               # Datos mock para desarrollo
├── 📁 src/                     # Código fuente
│   ├── 📄 App.tsx             # Componente principal
│   ├── 📄 main.tsx            # Punto de entrada
│   ├── 📁 components/         # Componentes React
│   │   ├── 📁 admin/          # Panel de administración
│   │   ├── 📁 common/         # Componentes reutilizables
│   │   ├── 📁 cv/             # Componentes específicos del CV
│   │   └── 📁 layout/         # Componentes de layout
│   ├── 📁 config/             # Configuración de la app
│   ├── 📁 constants/          # Constantes de la aplicación
│   ├── 📁 data/               # Datos y mocks
│   ├── 📁 hooks/              # Custom hooks
│   ├── 📁 services/           # Servicios API
│   ├── 📁 styles/             # Estilos globales
│   ├── 📁 types/              # Tipos TypeScript específicos
│   └── 📁 utils/              # Utilidades del frontend
├── 📄 package.json            # Dependencias del frontend
├── 📄 vite.config.ts          # Configuración de Vite
├── 📄 tsconfig.json           # Configuración TypeScript
├── 📄 eslint.config.js        # Configuración ESLint
└── 📄 index.html              # Template HTML
```

#### Componentes Destacados:

- **`components/admin/`**: Panel de administración completo
- **`components/cv/`**: Componentes para mostrar y editar CV
- **`hooks/`**: Lógica reutilizable (useAuth, useCV, etc.)
- **`services/`**: Comunicación con la API

### Backend (`apps/backend/`)

Servidor API REST construido con Node.js, Express y MongoDB.

```
apps/backend/
├── 📁 src/                     # Código fuente
│   ├── 📁 config/             # Configuración del servidor
│   │   ├── 📄 database.ts     # Configuración MongoDB
│   │   ├── 📄 multer.ts       # Configuración upload archivos
│   │   └── 📄 index.ts        # Configuración general
│   ├── 📁 controllers/        # Controladores de rutas
│   │   ├── 📄 authController.ts
│   │   ├── 📄 profileController.ts
│   │   ├── 📄 experiencesController.ts
│   │   └── 📄 ...
│   ├── 📁 middleware/         # Middleware personalizado
│   │   └── 📄 auth.ts         # Middleware de autenticación
│   ├── 📁 models/             # Modelos de Mongoose
│   │   ├── 📄 User.ts
│   │   ├── 📄 Experience.ts
│   │   ├── 📄 Project.ts
│   │   └── 📄 ...
│   ├── 📁 routes/             # Definición de rutas
│   │   ├── 📄 auth.ts
│   │   ├── 📄 profile.ts
│   │   └── 📄 ...
│   ├── 📁 services/           # Lógica de negocio
│   └── 📁 types/              # Tipos TypeScript del backend
├── 📁 uploads/                # Archivos subidos
├── 📁 dist-server/            # Código compilado
├── 📄 server-clean.ts         # Servidor sin base de datos
├── 📄 server-mongodb.ts       # Servidor con MongoDB
├── 📄 package.json            # Dependencias del backend
└── 📄 tsconfig.json           # Configuración TypeScript
```

#### Características Principales:

- **API RESTful**: Endpoints bien estructurados
- **Autenticación JWT**: Sistema de autenticación seguro
- **Upload de archivos**: Gestión de imágenes y documentos
- **Validación**: Validación robusta de datos de entrada

## 📦 Paquetes Compartidos (packages/)

### Shared (`packages/shared/`)

Contiene utilidades, tipos y constantes compartidas entre aplicaciones.

```
packages/shared/
├── 📁 src/
│   ├── 📄 index.ts            # Exportaciones principales
│   ├── 📄 types.ts            # Tipos compartidos
│   ├── 📄 constants.ts        # Constantes globales
│   ├── 📄 utils.ts            # Utilidades generales
│   ├── 📁 config/             # Configuraciones compartidas
│   ├── 📁 constants/          # Constantes específicas
│   ├── 📁 contexts/           # Context providers
│   ├── 📁 data/               # Datos mock compartidos
│   ├── 📁 hooks/              # Hooks reutilizables
│   ├── 📁 services/           # Servicios compartidos
│   ├── 📁 types/              # Tipos organizados por dominio
│   └── 📁 utils/              # Utilidades específicas
├── 📄 package.json
└── 📄 tsconfig.json
```

#### Contenido Principal:

```typescript
// Tipos compartidos
export interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

// Utilidades
export const formatDate = (date: Date) => { ... }
export const validateEmail = (email: string) => { ... }

// Constantes
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  PROFILE: '/api/profile',
  // ...
}
```

### UI (`packages/ui/`)

Sistema de componentes reutilizables basado en Material Design.

```
packages/ui/
├── 📁 src/
│   ├── 📄 index.ts            # Exportaciones de componentes
│   ├── 📁 components/         # Componentes base
│   │   ├── 📁 Button/
│   │   ├── 📁 Input/
│   │   ├── 📁 Modal/
│   │   ├── 📁 Card/
│   │   └── 📁 ...
│   ├── 📁 styles/             # Estilos del sistema
│   │   ├── 📄 globals.css
│   │   ├── 📄 variables.css
│   │   └── 📄 components.css
│   ├── 📁 types/              # Tipos de los componentes
│   └── 📁 utils/              # Utilidades de UI
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 copy-css.js             # Script para copiar estilos
```

#### Componentes Disponibles:

- **Button**: Botones con variantes (primary, secondary, etc.)
- **Input**: Campos de entrada con validación
- **Modal**: Modales reutilizables
- **Card**: Tarjetas de contenido
- **Loading**: Indicadores de carga
- **Typography**: Sistema tipográfico

## 🛠️ Herramientas (tools/)

Scripts y utilidades para el desarrollo y mantenimiento del proyecto.

```
tools/
├── 📄 clean.mjs               # Limpieza de archivos generados
├── 📄 migrate-shared.mjs      # Migración del paquete shared
├── 📄 setup.mjs               # Configuración inicial
└── 📄 update-imports.mjs      # Actualización de imports
```

### Scripts Principales:

- **`clean.mjs`**: Limpia `node_modules`, `dist` y archivos temporales
- **`setup.mjs`**: Configura el proyecto después del clone
- **`migrate-shared.mjs`**: Migra código al paquete shared
- **`update-imports.mjs`**: Actualiza imports automáticamente

## 🔗 Gestión de Dependencias

### Workspace Configuration

El archivo `package.json` principal define el workspace:

```json
{
  "name": "cv-maker-monorepo",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:all": "concurrently \"npm run dev:packages\" \"npm run dev:frontend\" \"npm run dev:backend\"",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces --if-present"
  }
}
```

### Dependencias Compartidas

- **TypeScript**: Configuración consistente
- **ESLint/Prettier**: Estándares de código
- **Testing**: Jest/Vitest para todas las apps

### Dependencias Específicas

#### Frontend:
- React 18, Vite, React Router
- Material-UI, Emotion
- Axios, React Query

#### Backend:
- Express, Mongoose
- JWT, bcrypt, multer
- Joi, cors, helmet

## 🔄 Flujo de Desarrollo

### 1. **Desarrollo Local**

```bash
# Instalar todas las dependencias
npm install

# Construir paquetes compartidos
npm run setup:packages

# Iniciar entorno de desarrollo
npm run dev:all
```

### 2. **Agregar Nueva Funcionalidad**

```bash
# 1. Agregar tipos en shared si es necesario
cd packages/shared
# Editar src/types.ts

# 2. Agregar componentes en ui si es reutilizable
cd packages/ui
# Crear nuevo componente

# 3. Implementar en frontend/backend
cd apps/frontend
# Usar los nuevos tipos/componentes
```

### 3. **Testing Cross-Package**

```bash
# Test en todos los paquetes
npm run test

# Test específico
npm run test --workspace=@cv-maker/frontend
```

## 📈 Ventajas del Monorepo

### ✅ **Beneficios**

1. **Código Compartido**: Reutilización eficiente
2. **Versionado Sincronizado**: Cambios coordinados
3. **Refactoring Seguro**: Cambios atómicos
4. **Tooling Compartido**: Configuración consistente
5. **Desarrollo Simplificado**: Un solo repositorio

### ⚠️ **Consideraciones**

1. **Tamaño**: El repositorio puede crecer mucho
2. **CI/CD**: Pipelines más complejos
3. **Permisos**: Control de acceso granular
4. **Learning Curve**: Requiere conocimiento específico

## 🚀 Próximos Pasos

1. **Micropackages**: Dividir shared en paquetes más específicos
2. **Build Optimization**: Implementar build cache
3. **Documentation**: Auto-generación de docs
4. **Testing**: Aumentar cobertura cross-package

Esta estructura de monorepo proporciona una base sólida para el crecimiento del proyecto, manteniendo la organización y facilitando la colaboración entre equipos.
