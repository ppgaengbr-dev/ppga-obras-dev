import { useAuth } from './useAuth';

export type UserRole = 'ADMIN' | 'CLIENTE' | 'ARQUITETO' | 'PRESTADOR';

export interface PermissionConfig {
  page: 'OBRAS' | 'CLIENTES' | 'PRESTADORES' | 'ARQUITETOS' | 'ORCAMENTOS' | 'CONTRATOS' | 'FINANCEIRO' | 'RELATORIOS' | 'CONFIGURACOES' | 'CRONOGRAMAS' | 'ALOCACOES' | 'DASHBOARD' | 'BUDGETS' | 'SCHEDULE' | 'FINANCE' | 'REPORTS' | 'SETTINGS' | 'CONTRACTS' | 'SIMULADOR';
  action?: 'view' | 'edit' | 'delete' | 'create';
}

export function usePermission() {
  const { user } = useAuth();
  const role = user?.role as UserRole;

  /**
   * Verifica se o usuário tem permissão para acessar uma página
   * 
   * Tabela de permissões:
   * | Página        | ADMIN | CLIENTE | ARQUITETO | PRESTADOR |
   * |---------------|-------|---------|-----------|-----------|
   * | Dashboard     | ✅    | ✅      | ✅        | ✅        |
   * | Clientes      | ✅    | ❌      | ❌        | ❌        |
   * | Prestadores   | ✅    | ❌      | ❌        | ❌        |
   * | Arquitetos    | ✅    | ❌      | ❌        | ❌        |
   * | Obras         | ✅    | Suas    | Suas      | ❌        |
   * | Alocações     | ✅    | ❌      | ❌        | Suas      |
   * | Orçamentos    | ✅    | Suas    | Suas      | ❌        |
   * | Contratos     | ✅    | Suas    | ❌        | ❌        |
   * | Cronogramas   | ✅    | Suas    | Suas      | ❌        |
   * | Financeiro    | ✅    | ❌      | ❌        | ❌        |
   * | Relatórios    | ✅    | ❌      | ❌        | ❌        |
   * | Configurações | ✅    | ❌      | ❌        | ❌        |
   * | Simulador     | ✅    | ❌      | ✅        | ❌        |
   */
  const canAccessPage = (pageOrConfig: string | PermissionConfig): boolean => {
    if (!role) return false;

    // Admin tem acesso a tudo
    if (role === 'ADMIN') return true;

    // Converter string para uppercase para compatibilidade
    const page = (typeof pageOrConfig === 'string' 
      ? pageOrConfig.toUpperCase() 
      : pageOrConfig.page) as string;

    // Páginas bloqueadas para cada role (usando nomes em português)
    const blockedPages: Record<UserRole, string[]> = {
      ADMIN: [],
      // CLIENTE: Bloqueia Prestadores, Arquitetos, Alocações, Financeiro, Relatórios, Configurações, Simulador
      CLIENTE: ['CLIENTES', 'PRESTADORES', 'ARQUITETOS', 'ALOCACOES', 'FINANCEIRO', 'RELATORIOS', 'CONFIGURACOES', 'SIMULADOR'],
      // ARQUITETO: Bloqueia Clientes, Contratos, Prestadores, Arquitetos, Relatórios, Financeiro, Configurações
      ARQUITETO: ['CLIENTES', 'CONTRATOS', 'PRESTADORES', 'ARQUITETOS', 'RELATORIOS', 'FINANCEIRO', 'CONFIGURACOES'],
      // PRESTADOR: Bloqueia Clientes, Prestadores, Arquitetos, Obras, Orçamentos, Contratos, Cronogramas, Financeiro, Relatórios, Configurações, Simulador
      PRESTADOR: ['CLIENTES', 'PRESTADORES', 'ARQUITETOS', 'OBRAS', 'ORCAMENTOS', 'CONTRATOS', 'CRONOGRAMAS', 'FINANCEIRO', 'RELATORIOS', 'CONFIGURACOES', 'SIMULADOR'],
    };

    return !blockedPages[role]?.includes(page);
  };

  /**
   * Verifica se o usuário pode editar/deletar
   */
  const canEdit = (): boolean => {
    if (!role) return false;
    return role === 'ADMIN';
  };

  /**
   * Verifica se o usuário pode deletar
   */
  const canDelete = (): boolean => {
    if (!role) return false;
    return role === 'ADMIN';
  };

  /**
   * Verifica se o usuário pode criar
   */
  const canCreate = (): boolean => {
    if (!role) return false;
    return role === 'ADMIN';
  };

  /**
   * Filtra obras baseado na role do usuário
   */
  const filterWorks = (works: any[]): any[] => {
    if (!role || role === 'ADMIN') return works;

    // Cliente: vê apenas obras que ele é cliente
    if (role === 'CLIENTE') {
      return works.filter(work => work.clientId === user?.linkedId);
    }

    // Arquiteto: vê apenas obras que ele está referenciado
    if (role === 'ARQUITETO') {
      return works.filter(work => work.architectId === user?.linkedId);
    }

    // Prestador não tem acesso a obras
    return [];
  };

  /**
   * Filtra alocações baseado na role do usuário
   */
  const filterAllocations = (allocations: any[]): any[] => {
    if (!role || role === 'ADMIN') return allocations;

    // Prestador: vê apenas alocações que ele está referenciado
    if (role === 'PRESTADOR') {
      return allocations.filter(alloc => alloc.providerId === user?.linkedId);
    }

    // Outras roles não têm acesso a alocações
    return [];
  };

  /**
   * Filtra orçamentos baseado na role do usuário
   */
  const filterBudgets = (budgets: any[]): any[] => {
    if (!role || role === 'ADMIN') return budgets;

    // Cliente: vê apenas orçamentos de suas obras
    if (role === 'CLIENTE') {
      return budgets.filter(budget => budget.workId && budget.work?.clientId === user?.linkedId);
    }

    // Arquiteto: vê apenas orçamentos de obras que ele está referenciado
    if (role === 'ARQUITETO') {
      return budgets.filter(budget => budget.workId && budget.work?.architectId === user?.linkedId);
    }

    // Prestador não tem acesso a orçamentos
    return [];
  };

  /**
   * Filtra contratos baseado na role do usuário
   */
  const filterContracts = (contracts: any[]): any[] => {
    if (!role || role === 'ADMIN') return contracts;

    // Cliente: vê apenas contratos de suas obras
    if (role === 'CLIENTE') {
      return contracts.filter(contract => contract.workId && contract.work?.clientId === user?.linkedId);
    }

    // Outras roles não têm acesso a contratos
    return [];
  };

  /**
   * Filtra cronogramas baseado na role do usuário
   */
  const filterSchedules = (schedules: any[]): any[] => {
    if (!role || role === 'ADMIN') return schedules;

    // Cliente: vê apenas cronogramas de suas obras
    if (role === 'CLIENTE') {
      return schedules.filter(schedule => schedule.workId && schedule.work?.clientId === user?.linkedId);
    }

    // Arquiteto: vê apenas cronogramas de obras que ele está referenciado
    if (role === 'ARQUITETO') {
      return schedules.filter(schedule => schedule.workId && schedule.work?.architectId === user?.linkedId);
    }

    // Prestador não tem acesso a cronogramas
    return [];
  };

  return {
    role,
    canAccessPage,
    canEdit,
    canDelete,
    canCreate,
    filterWorks,
    filterAllocations,
    filterBudgets,
    filterContracts,
    filterSchedules,
  };
}
