# PowerShell script to copy CSS files from src to dist
$srcDir = Join-Path (Get-Location) "src"
$distDir = Join-Path (Get-Location) "dist"

Write-Host "Copying CSS files from $srcDir to $distDir"

Get-ChildItem -Path $srcDir -Filter "*.css" -Recurse | ForEach-Object {
    $srcPath = $_.FullName
    $relativePath = $srcPath.Substring($srcDir.Length + 1)
    $destPath = Join-Path $distDir $relativePath
    $destFolder = Split-Path $destPath -Parent
    
    Write-Host "Copying: $relativePath"
    
    if (!(Test-Path $destFolder)) {
        New-Item -Path $destFolder -ItemType Directory -Force | Out-Null
    }
    
    Copy-Item -Path $srcPath -Destination $destPath -Force
}

Write-Host "CSS copy completed"
