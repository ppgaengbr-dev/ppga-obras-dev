import { useState, useEffect } from 'react';
import { SquarePen, Trash2 } from 'lucide-react';
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
import { PageToolbar, FilterOption } from '../components/PageToolbar';
import { ResponsibleBadge } from '../components/ResponsibleBadge';

interface Architect {
  id: number;
  officeNameName: string;
  status: string;
  address: string;
  architectName: string;
  phone: string;
  birthDate: string;
  commission: string;
  observation: string;
}

const STATUSES = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'recovery', label: 'Recuperação' },
];

export default function Architects() {
  const { canAccessPage } = usePermission();
  
  const [architects, setArchitects] = useState<Architect[]>([]);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
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
    status: 'active',
    address: '',
    architectName: '',
    phone: '',
    birthDate: '',
    commission: 'no',
    observation: '',
  });

  useEffect(() => {
    if (architectsData && Array.isArray(architectsData)) {
      setArchitects(architectsData);
    }
  }, [architectsData]);

  useEffect(() => {
    const handleOpenModal = () => {
      openCreateModal();
    };

    window.addEventListener('openAddArchitectModal', handleOpenModal);
    return () => {
      window.removeEventListener('openAddArchitectModal', handleOpenModal);
    };
  }, []);

  if (!canAccessPage('arquitetos')) {
    return <AccessDenied />;
  }

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      officeNameName: '',
      status: 'active',
      address: '',
      architectName: '',
      phone: '',
      birthDate: '',
      commission: 'no',
      observation: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (architect: Architect) => {
    setEditingId(architect.id);
    setFormData({
      officeNameName: architect.officeNameName || '',
      status: architect.status || 'active',
      address: architect.address || '',
      architectName: architect.architectName || '',
      phone: architect.phone || '',
      birthDate: architect.birthDate || '',
      commission: architect.commission || 'no',
      observation: architect.observation || '',
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

  const groupedArchitects = {
    active: (architects || []).filter((a: Architect) => a.status === 'active' || (!a.status && a.commission === 'yes')),
    inactive: (architects || []).filter((a: Architect) => a.status === 'inactive' || (!a.status && a.commission === 'no')),
    'follow-up': (architects || []).filter((a: Architect) => a.status === 'follow-up'),
    recovery: (architects || []).filter((a: Architect) => a.status === 'recovery'),
  };

  const filters: FilterOption[] = [
    { label: 'Status', options: STATUSES.map(s => s.label) },
    { label: 'Comissão', options: ['Sim', 'Não'] },
  ];

  return (
    <>
      <PageToolbar 
        filters={filters} 
        layout={layout} 
        onLayoutChange={setLayout} 
      />

      <div className="grid grid-cols-4 gap-6">
        {STATUSES.map((status) => {
          const columnArchitects = groupedArchitects[status.value as keyof typeof groupedArchitects];
          
          return (
            <div key={status.value} className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {status.label} ({columnArchitects.length})
                </h3>
              </div>

              <div className="space-y-3">
                {columnArchitects.length === 0 ? (
                  <Card className="p-4 flex items-center justify-center text-gray-400 text-sm h-24 border-dashed">
                    Nenhum arquiteto
                  </Card>
                ) : (
                  columnArchitects.map((architect: Architect) => (
                    <Card 
                      key={architect.id} 
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer group relative flex flex-col"
                      onClick={() => openEditModal(architect)}
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(architect);
                          }}
                          title="Editar arquiteto"
                          className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <SquarePen size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({ id: architect.id, name: architect.officeNameName });
                          }}
                          title="Excluir arquiteto"
                          className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex flex-col flex-1 pr-8">
                        <p className="font-semibold text-gray-900 text-sm break-words">
                          {architect.officeNameName}
                        </p>
                        <p className="text-gray-600 text-xs mt-1.5 break-words">
                          {architect.architectName}
                        </p>
                        <div className="mt-1.5">
                          <ResponsibleBadge name={architect.phone} />
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Arquiteto' : 'Adicionar Arquiteto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="status" className="text-sm font-medium mb-2 block">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm h-10"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="recovery">Recuperação</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white">Salvar</Button>
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
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button 
              onClick={async () => {
                if (deleteConfirm) {
                  await deleteArchitectMutation.mutateAsync({ id: deleteConfirm.id });
                  setDeleteConfirm(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
