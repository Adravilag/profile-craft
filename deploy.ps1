#!/usr/bin/env powershell

# 🚀 Script de Configuración de Despliegue - CV Maker
# Este script configura los repositorios remotos y variables necesarias para el despliegue

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("setup", "deploy", "status", "clean")]
    [string]$Action = "setup"
)

Write-Host "🎯 CV Maker - Configuración de Despliegue" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

function Setup-Deployment {
    Write-Host "📋 Configurando repositorios remotos..." -ForegroundColor Yellow
    
    # Verificar si estamos en la raíz del proyecto
    if (-not (Test-Path "package.json")) {
        Write-Error "❌ Ejecuta este script desde la raíz del proyecto"
        exit 1
    }
    
    # Configurar remoto para Render (backend)
    Write-Host "🔧 Configurando remoto de Render..." -ForegroundColor Green
    git remote remove render 2>$null
    $renderUrl = Read-Host "📝 Ingresa la URL del repositorio de Render (ej: https://git.render.com/srv-xxx.git)"
    if ($renderUrl) {
        git remote add render $renderUrl
        Write-Host "✅ Remoto 'render' configurado" -ForegroundColor Green
    }
    
    # Información sobre Vercel
    Write-Host "📱 Para Vercel (frontend):" -ForegroundColor Blue
    Write-Host "  1. Instala Vercel CLI: npm i -g vercel" -ForegroundColor Gray
    Write-Host "  2. Loguéate: vercel login" -ForegroundColor Gray
    Write-Host "  3. Vincula el proyecto: cd apps/frontend && vercel" -ForegroundColor Gray
    
    # Información sobre variables de entorno
    Write-Host "🔐 Variables de entorno necesarias:" -ForegroundColor Magenta
    Write-Host "Backend (Render):" -ForegroundColor White
    Write-Host "  - NODE_ENV=production" -ForegroundColor Gray
    Write-Host "  - JWT_SECRET=tu-jwt-secret" -ForegroundColor Gray
    Write-Host "  - MONGODB_URI=mongodb+srv://..." -ForegroundColor Gray
    Write-Host "  - CLOUDINARY_CLOUD_NAME=..." -ForegroundColor Gray
    Write-Host "  - CLOUDINARY_API_KEY=..." -ForegroundColor Gray
    Write-Host "  - CLOUDINARY_API_SECRET=..." -ForegroundColor Gray
    
    Write-Host "Frontend (Vercel):" -ForegroundColor White
    Write-Host "  - VITE_API_URL=https://tu-backend.onrender.com/api" -ForegroundColor Gray
    Write-Host "  - VITE_NODE_ENV=production" -ForegroundColor Gray
}

function Deploy-All {
    Write-Host "🚀 Iniciando despliegue completo..." -ForegroundColor Yellow
    
    # Build de packages
    Write-Host "📦 Building packages..." -ForegroundColor Blue
    npm run setup:packages
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Error building packages"
        exit 1
    }
    
    # Build y test
    Write-Host "🧪 Running type checks..." -ForegroundColor Blue
    npm run type-check
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Type check failed"
        exit 1
    }
    
    # Build frontend
    Write-Host "🎨 Building frontend..." -ForegroundColor Blue
    npm run build:frontend
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Frontend build failed"
        exit 1
    }
    
    # Build backend
    Write-Host "⚙️ Building backend..." -ForegroundColor Blue
    npm run build:backend
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Backend build failed"
        exit 1
    }
    
    Write-Host "✅ Builds completados!" -ForegroundColor Green
    
    # Commit y push
    $commit = Read-Host "📝 Mensaje del commit (opcional)"
    if (-not $commit) {
        $commit = "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    
    git add .
    git commit -m $commit
    git push origin main
    
    Write-Host "🎉 Despliegue iniciado!" -ForegroundColor Green
    Write-Host "📊 Monitorea el progreso en:" -ForegroundColor Yellow
    Write-Host "  - Render: https://dashboard.render.com" -ForegroundColor Gray
    Write-Host "  - Vercel: https://vercel.com/dashboard" -ForegroundColor Gray
    Write-Host "  - GitHub Actions: https://github.com/tu-usuario/cv-maker/actions" -ForegroundColor Gray
}

function Show-Status {
    Write-Host "📊 Estado del proyecto:" -ForegroundColor Yellow
    
    # Git status
    Write-Host "📁 Git Status:" -ForegroundColor Blue
    git status --short
    
    # Remotos
    Write-Host "🔗 Remotos configurados:" -ForegroundColor Blue
    git remote -v
    
    # Últimos commits
    Write-Host "📜 Últimos commits:" -ForegroundColor Blue
    git log --oneline -5
    
    # Estado de packages
    Write-Host "📦 Estado de packages:" -ForegroundColor Blue
    if (Test-Path "packages/shared/dist") {
        Write-Host "  ✅ @cv-maker/shared built" -ForegroundColor Green
    } else {
        Write-Host "  ❌ @cv-maker/shared not built" -ForegroundColor Red
    }
    
    if (Test-Path "packages/ui/dist") {
        Write-Host "  ✅ @cv-maker/ui built" -ForegroundColor Green
    } else {
        Write-Host "  ❌ @cv-maker/ui not built" -ForegroundColor Red
    }
}

function Clean-Deployment {
    Write-Host "🧹 Limpiando archivos de build..." -ForegroundColor Yellow
    
    npm run clean
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "apps/*/node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "packages/*/node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
    Write-Host "📝 Ejecuta 'npm install' para reinstalar dependencias" -ForegroundColor Yellow
}

# Ejecutar acción
switch ($Action) {
    "setup" { Setup-Deployment }
    "deploy" { Deploy-All }
    "status" { Show-Status }
    "clean" { Clean-Deployment }
    default { 
        Write-Host "❌ Acción no válida. Usa: setup, deploy, status, o clean" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🎉 Operación completada!" -ForegroundColor Green
