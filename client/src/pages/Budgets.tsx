import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Folder, LayoutGrid, List, SquarePen, Trash2, ChevronDown } from 'lucide-react';
import { usePermission } from '../_core/hooks/usePermission';
import AccessDenied from '../components/AccessDenied';

const MOCKED_BUDGETS = [
  { id: '1', number: 'ORC.709/2026', clientName: 'JOÃO E SILVA ENGENHARIA E ARQUITETURA', contact: 'João Silva' },
  { id: '2', number: 'ORC.708/2026', clientName: 'RODRIGO SOUZA PROJETOS', contact: 'Rodrigo Souza' },
  { id: '3', number: 'ORC.707/2026', clientName: 'LUIZA FERNANDES ARQUITETURA', contact: 'Luiza Fernandes' },
  { id: '4', number: 'ORC.706/2026', clientName: 'TIAGO LIMA CONSTRUÇÕES', contact: 'Tiago Lima' },
  { id: '5', number: 'ORC.705/2026', clientName: 'SECOC RS LTDA', contact: 'Carlos Eduardo' },
  { id: '6', number: 'ORC.704/2026', clientName: 'JANDIR ALVES REFORMAS', contact: 'Jandir Alves' },
  { id: '7', number: 'ORC.703/2026', clientName: 'GRUPO ALFA ENGENHARIA', contact: 'Ricardo Alfa' },
  { id: '8', number: 'ORC.702/2026', clientName: 'WILLIAN PEREIRA ARQUITETO', contact: 'Willian Pereira' },
  { id: '9', number: 'ORC.701/2026', clientName: 'AK | ZOMA ENGENHARIA', contact: 'Ana Karina' },
  { id: '10', number: 'ORC.700/2026', clientName: 'BANHEIRO SOCIAL APTO 301', contact: 'Condomínio Solar' },
  { id: '11', number: 'ORC.690/2026', clientName: 'RENATO E FAMÍLIA', contact: 'Renato Araújo' },
  { id: '12', number: 'ORC.689/2026', clientName: 'BANHEIRO SUÍTE APTO 502', contact: 'Condomínio Solar' },
  { id: '13', number: 'ORC.688/2026', clientName: 'FABIOLA E ANDRÉ', contact: 'Fabiola André' },
  { id: '14', number: 'ORC.687/2026', clientName: 'NATALIA E MARCOS', contact: 'Natalia Marcos' },
  { id: '15', number: 'ORC.686/2026', clientName: 'ROBERTA E CARLOS', contact: 'Roberta Carlos' },
  { id: '16', number: 'ORC.685/2026', clientName: 'JOÃO E MARIA', contact: 'João Maria' },
  { id: '17', number: 'ORC.684/2026', clientName: 'PAULA E PEDRO', contact: 'Paula Pedro' },
];

export default function Budgets() {
  const { canAccessPage } = usePermission();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  if (!canAccessPage('orcamentos')) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barra de Ferramentas com Filtros e Botões de Layout */}
      <div className="flex items-center justify-between pt-4 pb-4 bg-background">
        {/* Filtros - Visual leve e transparente */}
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center bg-transparent border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Status <ChevronDown size={14} className="ml-1.5 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Prospecção</DropdownMenuItem>
              <DropdownMenuItem>Orçamento</DropdownMenuItem>
              <DropdownMenuItem>Perdido</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center bg-transparent border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Origem <ChevronDown size={14} className="ml-1.5 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Google</DropdownMenuItem>
              <DropdownMenuItem>Indicação</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center bg-transparent border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Contato <ChevronDown size={14} className="ml-1.5 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Telefone</DropdownMenuItem>
              <DropdownMenuItem>Email</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center bg-transparent border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Responsável <ChevronDown size={14} className="ml-1.5 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Renato Araújo</DropdownMenuItem>
              <DropdownMenuItem>Rodrigo Silva</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Botões de Layout */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={() => setLayout("list")} className={`w-9 h-9 ${layout === "list" ? "bg-muted" : ""}`}>
            <List size={18} className="text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setLayout("grid")} className={`w-9 h-9 ${layout === "grid" ? "bg-muted" : ""}`}>
            <LayoutGrid size={18} className="text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Linha fina separadora */}
      <div className="border-b border-gray-100 mb-6"></div>

      {/* Área Principal em Grade */}
      <div className="flex-1 pb-4 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCKED_BUDGETS.map((budget) => (
            <Card key={budget.id} className="relative flex flex-col p-4 h-36 group hover:shadow-md transition-shadow duration-200 cursor-pointer">
              {/* Ações ao passar o mouse - Padrão Clients.tsx */}
              <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  title="Editar orçamento"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <SquarePen size={16} />
                </button>
                <button
                  title="Excluir orçamento"
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Conteúdo do Card em 3 linhas */}
              <div className="flex items-start space-x-3 pr-8">
                <Folder size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {budget.number}
                  </p>
                  <p className="text-gray-600 text-xs mt-1.5 break-words line-clamp-2">
                    {budget.clientName}
                  </p>
                  <p className="text-gray-500 text-xs mt-1.5 truncate">
                    {budget.contact}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
