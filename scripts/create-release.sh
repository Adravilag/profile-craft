#!/bin/bash
# Script para crear releases automáticamente

set -e

VERSION=""
MESSAGE=""

# Procesar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -m|--message)
            MESSAGE="$2"
            shift 2
            ;;
        -h|--help)
            echo "Uso: $0 -v <version> [-m <message>]"
            echo "Ejemplo: $0 -v 1.0.1 -m 'Bug fixes and improvements'"
            exit 0
            ;;
        *)
            echo "Argumento desconocido: $1"
            exit 1
            ;;
    esac
done

# Validar versión requerida
if [[ -z "$VERSION" ]]; then
    echo "❌ Error: La versión es requerida. Usa -v o --version"
    echo "Ejemplo: $0 -v 1.0.1"
    exit 1
fi

# Validar formato de versión
if [[ ! $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ Error: La versión debe estar en formato X.Y.Z (ej: 1.0.1)"
    exit 1
fi

echo "🚀 Creando release v$VERSION"

# Actualizar package.json files
PACKAGE_FILES=(
    "package.json"
    "apps/frontend/package.json"
    "apps/backend/package.json"
    "packages/shared/package.json"
    "packages/ui/package.json"
)

echo "📝 Actualizando archivos package.json..."

for file in "${PACKAGE_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        # Usar sed para reemplazar la versión
        sed -i.bak "s/\"version\": \"[0-9]*\.[0-9]*\.[0-9]*\"/\"version\": \"$VERSION\"/" "$file"
        rm "${file}.bak" # Eliminar archivo de respaldo
        echo "  ✅ $file"
    else
        echo "  ⚠️  $file no encontrado"
    fi
done

# Crear mensaje de commit predeterminado si no se proporciona
if [[ -z "$MESSAGE" ]]; then
    MESSAGE="chore: bump version to $VERSION"
fi

echo "📦 Preparando commit y tag..."

# Git operations
git add .
git commit -m "$MESSAGE"
git tag -a "v$VERSION" -m "Profile-Craft v$VERSION"

echo "🔄 Subiendo cambios al repositorio..."
git push origin main
git push origin "v$VERSION"

echo "✅ Release v$VERSION creado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ve a GitHub y crea un release desde el tag v$VERSION"
echo "2. Copia el contenido de RELEASE_NOTES.md para la descripción"
echo "3. Opcionalmente, adjunta archivos build"
echo ""
echo "🔗 Link directo al release:"
echo "https://github.com/Adravilag/profile-craft/releases/new?tag=v$VERSION"
