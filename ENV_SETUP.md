# Configuração de Ambientes DEV e PROD

## 📋 Visão Geral

Este projeto agora possui **dois ambientes isolados**:

| Ambiente | Localização | Banco de Dados | Arquivo Config |
|----------|------------|-----------------|-----------------|
| **DEV** | Manus (local) | Railway DEV | `.env.local` |
| **PROD** | Railway (web) | Railway PROD | `.env` |

## 🔧 Configuração

### Ambiente DEV (Desenvolvimento Local)

**Arquivo:** `.env.local`

```env
DATABASE_URL=mysql://root:hFrXEuLCxmpbowqtCuPUPRjyXZTkqGta@mysql.railway.internal:3306/railway
NODE_ENV=development
PORT=3000
```

**Características:**
- ✅ Usa banco DEV isolado
- ✅ Modo desenvolvimento (Vite ativo)
- ✅ Seguro para testes e alterações
- ✅ Pode ser quebrado sem afetar produção

### Ambiente PROD (Produção)

**Arquivo:** `.env`

```env
DATABASE_URL=mysql://root:WfeBWtwaVyUTfhknyiJBbnH0rTTZnjZU@mysql.railway.internal:3306/railway
NODE_ENV=production
PORT=3000
APP_URL=https://web-production-efc02.up.railway.app
```

**Características:**
- ✅ Usa banco PROD isolado
- ✅ Modo produção (static files)
- ✅ Dados reais dos clientes
- ✅ NÃO pode ser quebrado

## 🚀 Como Usar

### Desenvolvimento Local (DEV)

1. **Instalar dependências:**
   ```bash
   pnpm install
   ```

2. **Executar servidor DEV:**
   ```bash
   pnpm dev
   ```
   - Carrega `.env.local` automaticamente
   - Conecta ao banco DEV
   - Vite ativo na porta 5173

3. **Rodar migrations (primeira vez):**
   ```bash
   pnpm migrate
   ```
   - Cria tabelas no banco DEV
   - Usa `process.env.DATABASE_URL` do `.env.local`

4. **Testar fluxo completo:**
   - Criar cliente
   - Criar obra
   - Criar alocação
   - Verificar listagens

### Deploy em Produção (PROD)

1. **Extrair ZIP do projeto**
2. **Copiar para repositório Git**
3. **Commit e push:**
   ```bash
   git add .
   git commit -m "fix: configure separate DEV and PROD environments"
   git push origin main
   ```
4. **Railway faz deploy automático**
   - Injeta variáveis de PROD
   - Usa banco PROD
   - Migrations rodam automaticamente

## 🔐 Segurança

### ✅ Isolamento de Ambientes

- **DEV e PROD usam bancos diferentes**
  - DEV: senha `hFrXEuLCxmpbowqtCuPUPRjyXZTkqGta`
  - PROD: senha `WfeBWtwaVyUTfhknyiJBbnH0rTTZnjZU`

- **Não há fallbacks ou lógica condicional**
  - Sempre usa `process.env.DATABASE_URL`
  - Sem SQLite ou banco em memória

- **Arquivos de configuração**
  - `.env.local` → **NÃO fazer commit** (Git ignore)
  - `.env` → Contém dados de PROD (cuidado!)

## 📝 Fluxo de Trabalho Recomendado

```
1. Desenvolver no DEV (Manus)
   ↓
2. Testar fluxo completo (client → work → allocation)
   ↓
3. Validar que tudo funciona
   ↓
4. Gerar ZIP do projeto
   ↓
5. Subir no GitHub
   ↓
6. Railway faz deploy automático em PROD
   ↓
7. Verificar em app.ppgaobras.com.br
```

## 🧪 Testes

### Verificar Conexão DEV

```bash
# Rodar migrations (testa conexão)
pnpm migrate

# Verificar tabelas criadas
# Acesse o banco DEV via Railway dashboard
```

### Verificar Dados

1. **DEV:** Dados de teste isolados
2. **PROD:** Dados reais dos clientes

## ⚠️ Importante

- ✅ Nunca alterar `.env` localmente (é para PROD)
- ✅ Usar `.env.local` para desenvolvimento
- ✅ Testar tudo no DEV antes de fazer commit
- ✅ Não fazer commit de `.env.local`
- ✅ Migrations rodam automaticamente no DEV e PROD

## 📞 Troubleshooting

### "DATABASE_URL not set"
- Verificar se `.env.local` existe
- Verificar se `NODE_ENV=development` está definido

### "Connection refused"
- Verificar credenciais do banco
- Verificar se Railway DEV está ativo
- Verificar conectividade de rede

### Migrations não rodam
- Executar: `pnpm migrate`
- Verificar logs em `/api/migrate-once` endpoint

## 📚 Referências

- **Migrations:** `server/migrations.ts`
- **Database:** `server/db.ts`
- **Configuração:** `server/_core/env.ts`
- **Schema:** `drizzle/schema.ts`
