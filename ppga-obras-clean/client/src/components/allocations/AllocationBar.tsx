import { Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Allocation {
  id: string;
  workId: string;
  providerId: string;
  providerName: string;
  service: string;
  startDate: string;
  endDate: string;
}

interface AllocationBarProps {
  allocation: Allocation;
  weekDays: Date[];
  onClick: () => void;
  onDelete?: (allocation: Allocation) => void;
}

export default function AllocationBar({
  allocation,
  weekDays,
  onClick,
  onDelete,
}: AllocationBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
  const allocationStart = parseLocalDate(allocation.startDate);
  const allocationEnd = parseLocalDate(allocation.endDate);
  const weekStart = weekDays[0];
  
  const startDayIndex = Math.floor((allocationStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
  const endDayIndex = Math.floor((allocationEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
  
  const displayStartDay = Math.max(0, Math.min(4, startDayIndex));
  const displayEndDay = Math.max(0, Math.min(4, endDayIndex));
  
  const colStart = displayStartDay + 1;
  const colEnd = displayEndDay + 2;
  
  const displayText = allocation.service 
    ? `${allocation.providerName} - ${allocation.service}`
    : allocation.providerName;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(allocation);
    }
  };

  useEffect(() => {
    if (!containerRef.current || !buttonRef.current) return;

    const container = containerRef.current;
    const button = buttonRef.current;

    const handleMouseEnter = () => {
      button.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      button.style.opacity = '0';
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-6 cursor-pointer"
      style={{
        gridColumn: `${colStart} / ${colEnd}`,
      }}
      onClick={onClick}
    >
      <div className="h-full bg-gray-600 rounded-md flex items-center px-2 hover:bg-gray-700 transition-colors shadow-sm relative">
        <span 
          className="text-xs text-white font-normal truncate flex-1"
          title={displayText}
        >
          {displayText}
        </span>
        {onDelete && (
          <button
            ref={buttonRef}
            onClick={handleDelete}
            className="ml-1 p-0.5 text-gray-400 hover:text-red-400 flex-shrink-0 transition-opacity"
            style={{ opacity: 0 }}
            title="Excluir alocacao"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
