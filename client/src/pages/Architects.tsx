import { useState, useEffect } from 'react';
import { Plus, SquarePen, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { usePermission } from '@/_core/hooks/usePermission';
import AccessDenied from '../components/AccessDenied';

interface Architect {
  id: number;
  officeNameName: string;
  phone: string;
  email: string;
  commission: string;
}

const STATUSES = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
];

export default function Architects() {
  const { canAccessPage } = usePermission();
  
  const [architects, setArchitects] = useState<Architect[]>([]);
  const { data: architectsData } = trpc.architects.list.useQuery();
  const utils = trpc.useUtils();
  
  const createArchitectMutation = trpc.architects.create.useMutation({
    onSuccess: () => {
      utils.architects.list.invalidate();
      toast.success('Arquiteto criado com sucesso!');
    },
  });

  const updateArchitectMutation = trpc.architects.update.useMutation({
    onSuccess: () => {
      utils.architects.list.invalidate();
      toast.success('Arquiteto atualizado com sucesso!');
    },
  });

  const deleteArchitectMutation = trpc.architects.delete.useMutation({
    onSuccess: () => {
      utils.architects.list.invalidate();
      toast.success('Arquiteto removido com sucesso!');
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  const [formData, setFormData] = useState({
    officeNameName: '',
    phone: '',
    email: '',
    commission: 'no',
  });

  useEffect(() => {
    if (architectsData && Array.isArray(architectsData)) {
      setArchitects(architectsData);
    }
  }, [architectsData]);

  // Check permission - MUST be after all hooks
  if (!canAccessPage('arquitetos')) {
    return <AccessDenied />;
  }

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      officeNameName: '',
      phone: '',
      email: '',
      commission: 'no',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (architect: Architect) => {
    setEditingId(architect.id);
    setFormData({
      officeNameName: architect.officeNameName || '',
      phone: architect.phone || '',
      email: architect.email || '',
      commission: architect.commission || 'no',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.officeNameName.trim()) {
      toast.error('Nome do escritório é obrigatório');
      return;
    }

    try {
      if (editingId) {
        await updateArchitectMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
      } else {
        await createArchitectMutation.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar arquiteto');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteArchitectMutation.mutateAsync({ id: deleteConfirm.id });
        setDeleteConfirm(null);
      } catch (error) {
        toast.error('Erro ao deletar arquiteto');
      }
    }
  };

  const groupedArchitects = {
    active: (architects || []).filter((a: Architect) => a.commission === 'yes'),
    inactive: (architects || []).filter((a: Architect) => a.commission === 'no'),
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        {STATUSES.map((status) => (
          <div key={status.value}>
            <h2 className="font-semibold text-gray-900 mb-4">
              {status.label} ({groupedArchitects[status.value as keyof typeof groupedArchitects].length})
            </h2>

            <div className="space-y-3">
              {(groupedArchitects[status.value as keyof typeof groupedArchitects] || []).map((architect: Architect) => (
                <div key={architect.id}>
                  <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow relative group flex flex-col">
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(architect)}
                        title="Editar arquiteto"
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <SquarePen size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ id: architect.id, name: architect.officeNameName })}
                        title="Excluir arquiteto"
                        className="text-gray-400 hover:text-red-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex flex-col flex-1 pr-8">
                      <p className="font-semibold text-gray-900 text-sm break-words">
                        {architect.officeNameName}
                      </p>
                      <p className="text-gray-600 text-xs mt-1 break-words">
                        {architect.email}
                      </p>
                      <p className="text-gray-500 text-xs mt-1 break-words">
                        {architect.phone}
                      </p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 bg-gray-900 hover:bg-gray-800 text-white rounded-full p-4 shadow-lg"
        title="Adicionar novo arquiteto"
      >
        <Plus size={24} />
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Arquiteto' : 'Novo Arquiteto'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="officeNameName" className="text-sm font-medium mb-2 block">Nome do escritório *</Label>
              <Input
                id="officeNameName"
                placeholder="Digite o nome do escritório"
                value={formData.officeNameName}
                onChange={(e) => setFormData({ ...formData, officeNameName: e.target.value })}
                className="w-full bg-white border border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium mb-2 block">Telefone</Label>
              <Input
                id="phone"
                placeholder="(XX) XXXXX-XXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white border border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="commission" className="text-sm font-medium mb-2 block">Comissão</Label>
              <select
                id="commission"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
              >
                <option value="no">Não</option>
                <option value="yes">Sim</option>
              </select>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white">
              {editingId ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir arquiteto?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">
            Tem certeza que deseja excluir <strong>{deleteConfirm?.name}</strong>? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
