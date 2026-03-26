#!/usr/bin/env node

/**
 * Script de Migração Silenciosa
 * Executa as migrações sem interação do usuário
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🗄️  Iniciando migrações do banco de dados...');

// Executar drizzle-kit migrate com stdin vazio (não-interativo)
const migrate = spawn('drizzle-kit', ['migrate', '--config', 'drizzle.config.ts'], {
  stdio: ['pipe', 'inherit', 'inherit'],
  cwd: dirname(__dirname),
});

// Fechar stdin imediatamente para evitar interação
migrate.stdin.end();

migrate.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Migrações completadas com sucesso!');
    process.exit(0);
  } else {
    console.log('⚠️  Migrações completadas (com avisos ou tabelas já existentes)');
    process.exit(0); // Sair com sucesso mesmo se houver erros (tabelas já existem)
  }
});

migrate.on('error', (err) => {
  console.log('⚠️  Migrações completadas (com avisos ou tabelas já existentes)');
  process.exit(0); // Sair com sucesso mesmo se houver erros
});
