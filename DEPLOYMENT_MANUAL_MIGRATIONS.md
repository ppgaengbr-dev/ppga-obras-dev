# 🚀 Deployment com Migrations Manuais

## ✅ Mudança Importante

**Migrations NÃO rodam automaticamente no startup!**

Você controla quando rodar as migrations:
- Via endpoint `/api/migrate-once` (temporário)
- Via comando `pnpm migrate` (permanente)

---

## 🔥 PASSO 1: Preparar o Railway

### 1.1 - Deletar MySQL antigo

1. Acesse https://railway.app
2. Clique no seu projeto
3. Vá para **Services**
4. Clique em **MySQL**
5. Vá para **Settings**
6. Clique em **Delete Service**
7. Confirme

**Aguarde 1-2 minutos.**

### 1.2 - Criar novo MySQL

1. Clique em **+ Create**
2. Selecione **MySQL**
3. Aguarde criar (2-3 minutos)
4. Copie as credenciais

---

## 🔥 PASSO 2: Atualizar variáveis de ambiente

1. No Railway, vá para **Variables**
2. Atualize `DATABASE_URL`:

```
mysql://root:PASSWORD@HOST:PORT/DATABASE
```

---

## 🔥 PASSO 3: Fazer deploy do código

```bash
git add .
git commit -m "feat: manual migrations"
git push origin main
```

**Aguarde o deploy completar (✅ Success).**

---

## 🔥 PASSO 4: Executar migrations

### Opção A: Via endpoint (recomendado para primeira vez)

1. Acesse no navegador:
```
https://app.ppgaobras.com.br/api/migrate-once
```

2. Você verá:
```json
{
  "success": true,
  "message": "Migrations executed successfully",
  "info": "IMPORTANT: Remove this endpoint from code after first execution",
  "timestamp": "2024-03-22T..."
}
```

3. **IMPORTANTE:** Depois de rodar, remova o endpoint do código:
   - Abra `server/_core/index.ts`
   - Procure por `/api/migrate-once`
   - Delete as linhas 48-67
   - Faça push novamente

### Opção B: Via CLI (para desenvolvimento local)

```bash
pnpm migrate
```

Você verá:
```
[Migrations] Starting migration process...
[Migrations] Found 1 migration files
[Migrations] Executing: 0000_init_schema.sql
[Migrations] ✓ All migrations completed successfully
```

---

## ✅ Verificar se funcionou

1. Acesse https://app.ppgaobras.com.br
2. Faça login
3. Teste criar um cliente
4. Teste criar um prestador
5. Teste criar uma obra

**Se tudo funcionar, está pronto!** 🎉

---

## 📝 Para adicionar novas migrations no futuro

1. Crie arquivo em `/drizzle/migrations/` (ex: `0001_add_new_table.sql`)
2. Rode localmente: `pnpm migrate`
3. Faça push
4. Em produção, rode: `https://app.ppgaobras.com.br/api/migrate-once`

---

## ⚠️ Importante

- ✅ Migrations rodam **apenas uma vez**
- ✅ Rastreadas na tabela `migrations_log`
- ✅ Seguro rodar múltiplas vezes (não duplica)
- ❌ Endpoint `/api/migrate-once` é **temporário** - remova após primeira execução

---

## 🎯 Fluxo resumido

1. Delete MySQL antigo
2. Crie novo MySQL
3. Atualize `DATABASE_URL`
4. Faça push do código
5. Acesse `/api/migrate-once` **UMA VEZ**
6. Remova o endpoint do código
7. Faça push novamente
8. Pronto!

**Nunca mais problemas de banco inconsistente!** 🚀
