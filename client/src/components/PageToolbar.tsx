import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutGrid, List, ChevronDown } from 'lucide-react';

export interface FilterOption {
  label: string;
  options: string[];
  onSelect?: (option: string) => void;
}

interface PageToolbarProps {
  filters?: FilterOption[];
  layout?: 'grid' | 'list';
  onLayoutChange?: (layout: 'grid' | 'list') => void;
  showLayoutButtons?: boolean;
}

export const PageToolbar: React.FC<PageToolbarProps> = ({
  filters = [],
  layout = 'grid',
  onLayoutChange,
  showLayoutButtons = true,
}) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between pt-4 pb-4 bg-background">
        {/* Filtros - Visual leve e transparente */}
        <div className="flex items-center space-x-2">
          {filters.map((filter, index) => (
            <DropdownMenu key={index}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center bg-transparent border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  {filter.label} <ChevronDown size={14} className="ml-1.5 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filter.options.map((option, optIndex) => (
                  <DropdownMenuItem key={optIndex} onClick={() => filter.onSelect?.(option)}>
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        {/* Botões de Layout */}
        {showLayoutButtons && onLayoutChange && (
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onLayoutChange("list")} 
              className={`w-9 h-9 ${layout === "list" ? "bg-muted" : ""}`}
            >
              <List size={18} className="text-gray-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onLayoutChange("grid")} 
              className={`w-9 h-9 ${layout === "grid" ? "bg-muted" : ""}`}
            >
              <LayoutGrid size={18} className="text-gray-600" />
            </Button>
          </div>
        )}
      </div>

      {/* Linha fina separadora */}
      <div className="border-b border-gray-100 mb-6"></div>
    </div>
  );
};
