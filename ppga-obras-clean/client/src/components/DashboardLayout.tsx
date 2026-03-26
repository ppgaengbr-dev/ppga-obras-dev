import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";

/**
 * DashboardLayout Component
 * 
 * Design Philosophy: Minimalismo Corporativo Moderno
 * - Layout com Sidebar fixa à esquerda
 * - Header fixo no topo
 * - Conteúdo principal com padding adequado
 */

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actionButton?: ReactNode;
}

export default function DashboardLayout({
  children,
  title = "Dashboard",
  subtitle,
  actionButton,
}: DashboardLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col transition-all duration-300 ease-out"
        style={{
          marginLeft: isCollapsed ? '80px' : '288px',
        }}
      >
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {(title || actionButton) && (
              <div className="flex items-start justify-between mb-8">
                <div>
                  {title && <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>}
                  {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
                {actionButton && <div className="flex-shrink-0">{actionButton}</div>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
