import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import DashboardLayout from "./components/DashboardLayout";
import { Button } from "./components/ui/button";
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

function InternalRouter() {
  const [location] = useLocation();
  const headerConfig = getRouteHeaderConfig(location);

  const getActionButton = () => {
    if (!headerConfig.actionButton) return null;

    return (
      <Button 
        onClick={headerConfig.actionButton.onClick}
        className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium px-4 py-2"
      >
        {headerConfig.actionButton.label}
      </Button>
    );
  };

  return (
    <DashboardLayout 
      title={headerConfig.title}
      subtitle={headerConfig.subtitle}
      actionButton={getActionButton()}
    >
      <Switch>
        <Route path={"/"} component={Dashboard} />
        <Route path={"/clients"} component={Clients} />
        <Route path={"/clients-summary"} component={ClientsSummary} />
        <Route path={"/architects"} component={Architects} />

        <Route path={"/prestadores"} component={Prestadores} />
        <Route path={"/allocations"} component={Allocations} />
        <Route path={"/reports"} component={Reports} />
        <Route path={"/budgets"} component={Budgets} />
        <Route path={"/contracts"} component={Contracts} />
        <Route path={"/finance"} component={Finance} />
        <Route path={"/works"} component={Works} />
        <Route path={"/timeline"} component={Schedule} />
        <Route path={"/settings"} component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/(.*)"} component={InternalRouter} />
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
