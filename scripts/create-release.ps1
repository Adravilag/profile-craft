#!/usr/bin/env pwsh
# Scripts para crear releases automáticamente

param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    [string]$Message = ""
)

Write-Host "🚀 Creando release v$Version" -ForegroundColor Green

# Validar formato de versión
if ($Version -notmatch '^\d+\.\d+\.\d+$') {
    Write-Host "❌ Error: La versión debe estar en formato X.Y.Z (ej: 1.0.1)" -ForegroundColor Red
    exit 1
}

# Actualizar package.json files
$packageFiles = @(
    "package.json",
    "apps/frontend/package.json", 
    "apps/backend/package.json",
    "packages/shared/package.json",
    "packages/ui/package.json"
)

Write-Host "📝 Actualizando archivos package.json..." -ForegroundColor Yellow

foreach ($file in $packageFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $updated = $content -replace '"version": "\d+\.\d+\.\d+"', "`"version`": `"$Version`""
        Set-Content $file $updated -NoNewline
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $file no encontrado" -ForegroundColor Yellow
    }
}

# Crear mensaje de commit predeterminado si no se proporciona
if ([string]::IsNullOrEmpty($Message)) {
    $Message = "chore: bump version to $Version"
}

Write-Host "📦 Preparando commit y tag..." -ForegroundColor Yellow

# Git operations
try {
    git add .
    git commit -m $Message
    git tag -a "v$Version" -m "Profile-Craft v$Version"
    
    Write-Host "🔄 Subiendo cambios al repositorio..." -ForegroundColor Yellow
    git push origin main
    git push origin "v$Version"
    
    Write-Host "✅ Release v$Version creado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Ve a GitHub y crea un release desde el tag v$Version"
    Write-Host "2. Copia el contenido de RELEASE_NOTES.md para la descripción"
    Write-Host "3. Opcionalmente, adjunta archivos build"
    Write-Host ""
    Write-Host "🔗 Link directo al release:" -ForegroundColor Cyan
    Write-Host "https://github.com/Adravilag/profile-craft/releases/new?tag=v$Version"
    
} catch {
    Write-Host "❌ Error durante el proceso de git: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
