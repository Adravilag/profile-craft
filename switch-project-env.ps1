#!/usr/bin/env pwsh
# Script maestro para cambiar entornos en todo el proyecto CV Maker

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "production")]
    [string]$Environment
)

Write-Host "=== CV Maker - Cambio de Entorno Global ===" -ForegroundColor Cyan
Write-Host "Configurando entorno: $Environment" -ForegroundColor Yellow
Write-Host ""

$ProjectRoot = Get-Location
$BackendPath = Join-Path $ProjectRoot "backend"
$FrontendPath = Join-Path $ProjectRoot "frontend"

# Configurar Backend
Write-Host "1. Backend..." -ForegroundColor Green
if (Test-Path $BackendPath) {
    Set-Location $BackendPath
    if (Test-Path "switch-env.ps1") {
        & ".\switch-env.ps1" $Environment
    } else {
        Write-Host "   Script no encontrado" -ForegroundColor Red
    }
    Set-Location $ProjectRoot
} else {
    Write-Host "   Directorio no encontrado" -ForegroundColor Red
}

Write-Host ""

# Configurar Frontend
Write-Host "2. Frontend..." -ForegroundColor Green
if (Test-Path $FrontendPath) {
    Set-Location $FrontendPath
    if (Test-Path "switch-env.ps1") {
        & ".\switch-env.ps1" $Environment
    } else {
        Write-Host "   Script no encontrado" -ForegroundColor Red
    }
    Set-Location $ProjectRoot
} else {
    Write-Host "   Directorio no encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "Configuracion completada!" -ForegroundColor Green
