import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { SquarePen, Trash2, Bell } from 'lucide-react';
import { usePermission } from '@/_core/hooks/usePermission';
import AccessDenied from '@/components/AccessDenied';
import { EmptyColumnCard } from '@/components/EmptyColumnCard';
import { PageToolbar, FilterOption } from '../components/PageToolbar';
import { ResponsibleBadge } from '../components/ResponsibleBadge';

const WORK_STATUSES = [
  { value: 'Aguardando', label: 'Aguardando' },
  { value: 'Em andamento', label: 'Em andamento' },
  { value: 'Interrompido', label: 'Interrompido' },
  { value: 'Finalizado', label: 'Finalizado' },
  { value: 'back_to_client', label: 'Voltar para Cliente' },
];

const ORIGINS = [
  { value: 'Arquiteto', label: 'Arquiteto' },
  { value: 'Google', label: 'Google' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Indicação', label: 'Indicação' },
];

// Tipo Work
type Work = {
  id: number;
  name: string;
  workName: string;
  clientName: string;
  clientId?: number;
  status: string;
  workValue: string;
  startDate: string;
  endDate: string;
  responsible: string;
  commission: string;
  clientCommission?: string;
  clientPhone?: string;
  clientBirthDate?: string;
  clientAddress?: string;
  clientOrigin?: string;
  clientContact?: string;
  reminder?: boolean;
};

// Formatadores
const formatCurrency = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  const number = parseInt(cleaned || '0', 10);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number / 100);
};

export default function Works() {
  const { canAccessPage, filterWorks, canEdit, canDelete } = usePermission();
  
  const [works, setWorks] = useState<Work[]>([]);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const { data: worksData } = trpc.works.list.useQuery();
  const { data: architectsData } = trpc.architects.list.useQuery();
  const utils = trpc.useUtils();
  
  const createWorkMutation = trpc.works.create.useMutation({
    onSuccess: () => utils.works.list.invalidate(),
  });
  const updateWorkMutation = trpc.works.update.useMutation({
    onSuccess: () => {
      utils.works.list.invalidate();
    },
    onError: () => {
      toast.error('Erro ao atualizar obra');
    },
  });
  const deleteWorkMutation = trpc.works.delete.useMutation({
    onSuccess: () => utils.works.list.invalidate(),
  });
  
  const updateClientMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      utils.works.list.invalidate();
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'client' | 'work'; id: number; name: string } | null>(null);

  const [formData, setFormData] = useState({
    clientName: '',
    status: 'Aguardando',
    workName: '',
    workValue: '',
    startDate: '',
    endDate: '',
    clientPhone: '',
    clientBirthDate: '',
    clientAddress: '',
    clientOrigin: '',
    clientContact: '',
    responsible: '',
    commission: '',
    clientCommission: '',
  });

  // Sync data from tRPC
  useEffect(() => {
    if (worksData && Array.isArray(worksData)) {
      const filteredWorks = filterWorks(worksData);
      const adaptedWorks = filteredWorks.map((w: any, index: number) => ({
        ...w,
        id: w.id || `temp-${index}-${Date.now()}`,
        clientCommission: w.clientCommission || '',
        reminder: w.reminder || false,
      }));
      setWorks(adaptedWorks as Work[]);
    }
  }, [worksData, filterWorks]);

  // Listen for custom event from header button
  useEffect(() => {
    const handleOpenAddModal = () => {
      openAddModal();
    };
    window.addEventListener('openAddWorkModal', handleOpenAddModal);
    return () => {
      window.removeEventListener('openAddWorkModal', handleOpenAddModal);
    };
  }, []);

  const openAddModal = () => {
    setEditingWork(null);
    setFormData({
      clientName: '',
      status: 'Aguardando',
      workName: '',
      workValue: '',
      startDate: '',
      endDate: '',
      clientPhone: '',
      clientBirthDate: '',
      clientAddress: '',
      clientOrigin: '',
      clientContact: '',
      responsible: '',
      commission: '',
      clientCommission: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (work: Work) => {
    setEditingWork(work);
    
    const commission = work.commission || '';
    const clientCommission = work.clientCommission || '';
    
    setFormData({
      clientName: work.clientName || '',
      status: work.status || 'Aguardando',
      workName: work.workName || '',
      workValue: work.workValue || '',
      startDate: work.startDate || '',
      endDate: work.endDate || '',
      clientPhone: work.clientPhone || '',
      clientBirthDate: work.clientBirthDate || '',
      clientAddress: work.clientAddress || '',
      clientOrigin: work.clientOrigin || '',
      clientContact: work.clientContact || '',
      responsible: work.responsible || '',
      commission: commission,
      clientCommission: clientCommission,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.clientName.trim()) {
      toast.error('Nome completo é obrigatório');
      return;
    }
    if (!formData.status) {
      toast.error('Status é obrigatório');
      return;
    }

    if (formData.status === 'back_to_client') {
      if (!formData.clientName.trim()) {
        toast.error('Nome do cliente é obrigatório');
        return;
      }
      if (!formData.clientOrigin.trim()) {
        toast.error('Origem é obrigatória');
        return;
      }
      if (!formData.responsible.trim()) {
        toast.error('Responsável é obrigatório');
        return;
      }
    } else {
      if (!formData.workName.trim()) {
        toast.error('Nome da obra é obrigatório');
        return;
      }
      if (!formData.workValue.trim()) {
        toast.error('Valor total da obra é obrigatório');
        return;
      }
      if (!formData.startDate.trim()) {
        toast.error('Data de início é obrigatória');
        return;
      }
      if (!formData.endDate.trim()) {
        toast.error('Data de término é obrigatória');
        return;
      }
      if (!formData.clientOrigin.trim()) {
        toast.error('Origem é obrigatória');
        return;
      }
      if (!formData.responsible.trim()) {
        toast.error('Responsável é obrigatório');
        return;
      }
    }

    if (formData.status === 'back_to_client') {
      if (editingWork) {
        const clientData = {
          id: editingWork.clientId || editingWork.id,
          fullName: formData.clientName,
          phone: formData.clientPhone || '',
          birthDate: formData.clientBirthDate || '',
          address: formData.clientAddress || '',
          origin: formData.clientOrigin || '',
          contact: formData.clientContact || '',
          responsible: formData.responsible || '',
          status: 'prospect',
          commission: formData.commission || '',
          reminder: 0,
        };
        
        updateClientMutation.mutate(clientData);
        setWorks(works.filter((w: Work) => w.id !== editingWork.id));
        toast.success('Obra revertida para cliente com sucesso!');
      }
      setIsModalOpen(false);
      return;
    }

    if (editingWork) {
      if (editingWork.clientId) {
        const clientData = {
          id: editingWork.clientId,
          fullName: formData.clientName,
          phone: formData.clientPhone || '',
          birthDate: formData.clientBirthDate || '',
          address: formData.clientAddress || '',
          origin: formData.clientOrigin || '',
          contact: formData.clientContact || '',
          responsible: formData.responsible || '',
          status: 'work',
          commission: formData.commission || '',
          workName: formData.workName,
          workValue: formData.workValue,
          startDate: formData.startDate,
          endDate: formData.endDate,
        };
        updateClientMutation.mutate(clientData);
      } else {
        const updatedWork = { 
          ...editingWork, 
          clientName: formData.clientName,
          status: formData.status,
          workName: formData.workName,
          workValue: formData.workValue,
          startDate: formData.startDate,
          endDate: formData.endDate,
          clientPhone: formData.clientPhone,
          clientBirthDate: formData.clientBirthDate,
          clientAddress: formData.clientAddress,
          clientOrigin: formData.clientOrigin,
          clientContact: formData.clientContact,
          responsible: formData.responsible,
          commission: formData.clientCommission,
        };
        updateWorkMutation.mutate(updatedWork);
      }
      toast.success('Obra atualizada com sucesso!');
    } else {
      const newId = works.length > 0 ? Math.max(...works.map((w: any) => w.id)) + 1 : 1;
      const newWork = {
        id: newId,
        name: `Obra ${newId}`,
        clientName: formData.clientName,
        status: formData.status,
        workName: formData.workName,
        workValue: formData.workValue,
        startDate: formData.startDate,
        endDate: formData.endDate,
        clientPhone: formData.clientPhone,
        clientBirthDate: formData.clientBirthDate,
        clientAddress: formData.clientAddress,
        clientOrigin: formData.clientOrigin,
        clientContact: formData.clientContact,
        responsible: formData.responsible,
        commission: formData.clientCommission,
      };
      createWorkMutation.mutate(newWork);
      toast.success('Obra criada com sucesso!');
    }

    setIsModalOpen(false);
  };

  const groupedWorks = {
    waiting: works.filter((w: Work) => w.status === 'Aguardando'),
    in_progress: works.filter((w: Work) => w.status === 'Em andamento'),
    interrupted: works.filter((w: Work) => w.status === 'Interrompido'),
    completed: works.filter((w: Work) => w.status === 'Finalizado'),
  };

  if (!canAccessPage('obras')) {
    return <AccessDenied />;
  }

  const filters: FilterOption[] = [
    { label: 'Status', options: WORK_STATUSES.map(s => s.label) },
    { label: 'Origem', options: ORIGINS.map(o => o.label) },
    { label: 'Responsável', options: ['Renato Araújo', 'Rodrigo Silva'] },
  ];

  return (
    <>
      <PageToolbar 
        filters={filters} 
        layout={layout} 
        onLayoutChange={setLayout} 
      />

      <div className="grid grid-cols-4 gap-6">
        {Object.entries(groupedWorks).map(([status, statusWorks]) => (
          <div key={status}>
            <h2 className="font-semibold text-gray-900 mb-4">
              {status === 'waiting' && `Aguardando (${statusWorks.length})`}
              {status === 'in_progress' && `Em andamento (${statusWorks.length})`}
              {status === 'interrupted' && `Interrompido (${statusWorks.length})`}
              {status === 'completed' && `Finalizado (${statusWorks.length})`}
            </h2>

            <div className="space-y-3">
              {statusWorks.length === 0 ? (
                <EmptyColumnCard message="Nenhuma obra" />
              ) : (
                statusWorks.map((work: Work) => (
                  <div key={work.id}>
                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow relative group flex flex-col">
                    {canEdit() && canDelete() && (
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(work)}
                          title="Editar obra"
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <SquarePen size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'work', id: work.id, name: work.workName })}
                          title="Excluir obra"
                          className="text-gray-400 hover:text-red-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col flex-1 pr-8">
                      <p className="font-semibold text-gray-900 text-sm break-words">
                        {work.workName}
                      </p>
                      <p className="text-gray-600 text-xs mt-1.5 break-words">
                        {work.clientContact || work.clientName}
                      </p>
                      <div className="mt-1.5">
                        <ResponsibleBadge name={work.responsible} />
                      </div>
                    </div>

                    {work.reminder && (
                      <div className="absolute bottom-3 right-3">
                        <Bell size={14} className="text-red-500 flex-shrink-0" />
                      </div>
                    )}
                    </Card>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingWork ? 'Editar obra' : 'Nova obra'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName" className="text-sm font-medium mb-2 block">Nome do cliente *</Label>
                <Input
                  id="clientName"
                  placeholder="Digite o nome do cliente"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-white border border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-sm font-medium mb-2 block">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status" className="w-full bg-white border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workName" className="text-sm font-medium mb-2 block">Nome da obra *</Label>
                <Input
                  id="workName"
                  placeholder="Digite o nome da obra"
                  value={formData.workName}
                  onChange={(e) => setFormData({ ...formData, workName: e.target.value })}
                  className="w-full bg-white border border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="workValue" className="text-sm font-medium mb-2 block">Valor total da obra *</Label>
                <Input
                  id="workValue"
                  placeholder="R$ 0,00"
                  value={formData.workValue}
                  onChange={(e) => setFormData({ ...formData, workValue: formatCurrency(e.target.value) })}
                  className="w-full bg-white border border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium mb-2 block">Data de início *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-white border border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm font-medium mb-2 block">Data de término *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-white border border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientOrigin" className="text-sm font-medium mb-2 block">Origem *</Label>
                <Select value={formData.clientOrigin} onValueChange={(value) => setFormData({ ...formData, clientOrigin: value })}>
                  <SelectTrigger id="clientOrigin" className="w-full bg-white border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORIGINS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="responsible" className="text-sm font-medium mb-2 block">Responsável *</Label>
                <Select value={formData.responsible} onValueChange={(value) => setFormData({ ...formData, responsible: value })}>
                  <SelectTrigger id="responsible" className="w-full bg-white border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Renato Araújo">Renato Araújo</SelectItem>
                    <SelectItem value="Rodrigo Silva">Rodrigo Silva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white">
              {editingWork ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Excluir obra?
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">
            Tem certeza que deseja excluir <strong>{deleteConfirm?.name}</strong>? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (deleteConfirm) {
                  deleteWorkMutation.mutate({ id: deleteConfirm.id });
                  toast.success('Obra excluída com sucesso!');
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
