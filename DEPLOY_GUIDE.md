# 🚀 CV Maker - Guía de Despliegue

## 📋 Información General

CV Maker es un monorepo con:
- **Frontend**: React + TypeScript + Vite (desplegado en GitHub Pages)
- **Backend**: Node.js + Express + TypeScript (desplegado en Render)
- **Packages**: Shared libs y UI components

## 🏗️ Scripts de Despliegue

### Desde la raíz del proyecto:

```bash
# Despliegue completo (frontend + backend)
npm run deploy:all

# Solo backend (trigger manual en Render)
npm run deploy:backend

# Solo frontend (GitHub Pages)
npm run deploy:frontend

# Despliegue rápido con verificación
npm run deploy:quick
```

### Scripts PowerShell:

```powershell
# Script interactivo con opciones
.\quick-deploy.ps1

# Script completo con logs
.\deploy.ps1
```

## 🔧 Configuración de Render

### Variables de entorno requeridas:
- `MONGODB_URI`: Conexión a MongoDB
- `JWT_SECRET`: Secret para JWT
- `NODE_ENV`: production
- `PORT`: 10000 (automático en Render)

### Comandos de build/start:
- **Build Command**: `npm run render:build`
- **Start Command**: `npm run render:start`

## 🌐 URLs de Producción

- **Frontend**: https://netraluis.github.io/cv-maker/
- **Backend**: https://cv-maker-backend.onrender.com/
- **Health Check**: https://cv-maker-backend.onrender.com/api/health

## ⚡ Auto-Deploy

### GitHub Actions:
- **Trigger**: Push a `main` branch
- **Frontend**: Automático a GitHub Pages
- **Backend**: Automático vía Render webhook

### Render:
- **Trigger**: Push a `main` branch
- **Auto-Deploy**: Configurado desde GitHub

## 🛠️ Troubleshooting

### Si el deploy falla:

1. **Verificar logs**:
   ```bash
   # Verificar estado local
   .\verify-status.ps1
   ```

2. **Forzar re-deploy**:
   ```bash
   # Commit vacío para trigger
   git commit --allow-empty -m "Trigger deploy"
   git push
   ```

3. **Build local**:
   ```bash
   # Probar build completo
   npm run render:build
   npm run render:start
   ```

### Errores comunes:

- **TypeScript errors**: Ejecutar `npm run type-check`
- **Dependencies**: Ejecutar `npm ci` y `npm run setup:packages`
- **Environment vars**: Verificar en Render Dashboard

## 📦 Estructura del Monorepo

```
cv-maker/
├── apps/
│   ├── frontend/          # React app (GitHub Pages)
│   └── backend/           # Express API (Render)
├── packages/
│   ├── shared/            # Tipos y utilidades compartidas
│   └── ui/                # Componentes UI compartidos
├── .github/workflows/     # GitHub Actions
├── deploy.ps1           # Script de deploy completo
├── quick-deploy.ps1     # Script de deploy interactivo
└── verify-status.ps1    # Script de verificación
```

## ✅ Verificación Post-Deploy

Después de cada deploy, verificar:

1. ✅ **Backend Health**: https://cv-maker-backend.onrender.com/api/health
2. ✅ **Frontend Loading**: https://netraluis.github.io/cv-maker/
3. ✅ **API Connectivity**: Frontend conecta con backend
4. ✅ **Database**: Endpoints de datos funcionan

## 🔄 Workflow de Desarrollo

1. **Desarrollo local**:
   ```bash
   npm run dev:all  # Inicia frontend + backend
   ```

2. **Antes de push**:
   ```bash
   npm run type-check     # Verificar tipos
   npm run build:all      # Verificar build
   ```

3. **Deploy**:
   ```bash
   git push origin main   # Auto-deploy activado
   ```

## 📞 Soporte

- **Logs de Render**: https://dashboard.render.com/
- **GitHub Actions**: https://github.com/Adravilag/profile-craft/actions
- **Status verificación**: `.\verify-status.ps1`
