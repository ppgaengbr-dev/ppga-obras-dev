# 🚀 Guia de Deploy no Railway

Guia simples e direto para fazer deploy do PPGA OBRAS no Railway.

---

## 📋 Pré-requisitos

- ✅ Conta GitHub (gratuita)
- ✅ Conta Railway (gratuita)
- ✅ Git instalado no seu computador
- ✅ Arquivo .zip do projeto

---

## 🔧 PASSO 1: Criar Repositório no GitHub

### 1.1 Acessar GitHub
1. Abra https://github.com
2. Faça login ou crie uma conta (gratuita)

### 1.2 Criar Novo Repositório
1. Clique no **+** (canto superior direito)
2. Selecione **New repository**
3. Preencha:
   - **Repository name:** `ppga-obras`
   - **Description:** `Sistema de Gestão Inteligente de Obras`
   - **Visibility:** Public (para Railway conseguir acessar)
   - **Initialize this repository with:** Deixe em branco
4. Clique em **Create repository**

### 1.3 Você receberá uma página com instruções

Guarde essas informações:
```
git remote add origin https://github.com/seu-usuario/ppga-obras.git
git branch -M main
git push -u origin main
```

---

## 💻 PASSO 2: Preparar Projeto Localmente

### 2.1 Extrair o .zip

```bash
# No seu computador
unzip ppga-obras-export.zip
cd ppga-obras-export
```

### 2.2 Inicializar Git

```bash
# Dentro da pasta do projeto
git init
git add .
git commit -m "Initial commit: PPGA OBRAS"
```

### 2.3 Conectar ao GitHub

```bash
# Substitua seu-usuario pelo seu usuário GitHub
git remote add origin https://github.com/seu-usuario/ppga-obras.git
git branch -M main
git push -u origin main
```

**Pronto!** Seu código está no GitHub.

---

## 🚂 PASSO 3: Criar Conta no Railway

### 3.1 Acessar Railway
1. Abra https://railway.app
2. Clique em **Sign Up**
3. Escolha **GitHub** para login rápido
4. Autorize o Railway a acessar sua conta GitHub

### 3.2 Você está logado!

---

## 🎯 PASSO 4: Deploy no Railway

### 4.1 Criar Novo Projeto

1. Na dashboard do Railway, clique em **+ New Project**
2. Selecione **Deploy from GitHub repo**
3. Procure por **ppga-obras** e selecione
4. Clique em **Deploy**

Railway começará a fazer o build automaticamente.

### 4.2 Configurar Variáveis de Ambiente

1. Após o deploy iniciar, clique na aba **Variables**
2. Adicione as variáveis:

```
NODE_ENV=production
PORT=3000
```

### 4.3 Configurar Banco de Dados MySQL

1. Na dashboard do Railway, clique em **+ New**
2. Selecione **MySQL**
3. Railway criará automaticamente um MySQL para você

Você verá a variável `DATABASE_URL` aparecer automaticamente.

### 4.4 Executar Migrações do Banco

1. Clique na aba **Deploy** do seu projeto
2. Abra o **Terminal** (botão no canto superior)
3. Execute:

```bash
pnpm run db:push
```

Isso criará as tabelas no banco de dados.

### 4.5 Aguardar Deploy Completar

O Railway fará o build e deploy automaticamente. Você verá:
- ✅ Build iniciado
- ✅ Build concluído
- ✅ Deploy iniciado
- ✅ Deploy concluído

---

## 🌐 PASSO 5: Acessar a Aplicação

### 5.1 Encontrar a URL

1. Na dashboard do Railway, clique no seu projeto
2. Clique na aba **Deployments**
3. Procure por **Public URL** ou **Domain**
4. Você verá algo como: `https://ppga-obras-production.up.railway.app`

### 5.2 Testar a Aplicação

1. Abra a URL no navegador
2. Você deve ver o login do PPGA OBRAS
3. **Pronto!** Seu sistema está em produção! 🎉

---

## 📝 PASSO 6: Conectar Domínio Customizado (Depois)

Quando quiser conectar seu domínio `ppgaobras.com.br`:

1. Na dashboard do Railway, vá para **Settings**
2. Procure por **Custom Domain**
3. Adicione `ppgaobras.com.br`
4. Railway dará instruções de DNS
5. Configure no seu provedor de domínio

(Isso é simples e faremos depois)

---

## 🔄 PASSO 7: Atualizar o Sistema

Sempre que fizer alterações no código:

### 7.1 No Manus (Ambiente de Desenvolvimento)

```bash
# Fazer as alterações no código
# Testar localmente
```

### 7.2 Exportar Novo .zip

```bash
# Executar script de exportação
./export-project.sh
```

### 7.3 Atualizar GitHub

```bash
# No seu computador
unzip ppga-obras-export.zip
cd ppga-obras-export

git add .
git commit -m "Descrição das alterações"
git push origin main
```

### 7.4 Railway Faz Deploy Automático

Railway detecta o push no GitHub e faz deploy automaticamente!

---

## ✅ Checklist de Deploy

- [ ] Repositório GitHub criado
- [ ] Código enviado para GitHub
- [ ] Conta Railway criada
- [ ] Projeto conectado ao Railway
- [ ] Variáveis de ambiente configuradas
- [ ] MySQL criado no Railway
- [ ] Migrações executadas
- [ ] URL pública funcionando
- [ ] Sistema acessível no navegador

---

## 🐛 Troubleshooting

### Erro: "Build failed"
- Verifique se o `package.json` está correto
- Verifique se o `Procfile` existe
- Verifique se o `railway.json` está correto

### Erro: "Cannot connect to database"
- Verifique se MySQL foi criado no Railway
- Verifique se `DATABASE_URL` está configurada
- Execute `pnpm run db:push` novamente

### Erro: "Port already in use"
- Railway gerencia as portas automaticamente
- Não precisa se preocupar com isso

### Aplicação não carrega
- Aguarde 2-3 minutos para o deploy completar
- Verifique os logs no Railway
- Clique em **Redeploy** se necessário

---

## 📊 Monitorar Aplicação

No Railway você pode:
- ✅ Ver logs em tempo real
- ✅ Monitorar CPU e memória
- ✅ Ver histórico de deploys
- ✅ Fazer rollback se necessário
- ✅ Redeploy manualmente

---

## 🎯 Próximos Passos

1. ✅ Deploy inicial concluído
2. ⏭️ Conectar domínio customizado (depois)
3. ⏭️ Configurar backups automáticos (depois)
4. ⏭️ Monitorar performance (depois)

---

## 📞 Suporte Railway

- Documentação: https://docs.railway.app
- Status: https://status.railway.app
- Discord: https://discord.gg/railway

---

**Pronto para fazer deploy? Vamos lá! 🚀**
