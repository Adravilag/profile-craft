#!/usr/bin/env pwsh
# Script de verificación post-limpieza

Write-Host "🧹 CV Maker - Verificación de Limpieza" -ForegroundColor Cyan
Write-Host ""

# Verificar archivos temporales
Write-Host "🔍 Verificando archivos temporales..." -ForegroundColor Yellow
$tempFiles = @("deploy-log.txt", "package-render.json", "verify-deployment.ps1", "*.bak")

$foundTempFiles = @()
foreach ($pattern in $tempFiles) {
    $files = Get-ChildItem -Path "." -Name $pattern -Recurse -ErrorAction SilentlyContinue
    $foundTempFiles += $files
}

if ($foundTempFiles.Count -eq 0) {
    Write-Host "✅ No archivos temporales encontrados" -ForegroundColor Green
} else {
    Write-Host "⚠️ Archivos temporales:" -ForegroundColor Red
    $foundTempFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
}

Write-Host ""

# Verificar documentación
Write-Host "🔍 Verificando documentación..." -ForegroundColor Yellow
$docFiles = Get-ChildItem -Path "." -Name "*.md" | Where-Object { $_ -notlike "*node_modules*" }
Write-Host "📚 Archivos de documentación:" -ForegroundColor White
$docFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }

Write-Host ""

# Verificar scripts
Write-Host "🔍 Verificando scripts..." -ForegroundColor Yellow
$scripts = @("quick-deploy.ps1", "deploy.ps1", "switch-project-env.ps1")
foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "✅ $script" -ForegroundColor Green
    } else {
        Write-Host "❌ $script" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 Verificación completada" -ForegroundColor Cyan
