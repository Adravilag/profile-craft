#!/usr/bin/env powershell
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("frontend", "backend", "all", "quick", "full")]
    [string]$Target,
    
    [Parameter(Mandatory=$false)]
    [string]$Message = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# 🚀 CV Maker - Script de Despliegue Unificado
Write-Host "🎯 CV Maker - Despliegue: $Target" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

function Test-ProjectRoot {
    if (-not (Test-Path "package.json") -or -not (Test-Path "apps/frontend") -or -not (Test-Path "apps/backend")) {
        Write-Error "❌ Ejecuta este script desde la raíz del proyecto cv-maker"
        exit 1
    }
}

function Show-Help {
    Write-Host "📋 Uso del script de despliegue:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  .\deploy.ps1 frontend    # Solo frontend (GitHub Pages)" -ForegroundColor Green
    Write-Host "  .\deploy.ps1 backend     # Solo backend (Render)" -ForegroundColor Green  
    Write-Host "  .\deploy.ps1 all         # Frontend + Backend" -ForegroundColor Green
    Write-Host "  .\deploy.ps1 quick       # Solo frontend (más rápido)" -ForegroundColor Green
    Write-Host "  .\deploy.ps1 full        # Con verificaciones completas" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Opciones:" -ForegroundColor Yellow
    Write-Host "  -Message 'descripción'   # Mensaje personalizado para commits" -ForegroundColor Gray
    Write-Host "  -Force                   # Forzar despliegue sin confirmación" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Ejemplos:" -ForegroundColor Magenta
    Write-Host "  .\deploy.ps1 frontend" -ForegroundColor White
    Write-Host "  .\deploy.ps1 backend -Message 'Fix API endpoints'" -ForegroundColor White
    Write-Host "  .\deploy.ps1 all -Force" -ForegroundColor White
}

function Confirm-Deployment {
    param($deployType)
    
    if ($Force) {
        return $true
    }
    
    Write-Host "⚠️  ¿Confirmas el despliegue de $deployType?" -ForegroundColor Yellow
    Write-Host "   Frontend → GitHub Pages" -ForegroundColor Gray
    Write-Host "   Backend → Render" -ForegroundColor Gray
    $confirm = Read-Host "Continuar? (s/N)"
    return ($confirm -eq 's' -or $confirm -eq 'S' -or $confirm -eq 'si' -or $confirm -eq 'Si')
}

function Deploy-Frontend {
    Write-Host "📱 Desplegando Frontend..." -ForegroundColor Blue
    
    # Verificar que gh-pages esté instalado
    $hasGhPages = npm list gh-pages --workspace=@cv-maker/frontend 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ gh-pages no está instalado. Instálalo con: npm install gh-pages --save-dev --workspace=@cv-maker/frontend"
        return $false
    }
    
    Write-Host "🏗️  Building frontend..." -ForegroundColor Yellow
    npm run build:frontend
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Error en build del frontend"
        return $false
    }
    
    Write-Host "🚀 Deploying to GitHub Pages..." -ForegroundColor Yellow
    Set-Location "apps/frontend"
    gh-pages -d dist -b gh-pages
    $success = $LASTEXITCODE -eq 0
    Set-Location "../.."
    
    if ($success) {
        Write-Host "✅ Frontend desplegado exitosamente" -ForegroundColor Green
        Write-Host "🔗 URL: https://tu-usuario.github.io/cv-maker/profile-craft/" -ForegroundColor Cyan
    } else {
        Write-Error "❌ Error desplegando frontend"
    }
    
    return $success
}

function Deploy-Backend {
    Write-Host "⚙️  Desplegando Backend..." -ForegroundColor Blue
    
    # Verificar estado de Git
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "📝 Archivos modificados detectados" -ForegroundColor Yellow
        git status --short
        
        if (-not $Message) {
            $Message = Read-Host "📝 Mensaje del commit (Enter para mensaje automático)"
            if (-not $Message) {
                $Message = "Deploy: backend changes $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
            }
        }
        
        Write-Host "💾 Commiteando cambios..." -ForegroundColor Yellow
        git add .
        git commit -m $Message
        if ($LASTEXITCODE -ne 0) {
            Write-Error "❌ Error en commit"
            return $false
        }
    }
    
    Write-Host "🚀 Pushing to main branch (Render auto-deploy)..." -ForegroundColor Yellow
    git push origin main
    $success = $LASTEXITCODE -eq 0
    
    if ($success) {
        Write-Host "✅ Backend push exitoso - Render desplegará automáticamente" -ForegroundColor Green
        Write-Host "📊 Monitorea el progreso en: https://dashboard.render.com" -ForegroundColor Cyan
    } else {
        Write-Error "❌ Error en push del backend"
    }
    
    return $success
}

function Deploy-All {
    Write-Host "🎯 Desplegando Frontend y Backend..." -ForegroundColor Magenta
    
    $frontendOk = Deploy-Frontend
    $backendOk = Deploy-Backend
    
    if ($frontendOk -and $backendOk) {
        Write-Host "🎉 Despliegue completo exitoso!" -ForegroundColor Green
    } elseif ($frontendOk) {
        Write-Host "⚠️  Frontend OK, Backend falló" -ForegroundColor Yellow
    } elseif ($backendOk) {
        Write-Host "⚠️  Backend OK, Frontend falló" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Ambos despliegues fallaron" -ForegroundColor Red
    }
}

function Deploy-Full {
    Write-Host "🔍 Despliegue completo con verificaciones..." -ForegroundColor Magenta
    
    Write-Host "📦 Building packages..." -ForegroundColor Yellow
    npm run setup:packages
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Error building packages"
        return
    }
    
    Write-Host "🧪 Type checking..." -ForegroundColor Yellow
    npm run type-check
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Type check failed"
        return
    }
    
    Deploy-All
}

# Verificar directorio
Test-ProjectRoot

# Ejecutar según el target
switch ($Target) {
    "frontend" {
        if (Confirm-Deployment "Frontend (GitHub Pages)") {
            Deploy-Frontend
        } else {
            Write-Host "❌ Despliegue cancelado" -ForegroundColor Red
        }
    }
    "backend" {
        if (Confirm-Deployment "Backend (Render)") {
            Deploy-Backend
        } else {
            Write-Host "❌ Despliegue cancelado" -ForegroundColor Red
        }
    }
    "all" {
        if (Confirm-Deployment "Frontend + Backend") {
            Deploy-All
        } else {
            Write-Host "❌ Despliegue cancelado" -ForegroundColor Red
        }
    }
    "quick" {
        Write-Host "⚡ Despliegue rápido - Solo frontend" -ForegroundColor Cyan
        Deploy-Frontend
    }
    "full" {
        if (Confirm-Deployment "Full deployment con verificaciones") {
            Deploy-Full
        } else {
            Write-Host "❌ Despliegue cancelado" -ForegroundColor Red
        }
    }
    default {
        Show-Help
    }
}

Write-Host "`n🏁 Script de despliegue finalizado" -ForegroundColor Cyan
