# ❓ Preguntas Frecuentes (FAQ)

Esta sección responde las preguntas más comunes sobre CV Maker. Si no encuentras la respuesta a tu pregunta, consulta la [guía de troubleshooting](./troubleshooting.md) o crea un [issue en GitHub](https://github.com/tu-usuario/cv-maker/issues).

## 🚀 Instalación y Configuración

### **P: ¿Qué versión de Node.js necesito?**
**R:** Necesitas Node.js versión 20 o superior. Puedes verificar tu versión con:
```bash
node --version
```

### **P: ¿Puedo usar yarn en lugar de npm?**
**R:** Aunque el proyecto está configurado para npm, puedes usar yarn. Sin embargo, recomendamos npm para consistencia:
```bash
# Si usas yarn, ejecuta:
yarn install
yarn dev
```

### **P: Error: "Cannot find module" después de la instalación**
**R:** Esto suele ocurrir cuando las dependencias no se instalaron correctamente:
```bash
# Limpia y reinstala
rm -rf node_modules package-lock.json
npm install
npm run setup:packages
```

### **P: ¿Cómo configuro variables de entorno?**
**R:** Crea archivos `.env` en las carpetas correspondientes:
- Frontend: `apps/frontend/.env`
- Backend: `apps/backend/.env`

Ver la [guía de instalación](./installation.md#3-configurar-variables-de-entorno) para ejemplos completos.

## 🗄️ Base de Datos

### **P: ¿Necesito instalar MongoDB localmente?**
**R:** No es necesario. Recomendamos usar MongoDB Atlas (cloud):
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crear un cluster gratuito
3. Obtener la string de conexión
4. Configurar `MONGODB_URI` en `.env`

### **P: ¿Cómo reseteo la base de datos?**
**R:** Para development, puedes eliminar la base de datos:
```bash
# Conectar a MongoDB y ejecutar:
use cv-maker-dev
db.dropDatabase()
```

### **P: Error: "MongoServerError: Authentication failed"**
**R:** Verifica:
- String de conexión correcta en `.env`
- Usuario y contraseña correctos
- Whitelist de IP configurada en Atlas
- Red permite conexiones externas

## 🎨 Frontend

### **P: ¿Por qué no veo cambios en tiempo real?**
**R:** Verifica que el servidor de desarrollo esté corriendo:
```bash
# Debería mostrar:
# Local: http://localhost:5174
npm run dev:frontend
```

### **P: Error: "Module not found" al importar de @cv-maker/shared**
**R:** Los paquetes compartidos necesitan construirse:
```bash
npm run setup:packages
# o específicamente:
npm run build --workspace=@cv-maker/shared
```

### **P: ¿Cómo agrego nuevos componentes UI?**
**R:** Agrega componentes en `packages/ui/src/components/`:
```typescript
// packages/ui/src/components/MiComponente/index.tsx
export const MiComponente = () => {
  return <div>Mi componente</div>
}

// packages/ui/src/index.ts
export { MiComponente } from './components/MiComponente'
```

### **P: ¿Cómo personalizo los estilos?**
**R:** Modifica las variables CSS en `packages/ui/src/styles/variables.css`:
```css
:root {
  --color-primary: #your-color;
  --font-family: 'Your Font';
}
```

## ⚙️ Backend

### **P: Error: "Port 3001 is already in use"**
**R:** Otro proceso está usando el puerto:
```bash
# Encontrar y matar el proceso
npx kill-port 3001

# O cambiar puerto en .env
PORT=3002
```

### **P: ¿Cómo agrego nuevos endpoints?**
**R:** Sigue este patrón:

1. **Crear modelo** en `src/models/`
2. **Crear controlador** en `src/controllers/`
3. **Definir rutas** en `src/routes/`
4. **Registrar rutas** en el servidor principal

### **P: Error: "JWT malformed" en las requests**
**R:** Verifica:
- Token JWT válido en el header `Authorization`
- Secret JWT correcto en `.env`
- Formato: `Bearer <token>`

### **P: ¿Cómo subo archivos al servidor?**
**R:** Usa el endpoint configurado con multer:
```javascript
// Frontend
const formData = new FormData()
formData.append('file', file)

fetch('/api/upload', {
  method: 'POST',
  body: formData
})
```

## 🧪 Testing

### **P: ¿Cómo ejecuto tests específicos?**
**R:** Usa patrones para filtrar tests:
```bash
# Tests de autenticación
npm test -- --grep "auth"

# Tests de un archivo específico
npm test src/controllers/authController.test.ts
```

### **P: Error: "Cannot resolve module" en tests**
**R:** Verifica la configuración de jest/vitest para resolver rutas del monorepo.

### **P: ¿Cómo agrego tests a un nuevo componente?**
**R:** Crea archivos `.test.tsx` junto a tus componentes:
```typescript
// MiComponente.test.tsx
import { render } from '@testing-library/react'
import { MiComponente } from './MiComponente'

test('renders correctly', () => {
  render(<MiComponente />)
  // tus assertions
})
```

## 🚀 Deployment

### **P: ¿Dónde puedo desplegar la aplicación?**
**R:** Opciones recomendadas:
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Render, Heroku
- **Base de datos**: MongoDB Atlas

### **P: Error de CORS en producción**
**R:** Configura correctamente `CORS_ORIGIN` en el backend:
```env
# Para producción
CORS_ORIGIN=https://tu-dominio.com

# Para múltiples dominios
CORS_ORIGIN=https://tu-dominio.com,https://www.tu-dominio.com
```

### **P: ¿Cómo configuro variables de entorno en Vercel?**
**R:** En el dashboard de Vercel:
1. Ve a Settings → Environment Variables
2. Agrega cada variable con su valor
3. Redeploy el proyecto

## 🔧 Desarrollo

### **P: ¿Cómo agrego una nueva página?**
**R:** En React Router:
```typescript
// App.tsx
import { NewPage } from './components/NewPage'

// Dentro del Router
<Route path="/nueva-pagina" element={<NewPage />} />
```

### **P: ¿Cómo comparto código entre frontend y backend?**
**R:** Usa el paquete `@cv-maker/shared`:
```typescript
// packages/shared/src/types.ts
export interface NuevoTipo {
  id: string
  nombre: string
}

// Usar en frontend/backend
import { NuevoTipo } from '@cv-maker/shared'
```

### **P: Error: "TypeScript error" en importaciones**
**R:** Verifica que los tipos estén exportados correctamente:
```typescript
// packages/shared/src/index.ts
export * from './types'
export * from './utils'
```

## 📱 UI/UX

### **P: ¿La app es responsive?**
**R:** Sí, está diseñada mobile-first con breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### **P: ¿Cómo cambio el tema (claro/oscuro)?**
**R:** El tema se gestiona mediante CSS variables y context:
```typescript
import { useTheme } from '@cv-maker/ui'

const { theme, toggleTheme } = useTheme()
```

### **P: ¿Puedo personalizar los colores del Material Design?**
**R:** Sí, modifica las variables en `packages/ui/src/styles/variables.css`.

## 🔐 Seguridad

### **P: ¿Cómo manejo la autenticación?**
**R:** Usa el hook `useAuth`:
```typescript
import { useAuth } from '@cv-maker/shared'

const { user, login, logout, isAuthenticated } = useAuth()
```

### **P: ¿Los archivos subidos son seguros?**
**R:** Sí, hay validaciones de:
- Tipo de archivo (whitelist)
- Tamaño máximo
- Sanitización de nombres

### **P: ¿Cómo protejo rutas en el frontend?**
**R:** Usa componentes de protección:
```typescript
<ProtectedRoute>
  <AdminPanel />
</ProtectedRoute>
```

## 📊 Performance

### **P: ¿Por qué la app es lenta?**
**R:** Revisa:
- Tamaño del bundle (usa `npm run analyze`)
- Consultas de base de datos (agrega índices)
- Optimizaciones de imágenes
- Caché del navegador

### **P: ¿Cómo optimizo las imágenes?**
**R:** Usa formatos modernos y compresión:
```typescript
// En el upload, procesa las imágenes
// Usa WebP cuando sea posible
// Implementa lazy loading
```

## 🛠️ Contribución

### **P: ¿Cómo contribuyo al proyecto?**
**R:** Sigue estos pasos:
1. Fork del repositorio
2. Crea una rama feature
3. Implementa tus cambios
4. Agrega tests
5. Crea un Pull Request

### **P: ¿Hay estándares de código?**
**R:** Sí, consulta [Code Standards](./code-standards.md) para:
- Convenciones de naming
- Estructura de archivos
- Comentarios y documentación
- ESLint y Prettier configuration

## 📈 Escalabilidad

### **P: ¿El monorepo puede crecer?**
**R:** Sí, está diseñado para escalar:
- Nuevos paquetes en `packages/`
- Nuevas apps en `apps/`
- Microservicios cuando sea necesario

### **P: ¿Cómo divido funcionalidades grandes?**
**R:** Crea nuevos paquetes:
```bash
# Nuevo paquete especializado
mkdir packages/mi-nuevo-paquete
cd packages/mi-nuevo-paquete
npm init
```

## 🎯 Funcionalidades Específicas

### **P: ¿Cómo funciona la generación de PDF?**
**R:** Se usa una librería de generación de PDF (como Puppeteer o jsPDF) que convierte el HTML/CSS del CV en PDF descargable.

### **P: ¿Puedo agregar nuevas secciones al CV?**
**R:** Sí, sigue el patrón existente:
1. Crear modelo en backend
2. Crear API endpoints
3. Crear componentes frontend
4. Agregar al router principal

### **P: ¿Cómo funciona el sistema de templates?**
**R:** Los templates son componentes React que reciben datos del CV y los renderizan en diferentes layouts.

¿No encontraste tu pregunta? [Crea un issue](https://github.com/tu-usuario/cv-maker/issues) y te ayudaremos. 🚀
