# 🚀 Guia Rápido de Setup

## Local (Desenvolvimento)

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais MySQL

# 3. Criar banco de dados (se não existir)
mysql -u root -p -e "CREATE DATABASE ppga_obras;"

# 4. Executar migrações
pnpm run db:push

# 5. Iniciar servidor
pnpm run dev

# Acesso: http://localhost:3000
```

---

## Servidor (Produção)

### Pré-requisitos
- Ubuntu 20.04+ ou similar
- Node.js 20+
- MySQL 8+
- Acesso SSH

### Instalação Rápida

```bash
# 1. Conectar ao servidor
ssh usuario@seu-servidor.com

# 2. Clonar projeto
git clone https://github.com/seu-usuario/ppga-obras.git
cd ppga-obras

# 3. Instalar dependências
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc
pnpm install

# 4. Configurar ambiente
cp .env.example .env.local
nano .env.local  # Editar com suas credenciais

# 5. Banco de dados
sudo mysql -u root -p << EOF
CREATE DATABASE ppga_obras;
CREATE USER 'ppga'@'localhost' IDENTIFIED BY 'sua_senha';
GRANT ALL PRIVILEGES ON ppga_obras.* TO 'ppga'@'localhost';
FLUSH PRIVILEGES;
EOF

# 6. Migrações
pnpm run db:push

# 7. Build
pnpm run build

# 8. Iniciar com PM2
npm install -g pm2
pm2 start dist/index.js --name "ppga-obras"
pm2 save
pm2 startup
```

### Configurar Nginx

```bash
sudo apt install -y nginx

sudo tee /etc/nginx/sites-available/ppga-obras > /dev/null << 'EOF'
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
EOF

sudo ln -s /etc/nginx/sites-available/ppga-obras /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL com Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d seu-dominio.com
# Atualizar Nginx com certificados
```

---

## Variáveis de Ambiente Obrigatórias

```env
DATABASE_URL=mysql://usuario:senha@localhost:3306/ppga_obras
NODE_ENV=production
PORT=3000
APP_URL=https://seu-dominio.com
```

---

## Comandos Úteis

```bash
# Desenvolvimento
pnpm run dev          # Iniciar em desenvolvimento

# Build
pnpm run build        # Compilar para produção
pnpm run check        # Verificar tipos TypeScript

# Banco de dados
pnpm run db:push      # Executar migrações

# Produção
pnpm start            # Iniciar servidor compilado

# Qualidade
pnpm run format       # Formatar código
pnpm run test         # Executar testes
```

---

## Verificar Status

```bash
# Com PM2
pm2 status
pm2 logs ppga-obras

# Com systemctl
sudo systemctl status nginx
sudo systemctl status mysql

# Verificar porta
lsof -i :3000
```

---

## Troubleshooting Rápido

| Erro | Solução |
|------|---------|
| `Cannot find module` | `pnpm install` |
| `Connection refused` | Verificar MySQL: `sudo systemctl status mysql` |
| `Port 3000 in use` | `lsof -i :3000` e `kill -9 <PID>` |
| `Permission denied` | Verificar permissões: `chmod +x dist/index.js` |

---

## Suporte

- Documentação completa: Ver `README.md`
- Logs: `pm2 logs ppga-obras`
- Banco de dados: `mysql -u ppga -p ppga_obras`

---

**Pronto para deploy! 🚀**
