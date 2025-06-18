# CV Maker Monorepo

Un generador de CVs profesionales construido como monorepo con arquitectura moderna.

## 🏗️ Estructura del Proyecto

```
cv-maker/
├── apps/
│   ├── frontend/          # Aplicación React
│   └── backend/           # API Node.js
├── packages/
│   ├── shared/           # Tipos y utilidades compartidas
│   └── ui/               # Componentes UI reutilizables
├── tools/                # Scripts y herramientas
└── docs/                 # Documentación
```
├── package.json       # Scripts globales del monorepo
└── switch-project-env.ps1  # Script de gestión de entornos
```

## 🔧 Gestión de Entornos

Este proyecto utiliza un sistema avanzado de gestión de entornos que permite cambiar fácilmente entre desarrollo y producción.

### Scripts Globales (Recomendado)

```bash
# Configurar todo el proyecto para desarrollo
npm run env:local

# Configurar todo el proyecto para producción  
npm run env:production

# Ver estado de entornos
npm run env:status:backend
npm run env:status:frontend

# Comparar configuraciones del backend
npm run env:compare:backend
```

### Scripts Individuales

```bash
# Backend solamente
cd backend
npm run env:local
npm run env:production

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
