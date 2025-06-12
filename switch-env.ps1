#!/usr/bin/env pwsh
# Script para cambiar entre entornos de desarrollo y produccion - Frontend
# Uso: .\switch-env.ps1 [local|production]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "production")]
    [string]$Environment
)

$FrontendPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$EnvFile = Join-Path $FrontendPath ".env.local"

Write-Host "Cambiando al entorno: $Environment (Frontend)" -ForegroundColor Cyan

try {
    # Eliminar archivo .env existente si existe
    if (Test-Path $EnvFile) {
        Remove-Item $EnvFile -Force
        Write-Host "Archivo .env anterior eliminado" -ForegroundColor Yellow
    }

    # Copiar el archivo de entorno correspondiente
    switch ($Environment) {
        "local" {
            $SourceFile = Join-Path $FrontendPath ".env.local"
            Copy-Item $SourceFile $EnvFile
            Write-Host "Configurado para DESARROLLO LOCAL" -ForegroundColor Green
            Write-Host "Usando: .env.local" -ForegroundColor Gray
        }
        "production" {
            $SourceFile = Join-Path $FrontendPath ".env.production"
            Copy-Item $SourceFile $EnvFile
            Write-Host "Configurado para PRODUCCION" -ForegroundColor Green
            Write-Host "Usando: .env.production" -ForegroundColor Gray
        }
    }

    Write-Host "Archivo .env actualizado correctamente" -ForegroundColor Green
    
    # Mostrar el VITE_NODE_ENV o NODE_ENV configurado
    $ViteEnv = (Select-String -Path $EnvFile -Pattern "VITE_NODE_ENV=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
    if ($ViteEnv) {
        Write-Host "VITE_NODE_ENV: $ViteEnv" -ForegroundColor Magenta
    } else {
        $NodeEnv = (Select-String -Path $EnvFile -Pattern "NODE_ENV=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
        if ($NodeEnv) {
            Write-Host "NODE_ENV: $NodeEnv" -ForegroundColor Magenta
        }
    }

} catch {
    Write-Host "Error al cambiar el entorno: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Comandos utiles:" -ForegroundColor Yellow
Write-Host "   npm run dev          - Iniciar en desarrollo" -ForegroundColor Gray
Write-Host "   npm run build        - Construir para produccion" -ForegroundColor Gray
Write-Host "   npm run preview      - Previsualizar build" -ForegroundColor Gray
