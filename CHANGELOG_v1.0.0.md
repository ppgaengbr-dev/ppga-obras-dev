# CHANGELOG - v1.0.0 - Sistema Completo de Autenticação

## Data
26 de Março de 2026

## Versão
1.0.0 - auth-complete-system-with-permissions

## Novo Nesta Versão

### Backend

#### Banco de Dados
- **Tabela `users` (atualizada)**: Adicionados campos `password`, `status`, `linkedType`, `linkedId`
- **Tabela `passwordRequests` (nova)**: Para gerenciar requisições de troca de senha
- **Migration `0001_add_auth_system.sql`**: Aplicada automaticamente no primeiro deploy

#### Autenticação
- Sistema de login com email/senha usando bcrypt
- Registro de novos usuários com status PENDING
- Aprovação de usuários por administrador
- Bloqueio de usuários
- Sistema de requisição e aprovação de troca de senha

#### Autorização (RBAC)
- 4 papéis: ADMIN, CLIENTE, ARQUITETO, PRESTADOR
- Vínculo obrigatório com entidades (clientes, arquitetos, prestadores)
- Regras de permissão por recurso:
  - CLIENTE: vê apenas suas obras
  - ARQUITETO: vê apenas suas obras
  - PRESTADOR: vê apenas suas alocações
  - ADMIN: acesso total

#### Rotas tRPC
- `auth.register`: Cadastro de novo usuário
- `auth.login`: Login com email/senha
- `auth.me`: Dados do usuário autenticado
- `auth.requestPasswordChange`: Solicitar troca de senha
- `auth.getAllUsers`: Listar todos os usuários (admin)
- `auth.getPendingUsers`: Listar usuários pendentes (admin)
- `auth.approveUser`: Aprovar usuário (admin)
- `auth.blockUser`: Bloquear usuário (admin)
- `auth.changeUserRole`: Alterar função do usuário (admin)
- `auth.getPendingPasswordRequests`: Listar requisições de senha (admin)
- `auth.approvePasswordRequest`: Aprovar troca de senha (admin)
- `auth.rejectPasswordRequest`: Rejeitar troca de senha (admin)
- `permissions.*`: Rotas de verificação de permissões

#### Middleware de Permissões
- Funções para verificar acesso a recursos
- Filtros de dados por role
- Validação de edição (apenas ADMIN)

### Frontend

#### Páginas
- **Login.tsx**: Tela de login moderna estilo SaaS
- **Register.tsx**: Tela de cadastro com validações
- **AdminUsers.tsx**: Gestão de usuários para administrador

#### Componentes
- **ProtectedRoute.tsx**: Proteção de rotas com validação de role
- **useAuthContext.ts**: Hook para contexto de autenticação

### Endpoint de Versão
- `GET /api/system.version`: Retorna informações de versão do sistema

## Arquivos Adicionados

### Backend
- `server/routers/auth.ts`: Router de autenticação
- `server/routers/permissions.ts`: Router de permissões
- `server/_core/permissions.ts`: Funções de autorização
- `server/_core/version.ts`: Informações de versão
- `drizzle/migrations/0001_add_auth_system.sql`: Migration de autenticação

### Frontend
- `client/src/pages/Login.tsx`
- `client/src/pages/Register.tsx`
- `client/src/pages/AdminUsers.tsx`
- `client/src/_core/components/ProtectedRoute.tsx`
- `client/src/_core/hooks/useAuthContext.ts`

### Documentação
- `AUTH_SYSTEM.md`: Documentação completa do sistema de autenticação

## Arquivos Modificados

### Backend
- `server/db.ts`: Adicionadas funções de autenticação e gerenciamento de usuários
- `server/routers.ts`: Integrado authRouter e permissionsRouter
- `server/_core/trpc.ts`: Mantém compatibilidade com procedimentos existentes
- `server/_core/systemRouter.ts`: Adicionado endpoint de versão

### Frontend
- `package.json`: Adicionado bcryptjs

## Dependências Adicionadas
- `bcryptjs@^2.4.3`: Criptografia de senhas
- `@types/bcryptjs@^2.4.6`: Tipos TypeScript

## Compatibilidade

- ✅ Mantém suporte a OAuth existente (openId)
- ✅ Novos usuários podem usar email/senha
- ✅ Usuários OAuth existentes continuam funcionando
- ✅ Tabelas existentes não foram alteradas
- ✅ Código existente continua funcionando

## Fluxos de Autenticação

### 1. Registro
1. Usuário acessa /register
2. Preenche: Nome, Email, Senha
3. Novo usuário criado com status=PENDING
4. Mensagem de sucesso e redirecionamento para login

### 2. Login
1. Usuário acessa /login
2. Preenche: Email, Senha
3. Sistema valida status=APPROVED
4. Se aprovado, cria sessão
5. Se não aprovado, exibe mensagem

### 3. Aprovação (Admin)
1. Admin acessa Configurações → Usuários
2. Visualiza usuários pendentes
3. Seleciona: Função (role) e Vínculo (linkedType, linkedId)
4. Clica "Aprovar"
5. Usuário pode fazer login

## Próximas Fases

### Fase 2: Implementação de Permissões por Página
- Proteção de rotas no frontend
- Filtros de dados por role
- Restrições de acesso a páginas

### Fase 3: Interface de Cronograma
- Página de cronograma para PRESTADOR
- Sem exibição de valores financeiros

### Fase 4: Tabela `obra_prestadores`
- Vínculo muitos-para-muitos entre obras e prestadores

## Instruções de Deploy

### DEV
1. Extrair `ppga-obras-dev-v1.0.0-auth-complete-system.tar.gz`
2. Executar `pnpm install`
3. Executar `pnpm build`
4. Deploy para dev.ppgaobras.com.br
5. Migration será executada automaticamente no primeiro acesso

### MAIN
Após validação no DEV:
1. Extrair `ppga-obras-main-v1.0.0-auth-complete-system.tar.gz`
2. Seguir mesmo processo que DEV
3. Deploy para app.ppgaobras.com.br

## Testes Recomendados

1. **Registro e Aprovação**
   - Registrar novo usuário
   - Verificar status=PENDING
   - Admin aprova
   - Usuário faz login

2. **Bloqueio**
   - Admin bloqueia usuário
   - Usuário tenta fazer login (deve falhar)

3. **Permissões**
   - CLIENTE acessa apenas suas obras
   - PRESTADOR não vê dados financeiros
   - ADMIN vê tudo

## Notas Importantes

- Senhas são criptografadas com bcrypt (salt 10)
- Todas as validações de permissão ocorrem no backend
- Nunca confiar em dados do frontend
- Sistema mantém compatibilidade com OAuth existente
- Usuários OAuth podem ter senha adicionada depois

## Suporte

Para dúvidas ou problemas:
1. Consulte `AUTH_SYSTEM.md` para documentação completa
2. Verifique logs do servidor para erros
3. Valide banco de dados com migrations aplicadas

---
