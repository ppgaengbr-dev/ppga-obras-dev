# 🚀 Guia Definitivo de Deployment - PPGA Obras

## ✅ O que foi corrigido

Este projeto agora usa **Drizzle Migrations de verdade** em vez do endpoint `/setup-db`. Isso garante:

- ✅ Banco de dados consistente entre local e produção
- ✅ Migrations versionadas e rastreáveis
- ✅ Sem erros de "tabela já existe"
- ✅ Funciona automaticamente no startup

---

## 🔥 PASSO 1: Preparar o Railway (IMPORTANTE!)

### 1.1 Delete o MySQL atual

1. Acesse https://railway.app
2. Vá para seu projeto
3. Clique em **MySQL**
4. Vá para **Settings**
5. Clique em **Delete Service**
6. Confirme

### 1.2 Criar um novo MySQL

1. Clique em **+ Create**
2. Selecione **MySQL**
3. Aguarde criar (2-3 minutos)

**Importante:** Copie as credenciais que aparecem:
- Host
- Port
- Username
- Password
- Database

---

## 🔥 PASSO 2: Atualizar variáveis de ambiente

1. No Railway, vá para **Variables**
2. Atualize com as credenciais do novo MySQL:

```
DATABASE_URL=mysql://username:password@host:port/database
```

Exemplo:
```
DATABASE_URL=mysql://root:senha123@containers-us-west-123.railway.app:5432/railway
```

---

## 🔥 PASSO 3: Deploy do código

### 3.1 Fazer push do novo código

```bash
# No seu projeto local
git add .
git commit -m "feat: implement proper drizzle migrations"
git push origin main
```

Railway vai fazer deploy automaticamente.

### 3.2 Aguardar o deploy

- Vá para **Deployments** no Railway
- Aguarde aparecer ✅ **Success**
- Isso leva 2-5 minutos

### 3.3 Verificar logs

1. Clique em **View logs**
2. Procure por:
   ```
   [Server] Running database migrations...
   [Migrations] Starting migration process...
   [Migrations] ✓ All migrations completed successfully
   ```

Se vir isso, **está funcionando!** 🎉

---

## 🔥 PASSO 4: Testar a aplicação

1. Acesse https://app.ppgaobras.com.br
2. Faça login
3. Teste criar um cliente
4. Teste criar um prestador
5. Teste criar uma obra

**Se tudo funcionar, você está pronto!**

---

## ❌ Se der erro

### Erro: "Incorrect date value: '' for column 'startDate'"

**Solução:** Campos de data são opcionais. Você só precisa preenchê-los quando transformar cliente em obra.

### Erro: "Table already exists"

**Solução:** Isso não deve acontecer mais. Se acontecer, delete o MySQL e crie um novo (Passo 1).

### Erro: "Connection refused"

**Solução:** Verifique se o `DATABASE_URL` está correto no Railway.

---

## 📝 Entender as migrations

As migrations estão em `/drizzle/migrations/`:

- `0000_init_schema.sql` - Cria todas as tabelas

Cada migration é executada apenas **uma vez** e rastreada na tabela `migrations_log`.

---

## 🔄 Para adicionar novas tabelas no futuro

1. Edite `/drizzle/schema.ts`
2. Crie um novo arquivo em `/drizzle/migrations/` (ex: `0001_add_new_table.sql`)
3. Faça push
4. Railway roda a migration automaticamente

---

## ✅ Checklist final

- [ ] Deletei o MySQL antigo no Railway
- [ ] Criei um novo MySQL
- [ ] Atualizei o `DATABASE_URL`
- [ ] Fiz push do código
- [ ] Deploy foi bem-sucedido
- [ ] Vi as mensagens de migration nos logs
- [ ] Testei criar cliente/prestador/obra
- [ ] Tudo funcionando!

---

## 🎯 Resultado

Agora você pode:

1. **Desenvolver localmente** com confiança
2. **Fazer push** sem medo
3. **Migrations rodam automaticamente** em produção
4. **Sem mais erros de banco inconsistente**

**Nunca mais você terá que ficar ajustando coisas em produção!** 🚀
