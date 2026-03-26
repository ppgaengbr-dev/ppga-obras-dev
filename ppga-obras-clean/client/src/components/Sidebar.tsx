import { useSidebar } from "@/contexts/SidebarContext";
import { useLocation } from "wouter";
import {
  ChevronLeft,
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  BarChart3,
  DollarSign,
  Settings,
  Globe,
  Instagram,
  Menu,
} from "lucide-react";
import { Link } from "wouter";

/**
 * Sidebar Component
 * 
 * Design Philosophy: Minimalismo Corporativo Moderno
 * - Sidebar fixa à esquerda com 280px (expandida) / 80px (colapsada)
 * - Logo hexágono como marca visual
 * - Menu em duas seções: Principal e Links
 * - Transições suaves ao expandir/colapsar
 */

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  external?: boolean;
}

const mainNavItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/" },
  { id: "clients", label: "Clientes", icon: <Users size={20} />, href: "/clients" },
  { id: "budgets", label: "Orçamentos", icon: <DollarSign size={20} />, href: "/budgets" },
  { id: "works", label: "Obras", icon: <Briefcase size={20} />, href: "/works" },
  { id: "timeline", label: "Cronogramas", icon: <BarChart3 size={20} />, href: "/timeline" },
  { id: "contracts", label: "Contratos", icon: <FileText size={20} />, href: "/contracts" },
  { id: "allocations", label: "Alocações", icon: <BarChart3 size={20} />, href: "/allocations" },
  { id: "prestadores", label: "Prestadores", icon: <Briefcase size={20} />, href: "/prestadores" },
  { id: "architects", label: "Arquitetos", icon: <Users size={20} />, href: "/architects" },
  { id: "reports", label: "Relatórios", icon: <FileText size={20} />, href: "/reports" },
  { id: "financial", label: "Financeiro", icon: <DollarSign size={20} />, href: "/finance" },
  { id: "settings", label: "Configurações", icon: <Settings size={20} />, href: "/settings" },
  { id: "rules", label: "Regras", icon: <FileText size={20} />, href: "/rules" },
];

const secondaryNavItems: NavItem[] = [
  { id: "website", label: "Website", icon: <Globe size={20} />, href: "https://www.ppga.eng.br", external: true },
  { id: "instagram", label: "Instagram", icon: <Instagram size={20} />, href: "https://www.instagram.com/ppga.eng.br", external: true },
];

export default function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ease-out ${
        isCollapsed ? "w-20" : "w-72"
      } border-r border-sidebar-border shadow-lg`}
      style={{
        width: isCollapsed ? '80px' : '288px',
      }}
    >
      {/* Header com Logo e Botão Colapsar */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 flex-1">
          {!isCollapsed && (
            <>
              {/* Logo Hexágono PPGA */}
              <img src="/logo-hexagon.png" alt="PPGA Obras" className="flex-shrink-0 w-10 h-10" />
              <div className="flex flex-col">
                <h1 className="text-sm font-bold leading-tight">PPGA OBRAS</h1>
                <p className="text-xs text-sidebar-foreground/60">Painel administrativo</p>
              </div>
            </>
          )}
          {isCollapsed && <div className="w-10" />}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-black/20 rounded-lg transition-colors duration-200 flex-shrink-0 text-sidebar-foreground"
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Principal */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {mainNavItems.map((item) => (
          <Link key={item.id} href={item.href}>
            <a
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                isActive(item.href)
                  ? "bg-black/40 text-white font-semibold"
                  : "font-normal hover:bg-black/20"
              }`}
              title={isCollapsed ? item.label : ""}
            >
              <span className="flex-shrink-0 text-sidebar-foreground transition-colors">
                {item.icon}
              </span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </a>
          </Link>
        ))}
      </nav>

      {/* Divisor */}
      <div className="border-t border-sidebar-border" />

      {/* Menu Secundário */}
      <nav className="py-4 px-2 space-y-1 border-b border-sidebar-border">
        {secondaryNavItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal transition-all duration-150 hover:bg-black/20 group"
            title={isCollapsed ? item.label : ""}
          >
            <span className="flex-shrink-0 text-sidebar-foreground group-hover:text-sidebar-accent transition-colors">
              {item.icon}
            </span>
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </a>
        ))}
      </nav>

      {/* Footer com Informações do Usuário */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sidebar-accent to-secondary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sidebar-accent-foreground font-display font-bold text-xs">RA</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">Renato Araújo</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">Admin</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
