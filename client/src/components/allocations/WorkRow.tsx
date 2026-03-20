import { useState } from 'react';
import AllocationBar from './AllocationBar';

interface Work {
  id: string;
  name: string;
  architectName: string;
  responsibleName: string;
  status: string;
  clientOrigin?: string;
  clientContact?: string;
}

interface Allocation {
  id: string;
  workId: string;
  providerId: string;
  providerName: string;
  service: string;
  startDate: string;
  endDate: string;
}

interface WorkRowProps {
  work: Work;
  workAllocations: Allocation[];
  weekDays: Date[];
  onEditAllocation?: (allocation: Allocation) => void;
  onDeleteAllocation?: (id: string, providerName: string) => void;
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

export default function WorkRow({
  work,
  workAllocations,
  weekDays,
  onEditAllocation,
  onDeleteAllocation,
}: WorkRowProps) {
  // Calcular altura mínima baseada no número de alocações
  // Cada barra tem ~32px (h-8) + gap de 8px (space-y-2)
  const minHeightClass = workAllocations.length > 1 
    ? `min-h-[${32 + (workAllocations.length - 1) * 40}px]`
    : 'min-h-24';

  return (
    <div className="flex gap-4 border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 items-stretch">
      {/* Card da obra - esquerda - altura sincronizada */}
      <div className={`w-64 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col justify-center ${minHeightClass}`}>
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{work.name}</h3>
        <p className="text-xs text-gray-600 mt-1 leading-tight">Origem: {getDisplayOrigin(work.clientOrigin)}</p>
        <p className="text-xs text-gray-600 leading-tight">Contato: {getDisplayContact(work.clientContact)}</p>
        <p className="text-xs text-gray-600 leading-tight">Responsavel: {work.responsibleName}</p>
      </div>

      {/* Barras de prestadores - direita */}
      <div className="flex-1 flex flex-col justify-center">
        {workAllocations.length === 0 ? (
          <p className="text-xs text-gray-500 py-4">
            Sem alocações nesta semana
          </p>
        ) : (
          <div className="space-y-2 flex flex-col">
            {workAllocations.map(allocation => (
              <AllocationBar
                key={allocation.id}
                allocation={allocation}
                weekDays={weekDays}
                onClick={() => onEditAllocation?.(allocation)}
                onDelete={onDeleteAllocation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
