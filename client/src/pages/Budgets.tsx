
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Folder, LayoutGrid, List, MoreVertical, Plus } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { usePermission } from '../_core/hooks/usePermission';
import AccessDenied from '../components/AccessDenied';

const MOCKED_BUDGETS = [
  { id: '1', name: 'ORC.709/2026 - JOÃO E...' },
  { id: '2', name: 'ORC.708/2026 - RODRIGO ...' },
  { id: '3', name: 'ORC.707/2026 - LUIZA...' },
  { id: '4', name: 'ORC.706/2026 - TIAGO |...' },
  { id: '5', name: 'ORC.705/2026 - SECOC RS ...' },
  { id: '6', name: 'ORC.704/2026 - JANDIR' },
  { id: '7', name: 'ORC.703/2026 - GRUPO...' },
  { id: '8', name: 'ORC.702/2026 - WILLIAN...' },
  { id: '9', name: 'ORC.701/2026 - AK | ZOMA...' },
  { id: '10', name: 'ORC.700/2026 - BANHEIR...' },
  { id: '11', name: 'ORC.690/2026 - RENATO E...' },
  { id: '12', name: 'ORC.689/2026 - BANHEIR...' },
  { id: '13', name: 'ORC.688/2026 - FABIOLA |...' },
  { id: '14', name: 'ORC.687/2026 - NATALIA E...' },
  { id: '15', name: 'ORC.686/2026 - ROBERTA...' },
  { id: '16', name: 'ORC.685/2026 - JOÃO...' },
  { id: '17', name: 'ORC.684/2026 - PAULA E...' },
];

export default function Budgets() {
  const { canAccessPage } = usePermission();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [layout, setLayout] = useState<'grid' | 'list'>('grid'); // 'grid' or 'list'

  if (!canAccessPage('orcamentos')) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Orçamentos" />

      {/* Breadcrumb e Seletor de Ano */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Orçamentos</span>
          <ChevronDown size={16} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-2 py-1 h-auto text-sm">
                {currentYear} <ChevronDown size={16} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setCurrentYear(2026)}>2026</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentYear(2025)}>2025</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentYear(2024)}>2024</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Botões de Layout */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setLayout('list')} className={layout === 'list' ? 'bg-muted' : ''}>
            <List size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setLayout('grid')} className={layout === 'grid' ? 'bg-muted' : ''}>
            <LayoutGrid size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <Plus size={20} />
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-2 p-4 border-b bg-background">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              Status <ChevronDown size={16} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Prospecção</DropdownMenuItem>
            <DropdownMenuItem>Orçamento</DropdownMenuItem>
            <DropdownMenuItem>Perdido</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              Origem <ChevronDown size={16} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Google</DropdownMenuItem>
            <DropdownMenuItem>Indicação</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              Contato <ChevronDown size={16} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Telefone</DropdownMenuItem>
            <DropdownMenuItem>Email</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              Responsável <ChevronDown size={16} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Renato Araújo</DropdownMenuItem>
            <DropdownMenuItem>Rodrigo Silva</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Área Principal em Grade */}
      <div className="flex-1 p-4 overflow-auto bg-muted/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {MOCKED_BUDGETS.map((budget) => (
            <Card key={budget.id} className="flex items-center justify-between p-3 h-16">
              <div className="flex items-center space-x-3">
                <Folder size={24} className="text-gray-500" />
                <span className="font-medium text-sm truncate">{budget.name}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Abrir</DropdownMenuItem>
                  <DropdownMenuItem>Renomear</DropdownMenuItem>
                  <DropdownMenuItem>Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
