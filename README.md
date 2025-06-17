


# README Completo de ProfileCraft

## 📝 Descripción del Proyecto

**ProfileCraft** es un generador de CVs profesionales moderno y elegante que permite crear currículums personalizados de manera fácil e intuitiva [1](#0-0) . El proyecto anteriormente era conocido como "CV Maker" y fue completamente renombrado a ProfileCraft manteniendo toda la funcionalidad existente [2](#0-1) .

## ✨ Características Principales

### 🎨 **Diseño y Experiencia de Usuario**
- **Diseño Moderno**: Interfaz limpia y profesional basada en Material Design 3 [3](#0-2) 
- **Responsive**: Funciona perfectamente en todos los dispositivos
- **Personalizable**: Múltiples secciones configurables (experiencia, educación, habilidades, etc.)
- **Temas**: Soporte para modo claro y oscuro [4](#0-3) 

### 🔒 **Seguridad y Persistencia**
- **Autenticación JWT**: Sistema seguro de autenticación [5](#0-4) 
- **Persistencia**: Guarda automáticamente tu progreso en base de datos SQLite [6](#0-5) 
- **Datos seguros**: Almacenamiento local con autenticación JWT

### 📄 **Funcionalidades Avanzadas**
- **Exportación PDF**: Genera PDFs listos para imprimir usando jsPDF [7](#0-6) 
- **Editor Rico**: Soporte para contenido HTML extenso [8](#0-7) 
- **Artículos/Blog**: Sistema completo de gestión de artículos [9](#0-8) 
- **Testimoniales**: Gestión de testimonios de clientes [10](#0-9) 
- **Contacto**: Sistema integrado con EmailJS [11](#0-10) 

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **React 18** con TypeScript [12](#0-11) 
- **Vite** como bundler y servidor de desarrollo [13](#0-12) 
- **CSS Modules** para estilos modulares
- **Material Design 3** principios de diseño
- **React Router** para navegación SPA [14](#0-13) 
- **Framer Motion** para animaciones [15](#0-14) 

### **Backend**
- **Node.js** con Express.js [16](#0-15) 
- **SQLite** como base de datos [17](#0-16) 
- **JWT** para autenticación [18](#0-17) 
- **bcryptjs** para encriptación de contraseñas [19](#0-18) 
- **RESTful API** con validación de datos [20](#0-19) 

## 🚀 Instalación Paso a Paso

### **Prerrequisitos**
- Node.js (versión 16 o superior)
- npm o yarn
- Git

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/Adravilag/ProfileCraft.git
cd ProfileCraft
```

### **2. Instalación de Dependencias**

**Instalar dependencias raíz:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### **3. Configuración del Entorno**
Crear archivo `.env` en la carpeta `backend` con las variables necesarias para el servicio de email y JWT.

### **4. Inicialización de la Base de Datos**
La base de datos SQLite se crea automáticamente al iniciar el servidor backend [6](#0-5) .

## 🎯 Uso del Proyecto

### **Desarrollo**

**Iniciar ambos servidores simultáneamente:**
```bash
npm run dev:all
``` [21](#0-20) 

**O iniciar individualmente:**

**Backend (Puerto 3000):**
```bash
cd backend
npm run dev
```

**Frontend (Puerto 5174):**
```bash
cd frontend
npm run dev
```

### **Acceso a la Aplicación**
1. **Frontend**: http://localhost:5174/ [22](#0-21) 
2. **Backend API**: http://localhost:3000/ [23](#0-22) 

### **Navegación y Funcionalidades**

La aplicación incluye las siguientes secciones principales [24](#0-23) :

1. **Sobre Mí**: Información personal y profesional
2. **Experiencia**: Historial laboral detallado
3. **Artículos**: Sistema de blog/artículos técnicos
4. **Habilidades**: Competencias técnicas y profesionales
5. **Certificaciones**: Títulos y certificaciones obtenidas
6. **Testimoniales**: Opiniones de clientes y colaboradores
7. **Contacto**: Formulario de contacto integrado

## 📁 Estructura del Proyecto

```
ProfileCraft/
├── README.md                    # Documentación principal
├── LICENSE                      # Licencia MIT
├── package.json                 # Configuración raíz y scripts globales
├── frontend/                    # Aplicación React
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   ├── pages/              # Páginas principales
│   │   ├── contexts/           # Contextos de React
│   │   ├── services/           # Servicios API
│   │   └── hooks/              # Hooks personalizados
│   └── package.json            # Dependencias frontend
├── backend/                     # API Server
│   ├── src/
│   │   ├── services/           # Servicios del backend
│   │   └── routes/             # Endpoints de la API
│   ├── data/                   # Base de datos SQLite
│   └── server.ts              # Servidor principal
└── tools/                      # Herramientas auxiliares
```

## 🔧 Funcionalidades Detalladas

### **Sistema de Artículos**
- Creación y edición de artículos con editor rico
- Soporte para contenido HTML y Markdown [25](#0-24) 
- Vista individual de artículos con routing dinámico [26](#0-25) 

### **Gestión de Testimoniales**
- Sistema completo de gestión para administradores [27](#0-26) 
- API para crear, actualizar y eliminar testimonios [28](#0-27) 

### **Generación de PDF**
- Exportación del CV completo a PDF [7](#0-6) 
- Captura de pantalla con html2canvas [29](#0-28) 

### **Performance y Optimización**
- Lazy loading de componentes [30](#0-29) 
- Monitoreo de performance integrado [31](#0-30) 
- Métricas de Core Web Vitals

## 🏗️ Construcción para Producción

**Construir todo el proyecto:**
```bash
npm run build:all
``` [32](#0-31) 

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT [33](#0-32) . Ver el archivo `LICENSE` para más detalles [34](#0-33) .

## 📧 Contacto

**ProfileCraft** - Generador de CVs Profesionales

Project Link: [https://github.com/Adravilag/ProfileCraft](https://github.com/Adravilag/ProfileCraft)

---

## 📊 Estado del Proyecto

**✅ FUNCIONANDO PERFECTAMENTE** [35](#0-34) :
- Frontend y Backend operativos
- Build de producción exitoso
- Base de datos correctamente configurada
- Todas las funcionalidades implementadas

**Comando rápido para desarrollo:**
```bash
npm run dev:all
```

## Notes

Este README está basado en el análisis completo del codebase de ProfileCraft. El proyecto es un generador de CVs profesionales full-stack que utiliza tecnologías modernas como React 18, TypeScript, Node.js, Express y SQLite. Incluye funcionalidades avanzadas como autenticación JWT, sistema de artículos, gestión de testimoniales, exportación a PDF y un diseño responsive basado en Material Design 3. El proyecto está completamente funcional y listo para uso en desarrollo y producción.