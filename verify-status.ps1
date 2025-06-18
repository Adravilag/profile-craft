#!/usr/bin/env pwsh
# Script para verificar el estado de los despliegues

Write-Host "=== VERIFICACIÓN DEL ESTADO DE DESPLIEGUES ===" -ForegroundColor Cyan
Write-Host ""

# Verificar si el backend de Render está funcionando
Write-Host "🔍 Verificando Backend en Render..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://cv-maker-backend.onrender.com/api/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend está funcionando correctamente" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Error al conectar con el backend:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor White
}

Write-Host ""

# Verificar endpoint de autenticación
Write-Host "🔍 Verificando endpoint de autenticación..." -ForegroundColor Yellow
try {
    $authResponse = Invoke-RestMethod -Uri "https://cv-maker-backend.onrender.com/api/auth/has-user" -Method GET -TimeoutSec 10
    Write-Host "✅ Endpoint de autenticación responde correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en endpoint de autenticación:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor White
}

Write-Host ""

# Verificar el frontend en GitHub Pages
Write-Host "🔍 Verificando Frontend en GitHub Pages..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://netraluis.github.io/cv-maker/" -Method GET -TimeoutSec 10
    Write-Host "✅ Frontend está accesible" -ForegroundColor Green
    Write-Host "   Status Code: $($frontendResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "❌ Error al acceder al frontend:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor White
}

Write-Host ""
Write-Host "=== VERIFICACIÓN COMPLETADA ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Para verificar manualmente:" -ForegroundColor Blue
Write-Host "   • Backend: https://cv-maker-backend.onrender.com/api/health"
Write-Host "   • Frontend: https://netraluis.github.io/cv-maker/"
Write-Host "   • Render Dashboard: https://dashboard.render.com/"
Write-Host "   • GitHub Actions: https://github.com/netraluis/cv-maker/actions"
