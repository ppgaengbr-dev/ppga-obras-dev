# PPGA OBRAS - Sistema de Gestão Inteligente de Obras

Sistema completo para gerenciamento de obras, alocações de prestadores, cronogramas e contratos.

## 📋 Características

- ✅ **Dashboard Administrativo** - Visão geral de todas as operações
- ✅ **Gerenciamento de Clientes** - CRUD completo de clientes
- ✅ **Gerenciamento de Obras** - Cadastro e acompanhamento de projetos
- ✅ **Alocações de Prestadores** - Calendário visual de alocações
- ✅ **Gerenciamento de Prestadores** - Dados e histórico
- ✅ **Configurações Dinâmicas** - Categorias e remunerações customizáveis
- ✅ **Relatórios** - Análise de dados e performance
- ✅ **Cronogramas** - Planejamento de projetos
- ✅ **Contratos** - Gerenciamento de documentos

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - Framework UI
- **Vite** - Build tool
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Radix UI** - Component library
- **React Query + tRPC** - Data fetching

### Backend
- **Node.js + Express** - Server
- **tRPC** - Type-safe API
- **Drizzle ORM** - Database ORM
- **MySQL** - Database

### DevOps
- **pnpm** - Package manager
- **Docker** (opcional) - Containerization

---

## 🚀 Instalação Local

### Pré-requisitos

- **Node.js** 18+ ou 20+
- **pnpm** 10+
- **MySQL** 8+ (local ou remoto)

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/ppga-obras.git
cd ppga-obras
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar o arquivo de exemplo
cp .env.example .env.local

# Editar o arquivo com suas configurações
nano .env.local
```

**Variáveis obrigatórias:**
- `DATABASE_URL` - String de conexão MySQL
- `NODE_ENV` - `development` ou `production`
- `PORT` - Porta do servidor (padrão: 3000)

### 4. Configurar Banco de Dados

```bash
# Gerar e executar migrações
pnpm run db:push
```

### 5. Iniciar em Desenvolvimento

```bash
pnpm run dev
```

A aplicação estará disponível em `http://localhost:3000`

---

## 📦 Build para Produção

### 1. Compilar o Projeto

```bash
pnpm run build
```

Isso gera:
- Frontend otimizado em `dist/public/`
- Backend compilado em `dist/index.js`

### 2. Iniciar em Produção

```bash
NODE_ENV=production pnpm start
```

---

## 🌐 Deploy em Servidor Externo

### Opção 1: VPS (DigitalOcean, Linode, AWS EC2, etc)

#### 1. Conectar ao Servidor

```bash
ssh usuario@seu-servidor.com
```

#### 2. Instalar Dependências do Sistema

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm curl git

# Instalar pnpm
npm install -g pnpm

# Instalar MySQL (se não tiver)
sudo apt install -y mysql-server
```

#### 3. Clonar e Configurar Projeto

```bash
cd /home/seu-usuario
git clone https://github.com/seu-usuario/ppga-obras.git
cd ppga-obras

pnpm install
cp .env.example .env.local

# Editar .env.local com suas configurações
nano .env.local
```

#### 4. Configurar Banco de Dados

```bash
# Se usar MySQL local
sudo mysql -u root -p
```

```sql
CREATE DATABASE ppga_obras;
CREATE USER 'ppga'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON ppga_obras.* TO 'ppga'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 5. Executar Migrações

```bash
pnpm run db:push
```

#### 6. Build e Deploy

```bash
pnpm run build
NODE_ENV=production pnpm start
```

### Opção 2: Usar PM2 para Gerenciar Processo

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar arquivo de configuração
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ppga-obras',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração para reiniciar após reboot
pm2 save
pm2 startup
```

### Opção 3: Usar Nginx como Reverse Proxy

```bash
# Instalar Nginx
sudo apt install -y nginx

# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/ppga-obras
```

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/ppga-obras /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Opção 4: Docker (Recomendado)

Crie um `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build
RUN pnpm run build

# Expor porta
EXPOSE 3000

# Iniciar
CMD ["pnpm", "start"]
```

Build e execute:

```bash
docker build -t ppga-obras .
docker run -p 3000:3000 --env-file .env.local ppga-obras
```

---

## 🔗 Conectar Domínio

### 1. Apontar DNS para seu Servidor

No provedor de domínio, configure:
- **A Record**: `seu-dominio.com` → IP do servidor
- **CNAME**: `www.seu-dominio.com` → `seu-dominio.com`

### 2. Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot certonly --nginx -d seu-dominio.com -d www.seu-dominio.com

# Atualizar Nginx com SSL
sudo nano /etc/nginx/sites-available/ppga-obras
```

```nginx
server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

```bash
sudo systemctl restart nginx
```

---

## 📊 Estrutura do Projeto

```
ppga-obras/
├── client/                 # Frontend React/Vite
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários e helpers
│   │   └── styles/        # Estilos globais
│   └── index.html
├── server/                 # Backend Node/Express
│   ├── src/
│   │   ├── _core/         # Servidor principal
│   │   ├── routers.ts     # Rotas tRPC
│   │   └── db.ts          # Funções de banco de dados
│   └── index.ts
├── drizzle/                # Migrações do banco
│   ├── schema.ts          # Definição das tabelas
│   └── migrations/        # Arquivos de migração
├── shared/                 # Código compartilhado
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── .env.example
└── README.md
```

---

## 🔐 Segurança

### Checklist de Segurança

- [ ] Alterar senha padrão do banco de dados
- [ ] Configurar HTTPS/SSL
- [ ] Usar variáveis de ambiente para secrets
- [ ] Configurar firewall do servidor
- [ ] Fazer backup regular do banco de dados
- [ ] Manter dependências atualizadas
- [ ] Configurar rate limiting
- [ ] Usar senhas fortes para usuários

### Backup do Banco de Dados

```bash
# Fazer backup
mysqldump -u ppga -p ppga_obras > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
mysql -u ppga -p ppga_obras < backup_20240317_120000.sql
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
# Limpar cache e reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro: "Connection refused" (Banco de dados)

- Verificar se MySQL está rodando: `sudo systemctl status mysql`
- Verificar `DATABASE_URL` em `.env.local`
- Verificar credenciais do banco

### Erro: "Port 3000 already in use"

```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 pnpm start
```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs: `pm2 logs ppga-obras`
2. Consultar documentação do tRPC: https://trpc.io
3. Consultar documentação do Drizzle: https://orm.drizzle.team

---

## 📄 Licença

MIT License - veja LICENSE.md para detalhes

---

## 🎯 Próximos Passos

Após o deploy:
1. Testar todas as funcionalidades
2. Configurar backups automáticos
3. Monitorar performance e logs
4. Configurar alertas de erro
5. Documentar processos internos

---

**Desenvolvido com ❤️ para PPGA OBRAS**
