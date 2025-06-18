#!/usr/bin/env pwsh
# Script de verificación post-limpieza

Write-Host "🧹 CV Maker - Verificación de Limpieza de Código" -ForegroundColor Cyan
Write-Host ""

# Verificar archivos temporales
Write-Host "🔍 Verificando archivos temporales..." -ForegroundColor Yellow
$tempFiles = @("deploy-log.txt", "package-render.json", "verify-deployment.ps1")
$foundTempFiles = @()

foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        $foundTempFiles += $file
    }
}

if ($foundTempFiles.Count -eq 0) {
    Write-Host "✅ No se encontraron archivos temporales conocidos" -ForegroundColor Green
} else {
    Write-Host "⚠️  Archivos temporales encontrados:" -ForegroundColor Red
    foreach ($file in $foundTempFiles) {
        Write-Host "   - $file" -ForegroundColor White
    }
}

Write-Host ""

# Verificar scripts de deploy
Write-Host "🔍 Verificando scripts de deploy..." -ForegroundColor Yellow
$deployScripts = @("quick-deploy.ps1", "deploy.ps1", "switch-project-env.ps1")
foreach ($script in $deployScripts) {
    if (Test-Path $script) {
        Write-Host "✅ $script - Presente" -ForegroundColor Green
    } else {
        Write-Host "❌ $script - Faltante" -ForegroundColor Red
    }
}

Write-Host ""

# Verificar documentación principal
Write-Host "🔍 Verificando documentación principal..." -ForegroundColor Yellow
$mainDocs = @("README.md", "DEPLOY_GUIDE.md")
foreach ($doc in $mainDocs) {
    if (Test-Path $doc) {
        Write-Host "✅ $doc - Presente" -ForegroundColor Green
    } else {
        Write-Host "❌ $doc - Faltante" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 Verificación de limpieza completada" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos pasos recomendados:" -ForegroundColor Blue
Write-Host "   1. Revisar commits pendientes: git status"
Write-Host "   2. Verificar deploy: .\quick-deploy.ps1 quick"
Write-Host "   3. Confirmar backend: endpoint de salud"
