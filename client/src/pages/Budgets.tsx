import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Folder, SquarePen, Trash2 } from 'lucide-react';
import { usePermission } from '../_core/hooks/usePermission';
import AccessDenied from '../components/AccessDenied';
import { PageToolbar, FilterOption } from '../components/PageToolbar';

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

  const filters: FilterOption[] = [
    { label: 'Status', options: ['Prospecção', 'Orçamento', 'Perdido'] },
    { label: 'Origem', options: ['Google', 'Indicação'] },
    { label: 'Contato', options: ['Telefone', 'Email'] },
    { label: 'Responsável', options: ['Renato Araújo', 'Rodrigo Silva'] },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageToolbar 
        filters={filters} 
        layout={layout} 
        onLayoutChange={setLayout} 
      />

      {/* Área Principal em Grade */}
      <div className="flex-1 pb-4 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCKED_BUDGETS.map((budget) => (
            <Card key={budget.id} className="relative flex flex-col p-4 group hover:shadow-md transition-shadow duration-200 cursor-pointer">
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

              {/* Conteúdo do Card em 3 linhas - Altura automática (sem h-36) */}
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
