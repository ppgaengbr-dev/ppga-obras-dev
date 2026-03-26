# Deployment - Ambiente DEV

## Informações do Ambiente DEV

- **URL**: https://dev.ppgaobras.com.br
- **Serviço Railway**: web (dev.ppgaobras.com.br)
- **Banco de Dados**: MySQL DEV (Railway)
- **NODE_ENV**: production
- **PORT**: 3000 (padrão Railway)

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no Railway (serviço web DEV):

```env
DATABASE_URL=mysql://root:yXfe0IGwfF0PFdTwjztWBIYvfJ@amvmwH@mysql.railway.internal:3306/railway
NODE_ENV=production
PORT=3000
APP_URL=https://dev.ppgaobras.com.br
OAUTH_SERVER_URL=https://dev.ppgaobras.com.br
```

## Processo de Deployment

1. **Push do código** para o repositório
2. **Railway detecta** a mudança e inicia o build
3. **Build**: `pnpm install && pnpm build`
4. **Start**: `pnpm start`
5. **Migrations**: Executadas automaticamente no startup via `/api/migrate-once`

## Migrations

As migrations são executadas automaticamente quando o servidor inicia:

- Arquivo: `server/migrations.ts`
- Migrations SQL: `drizzle/migrations/*.sql`
- Tabela de controle: `migrations_log`

## Verificação Pós-Deploy

1. Acessar https://dev.ppgaobras.com.br
2. Testar endpoint: `/api/health`
3. Fazer login
4. Criar um cliente de teste
5. Verificar se foi salvo no banco DEV

## Rollback

Se algo der errado:
1. Reverter o commit no GitHub
2. Railway fará deploy automático da versão anterior

## Suporte

- Logs do Railway: Deployments > View logs
- Console do servidor: Logs em tempo real
