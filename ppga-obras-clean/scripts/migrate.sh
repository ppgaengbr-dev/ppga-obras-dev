#!/bin/bash

# Script de Migração - PPGA Obras
# Este script executa as migrações do banco de dados

echo "🗄️  Iniciando migrações do banco de dados..."

# Executar drizzle-kit migrate (sem interação)
npx drizzle-kit migrate --config drizzle.config.ts

if [ $? -eq 0 ]; then
  echo "✅ Migrações completadas com sucesso!"
  exit 0
else
  echo "❌ Erro ao executar migrações"
  exit 1
fi
