# 🚀 Comandos de Despliegue desde la Raíz

## 📋 **Todos los comandos desde `d:\Profesional\cv-maker\`**

### ⚡ **Comandos Simples (NPM)**

```bash
# Solo frontend (GitHub Pages) - El más común
npm run deploy

# Solo backend (Render)
npm run deploy:backend

# Frontend + Backend
npm run deploy:all

# Solo frontend (más rápido, sin verificaciones)
npm run deploy:quick

# Completo con verificaciones de tipos
npm run deploy:full
```

### 🎯 **Script Avanzado (PowerShell)**

```bash
# Solo frontend
.\quick-deploy.ps1 frontend

# Solo backend
.\quick-deploy.ps1 backend

# Frontend + Backend
.\quick-deploy.ps1 all

# Solo frontend (sin confirmación)
.\quick-deploy.ps1 quick

# Completo con verificaciones
.\quick-deploy.ps1 full

# Con mensaje personalizado
.\quick-deploy.ps1 backend -Message "Fix API endpoints"

# Sin confirmación
.\quick-deploy.ps1 all -Force
```

---

## 🎨 **Equivalencias de Comandos**

| **Comando Anterior** | **Nuevo Comando (Raíz)** | **Descripción** |
|----------------------|--------------------------|------------------|
| `cd apps/frontend && npm run deploy` | `npm run deploy` | Frontend a GitHub Pages |
| `git push origin main` | `npm run deploy:backend` | Backend a Render |
| *Manual* | `npm run deploy:all` | Frontend + Backend |
| *No existía* | `npm run deploy:quick` | Solo frontend rápido |
| *No existía* | `npm run deploy:full` | Con verificaciones |

---

## 📱 **Frontend (GitHub Pages)**

### **Comando directo:**
```bash
npm run deploy
```

### **Alternativas:**
```bash
npm run deploy:frontend              # Alias explícito
npm run deploy:frontend:gh-pages     # Comando específico
.\quick-deploy.ps1 frontend          # Script con confirmación
.\quick-deploy.ps1 quick             # Sin confirmación
```

**Lo que hace:**
1. `npm run build:frontend` → Compila React + TypeScript
2. `gh-pages -d dist -b gh-pages` → Sube a GitHub Pages

---

## ⚙️ **Backend (Render)**

### **Comando directo:**
```bash
npm run deploy:backend
```

### **Alternativas:**
```bash
npm run deploy:backend:render        # Comando específico
.\quick-deploy.ps1 backend           # Script con confirmación
git add . && git commit -m "msg" && git push origin main  # Manual
```

**Lo que hace:**
1. `git add .` → Agrega cambios
2. `git commit -m "Deploy: backend changes"` → Commit automático
3. `git push origin main` → Push que trigger Render

---

## 🔄 **Frontend + Backend**

### **Comando directo:**
```bash
npm run deploy:all
```

### **Alternativas:**
```bash
.\quick-deploy.ps1 all               # Script con confirmación
npm run deploy:full                  # Con verificaciones de tipos
.\quick-deploy.ps1 full              # Script completo con checks
```

**Lo que hace:**
1. Despliega frontend a GitHub Pages
2. Despliega backend a Render
3. Muestra URLs de resultado

---

## 🧪 **Con Verificaciones**

### **Comando completo:**
```bash
npm run deploy:full
```

### **Script avanzado:**
```bash
.\quick-deploy.ps1 full
```

**Lo que hace:**
1. `npm run setup:packages` → Compila packages compartidos
2. `npm run type-check` → Verifica tipos TypeScript
3. `npm run deploy:all` → Despliega todo

---

## 💡 **Recomendaciones de Uso**

### **Desarrollo diario:**
```bash
npm run deploy          # Solo frontend (más común)
```

### **Cambios en backend:**
```bash
npm run deploy:backend  # Solo backend
```

### **Deploy completo:**
```bash
npm run deploy:all      # Frontend + Backend
```

### **Deploy con verificaciones:**
```bash
npm run deploy:full     # Con type checking
```

---

## 🔍 **Verificación Post-Deploy**

### **Verificar Frontend:**
```bash
# URL resultante
https://tu-usuario.github.io/cv-maker/profile-craft/
```

### **Verificar Backend:**
```bash
# Verificar API
curl https://tu-backend.onrender.com/api/auth/has-user

# Ver logs en Render Dashboard
https://dashboard.render.com
```

---

## 🆘 **Troubleshooting**

### **Error en Frontend:**
```bash
# Verificar gh-pages
npm list gh-pages --workspace=@cv-maker/frontend

# Re-build manual
npm run build:frontend
cd apps/frontend
npm run deploy
```

### **Error en Backend:**
```bash
# Verificar status de git
git status

# Push manual
git add .
git commit -m "Manual deploy"
git push origin main
```

### **Error en Packages:**
```bash
# Re-build packages
npm run setup:packages

# Limpiar y re-build
npm run clean
npm install
npm run setup:packages
```

---

## ✅ **Resumen: Comandos Más Usados**

```bash
# 🥇 Más común (solo frontend)
npm run deploy

# 🥈 Segundo más común (solo backend) 
npm run deploy:backend

# 🥉 Para releases (frontend + backend)
npm run deploy:all

# 🔧 Con verificaciones completas
npm run deploy:full
```

**¡Ahora puedes desplegar todo desde la raíz del proyecto!** 🎉
