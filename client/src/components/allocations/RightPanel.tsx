import { ChevronLeft, ChevronRight } from 'lucide-react';
import WeeklySchedule from './WeeklySchedule';

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

interface RightPanelProps {
  works: Work[];
  allocations: Allocation[];
  currentWeekMonday: Date;
  weekNumber: number;
  year: number;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onEditAllocation?: (allocation: Allocation) => void;
  onDeleteAllocation?: (id: string, providerName: string) => void;
}

export default function RightPanel({
  works,
  allocations,
  currentWeekMonday,
  weekNumber,
  year,
  onPreviousWeek,
  onNextWeek,
  onEditAllocation,
  onDeleteAllocation,
}: RightPanelProps) {
  // Função para parsear data sem conversão de timezone
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const weekDays = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(currentWeekMonday);
    date.setDate(date.getDate() + i);
    weekDays.push(date);
  }

  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const dateFormat = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  return (
    <div className="flex-1 bg-white border-l border-gray-200 flex flex-col rounded-lg shadow-sm h-full">
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-lg">
        <button
          onClick={onPreviousWeek}
          className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <div className="flex gap-12 flex-1 px-4">
          {weekDays.map((date, index) => {
            // Filtrar alocacoes que ocorrem neste dia da semana
            const allocCount = allocations.filter(a => {
              const allocStart = parseLocalDate(a.startDate);
              const allocEnd = parseLocalDate(a.endDate);
              return allocStart <= date && allocEnd >= date;
            }).length;
            return (
              <div key={index} className="text-center flex-1">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  {dateFormat.format(date)}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {dayNames[index]} <span className="text-xs text-gray-500">({allocCount})</span>
                </p>
              </div>
            );
          })}
        </div>

        <button
          onClick={onNextWeek}
          className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <WeeklySchedule
          works={works}
          allocations={allocations}
          weekNumber={weekNumber}
          year={year}
          weekDays={weekDays}
          onEditAllocation={onEditAllocation}
          onDeleteAllocation={onDeleteAllocation}
        />
      </div>
    </div>
  );
}
