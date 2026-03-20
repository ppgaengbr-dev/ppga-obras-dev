import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';

interface Allocation {
  id: string;
  workId: string;
  providerId: string;
  providerName: string;
  service: string;
  startDate: string;
  endDate: string;
}

interface AllocationModalProps {
  allocation: Allocation;
  onClose: () => void;
}

export default function AllocationModal({
  allocation,
  onClose,
}: AllocationModalProps) {
  const [formData, setFormData] = useState(allocation);
  const utils = trpc.useUtils();
  const deleteMutation = trpc.allocations.delete.useMutation();

  const handleSave = async () => {
    try {
      // TODO: Implement save via tRPC
      // For now, just close the modal
      await utils.allocations.list.invalidate();
      await utils.allocations.list.refetch();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar alocação:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja deletar esta alocação?')) {
      try {
        await deleteMutation.mutateAsync(parseInt(allocation.id));
        await utils.allocations.list.invalidate();
        await utils.allocations.list.refetch();
        onClose();
      } catch (error) {
        console.error('Erro ao deletar alocação:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Editar Alocação</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <Label htmlFor="providerName" className="text-sm font-medium mb-2 block">
              Nome do Prestador
            </Label>
            <Input
              id="providerName"
              value={formData.providerName}
              onChange={(e) =>
                setFormData({ ...formData, providerName: e.target.value })
              }
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="service" className="text-sm font-medium mb-2 block">
              Serviço
            </Label>
            <Input
              id="service"
              value={formData.service}
              onChange={(e) =>
                setFormData({ ...formData, service: e.target.value })
              }
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startDay" className="text-sm font-medium mb-2 block">
                Dia Início
              </Label>
              <Input
                id="startDay"
                type="number"
                min="1"
                max="5"
                value={formData.startDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startDay: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="endDay" className="text-sm font-medium mb-2 block">
                Dia Fim
              </Label>
              <Input
                id="endDay"
                type="number"
                min="1"
                max="5"
                value={formData.endDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endDay: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
