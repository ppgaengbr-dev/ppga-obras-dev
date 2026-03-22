# Instruções de Deploy - Correção de Alocações

## 📋 Resumo das Mudanças

Este release corrige o problema onde **alocações não apareciam no calendário frontend** após serem criadas. O problema foi causado por referências incorretas de chave estrangeira no banco de dados.

**Arquivos modificados:**
- `drizzle/schema.ts` - Corrigida referência de FK
- `server/_core/index.ts` - Adicionadas constraints de FK na migração SQL

## 🚀 Passos para Deploy

### 1. Preparar o Código

```bash
# Clonar ou atualizar o repositório
git clone <seu-repositorio> ppga-obras-clone
cd ppga-obras-clone

# Ou se já tiver o repositório:
git pull origin main

# Instalar dependências
pnpm install

# Compilar o projeto
pnpm build
```

### 2. Fazer Push para Railway

```bash
# Adicionar as mudanças
git add .

# Fazer commit
git commit -m "fix: Correct foreign key references for allocations table

- Fixed workId reference from clients.id to works.id in schema
- Added foreign key constraints in allocations table migration
- Ensures allocations are properly linked to works
- Fixes issue where allocations were not displaying in calendar"

# Fazer push
git push origin main
```

Railway fará o deploy automaticamente.

### 3. Executar a Migração do Banco de Dados

Após o deploy, acesse a URL de setup para executar as migrações:

```
https://app.ppgaobras.com.br/api/setup-db
```

**Importante**: Isso vai recriar as tabelas com as constraints corretas. Se você tiver dados existentes, eles serão preservados (a migração usa `CREATE TABLE IF NOT EXISTS`).

### 4. Verificar o Deploy

1. Acesse https://app.ppgaobras.com.br/allocations
2. Crie uma nova alocação:
   - Selecione um prestador
   - Selecione uma obra
   - Defina as datas (ex: 16/03 a 20/03)
   - Preencha os outros campos
   - Clique em "Adicionar"
3. **Resultado esperado**: A alocação deve aparecer imediatamente no calendário

## 🔍 Verificação Técnica

### Verificar se a Migração Foi Executada

Acesse o banco de dados e execute:

```sql
-- Verificar a estrutura da tabela allocations
DESCRIBE allocations;

-- Verificar as constraints
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'allocations' AND REFERENCED_TABLE_NAME IS NOT NULL;
```

Você deve ver:
- `allocations_workId_fk`: Referencia `works.id`
- `allocations_providerId_fk`: Referencia `providers.id`

### Verificar Alocações no Banco

```sql
-- Ver todas as alocações
SELECT id, workId, providerId, startDate, endDate FROM allocations;

-- Ver alocações de uma obra específica
SELECT * FROM allocations WHERE workId = <id_da_obra>;
```

## 🐛 Troubleshooting

### Problema: Alocações ainda não aparecem

**Solução 1**: Limpar cache do navegador
```
- Pressionar Ctrl+Shift+Delete (ou Cmd+Shift+Delete no Mac)
- Limpar cookies e cache
- Recarregar a página
```

**Solução 2**: Verificar logs do Railway
```bash
railway logs --follow
```

Procure por erros como:
- `Failed to create allocation`
- `Foreign key constraint fails`
- `Database not available`

### Problema: Erro "Foreign key constraint fails"

Isso significa que o `workId` ou `providerId` não existe nas tabelas `works` ou `providers`.

**Verificar**:
```sql
-- Verificar se a obra existe
SELECT * FROM works WHERE id = <workId>;

-- Verificar se o prestador existe
SELECT * FROM providers WHERE id = <providerId>;
```

### Problema: Erro ao acessar /api/setup-db

Isso pode significar que o banco de dados não está acessível.

**Verificar**:
1. Confirmar que a variável `DATABASE_URL` está configurada no Railway
2. Verificar se o banco de dados MySQL está rodando
3. Verificar os logs do Railway para mais detalhes

## 📊 Impacto das Mudanças

### Antes da Correção
- ❌ Alocações eram criadas mas não apareciam no calendário
- ❌ Sem validação de chave estrangeira
- ❌ Possibilidade de dados órfãos no banco

### Depois da Correção
- ✅ Alocações aparecem imediatamente após criação
- ✅ Validação de chave estrangeira garante integridade dos dados
- ✅ Impossível criar alocações com works/providers inválidos
- ✅ Deleção de works/providers remove suas alocações automaticamente

## 🔄 Rollback (Se Necessário)

Se precisar reverter as mudanças:

```bash
# Reverter para a versão anterior
git revert HEAD

# Fazer push
git push origin main

# Acessar /api/setup-db novamente para restaurar o schema anterior
```

## 📝 Notas Importantes

1. **Backup**: Faça backup do banco de dados antes do deploy
2. **Downtime**: Não há downtime esperado durante o deploy
3. **Dados Existentes**: Alocações existentes serão preservadas
4. **Testes**: Teste em staging antes de fazer deploy em produção

## 🎯 Próximas Melhorias (Futuro)

- [ ] Adicionar validação de datas (endDate >= startDate)
- [ ] Adicionar índices nas colunas de FK para melhor performance
- [ ] Implementar testes de integração para alocações
- [ ] Adicionar soft delete para manter histórico
- [ ] Adicionar auditoria de mudanças em alocações

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do Railway
2. Verifique a integridade do banco de dados
3. Limpe o cache do navegador
4. Tente acessar `/api/setup-db` novamente

Para mais informações, consulte `FIX_ALLOCATIONS_ISSUE.md`.
