"use client";

import { useState, useEffect, useMemo } from 'react';
import AddAllocationModal from '@/components/allocations/AddAllocationModal';
import EditAllocationModal from '@/components/allocations/EditAllocationModal';
import ConfirmDeleteModal from '@/components/allocations/ConfirmDeleteModal';
import AllocationBar from '@/components/allocations/AllocationBar';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
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

interface Provider {
  id: string;
  fullName: string;
  category: string;
  observation: string;
  remuneration: string;
  baseValue: string;
}

interface Allocation {
  id: string;
  workId: string;
  providerId: string;
  providerName: string;
  service: string;
  startDate: string;
  endDate: string;
  category?: string;
  observation?: string;
  remuneration?: string;
  baseValue?: string;
}

// Mapeamento de origem para exibição correta
const originMap: Record<string, string> = {
  'architect': 'Arquiteto',
  'google': 'Google',
  'instagram': 'Instagram',
  'facebook': 'Facebook',
  'indication': 'Indicação',
};

const contactMap: Record<string, string> = {
  'office': 'Escritório',
  'traffic': 'Tráfego',
  'whatsapp': 'WhatsApp',
  'phone': 'Telefone',
};

// Função auxiliar para calcular o início da semana (segunda-feira)
const getWeekStart = (date: Date): Date => {
  // Converter para string YYYY-MM-DD para garantir que é uma data local
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  // Usar parseLocalDate para garantir que é uma data local
  const d = new Date(year, parseInt(month) - 1, parseInt(day));
  const dayOfWeek = d.getDay();
  const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  
  // Retornar como data local
  return new Date(year, parseInt(month) - 1, diff);
};

export default function Allocations() {
  // Estados de datas
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => getWeekStart(new Date()));

  // Estados de controle do CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);

  // Sincronizar weekStartDate quando currentDate mudar
  useEffect(() => {
    setWeekStartDate(getWeekStart(currentDate));
  }, [currentDate]);

  // Queries
  const { data: works = [] } = trpc.works.list.useQuery();
  const { data: providers = [] } = trpc.prestadores.list.useQuery();
  const { data: allocations = [] } = trpc.allocations.list.useQuery();

  // Mutations
  const createAllocationMutation = trpc.allocations.create.useMutation();
  const updateAllocationMutation = trpc.allocations.update.useMutation();
  const deleteAllocationMutation = trpc.allocations.delete.useMutation();
  const utils = trpc.useUtils();

  // Calcular os dias da semana a partir de weekStartDate
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const year = weekStartDate.getFullYear();
      const month = weekStartDate.getMonth();
      const day = weekStartDate.getDate() + i;
      const date = new Date(year, month, day);
      days.push(date);
    }
    return days;
  }, [weekStartDate]);

  // Função auxiliar para converter string de data para Date local (sem timezone)
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Allocations desta semana
  const allocationsThisWeek = useMemo(() => {
    return allocations.filter(a => {
      const allocStart = parseLocalDate(a.startDate);
      const allocEnd = parseLocalDate(a.endDate);
      return allocStart <= weekDays[4] && allocEnd >= weekDays[0];
    });
  }, [allocations, weekDays]);

  // Obras com alocações nesta semana
  const worksWithAllocations = useMemo(() => {
    return works
      .filter(work => allocationsThisWeek.some(a => a.workId === work.id))
      .map(work => ({
        ...work,
        allocations: allocationsThisWeek.filter(a => a.workId === work.id),
      }));
  }, [works, allocationsThisWeek]);

  // Formatadores
  const dateFormat = new Intl.DateTimeFormat('pt-BR', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const monthYear = `${monthNames[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;

  // Funções de navegação de mês
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Funções de navegação de semana
  const handlePreviousWeek = () => {
    setCurrentDate(prev => {
      const date = new Date(prev);
      date.setDate(date.getDate() - 7);
      return date;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => {
      const date = new Date(prev);
      date.setDate(date.getDate() + 7);
      return date;
    });
  };

  // Handlers para abrir modais
  const handleOpenAddModal = () => {
    setModalType('add');
    setSelectedAllocation(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (allocation: Allocation) => {
    setModalType('edit');
    setSelectedAllocation(allocation);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (allocation: Allocation) => {
    setModalType('delete');
    setSelectedAllocation(allocation);
    setIsModalOpen(true);
  };

  // Handler para fechar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAllocation(null);
    setModalType('add');
  };

  // Handler para salvar alocação (Adicionar ou Editar)
  const handleSaveAllocation = async (data: any) => {
    try {
      if (modalType === 'add') {
        await createAllocationMutation.mutateAsync(data);
        toast.success('Alocação criada com sucesso!');
      } else if (modalType === 'edit' && selectedAllocation) {
        await updateAllocationMutation.mutateAsync({
          id: selectedAllocation.id,
          ...data,
        });
        toast.success('Alocação atualizada com sucesso!');
      }
      await utils.allocations.list.invalidate();
      handleCloseModal();
    } catch (error) {
      toast.error('Erro ao salvar alocação');
    }
  };

  // Handler para excluir alocação
  const handleConfirmDelete = async () => {
    if (!selectedAllocation) return;
    try {
      await deleteAllocationMutation.mutateAsync({ id: selectedAllocation.id });
      toast.success('Alocação removida com sucesso!');
      await utils.allocations.list.invalidate();
      handleCloseModal();
    } catch (error) {
      toast.error('Erro ao remover alocação');
    }
  };

  // Escutar evento do header button
  useEffect(() => {
    const handleOpenEvent = () => handleOpenAddModal();
    window.addEventListener('openAddAllocationModal', handleOpenEvent);
    return () => window.removeEventListener('openAddAllocationModal', handleOpenEvent);
  }, []);

  // Helper para exibir origem
  const getDisplayOrigin = (origin?: string) => {
    if (!origin) return 'N/A';
    return originMap[origin] || origin;
  };

  // Helper para exibir contato
  const getDisplayContact = (contact?: string) => {
    if (!contact) return 'N/A';
    return contactMap[contact] || contact;
  };

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Cabeçalho com Seletores de Mês e Semana */}
          <div className="flex w-full items-center mb-8 gap-8">
            {/* Seção Esquerda: Seletor de Mês */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
                {monthYear}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Seção Direita: Seletor de Semana */}
            <div className="flex-1 flex items-center gap-4">
              <button
                onClick={handlePreviousWeek}
                className="p-2 hover:bg-gray-100 rounded flex-shrink-0"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>

              <div className="flex-1 grid grid-cols-5 gap-4">
                {weekDays.map((date, index) => {
                  const allocCount = allocationsThisWeek.filter(a => {
                    const allocStart = parseLocalDate(a.startDate);
                    const allocEnd = parseLocalDate(a.endDate);
                    return allocStart <= date && allocEnd >= date;
                  }).length;
                  return (
                    <div key={index} className="text-center">
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
                onClick={handleNextWeek}
                className="p-2 hover:bg-gray-100 rounded flex-shrink-0"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Grade de Obras e Alocações */}
          <div className="space-y-4">
            {worksWithAllocations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">
                  Nenhuma obra com alocações nesta semana
                </p>
              </div>
            ) : (
              worksWithAllocations.map(work => (
                <div
                  key={work.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Linha da Obra - Flex container com duas seções */}
                  <div className="flex min-h-[120px]">
                    {/* Seção Esquerda: Detalhes da Obra */}
                    <div className="w-80 flex-shrink-0 border-r border-gray-200 p-4 flex flex-col justify-center bg-gray-50">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {work.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-2 leading-tight">
                        Origem: {getDisplayOrigin(work.clientOrigin)}
                      </p>
                      <p className="text-xs text-gray-600 leading-tight">
                        Contato: {getDisplayContact(work.clientContact)}
                      </p>
                      <p className="text-xs text-gray-600 leading-tight">
                        Responsável: {work.responsibleName}
                      </p>
                    </div>

                    {/* Seção Direita: Grade de Alocações da Obra */}
                    <div className="flex-1 p-4">
                      {work.allocations.length === 0 ? (
                        <p className="text-xs text-gray-500 py-4">
                          Sem alocações nesta semana
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {work.allocations.map(allocation => (
                            <div key={allocation.id} className="grid grid-cols-5 gap-4">
                              <AllocationBar
                                allocation={allocation}
                                weekDays={weekDays}
                                onClick={() => handleOpenEditModal(allocation)}
                                onDelete={(alloc) => handleOpenDeleteModal(alloc)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal Unificado */}
      {isModalOpen && modalType === 'add' && (
        <AddAllocationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          works={works}
          providers={providers}
          onAddAllocation={handleSaveAllocation}
        />
      )}

      {isModalOpen && modalType === 'edit' && selectedAllocation && (
        <EditAllocationModal
          open={isModalOpen}
          onOpenChange={handleCloseModal}
          allocation={selectedAllocation}
          works={works}
          providers={providers}
          onSuccess={handleSaveAllocation}
        />
      )}

      {isModalOpen && modalType === 'delete' && selectedAllocation && (
        <ConfirmDeleteModal
          open={isModalOpen}
          onOpenChange={handleCloseModal}
          title="Remover alocação"
          message={`Tem certeza que deseja remover a alocação de ${selectedAllocation.providerName}?`}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}
