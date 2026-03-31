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
  // Portuguese routes (primary)
  '/painel': {
    title: 'Dashboard',
    subtitle: 'Painel de controle',
    actionButton: {
      label: 'Atalho rápido',
    },
  },
  '/clientes': {
    title: 'Clientes',
    subtitle: 'Gerencie seus clientes',
    actionButton: {
      label: '+ Adicionar cliente',
      onClick: () => {
        const event = new CustomEvent('openAddClientModal');
        window.dispatchEvent(event);
      },
    },
  },
  '/arquitetos': {
    title: 'Arquitetos',
    subtitle: 'Gerencie seus arquitetos',
    actionButton: {
      label: '+ Adicionar arquiteto',
      onClick: () => {
        const event = new CustomEvent('openAddArchitectModal');
        window.dispatchEvent(event);
      },
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
  '/alocacoes': {
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
  '/relatorios': {
    title: 'Relatórios',
    subtitle: 'Visualize relatórios e análises',
  },
  '/orcamentos': {
    title: 'Orçamentos',
    subtitle: 'Gerencie orçamentos de projetos',
  },
  '/contratos': {
    title: 'Contratos',
    subtitle: 'Gerencie contratos e documentos',
  },
  '/financeiro': {
    title: 'Financeiro',
    subtitle: 'Controle financeiro do sistema',
  },
  '/obras': {
    title: 'Obras',
    subtitle: 'Gerencie suas obras',
    actionButton: {
      label: '+ Adicionar obra',
      onClick: () => {
        const event = new CustomEvent('openAddWorkModal');
        window.dispatchEvent(event);
      },
    },
  },
  '/cronogramas': {
    title: 'Cronograma',
    subtitle: 'Visualize cronograma de projetos',
  },
  '/configuracoes': {
    title: 'Configurações',
    subtitle: 'Ajuste as configurações do sistema',
  },
  '/simulador': {
    title: 'Simulador',
    subtitle: 'Simule o cálculo de valor de obra',
  },
  
  // English routes (backward compatibility)
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Painel de controle',
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
    actionButton: {
      label: '+ Adicionar obra',
      onClick: () => {
        const event = new CustomEvent('openAddWorkModal');
        window.dispatchEvent(event);
      },
    },
  },
  '/timeline': {
    title: 'Cronograma',
    subtitle: 'Visualize cronograma de projetos',
  },
  '/schedule': {
    title: 'Cronograma',
    subtitle: 'Visualize cronograma de projetos',
  },
  '/settings': {
    title: 'Configurações',
    subtitle: 'Ajuste as configurações do sistema',
  },
  '/account': {
    title: 'Conta do usuário',
    subtitle: 'Gerencie o seu perfil de usuário',
  },
  '/simulator': {
    title: 'Simulador',
    subtitle: 'Simule o cálculo de valor de obra',
  },
};

export function getRouteHeaderConfig(pathname: string): RouteHeaderConfig {
  return routeHeaderConfig[pathname] || {
    title: '',
    subtitle: '',
  };
}
