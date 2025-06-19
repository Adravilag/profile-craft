# 🚀 CV Maker v1.0.0 - Profile-Craft (Initial Release)

## 📋 Overview

**CV Maker (Profile-Craft)** es una plataforma moderna y profesional para crear portfolios y CVs interactivos. Esta es la primera versión estable del proyecto, lista para uso en producción.

## ✨ Features

### 🎨 **Core Functionality**
- **Complete CV/Portfolio Management System** - Sistema completo de gestión de CV y portafolio
- **PDF Export** - Exportación a PDF de alta calidad
- **Responsive Design** - Diseño adaptable a cualquier dispositivo
- **Material Design 3** - Interfaz moderna y elegante
- **Multiple Templates** - Plantillas personalizables para diferentes estilos

### 🛡️ **Authentication & Security**
- **JWT Authentication** - Sistema de autenticación seguro
- **User Management** - Gestión completa de usuarios
- **Protected Routes** - Rutas protegidas en frontend y backend
- **Secure File Upload** - Carga segura de archivos con validación

### 🎯 **Admin Panel**
- **Content Management** - Panel completo para gestionar contenido
- **Experience Management** - Gestión de experiencia laboral
- **Project Portfolio** - Administración de proyectos
- **Education & Skills** - Gestión de educación y habilidades
- **Certifications** - Administración de certificaciones
- **Testimonials** - Gestión de testimonios

### 🖼️ **Media Management**
- **File Upload System** - Sistema de carga de archivos
- **Cloudinary Integration** - Integración con Cloudinary para gestión de imágenes
- **Image Optimization** - Optimización automática de imágenes
- **Multiple File Formats** - Soporte para múltiples formatos

## 🛠️ Tech Stack

### **Frontend**
- **React 18.3.1** - Framework principal con Concurrent Features
- **TypeScript 5.8.3** - Tipado estático para mayor robustez
- **Vite 6.3.5** - Build tool ultra-rápido
- **React Router DOM 7.6.1** - Navegación SPA
- **Axios 1.9.0** - Cliente HTTP
- **HTML2Canvas + jsPDF** - Exportación a PDF

### **Backend**
- **Node.js 20+** - Runtime de JavaScript
- **Express 5.1.0** - Framework web
- **TypeScript 5.8.3** - Tipado estático
- **Mongoose 8.15.1** - ODM para MongoDB
- **JWT + bcryptjs** - Autenticación y seguridad
- **Multer 2.0.1** - Manejo de archivos

### **Database & Storage**
- **MongoDB Atlas** - Base de datos en la nube
- **Cloudinary** - Gestión de archivos multimedia
- **Better SQLite3** - Alternativa local para desarrollo

### **Development & Deployment**
- **Monorepo Architecture** - Arquitectura de monorepo con workspaces
- **GitHub Pages** - Hosting frontend
- **Render** - Hosting backend
- **GitHub Actions** - CI/CD

## 📦 Installation

### Quick Start
```bash
# Clone the repository
git clone https://github.com/tu-usuario/cv-maker.git
cd cv-maker

# Install dependencies
npm install

# Setup shared packages
npm run setup:packages

# Start development servers
npm run dev:all
```

### URLs
- **Frontend**: http://localhost:5174
- **Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

## 📚 Documentation

Esta versión incluye documentación completa:

- **[Installation Guide](docs/installation.md)** - Guía de instalación paso a paso
- **[Getting Started](docs/getting-started.md)** - Primeros pasos para desarrolladores
- **[Architecture](docs/architecture.md)** - Arquitectura del sistema
- **[Tech Stack](docs/tech-stack.md)** - Stack tecnológico completo
- **[Frontend Guide](docs/frontend/README.md)** - Guía del frontend
- **[Backend Guide](docs/backend/README.md)** - Guía del backend
- **[Code Standards](docs/code-standards.md)** - Estándares de código
- **[Troubleshooting](docs/troubleshooting.md)** - Solución de problemas
- **[FAQ](docs/faq.md)** - Preguntas frecuentes

## 🚀 Deployment

### Frontend (GitHub Pages)
```bash
npm run deploy:frontend
```

### Backend (Render)
```bash
npm run deploy:backend
```

### Environment Variables
Ver [Installation Guide](docs/installation.md#3-configurar-variables-de-entorno) para configuración completa.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [Code Standards](docs/code-standards.md) for detailed contribution guidelines.

## 📞 Support

- 📧 Email: adrian.davilaguerra@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/cv-maker/issues)
- 📖 Documentation: [docs/](docs/)

## 🎯 What's Next?

Esta es una versión estable y funcional. Las próximas versiones incluirán:
- Más plantillas de CV
- Integración con redes sociales
- Export a diferentes formatos
- Temas personalizables
- Funcionalidades colaborativas

---

**¡Gracias por usar CV Maker! 🚀**
