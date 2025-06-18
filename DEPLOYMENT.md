# 🚀 Guía de Despliegue - CV Maker Monorepo

## 📊 **Estrategia de Despliegue**

### **Backend: Render**
- **URL**: `https://cv-maker-backend.onrender.com`
- **Base de datos**: MongoDB Atlas
- **Archivos**: Cloudinary

### **Frontend: Vercel**
- **URL**: `https://cv-maker-frontend.vercel.app`
- **Framework**: Vite + React
- **Base path**: `/profile-craft/`

---

## 🎯 **1. Despliegue del Backend en Render**

### **Configuración ya lista:**
- ✅ Scripts en `package.json`
- ✅ Archivos en `/deploy/`
- ✅ Variables de entorno documentadas

### **Comandos:**
```bash
# Build Command
npm run render:build

# Start Command  
npm run render:start
```

### **Variables de entorno necesarias:**
```bash
NODE_ENV=production
JWT_SECRET=tu-jwt-secret-super-seguro
MONGODB_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

---

## 🎨 **2. Despliegue del Frontend en Vercel**

### **Paso 1: Configurar build desde monorepo**
```bash
# Root Directory: apps/frontend
# Build Command: npm run build:frontend --workspace=root
# Output Directory: dist
```

### **Paso 2: Variables de entorno**
```bash
VITE_API_URL=https://cv-maker-backend.onrender.com/api
VITE_NODE_ENV=production
```

---

## 🔧 **3. Configuración Automática**

### **Scripts adicionales para package.json root:**
```json
{
  "scripts": {
    "deploy:backend": "cd apps/backend && git subtree push --prefix apps/backend render main",
    "deploy:frontend": "npm run build:frontend && cd apps/frontend && npx vercel --prod",
    "deploy:all": "npm run deploy:backend && npm run deploy:frontend"
  }
}
```

### **GitHub Actions (Opcional):**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-backend:
    # Deploy a Render cuando cambie /apps/backend
  deploy-frontend:
    # Deploy a Vercel cuando cambie /apps/frontend
```

---

## 🌐 **4. Alternativas de Despliegue**

### **Opción A: Todo en Render**
- **Pros**: Un solo proveedor, más simple
- **Contras**: Costo más alto para frontend estático

### **Opción B: Frontend en GitHub Pages**
- **Pros**: Gratis
- **Contras**: Solo contenido estático, configuración más compleja

### **Opción C: Todo en Vercel**
- **Pros**: Excelente DX, serverless functions
- **Contras**: Limitaciones en DB connections

---

## 📋 **5. Checklist de Despliegue**

### **Backend:**
- [ ] MongoDB Atlas configurado
- [ ] Cloudinary configurado  
- [ ] Variables de entorno en Render
- [ ] Health check funcionando
- [ ] CORS configurado para frontend

### **Frontend:**
- [ ] API_URL apuntando a backend
- [ ] Build funcionando localmente
- [ ] Rutas configuradas correctamente
- [ ] Assets optimizados

### **Monorepo:**
- [ ] Packages building correctamente
- [ ] Dependencies actualizadas
- [ ] Scripts de despliegue probados

---

## 🔍 **6. Testing Post-Despliegue**

```bash
# Test Backend
curl https://cv-maker-backend.onrender.com/health

# Test Frontend
curl https://cv-maker-frontend.vercel.app/profile-craft/

# Test API Integration
curl https://cv-maker-backend.onrender.com/api/profile
```

---

## 🚨 **7. Troubleshooting Común**

### **Backend en Render:**
- **Error**: `Application failed to respond`
  - **Solución**: Verificar PORT=process.env.PORT
  
- **Error**: `MongoDB connection failed`
  - **Solución**: Verificar MONGODB_URI y IP whitelist

### **Frontend en Vercel:**
- **Error**: `404 en rutas`
  - **Solución**: Configurar rewrites en vercel.json
  
- **Error**: `API calls failing`
  - **Solución**: Verificar CORS y VITE_API_URL
