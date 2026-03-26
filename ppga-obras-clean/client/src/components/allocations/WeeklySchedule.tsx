import { useState } from 'react';
import AllocationBar from './AllocationBar';
import AllocationModal from './AllocationModal';

interface Work {
  id: string;
  name: string;
  architectName: string;
  responsibleName: string;
  status: string;
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

interface WeeklyScheduleProps {
  works: Work[];
  allocations: Allocation[];
  weekNumber: number;
  year: number;
  weekDays: Date[];
  onEditAllocation?: (allocation: Allocation) => void;
  onDeleteAllocation?: (id: string, providerName: string) => void;
}

export default function WeeklySchedule({
  works,
  allocations,
  weekNumber,
  year,
  weekDays,
  onEditAllocation,
  onDeleteAllocation,
}: WeeklyScheduleProps) {
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleAllocationClick = (allocation: Allocation) => {
    if (onEditAllocation) {
      onEditAllocation(allocation);
    } else {
      setSelectedAllocation(allocation);
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="px-6 py-4 space-y-4">
        {works.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Nenhuma obra com alocações nesta semana
            </p>
          </div>
        ) : (
          works.map(work => {
            // Filtrar alocacoes desta obra que ocorrem nesta semana
            const workAllocations = allocations.filter(a => {
              if (a.workId !== work.id) return false;
              const allocStart = new Date(a.startDate);
              const allocEnd = new Date(a.endDate);
              // Verificar se a alocacao se sobrepoe com a semana (segunda a sexta)
              const weekStart = weekDays[0];
              const weekEnd = new Date(weekDays[weekDays.length - 1]);
              weekEnd.setDate(weekEnd.getDate() + 1); // Incluir ate o final do ultimo dia
              return allocStart < weekEnd && allocEnd >= weekStart;
            });

            return (
              <div key={work.id} className="flex gap-4 border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 items-stretch">
                {/* Espaço vazio correspondente ao card da obra (w-64) */}
                <div className="w-64 flex-shrink-0" />

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
                          onClick={() => handleAllocationClick(allocation)}
                          onDelete={onDeleteAllocation}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && selectedAllocation && !onEditAllocation && (
        <AllocationModal
          allocation={selectedAllocation}
          onClose={() => {
            setShowModal(false);
            setSelectedAllocation(null);
          }}
        />
      )}
    </>
  );
}
