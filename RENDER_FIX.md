# 🔧 Configuración de Render para Monorepo - CV Maker

## ❌ **Problema Detectado**
```
npm error Missing script: "render:build"
==> Build failed 😞
```

## ✅ **Solución Implementada**

### **Scripts agregados al package.json raíz:**
```json
{
  "scripts": {
    "render:build": "npm install && npm run setup:packages && cd apps/backend && npm run build",
    "render:start": "cd apps/backend && node dist-server/server-mongodb.js"
  }
}
```

---

## 🚀 **Configuración de Render Dashboard**

### **1. General Settings:**
- **Name**: `cv-maker-backend` (o tu nombre preferido)
- **Environment**: `Node`
- **Region**: `Oregon (US West)` o el más cercano
- **Branch**: `main`
- **Root Directory**: `.` (raíz del proyecto, NO apps/backend)

### **2. Build & Deploy Settings:**
```bash
Build Command: npm run render:build
Start Command: npm run render:start
```

### **3. Advanced Settings:**
- **Node Version**: `18` (o superior)
- **Build Timeout**: `20 minutes` (para builds largos de monorepo)
- **Auto-Deploy**: `Yes` (deploy automático en push)

---

## 🔍 **Proceso de Build de Render**

### **Lo que hace `npm run render:build`:**
1. `npm install` → Instala todas las dependencias del monorepo
2. `npm run setup:packages` → Compila @cv-maker/shared y @cv-maker/ui
3. `cd apps/backend` → Se mueve al directorio del backend
4. `npm run build` → Compila TypeScript del backend

### **Lo que hace `npm run render:start`:**
1. `cd apps/backend` → Se mueve al directorio del backend
2. `node dist-server/server-mongodb.js` → Inicia el servidor

---

## 📋 **Variables de Entorno Necesarias**

### **En Render Dashboard → Environment:**
```bash
# Obligatorias
NODE_ENV=production
JWT_SECRET=ProfileCraft-Super-Secure-Secret-Key-2024-Render-Production

# Base de datos
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cvmaker

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
CONTACT_EMAIL=tu-email@gmail.com

# Cloudinary (archivos)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# URLs
FRONTEND_URL=https://tu-usuario.github.io/profile-craft/profile-craft/
API_BASE_URL=https://tu-backend.onrender.com
```

---

## 🔄 **Proceso de Deploy Corregido**

### **1. Desde tu local:**
```bash
# Hacer cambios en el backend
git add .
git commit -m "Backend: descripción de cambios"
git push origin main
```

### **2. Render detecta el push:**
```bash
==> Cloning from https://github.com/Adravilag/profile-craft
==> Running build command 'npm run render:build'...
✅ npm install
✅ npm run setup:packages
✅ cd apps/backend && npm run build
==> Running start command 'npm run render:start'...
✅ cd apps/backend && node dist-server/server-mongodb.js
==> Deploy successful! 🎉
```

---

## 🧪 **Verificación Post-Deploy**

### **1. Health Check:**
```bash
curl https://tu-backend.onrender.com/api/auth/has-user
```

### **2. En Render Dashboard:**
- Ver logs en tiempo real
- Verificar que no hay errores
- Comprobar métricas de memoria/CPU

### **3. Desde Frontend:**
- Verificar que la API responde
- Probar login/autenticación
- Verificar CORS configurado

---

## 🆘 **Troubleshooting**

### **Si build falla:**
1. Verificar que `render:build` existe: `npm run`
2. Probar build local: `npm run render:build`
3. Verificar logs de Render para errores específicos

### **Si start falla:**
1. Verificar que `dist-server/` se creó en build
2. Verificar variables de entorno
3. Comprobar logs de aplicación en Render

### **Si CORS falla:**
1. Verificar `FRONTEND_URL` en variables de entorno
2. Comprobar configuración CORS en backend
3. Verificar que URLs coinciden exactamente

---

## 📊 **Monitoreo**

### **URLs importantes:**
- **Render Dashboard**: https://dashboard.render.com
- **Logs en vivo**: En el dashboard de tu servicio
- **Métricas**: CPU, memoria, requests por segundo

### **Comandos de verificación:**
```bash
# Test API
curl https://tu-backend.onrender.com/api/auth/has-user

# Test health (si existe)
curl https://tu-backend.onrender.com/health

# Test CORS
curl -H "Origin: https://tu-usuario.github.io" https://tu-backend.onrender.com/api/auth/has-user
```

---

## ✅ **Status: CONFIGURACIÓN CORREGIDA**

Los scripts `render:build` y `render:start` están ahora disponibles en el package.json raíz. El próximo deploy en Render debería funcionar correctamente.

**Commit realizado:** `Fix: Add render:build and render:start scripts to root package.json for Render deployment`
