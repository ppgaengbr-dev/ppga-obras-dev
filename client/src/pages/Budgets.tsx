
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Folder, LayoutGrid, List, Plus, Pencil, Trash2 } from 'lucide-react';
import { usePermission } from '../_core/hooks/usePermission';
import AccessDenied from '../components/AccessDenied';

const MOCKED_BUDGETS = [
  { id: '1', name: 'ORC.709/2026 - JOÃO E SILVA ENGENHARIA E ARQUITETURA' },
  { id: '2', name: 'ORC.708/2026 - RODRIGO SOUZA PROJETOS' },
  { id: '3', name: 'ORC.707/2026 - LUIZA FERNANDES ARQUITETURA' },
  { id: '4', name: 'ORC.706/2026 - TIAGO LIMA CONSTRUÇÕES' },
  { id: '5', name: 'ORC.705/2026 - SECOC RS LTDA' },
  { id: '6', name: 'ORC.704/2026 - JANDIR ALVES REFORMAS' },
  { id: '7', name: 'ORC.703/2026 - GRUPO ALFA ENGENHARIA' },
  { id: '8', name: 'ORC.702/2026 - WILLIAN PEREIRA ARQUITETO' },
  { id: '9', name: 'ORC.701/2026 - AK | ZOMA ENGENHARIA' },
  { id: '10', name: 'ORC.700/2026 - BANHEIRO SOCIAL APTO 301' },
  { id: '11', name: 'ORC.690/2026 - RENATO E FAMÍLIA' },
  { id: '12', name: 'ORC.689/2026 - BANHEIRO SUÍTE APTO 502' },
  { id: '13', name: 'ORC.688/2026 - FABIOLA E ANDRÉ' },
  { id: '14', name: 'ORC.687/2026 - NATALIA E MARCOS' },
  { id: '15', name: 'ORC.686/2026 - ROBERTA E CARLOS' },
  { id: '16', name: 'ORC.685/2026 - JOÃO E MARIA' },
  { id: '17', name: 'ORC.684/2026 - PAULA E PEDRO' },
];

export default function Budgets() {
  const { canAccessPage } = usePermission();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid'); // 'grid' or 'list'

  if (!canAccessPage('orcamentos')) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barra de Ferramentas Principal */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        {/* Filtros */}
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                Status <Folder size={16} className="ml-1" />
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
                Origem <Folder size={16} className="ml-1" />
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
                Contato <Folder size={16} className="ml-1" />
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
                Responsável <Folder size={16} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Renato Araújo</DropdownMenuItem>
              <DropdownMenuItem>Rodrigo Silva</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Botões de Layout e Novo Orçamento */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setLayout('list')} className={layout === 'list' ? 'bg-muted' : ''}>
            <List size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setLayout('grid')} className={layout === 'grid' ? 'bg-muted' : ''}>
            <LayoutGrid size={20} />
          </Button>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium px-4 py-2">
            <Plus size={16} className="mr-2" /> Novo orçamento
          </Button>
        </div>
      </div>

      {/* Área Principal em Grade */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MOCKED_BUDGETS.map((budget) => (
            <Card key={budget.id} className="relative flex flex-col justify-between p-4 h-32 group hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-3 mb-2">
                <Folder size={24} className="text-gray-500" />
                <span className="font-medium text-base leading-tight">{budget.name}</span>
              </div>
              {/* Ações ao passar o mouse */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-red-500 hover:text-red-600">
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
