# 🚀 Profile-Craft

<div align="center">

![Profile-Craft Logo](https://img.shields.io/badge/Profile--Craft-Portfolio%20Generator-blue?style=for-the-badge&logo=react)

**Una plataforma moderna y profesional para crear portfolios y CVs interactivos**

[![Live Demo](https://img.shields.io/badge/🌐-Live%20Demo-success?style=for-the-badge)](https://adravilag.github.io/profile-craft/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat&logo=node.js)](https://nodejs.org/)

</div>

---

## ✨ Características Principales

🎨 **Diseño Moderno y Responsive**
- Interfaz elegante basada en Material Design 3
- Adaptable a cualquier dispositivo (móvil, tablet, desktop)
- Tema oscuro/claro automático
- Animaciones suaves y transiciones

📊 **Gestión Completa de Portafolio**
- Secciones profesionales: Experiencia, Educación, Proyectos, Habilidades
- Sistema de certificaciones con validación
- Testimonios y recomendaciones
- Artículos y blog personal

🛠️ **Tecnologías de Vanguardia**
- Arquitectura de monorepo moderna
- Frontend React 18 + TypeScript + Vite
- Backend Node.js + Express + MongoDB
- Componentes reutilizables y tipado estricto

🔐 **Sistema de Administración**
- Panel de administración completo
- Autenticación segura con JWT
- CRUD completo para todas las secciones
- Gestión de archivos y media

📄 **Exportación Profesional**
- Generación de PDF de alta calidad
- Múltiples plantillas de CV
- Descarga en diferentes formatos
- Optimización para impresión

---

## 🏗️ Arquitectura del Proyecto

```
profile-craft/
├── 📁 apps/
│   ├── 🎨 frontend/          # Aplicación React (Vite + TypeScript)
│   └── 🔧 backend/           # API REST (Node.js + Express + MongoDB)
├── 📦 packages/
│   ├── 🔄 shared/           # Tipos, servicios y utilidades compartidas
│   └── 🎭 ui/               # Biblioteca de componentes UI reutilizables
├── 🛠️ tools/                # Scripts de automatización y herramientas
└── 📚 docs/                 # Documentación del proyecto
```

### Tecnologías Utilizadas

#### Frontend
- **React 18** - Biblioteca UI moderna con Hooks y Concurrent Features
- **TypeScript 5** - Tipado estático para mayor robustez
- **Vite 6** - Build tool ultra-rápido con HMR
- **Material Design 3** - Sistema de diseño moderno
- **Axios** - Cliente HTTP para APIs
- **React Router** - Navegación SPA
- **HTML2Canvas + jsPDF** - Generación de documentos

#### Backend
- **Node.js 20** - Runtime JavaScript del servidor
- **Express.js** - Framework web minimalista
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **Multer** - Manejo de archivos
- **Cloudinary** - Gestión de media en la nube

#### DevOps & Tools
- **NPM Workspaces** - Gestión de monorepo
- **ESLint + Prettier** - Linting y formateo
- **GitHub Actions** - CI/CD automatizado
- **GitHub Pages** - Hosting estático
- **Render** - Hosting del backend

---

## 🚀 Instalación y Configuración

### Prerrequisitos

```bash
# Versiones requeridas
node --version  # v20 o superior
npm --version   # v10 o superior
```

### Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/adravilag/profile-craft.git
cd profile-craft

# 2. Instalar dependencias (instala todo el monorepo)
npm install

# 3. Configurar entorno de desarrollo
npm run env:local

# 4. Iniciar todos los servicios
npm run dev:all
```

### Configuración Manual

#### 1. **Instalar dependencias**
```bash
# Instalar dependencias raíz y de todos los workspaces
npm install

# O instalar workspace específico
npm install --workspace=@cv-maker/frontend
npm install --workspace=@cv-maker/backend
```

#### 2. **Configurar variables de entorno**

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000/api
VITE_USE_SQLITE=false
VITE_DEFAULT_USER_ID=1
NODE_ENV=development
```

**Backend (.env):**
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/profilecraft
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 3. **Iniciar servicios**

```bash
# Opción 1: Iniciar todo (recomendado)
npm run dev:all

# Opción 2: Iniciar servicios individualmente
npm run dev:packages  # Shared + UI packages
npm run dev:frontend  # Solo frontend (puerto 5174)
npm run dev:backend   # Solo backend (puerto 3000)
```

---

## 🌐 URLs de Desarrollo

Una vez iniciados los servicios:

- **Frontend**: http://localhost:5174/profile-craft/
- **Backend API**: http://localhost:3000/api
- **Documentación API**: http://localhost:3000/api/docs (próximamente)

---

## 🎯 Scripts Disponibles

### Scripts Globales (Monorepo)

```bash
# Desarrollo
npm run dev:all          # Iniciar todos los servicios
npm run dev:frontend     # Solo frontend
npm run dev:backend      # Solo backend
npm run dev:packages     # Solo packages (shared + ui)

# Build
npm run build            # Build de todos los workspaces
npm run build:frontend   # Build solo del frontend
npm run build:backend    # Build solo del backend

# Testing
npm run test             # Tests en todos los workspaces
npm run test:frontend    # Tests del frontend
npm run test:backend     # Tests del backend

# Linting
npm run lint             # Lint en todos los workspaces
npm run type-check       # TypeScript check

# Gestión de entornos
npm run env:local        # Configurar entorno local
npm run env:production   # Configurar entorno producción

# Deployment
npm run deploy           # Deploy a GitHub Pages
npm run deploy:frontend  # Deploy solo del frontend
```

### Scripts del Frontend

```bash
cd apps/frontend

npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run preview          # Preview del build
npm run test             # Tests con Vitest
npm run lint             # ESLint
npm run type-check       # TypeScript check

# Deployment específico
npm run deploy:gh-pages  # GitHub Pages
npm run deploy:vercel    # Vercel
npm run deploy:netlify   # Netlify
```

### Scripts del Backend

```bash
cd apps/backend

npm run dev              # Servidor con nodemon
npm run build            # Compilar TypeScript
npm run start            # Iniciar servidor compilado
npm run test             # Tests con Jest
npm run lint             # ESLint

# Gestión de entornos
npm run env:local        # Configurar para desarrollo
npm run env:production   # Configurar para producción
npm run env:status       # Ver configuración actual
```

---

## 🔧 Gestión de Entornos

Profile-Craft incluye un sistema avanzado de gestión de entornos que permite cambiar fácilmente entre desarrollo y producción:

### Comandos de Entorno

```bash
# Configurar todo el proyecto para desarrollo local
npm run env:local

# Configurar todo el proyecto para producción
npm run env:production

# Ver estado actual de configuración
npm run env:status:frontend
npm run env:status:backend
```

### Archivos de Configuración

El proyecto incluye plantillas de configuración:
- `.env.local` - Configuración de desarrollo
- `.env.production` - Configuración de producción
- `switch-project-env.ps1` - Script automatizado de cambio de entorno

---

## 🚢 Deployment

### Frontend (GitHub Pages)

```bash
# Deploy automático a GitHub Pages
npm run deploy:frontend

# O manualmente
npm run build:frontend
cd apps/frontend
npm run deploy:gh-pages
```

**URL de producción**: https://adravilag.github.io/profile-craft/

### Backend (Render)

1. **Conectar repositorio a Render**
2. **Configurar variables de entorno en Render**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_production_secret
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
3. **Build automatizado** desde rama `main`

**URL de producción**: https://profilecraft.onrender.com/api

---

## 📁 Estructura Detallada

<details>
<summary><strong>📂 Ver estructura completa del proyecto</strong></summary>

```
profile-craft/
├── 📁 apps/
│   ├── 🎨 frontend/
│   │   ├── public/           # Archivos estáticos
│   │   │   ├── assets/       # Imágenes, iconos, SVGs
│   │   │   └── data/         # Datos estáticos (CSV, JSON)
│   │   ├── src/
│   │   │   ├── components/   # Componentes React
│   │   │   │   ├── sections/ # Secciones principales
│   │   │   │   ├── header/   # Cabecera y navegación
│   │   │   │   └── styles/   # Estilos globales
│   │   │   ├── hooks/        # Custom hooks
│   │   │   ├── services/     # Servicios y APIs
│   │   │   ├── utils/        # Utilidades
│   │   │   └── types/        # Tipos TypeScript
│   │   ├── vite.config.ts    # Configuración Vite
│   │   └── package.json
│   │
│   └── 🔧 backend/
│       ├── src/
│       │   ├── controllers/  # Controladores de rutas
│       │   ├── models/       # Modelos Mongoose
│       │   ├── routes/       # Definición de rutas
│       │   ├── middleware/   # Middlewares
│       │   ├── services/     # Lógica de negocio
│       │   ├── config/       # Configuración
│       │   └── types/        # Tipos TypeScript
│       ├── uploads/          # Archivos subidos
│       ├── deploy/           # Scripts de deployment
│       └── package.json
│
├── 📦 packages/
│   ├── 🔄 shared/           # Código compartido
│   │   ├── src/
│   │   │   ├── contexts/    # React Contexts
│   │   │   ├── services/    # Servicios compartidos
│   │   │   ├── types/       # Tipos compartidos
│   │   │   ├── utils/       # Utilidades compartidas
│   │   │   └── config/      # Configuración compartida
│   │   └── package.json
│   │
│   └── 🎭 ui/               # Componentes UI
│       ├── src/
│       │   ├── components/  # Componentes reutilizables
│       │   ├── styles/      # Estilos compartidos
│       │   └── utils/       # Utilidades UI
│       └── package.json
│
├── 🛠️ tools/                # Herramientas y scripts
├── 📚 docs/                 # Documentación
├── package.json             # Configuración del monorepo
└── README.md               # Este archivo
```

</details>

---

## 🎨 Características del UI

### Material Design 3
- **Sistema de colores dinámico** adaptado al contenido
- **Tipografía moderna** con jerarquía visual clara
- **Componentes interactivos** con feedback inmediato
- **Animaciones fluidas** y transiciones naturales

### Responsive Design
- **Mobile First** - Optimizado para dispositivos móviles
- **Breakpoints adaptativos** para tablet y desktop
- **Touch-friendly** - Controles optimizados para tactil
- **Accesibilidad** - Cumple estándares WCAG 2.1

### Secciones Principales
- **Hero Section** - Presentación personal con foto y datos de contacto
- **About** - Descripción profesional y personal
- **Experience** - Experiencia laboral con timeline interactivo
- **Education** - Formación académica y certificaciones
- **Skills** - Habilidades técnicas con nivel de dominio
- **Projects** - Portfolio de proyectos con demos y código
- **Testimonials** - Recomendaciones y testimonios
- **Articles** - Blog personal y artículos técnicos
- **Contact** - Formulario de contacto y redes sociales

---

## 🔐 Sistema de Administración

### Panel de Admin
- **Dashboard** con métricas y estadísticas
- **CRUD completo** para todas las secciones
- **Gestión de archivos** con arrastrar y soltar
- **Preview en tiempo real** de cambios
- **Backup y restauración** de datos

### Autenticación
- **JWT tokens** con refresh automático
- **Roles y permisos** granulares
- **Sesiones seguras** con expiración
- **Protección CSRF** y XSS

### APIs RESTful
- **Endpoints organizados** por recursos
- **Validación de datos** con Joi/Yup
- **Paginación automática** y filtros
- **Rate limiting** y throttling
- **Documentación Swagger** (próximamente)

---

## 🧪 Testing

### Frontend Testing
```bash
# Tests unitarios con Vitest
npm run test:frontend

# Tests con coverage
npm run test:frontend -- --coverage

# Tests en watch mode
npm run test:frontend -- --watch
```

### Backend Testing
```bash
# Tests con Jest
npm run test:backend

# Tests de integración
npm run test:backend -- --integration

# Tests E2E
npm run test:backend -- --e2e
```

---

## 🔧 Desarrollo

### Agregar Nueva Sección

1. **Crear modelo** (Backend):
```typescript
// apps/backend/src/models/NewSection.ts
import { Schema, model } from 'mongoose';

const newSectionSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  // ... más campos
});

export default model('NewSection', newSectionSchema);
```

2. **Crear controlador** (Backend):
```typescript
// apps/backend/src/controllers/newSectionController.ts
export const getNewSections = async (req, res) => {
  // Lógica del controlador
};
```

3. **Agregar rutas** (Backend):
```typescript
// apps/backend/src/routes/newSection.ts
router.get('/', getNewSections);
router.post('/', createNewSection);
// ... más rutas
```

4. **Crear componente** (Frontend):
```tsx
// apps/frontend/src/components/sections/NewSection.tsx
export const NewSection: React.FC = () => {
  // Lógica del componente
  return <div>Nueva Sección</div>;
};
```

5. **Agregar al portfolio**:
```tsx
// apps/frontend/src/components/CurriculumMD3.tsx
import { NewSection } from './sections/NewSection';

// En el JSX
<NewSection />
```

### Agregar Nuevo Componente UI

```tsx
// packages/ui/src/components/NewComponent.tsx
export interface NewComponentProps {
  title: string;
  children?: React.ReactNode;
}

export const NewComponent: React.FC<NewComponentProps> = ({ 
  title, 
  children 
}) => {
  return (
    <div className="new-component">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

// Exportar en packages/ui/src/index.ts
export { NewComponent } from './components/NewComponent';
```

---

## 🐛 Troubleshooting

### Problemas Comunes

**Error: Module not found '@cv-maker/shared'**
```bash
# Reconstruir packages
npm run build --workspace=@cv-maker/shared
npm run build --workspace=@cv-maker/ui
```

**Error: MongoDB connection failed**
```bash
# Verificar MongoDB está ejecutándose
mongod --version
# O usar MongoDB Atlas con MONGODB_URI
```

**Error: Puerto en uso**
```bash
# Matar procesos en puertos específicos
npx kill-port 3000  # Backend
npx kill-port 5174  # Frontend
```

**Error: Variables de entorno no definidas**
```bash
# Verificar archivos .env
npm run env:status:frontend
npm run env:status:backend

# Reconfigurar entorno
npm run env:local
```

### Debug Mode

```bash
# Habilitar debug en desarrollo
DEBUG=profile-craft:* npm run dev:backend

# Ver logs detallados del frontend
npm run dev:frontend -- --debug
```

---

## 🤝 Contribuir

### Guía de Contribución

1. **Fork** el repositorio
2. **Crear rama** para la feature: `git checkout -b feature/nueva-caracteristica`
3. **Commit** cambios: `git commit -m 'feat: agregar nueva característica'`
4. **Push** a la rama: `git push origin feature/nueva-caracteristica`
5. **Crear Pull Request**

### Convenciones

**Commits (Conventional Commits):**
- `feat:` - Nueva característica
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato (no afectan lógica)
- `refactor:` - Refactoring de código
- `test:` - Agregar o modificar tests
- `chore:` - Cambios en build o herramientas

**Branches:**
- `main` - Rama principal (producción)
- `develop` - Rama de desarrollo
- `feature/*` - Nuevas características
- `fix/*` - Correcciones de bugs
- `hotfix/*` - Correcciones urgentes

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Adrián Dávila**
- GitHub: [@adravilag](https://github.com/adravilag)
- LinkedIn: [Adrian Dávila](https://linkedin.com/in/adravilag)
- Portfolio: [Profile-Craft](https://adravilag.github.io/profile-craft/)

---

## 🙏 Agradecimientos

- **React Team** - Por la excelente biblioteca
- **Vite Team** - Por la herramienta de build ultrarrápida
- **Material Design** - Por el sistema de diseño
- **MongoDB** - Por la base de datos flexible
- **Render** - Por el hosting gratuito del backend
- **GitHub** - Por Pages y Actions gratuitos

---

## 📊 Estadísticas del Proyecto

![GitHub repo size](https://img.shields.io/github/repo-size/adravilag/profile-craft)
![GitHub language count](https://img.shields.io/github/languages/count/adravilag/profile-craft)
![GitHub top language](https://img.shields.io/github/languages/top/adravilag/profile-craft)
![GitHub last commit](https://img.shields.io/github/last-commit/adravilag/profile-craft)

---

<div align="center">

**⭐ Si te gusta este proyecto, considera darle una estrella en GitHub ⭐**

[🌐 Demo en Vivo](https://adravilag.github.io/profile-craft/) | [📧 Contacto](mailto:adravilag-contact@gmail.com) | [🐛 Reportar Bug](https://github.com/adravilag/profile-craft/issues)

</div>

# Frontend solamente  
cd frontend
npm run env:local
npm run env:production
```

## 🚀 Desarrollo

### Instalación Inicial

```bash
# Instalar dependencias globales
npm install

# Instalar dependencias de backend y frontend
npm run install:all
```

### Desarrollo Local

```bash
# Configurar entorno de desarrollo
npm run env:local

# Iniciar backend y frontend simultáneamente
npm run dev:all

# O iniciar por separado:
npm run dev:backend   # Backend en http://localhost:3000
npm run dev:frontend  # Frontend en http://localhost:5173
```

### Producción

```bash
# Configurar entorno de producción
npm run env:production

# Construir ambos proyectos
npm run build:all

# Iniciar en modo producción
npm run start:backend  # API
npm run start:frontend # Frontend estático
```

## ⚙️ Configuración por Entorno

### Desarrollo Local
- **Backend**: `.env.local` con configuración de desarrollo
- **Frontend**: `.env.local` con URLs locales
- Base de datos MongoDB Atlas compartida
- CORS habilitado para desarrollo

### Producción
- **Backend**: `.env.production` con configuración optimizada
- **Frontend**: `.env.production` con URLs de producción
- Misma base de datos MongoDB Atlas
- Configuraciones de seguridad y rendimiento

## 🛠️ Scripts Disponibles

### Scripts Globales (desde raíz)
| Script | Descripción |
|--------|-------------|
| `npm run dev:all` | Inicia backend y frontend en desarrollo |
| `npm run build:all` | Construye backend y frontend |
| `npm run env:local` | Configura todo para desarrollo |
| `npm run env:production` | Configura todo para producción |
| `npm run install:all` | Instala dependencias en ambos proyectos |

### Scripts de Backend
| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Construcción para producción |
| `npm run start` | Iniciar en producción |
| `npm run env:compare` | Comparar configuraciones |

### Scripts de Frontend
| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con Vite |
| `npm run build` | Construcción para producción |
| `npm run preview` | Previsualizar build de producción |

## 🔒 Seguridad

- ✅ Archivos `.env*` excluidos de Git (excepto `.env.example`)
- ✅ JWT secrets diferentes para desarrollo y producción
- ✅ Configuración CORS específica por entorno
- ✅ Variables de entorno validadas

## 📊 Tecnologías

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Base de datos**: MongoDB Atlas
- **Autenticación**: JWT
- **Email**: Nodemailer
- **Upload**: Multer

### Frontend  
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules + Tailwind
- **Editor**: TinyMCE/Lexical
- **HTTP Client**: Axios

## � Despliegue

Este proyecto está configurado para despliegue automático:

- **Frontend**: GitHub Pages (https://netraluis.github.io/cv-maker/)
- **Backend**: Render (https://cv-maker-backend.onrender.com/)
- **Auto-Deploy**: Activado en push a `main`

### Scripts de despliegue rápido:
```bash
npm run deploy:all        # Deploy completo
npm run deploy:quick      # Deploy con verificación
.\quick-deploy.ps1        # Script interactivo
```

📖 **Ver guía completa**: [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

## �🚦 Estado del Proyecto

- ✅ Sistema de autenticación completo
- ✅ Gestión de perfiles y CVs
- ✅ Upload de imágenes  
- ✅ Sistema de contacto
- ✅ Gestión de entornos automatizada
- ✅ Deploy automático configurado (Render + GitHub Pages)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Configura tu entorno local (`npm run env:local`)
4. Desarrolla y testa tus cambios
5. Commit (`git commit -m 'Add some AmazingFeature'`)
6. Push (`git push origin feature/AmazingFeature`)
7. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

**ProfileCraft** - Creando CVs profesionales con tecnología moderna 🎯
