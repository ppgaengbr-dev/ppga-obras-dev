import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import DashboardLayout from "./components/DashboardLayout";
import { Button } from "./components/ui/button";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientsSummary from "./pages/ClientsSummary";
import Architects from "./pages/Architects";

import Prestadores from "./pages/Prestadores";
import Allocations from "./pages/Allocations";
import Reports from "./pages/Reports";
import Budgets from "./pages/Budgets";
import Contracts from "./pages/Contracts";
import Finance from "./pages/Finance";
import Works from "./pages/Works";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import { getRouteHeaderConfig } from "./config/routeHeaderConfig";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { AdminUsersPage } from "./pages/AdminUsers";
import RootRedirect from "./pages/RootRedirect";
import Account from "./pages/Account";
import Simulator from "./pages/Simulator";
import { usePermission } from "./_core/hooks/usePermission";
import AccessDenied from "./components/AccessDenied";

function InternalRouter() {
  const [location] = useLocation();
  const { canAccessPage } = usePermission();
  const headerConfig = getRouteHeaderConfig(location);

  // Mapeamento de rotas para permissões
  const routeToPermission: Record<string, string> = {
    '/clientes': 'clientes',
    '/clients': 'clientes',
    '/arquitetos': 'arquitetos',
    '/architects': 'arquitetos',
    '/prestadores': 'prestadores',
    '/providers': 'prestadores',
    '/alocacoes': 'alocacoes',
    '/allocations': 'alocacoes',
    '/relatorios': 'relatorios',
    '/reports': 'relatorios',
    '/orcamentos': 'orcamentos',
    '/budgets': 'orcamentos',
    '/contratos': 'contratos',
    '/contracts': 'contratos',
    '/financeiro': 'financeiro',
    '/finance': 'financeiro',
    '/obras': 'obras',
    '/works': 'obras',
    '/cronogramas': 'cronogramas',
    '/timeline': 'cronogramas',
    '/schedule': 'cronogramas',
    '/configuracoes': 'configuracoes',
    '/settings': 'configuracoes',
    '/simulador': 'simulador',
    '/simulator': 'simulador',
  };

  const permissionKey = routeToPermission[location];
  const hasAccess = !permissionKey || canAccessPage(permissionKey);

  const getActionButton = () => {
    if (!headerConfig.actionButton || !hasAccess) return null;

    return (
      <Button 
        onClick={headerConfig.actionButton.onClick}
        className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium px-4 py-2"
      >
        {headerConfig.actionButton.label}
      </Button>
    );
  };

  // Se não tiver acesso, forçamos showHeader = false para não aparecer o título da rota
  const showHeader = hasAccess ? headerConfig.showHeader : false;

  return (
    <ProtectedRoute>
      <DashboardLayout 
        title={hasAccess ? headerConfig.title : ""}
        subtitle={hasAccess ? headerConfig.subtitle : ""}
        actionButton={getActionButton()}
        showHeader={showHeader}
      >
        <Switch>
          {/* Portuguese routes (primary) */}
          <Route path={"/painel"} component={Dashboard} />
          <Route path={"/clientes"} component={Clients} />
          <Route path={"/arquitetos"} component={Architects} />
          <Route path={"/prestadores"} component={Prestadores} />
          <Route path={"/alocacoes"} component={Allocations} />
          <Route path={"/relatorios"} component={Reports} />
          <Route path={"/orcamentos"} component={Budgets} />
          <Route path={"/contratos"} component={Contracts} />
          <Route path={"/financeiro"} component={Finance} />
          <Route path={"/obras"} component={Works} />
          <Route path={"/cronogramas"} component={Schedule} />
          <Route path={"/configuracoes"} component={Settings} />
          <Route path={"/simulador"} component={Simulator} />
          
          {/* English routes (backward compatibility) */}
          <Route path={"/dashboard"} component={Dashboard} />
          <Route path={"/clients"} component={Clients} />
          <Route path={"/clients-summary"} component={ClientsSummary} />
          <Route path={"/architects"} component={Architects} />
          <Route path={"/allocations"} component={Allocations} />
          <Route path={"/reports"} component={Reports} />
          <Route path={"/budgets"} component={Budgets} />
          <Route path={"/contracts"} component={Contracts} />
          <Route path={"/finance"} component={Finance} />
          <Route path={"/works"} component={Works} />
          <Route path={"/timeline"} component={Schedule} />
          <Route path={"/schedule"} component={Schedule} />
          <Route path={"/settings"} component={Settings} />
          <Route path={"/simulator"} component={Simulator} />
          
          {/* Other routes */}
          <Route path={"/admin/users"} component={AdminUsersPage} />
          <Route path={"/account"} component={Account} />
          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={RootRedirect} />
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/register"} component={RegisterPage} />
      <Route path={"/:rest*"} component={InternalRouter} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <SidebarProvider>
          <TooltipProvider>
            <Router />
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
