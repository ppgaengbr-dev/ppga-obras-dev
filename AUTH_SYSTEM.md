# Sistema de Autenticação e Controle de Acesso - PPGA Obras v1.0.0

## Visão Geral

Este documento descreve o sistema completo de autenticação, autorização e controle de acesso implementado no PPGA Obras.

## Arquitetura

### Backend

#### Banco de Dados

**Tabela `users` (atualizada)**
- `id`: Chave primária
- `openId`: Identificador OAuth (opcional, pode ser NULL para autenticação por email/senha)
- `email`: Email único do usuário (obrigatório para autenticação por email/senha)
- `password`: Senha criptografada com bcrypt
- `name`: Nome completo
- `role`: Enum - ADMIN, CLIENTE, ARQUITETO, PRESTADOR
- `status`: Enum - PENDING, APPROVED, BLOCKED
- `linkedType`: Enum - CLIENTE, ARQUITETO, PRESTADOR (NULL para ADMIN)
- `linkedId`: ID da entidade vinculada (clients, architects, providers)
- `createdAt`, `updatedAt`, `lastSignedIn`: Timestamps

**Tabela `passwordRequests` (nova)**
- `id`: Chave primária
- `userId`: Referência ao usuário
- `newPassword`: Nova senha criptografada (pendente de aprovação)
- `status`: Enum - PENDING, APPROVED, REJECTED
- `createdAt`, `updatedAt`: Timestamps

#### Funções de Banco de Dados (`server/db.ts`)

**Autenticação:**
- `createUser()`: Cria novo usuário com senha criptografada
- `getUserByEmail()`: Busca usuário por email
- `getUserById()`: Busca usuário por ID
- `verifyPassword()`: Valida senha com bcrypt

**Gerenciamento de Usuários:**
- `getAllUsers()`: Lista todos os usuários
- `getPendingUsers()`: Lista usuários pendentes de aprovação
- `updateUserStatus()`: Atualiza status, role e vínculo do usuário

**Requisições de Senha:**
- `createPasswordRequest()`: Cria solicitação de troca de senha
- `getPasswordRequestsByUserId()`: Lista requisições de um usuário
- `getPendingPasswordRequests()`: Lista requisições pendentes
- `approvePasswordRequest()`: Aprova e aplica nova senha
- `rejectPasswordRequest()`: Rejeita solicitação

#### Rotas tRPC (`server/routers/auth.ts`)

**Públicas:**
- `auth.register`: Cadastro de novo usuário (status=PENDING, role=CLIENTE)
- `auth.login`: Login com email/senha (valida status=APPROVED)
- `auth.me`: Retorna dados do usuário autenticado

**Protegidas (requer autenticação):**
- `auth.requestPasswordChange`: Solicita troca de senha

**Admin (requer role=ADMIN):**
- `auth.getAllUsers`: Lista todos os usuários
- `auth.getPendingUsers`: Lista usuários pendentes
- `auth.approveUser`: Aprova usuário com role e vínculo
- `auth.blockUser`: Bloqueia usuário
- `auth.changeUserRole`: Altera função e vínculo
- `auth.getPendingPasswordRequests`: Lista requisições de senha
- `auth.approvePasswordRequest`: Aprova troca de senha
- `auth.rejectPasswordRequest`: Rejeita troca de senha

#### Procedimentos tRPC (`server/_core/trpc.ts`)

- `publicProcedure`: Sem autenticação
- `protectedProcedure`: Requer autenticação (status=APPROVED)
- `adminProcedure`: Requer role=ADMIN

### Frontend

#### Páginas

**`client/src/pages/Login.tsx`**
- Tela de login moderna estilo SaaS
- Campos: Email, Senha
- Checkbox: Lembrar de mim
- Validações de status APPROVED
- Link para cadastro

**`client/src/pages/Register.tsx`**
- Tela de cadastro
- Campos: Nome, Email, Senha, Confirmar Senha
- Novo usuário recebe status=PENDING
- Mensagem de sucesso com redirecionamento

**`client/src/pages/AdminUsers.tsx`**
- Gestão de usuários (Configurações → Usuários)
- Tabela de usuários pendentes
- Tabela de todos os usuários
- Modal de aprovação com seleção de role e vínculo
- Ações: Aprovar, Bloquear, Alterar função

#### Componentes

**`client/src/_core/components/ProtectedRoute.tsx`**
- Componente para proteger rotas
- Valida autenticação
- Valida status=APPROVED
- Valida role se necessário
- Redireciona para /login se não autenticado

**`client/src/_core/hooks/useAuthContext.ts`**
- Hook para acessar contexto de autenticação
- Tipos TypeScript para usuário autenticado

## Fluxos de Autenticação

### 1. Registro de Novo Usuário

```
1. Usuário acessa /register
2. Preenche: Nome, Email, Senha
3. Sistema cria usuário com:
   - status = PENDING
   - role = CLIENTE (padrão)
4. Exibe mensagem: "Cadastro enviado para aprovação"
5. Redireciona para /login após 2 segundos
```

### 2. Login

```
1. Usuário acessa /login
2. Preenche: Email, Senha
3. Sistema valida:
   - Email existe
   - Senha correta
   - status = APPROVED
4. Se status ≠ APPROVED:
   - Exibe: "Seu acesso está aguardando aprovação"
5. Se sucesso:
   - Cria sessão
   - Redireciona para dashboard
```

### 3. Aprovação de Usuário (Admin)

```
1. Admin acessa Configurações → Usuários
2. Visualiza usuários pendentes
3. Clica "Aprovar" em um usuário
4. Modal solicita:
   - Função (role)
   - Vínculo (linkedType, linkedId) - se não ADMIN
5. Admin confirma
6. Sistema atualiza:
   - status = APPROVED
   - role = selecionado
   - linkedType = selecionado
   - linkedId = selecionado
7. Usuário pode fazer login
```

### 4. Bloqueio de Usuário (Admin)

```
1. Admin clica "Bloquear" em usuário pendente
2. Sistema atualiza status = BLOCKED
3. Usuário não pode mais fazer login
```

### 5. Troca de Senha

```
1. Usuário autenticado solicita troca
2. Sistema cria passwordRequest com:
   - status = PENDING
   - newPassword = criptografada
3. Admin aprova em Configurações
4. Após aprovação:
   - users.password = newPassword
   - passwordRequest.status = APPROVED
```

## Regras de Permissão

### ADMIN
- Acesso total ao sistema
- Sem vínculo obrigatório
- Pode gerenciar todos os usuários

### CLIENTE
- Pode ver apenas obras onde `obra.clientId = users.linkedId`
- Pode ver seu próprio cadastro
- Não pode editar nada
- Não pode ver outros clientes

### ARQUITETO
- Pode ver apenas obras onde `obra.architectId = users.linkedId`
- Pode ver seu próprio cadastro
- Não pode editar nada
- Não pode ver outros arquitetos

### PRESTADOR
- Pode ver apenas suas alocações onde `allocations.providerId = users.linkedId`
- Pode ver seu próprio cadastro
- Não pode ver dados financeiros
- Não pode ver outras alocações
- Não pode acessar página de obras

## Segurança

### Validações Backend

- Todas as permissões validadas no backend
- Nunca confiar em dados do frontend
- Validar `user.linkedId === resource_id` para acesso a recursos

### Criptografia

- Senhas: bcrypt com salt 10
- Comparação segura com `bcrypt.compare()`

### Proteção de Rotas

- Rotas públicas: sem autenticação
- Rotas protegidas: requerem autenticação + status=APPROVED
- Rotas admin: requerem role=ADMIN

## Endpoint de Versão

```
GET /api/system.version

Response:
{
  "version": "1.0.0",
  "environment": "dev",
  "feature": "auth-complete-system-with-permissions",
  "date": "2026-03-26",
  "changelog": "Auth system with roles, user linking, approval flow, prestador restrictions and security rules"
}
```

## Integração com Código Existente

### Compatibilidade

- Sistema mantém suporte a OAuth existente (openId)
- Novos usuários podem usar email/senha
- Usuários OAuth existentes continuam funcionando
- Tabelas existentes não foram alteradas (apenas adicionados campos)

### Migrações

1. `0000_init_schema.sql`: Schema inicial (sem alterações)
2. `0001_add_auth_system.sql`: Adiciona campos de autenticação

### Procedimentos tRPC Existentes

- `publicProcedure`: Continua funcionando
- `protectedProcedure`: Agora valida status=APPROVED
- `adminProcedure`: Continua validando role=admin

## Próximas Fases

### Fase 2: Implementação de Permissões por Recurso

```
- Middleware de autorização por role
- Filtros de dados por linkedId
- Restrições de acesso a páginas
```

### Fase 3: Interface de Cronograma

```
- Página de cronograma para PRESTADOR
- Sem exibição de valores financeiros
- Apenas tarefas alocadas
```

### Fase 4: Tabela `obra_prestadores`

```
- Vínculo muitos-para-muitos entre obras e prestadores
- Preparado para futuro
```

## Variáveis de Ambiente

Nenhuma nova variável de ambiente é necessária. O sistema usa:
- `DATABASE_URL`: Conexão com banco de dados (existente)
- `NODE_ENV`: Ambiente (dev/prod)

## Testes

### Fluxos Recomendados

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

## Suporte

Para dúvidas ou problemas, consulte:
- Backend: `server/routers/auth.ts`
- Frontend: `client/src/pages/Login.tsx`, `Register.tsx`, `AdminUsers.tsx`
- Database: `drizzle/migrations/0001_add_auth_system.sql`
