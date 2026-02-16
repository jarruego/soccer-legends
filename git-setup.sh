#!/bin/bash

# Script para inicializar Git y crear el repositorio
# Uso: bash git-setup.sh

echo "🚀 Inicializando repositorio Git..."

# Inicializar repositorio
git init

# Agregar todos los archivos
git add .

# Crear primer commit
git commit -m "Initial commit: Soccer Legends app setup

- Backend: NestJS con Drizzle ORM y PostgreSQL
- Frontend: React Native con Expo
- Autenticación: JWT
- Base de datos: 4 tablas principales
- 3 módulos completamente funcionales"

echo "✅ Repositorio inicializado"
echo ""
echo "Próximos pasos:"
echo "1. Crear un repositorio en GitHub en https://github.com/new"
echo "2. Ejecuta: git remote add origin <tu-url-repo>"
echo "3. Ejecuta: git branch -M main"
echo "4. Ejecuta: git push -u origin main"
