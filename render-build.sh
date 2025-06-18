#!/bin/bash
# Script de build optimizado para Render

set -e  # Exit on any error

echo "🚀 Starting Render build process..."

# Install all dependencies including dev dependencies
echo "📦 Installing dependencies..."
npm install --include=dev

# Build shared packages first
echo "🏗️ Building shared packages..."
npm run build --workspace=@cv-maker/shared --include=dev

# Build UI package (without Node.js types requirement)
echo "🎨 Building UI package..."
cd packages/ui
npm install --include=dev
npx tsc --skipLibCheck
npm run copy-assets
cd ../..

# Build backend
echo "⚙️ Building backend..."
cd apps/backend
npm install --include=dev
npm run build
cd ../..

echo "✅ Build completed successfully!"
