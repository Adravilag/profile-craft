# 🚀 Primeros Pasos

¡Bienvenido a CV Maker! Esta guía te ayudará a familiarizarte con el proyecto y comenzar a desarrollar rápidamente.

## 🎯 Objetivos de esta Guía

Al finalizar esta guía, serás capaz de:
- Entender la estructura del proyecto
- Navegar por las diferentes secciones
- Realizar tu primera modificación
- Ejecutar tests básicos
- Entender el flujo de desarrollo

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de haber completado la [Guía de Instalación](./installation.md).

## 🏗️ Estructura del Proyecto - Vista Rápida

```
cv-maker/
├── apps/
│   ├── frontend/          # React App (Puerto 5173)
│   └── backend/           # Node.js API (Puerto 3001)
├── packages/
│   ├── shared/            # Código compartido
│   └── ui/                # Componentes reutilizables
└── docs/                  # Esta documentación
```

## 🚀 Tu Primer Inicio

### 1. Clonar y Configurar

```bash
# Clonar el repositorio
git clone <repository-url>
cd cv-maker

# Instalar dependencias
npm install

# Configurar entorno
npm run setup:packages
```

### 2. Iniciar el Entorno de Desarrollo

```bash
# Iniciar todos los servicios
npm run dev:all
```

Esto iniciará:
- **Frontend**: http://localhost:5174
- **Backend**: http://localhost:3001
- **Paquetes**: En modo watch

### 3. Verificar que Todo Funciona

1. **Frontend**: Abre http://localhost:5174
   - Deberías ver la página principal del CV Maker
   - Navega por las diferentes secciones

2. **Backend**: Abre http://localhost:3001/api/health
   - Deberías ver: `{"status": "OK", ...}`

3. **Base de Datos**: Revisa la consola del backend
   - Busca: `✅ Connected to MongoDB successfully`

## 🎮 Explorando la Aplicación

### Frontend (React App)

#### **Página Principal**
- **URL**: http://localhost:5174
- **Contenido**: Landing page con información del CV
- **Archivo**: `apps/frontend/src/App.tsx`

#### **Panel de Administración**
- **URL**: http://localhost:5174/admin
- **Contenido**: Panel para editar información del CV
- **Autenticación**: Requerida (crear cuenta o usar demo)

#### **Secciones Principales**
- **Perfil**: Información personal y profesional
- **Experiencia**: Historial laboral
- **Proyectos**: Portfolio de proyectos
- **Educación**: Formación académica
- **Habilidades**: Skills técnicos y soft skills
- **Certificaciones**: Certificados y logros

### Backend (API REST)

#### **Endpoints Principales**
```
GET    /api/health              # Estado del servidor
POST   /api/auth/login          # Autenticación
GET    /api/profile             # Información del perfil
GET    /api/experiences         # Lista de experiencias
POST   /api/experiences         # Crear experiencia
PUT    /api/experiences/:id     # Actualizar experiencia
DELETE /api/experiences/:id     # Eliminar experiencia
```

#### **Documentación API**
- **Swagger**: http://localhost:3001/api-docs (si está configurado)
- **Archivos**: `apps/backend/src/routes/`

## 📝 Tu Primera Modificación

Vamos a hacer un cambio simple para entender el flujo de desarrollo.

### Ejercicio 1: Cambiar el Título de la Página

1. **Localizar el archivo**:
   ```bash
   # El título está en el componente principal
   code apps/frontend/src/App.tsx
   ```

2. **Hacer el cambio**:
   ```typescript
   // Buscar algo como:
   <h1>Mi CV Profesional</h1>
   
   // Cambiar por:
   <h1>Mi Nuevo CV Profesional</h1>
   ```

3. **Ver el resultado**:
   - El navegador se actualizará automáticamente
   - Verifica el cambio en http://localhost:5174

### Ejercicio 2: Agregar una Nueva Habilidad

1. **Abrir el panel de administración**:
   - Ve a http://localhost:5174/admin
   - Autentícate (crear cuenta si es necesario)

2. **Navegar a Skills**:
   - Busca la sección de habilidades
   - Agrega una nueva skill: "React Hooks"

3. **Verificar en la API**:
   - Abre http://localhost:3001/api/skills
   - Deberías ver tu nueva habilidad

## 🧪 Ejecutar Tests

### Tests del Frontend

```bash
# Ejecutar todos los tests del frontend
npm run test:frontend

# Ejecutar tests en modo watch
cd apps/frontend
npm run test:watch
```

### Tests del Backend

```bash
# Ejecutar todos los tests del backend
npm run test:backend

# Tests específicos
cd apps/backend
npm test -- --grep "auth"
```

### Tests de Todo el Proyecto

```bash
# Ejecutar todos los tests
npm run test
```

## 🔧 Comandos Útiles

### Desarrollo Diario

```bash
# Iniciar desarrollo
npm run dev:all

# Solo frontend
npm run dev:frontend

# Solo backend
npm run dev:backend

# Verificar tipos TypeScript
npm run type-check

# Ejecutar linter
npm run lint
```

### Gestión de Dependencias

```bash
# Instalar dependencia en frontend
npm install <package> --workspace=@cv-maker/frontend

# Instalar dependencia en backend
npm install <package> --workspace=@cv-maker/backend

# Instalar dependencia en shared
npm install <package> --workspace=@cv-maker/shared
```

### Build y Producción

```bash
# Construir todo el proyecto
npm run build

# Construir solo frontend
npm run build:frontend

# Construir solo backend
npm run build:backend

# Previsualizar frontend en producción
npm run start:frontend
```

## 📁 Archivos Importantes para Conocer

### Configuración Principal
- `package.json` - Configuración del monorepo
- `tsconfig.json` - Configuración TypeScript global

### Frontend
- `apps/frontend/src/App.tsx` - Componente principal
- `apps/frontend/src/main.tsx` - Punto de entrada
- `apps/frontend/vite.config.ts` - Configuración de Vite
- `apps/frontend/package.json` - Dependencias del frontend

### Backend
- `apps/backend/server-mongodb.ts` - Servidor principal
- `apps/backend/src/config/index.ts` - Configuración
- `apps/backend/src/routes/` - Definición de rutas API
- `apps/backend/src/models/` - Modelos de base de datos

### Paquetes Compartidos
- `packages/shared/src/types.ts` - Tipos compartidos
- `packages/shared/src/utils.ts` - Utilidades
- `packages/ui/src/index.ts` - Componentes UI

## 🗂️ Flujo de Trabajo Recomendado

### 1. **Planificación**
- Identifica qué funcionalidad vas a implementar
- Revisa si necesitas nuevos tipos en `shared`
- Determina si necesitas nuevos componentes en `ui`

### 2. **Desarrollo**
- Comienza por los tipos compartidos si es necesario
- Implementa la lógica en el backend (API)
- Desarrolla la interfaz en el frontend
- Prueba la integración

### 3. **Testing**
- Escribe tests para la nueva funcionalidad
- Ejecuta tests existentes para evitar regresiones
- Verifica el tipado con TypeScript

### 4. **Revisión**
- Revisa el código siguiendo los [estándares](./code-standards.md)
- Documenta los cambios si es necesario
- Actualiza la documentación si añades nuevas APIs

## 🎓 Siguientes Pasos de Aprendizaje

### Nivel Principiante
1. [Arquitectura del Sistema](./architecture.md) - Entender la estructura
2. [Estructura del Monorepo](./monorepo-structure.md) - Organización del código
3. [Stack Tecnológico](./tech-stack.md) - Tecnologías utilizadas

### Nivel Intermedio
1. [Guía del Frontend](./frontend/README.md) - Desarrollo React
2. [Guía del Backend](./backend/README.md) - Desarrollo API
3. [Testing](./testing.md) - Estrategias de pruebas

### Nivel Avanzado
1. [Contribución](./contributing.md) - Como contribuir al proyecto
2. [Deployment](./deployment/) - Despliegue en producción
3. [Troubleshooting](./troubleshooting.md) - Solución de problemas

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas o preguntas:

1. **Consulta las FAQ**: [FAQ](./faq.md)
2. **Revisa troubleshooting**: [Troubleshooting](./troubleshooting.md)
3. **Busca en issues**: [GitHub Issues](https://github.com/tu-usuario/cv-maker/issues)
4. **Crea un nuevo issue**: Si no encuentras la solución

## 🎉 ¡Felicidades!

Has completado la guía de primeros pasos. Ahora tienes una comprensión básica del proyecto y estás listo para comenzar a desarrollar.

**Próximos objetivos recomendados:**
- [ ] Explorar el código del frontend
- [ ] Entender la estructura de la API
- [ ] Hacer tu primera contribución
- [ ] Implementar una nueva funcionalidad

¡Bienvenido al equipo de desarrollo de CV Maker! 🚀
