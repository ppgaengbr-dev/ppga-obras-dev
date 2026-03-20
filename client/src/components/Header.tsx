import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

/**
 * Header Component
 * 
 * Design Philosophy: Minimalismo Corporativo Moderno
 * - Header fixo no topo com altura de 64px
 * - Espaço para título da página à esquerda
 * - Ícones de ação e notificações à direita
 * - Transições suaves em hover
 */

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = "Dashboard", subtitle }: HeaderProps) {
  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm transition-all duration-300 ease-out">
      {/* Título e Subtítulo */}
      <div className="flex flex-col">
        <h1 className="text-xl font-display font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Ações à Direita */}
      <div className="flex items-center gap-3">
        {/* Botão Atalho Rápido */}
        <Button
          variant="default"
          className="bg-foreground text-background hover:bg-foreground/90 rounded-full h-10 px-4 flex items-center gap-2"
        >
          Atalho rápido
          <ChevronDown size={16} />
        </Button>

        {/* Avatar */}
        <Avatar className="w-10 h-10">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=RA" alt="RA" />
          <AvatarFallback>RA</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
