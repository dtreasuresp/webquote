#!/bin/bash
set -e

echo "📦 Ejecutando migraciones de Prisma..."

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones pendientes
npx prisma migrate deploy

echo "✅ Migraciones completadas"
