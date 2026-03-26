import { ReactNode } from 'react';

export interface RouteHeaderConfig {
  title: string;
  subtitle: string;
  actionButton?: {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
  };
}

export const routeHeaderConfig: Record<string, RouteHeaderConfig> = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Visão geral do sistema',
    actionButton: {
      label: 'Atalho rápido',
    },
  },
  '/clients': {
    title: 'Clientes',
    subtitle: 'Gerencie seus clientes',
    actionButton: {
      label: '+ Adicionar cliente',
      onClick: () => {
        // Trigger modal open via custom event
        const event = new CustomEvent('openAddClientModal');
        window.dispatchEvent(event);
      },
    },
  },
  '/architects': {
    title: 'Arquitetos',
    subtitle: 'Gerencie seus arquitetos',
    actionButton: {
      label: '+ Adicionar arquiteto',
      onClick: () => {
        // Trigger modal open via custom event
        const event = new CustomEvent('openAddArchitectModal');
        window.dispatchEvent(event);
      },
    },
  },
  '/providers': {
    title: 'Prestadores',
    subtitle: 'Gerencie seus prestadores',
    actionButton: {
      label: '+ Adicionar prestador',
    },
  },
  '/prestadores': {
    title: 'Prestadores',
    subtitle: 'Gerencie seus prestadores',
    actionButton: {
      label: '+ Adicionar prestador',
      onClick: () => {
        const event = new CustomEvent('openAddPrestadorModal');
        window.dispatchEvent(event);
      },
    },
  },
  '/allocations': {
    title: 'Alocações',
    subtitle: 'Gerencie alocações de prestadores',
    actionButton: {
      label: '+ Adicionar alocação',
      onClick: () => {
        const event = new CustomEvent('openAddAllocationModal');
        window.dispatchEvent(event);
      },
    },
  },
  '/reports': {
    title: 'Relatórios',
    subtitle: 'Visualize relatórios e análises',
  },
  '/budgets': {
    title: 'Orçamentos',
    subtitle: 'Gerencie orçamentos de projetos',
  },
  '/contracts': {
    title: 'Contratos',
    subtitle: 'Gerencie contratos e documentos',
  },
  '/finance': {
    title: 'Financeiro',
    subtitle: 'Controle financeiro do sistema',
  },
  '/works': {
    title: 'Obras',
    subtitle: 'Gerencie suas obras',
  },
  '/schedule': {
    title: 'Cronograma',
    subtitle: 'Visualize cronograma de projetos',
  },
  '/settings': {
    title: 'Configurações',
    subtitle: 'Ajuste as configurações do sistema',
  },
};

export function getRouteHeaderConfig(pathname: string): RouteHeaderConfig {
  return routeHeaderConfig[pathname] || {
    title: 'Página',
    subtitle: 'Conteúdo',
  };
}
