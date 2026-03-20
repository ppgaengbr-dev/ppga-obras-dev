import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Work {
  id: string;
  name: string;
  architectName: string;
  responsibleName: string;
  status: string;
  clientOrigin?: string;
  clientContact?: string;
}

interface LeftPanelProps {
  works: Work[];
  selectedWorkId: string | null;
  onSelectWork: (workId: string) => void;
  currentDate: Date;
  monthYear: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

// Mapeamento de origem para exibição correta
const originMap: Record<string, string> = {
  'architect': 'Arquiteto',
  'google': 'Google',
  'instagram': 'Instagram',
  'facebook': 'Facebook',
  'indication': 'Indicação',
};

const getDisplayOrigin = (origin: string | undefined): string => {
  if (!origin) return 'N/A';
  if (origin[0] === origin[0].toUpperCase() && origin[0] !== origin[0].toLowerCase()) {
    return origin;
  }
  return originMap[origin.toLowerCase()] || origin;
};

const getDisplayContact = (contact: string | undefined): string => {
  if (!contact) return 'N/A';
  if (contact[0] === contact[0].toUpperCase()) {
    return contact;
  }
  return contact.charAt(0).toUpperCase() + contact.slice(1);
};

export default function LeftPanel({
  works,
  selectedWorkId,
  onSelectWork,
  currentDate,
  monthYear,
  onPreviousMonth,
  onNextMonth,
}: LeftPanelProps) {
  return (
    <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col rounded-lg shadow-sm h-full">
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0 rounded-t-lg">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <div className="text-center flex-1">
            <h2 className="text-sm font-semibold text-gray-900 capitalize">
              {monthYear}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              Obra com locação ({works.length})
            </p>
          </div>
          <button
            onClick={onNextMonth}
            className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
        {works.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">
              Nenhuma obra com alocações nesta semana
            </p>
          </div>
        ) : (
          works.map(work => (
            <div key={work.id} className="flex gap-4 border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 items-stretch">
              {/* Card da obra */}
              <div 
                onClick={() => onSelectWork(work.id)}
                className={`w-64 flex-shrink-0 border rounded-lg p-3 flex flex-col justify-center cursor-pointer transition-colors ${
                  selectedWorkId === work.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">{work.name}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-tight">Origem: {getDisplayOrigin(work.clientOrigin)}</p>
                <p className="text-xs text-gray-600 leading-tight">Contato: {getDisplayContact(work.clientContact)}</p>
                <p className="text-xs text-gray-600 leading-tight">Responsavel: {work.responsibleName}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
