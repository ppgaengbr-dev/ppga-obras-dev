import { useCallback } from 'react';
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
  const canAccessPage = useCallback((pageOrConfig: string | PermissionConfig): boolean => {
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
  }, [role]);

  /**
   * Verifica se o usuário pode editar/deletar
   */
  const canEdit = useCallback((): boolean => {
    if (!role) return false;
    return role === 'ADMIN';
  }, [role]);

  /**
   * Verifica se o usuário pode deletar
   */
  const canDelete = useCallback((): boolean => {
    if (!role) return false;
    return role === 'ADMIN';
  }, [role]);

  /**
   * Verifica se o usuário pode criar
   */
  const canCreate = useCallback((): boolean => {
    if (!role) return false;
    return role === 'ADMIN';
  }, [role]);

  /**
   * Filtra obras baseado na role do usuário
   */
  const filterWorks = useCallback((works: any[]): any[] => {
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
  }, [role, user?.linkedId]);

  /**
   * Filtra alocações baseado na role do usuário
   */
  const filterAllocations = useCallback((allocations: any[]): any[] => {
    if (!role || role === 'ADMIN') return allocations;

    // Prestador: vê apenas alocações que ele está referenciado
    if (role === 'PRESTADOR') {
      return allocations.filter(alloc => alloc.providerId === user?.linkedId);
    }

    // Outras roles não têm acesso a alocações
    return [];
  }, [role, user?.linkedId]);

  /**
   * Filtra orçamentos baseado na role do usuário
   */
  const filterBudgets = useCallback((budgets: any[]): any[] => {
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
  }, [role, user?.linkedId]);

  /**
   * Filtra contratos baseado na role do usuário
   */
  const filterContracts = useCallback((contracts: any[]): any[] => {
    if (!role || role === 'ADMIN') return contracts;

    // Cliente: vê apenas contratos de suas obras
    if (role === 'CLIENTE') {
      return contracts.filter(contract => contract.workId && contract.work?.clientId === user?.linkedId);
    }

    // Outras roles não têm acesso a contratos
    return [];
  }, [role, user?.linkedId]);

  /**
   * Filtra cronogramas baseado na role do usuário
   */
  const filterSchedules = useCallback((schedules: any[]): any[] => {
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
  }, [role, user?.linkedId]);

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
