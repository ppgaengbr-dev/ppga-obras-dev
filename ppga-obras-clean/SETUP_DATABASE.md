# 🗄️ Configuração do Banco de Dados - PPGA Obras

## ✅ Status Atual

- ✅ Arquivo `.env` já está configurado com a URL PÚBLICA do MySQL do Railway
- ✅ Package.json atualizado
- ✅ Pronto para executar as migrações

---

## 🚀 Próximos Passos

### **Opção 1: Executar Migrações Localmente (Recomendado)**

Se você tem Node.js e pnpm instalados no seu Mac:

```bash
# 1. Navegue até a pasta do projeto
cd ~/Downloads/ppga-obras

# 2. Instale as dependências
pnpm install

# 3. Execute as migrações
pnpm run migrate
```

Você verá a mensagem: `Migrações completadas com sucesso!`

---

### **Opção 2: Executar Migrações via Railway (Se não tiver Node.js)**

1. Acesse o Railway Dashboard
2. Vá para o serviço **web**
3. Clique em **Deployments** → Deploy atual
4. Clique em **Terminal**
5. Execute:
   ```bash
   pnpm run migrate
   ```

---

## 📋 Variáveis de Ambiente

O arquivo `.env` já contém:

```
DATABASE_URL=mysql://root:tSewAJXizHMWmiqoTrzgSpkyEQHmraSQballast.proxy.riwy.net:3306/railway
NODE_ENV=production
PORT=3000
APP_URL=https://web-production-efc02.up.railway.app
```

---

## ✨ Tabelas Criadas

Após as migrações, as seguintes tabelas serão criadas:

- `clients` - Clientes
- `projects` - Projetos
- `providers` - Prestadores de Serviço
- `allocations` - Alocações de Trabalho
- `categories` - Categorias de Trabalho
- `remunerations` - Tipos de Remuneração

---

## 🎯 Próximo Passo

Após executar as migrações:

1. Faça push para o GitHub via Git Desktop
2. Railway fará deploy automaticamente
3. Acesse https://web-production-efc02.up.railway.app/
4. O sistema deve estar 100% funcional! ✅

---

## ❓ Dúvidas?

Se algo não funcionar, verifique:

1. ✅ O arquivo `.env` está presente
2. ✅ DATABASE_URL está correto
3. ✅ MySQL no Railway está Online
4. ✅ Você executou `pnpm run migrate`
