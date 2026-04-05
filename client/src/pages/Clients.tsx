import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { SquarePen, Trash2, Bell } from 'lucide-react';
import { formatPhone } from '@/lib/formatters';
import { usePermission } from '../_core/hooks/usePermission';
import AccessDenied from '../components/AccessDenied';
import { EmptyColumnCard } from '../components/EmptyColumnCard';

const STATUSES = [
  { value: 'prospect', label: 'Prospecção' },
  { value: 'budget', label: 'Orçamento' },
  { value: 'remarketing', label: 'Remarketing' },
  { value: 'lost', label: 'Perdido' },
  { value: 'work', label: 'Obra' },
];

const CREATION_STATUSES = STATUSES.filter(s => s.value !== 'work');

const RESPONSIBLE = [
  { value: 'Renato Araújo', label: 'Renato Araújo' },
  { value: 'Rodrigo Silva', label: 'Rodrigo Silva' },
];

const ORIGINS = [
  { value: 'architect', label: 'Arquiteto' },
  { value: 'google', label: 'Google' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'indication', label: 'Indicação' },
];

const formatCurrency = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  const number = parseInt(cleaned || '0', 10);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number / 100);
};

export default function Clients() {
  const { canAccessPage } = usePermission();
  
  const [clients, setClients] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const { data: clientsData } = trpc.clients.list.useQuery();
  const { data: worksData } = trpc.works.list.useQuery();
  const { data: architectsData } = trpc.architects.list.useQuery();
  const utils = trpc.useUtils();
  
  const createClientMutation = trpc.clients.create.useMutation({
    onSuccess: (data: any) => {
      utils.clients.list.invalidate();
      if (data.status === 'work') {
        setIsModalOpen(false);
        setTimeout(() => {
          setCelebrationName(data.fullName);
          setShowCelebration(true);
        }, 300);
      } else {
        toast.success('Cliente criado com sucesso!');
        setIsModalOpen(false);
      }
    },
    onError: (error: any) => {
      toast.error('Erro ao criar cliente: ' + error.message);
    },
  });

  const updateClientMutation = trpc.clients.update.useMutation({
    onSuccess: (data: any) => {
      utils.clients.list.invalidate();
      if (data.status === 'work' && editingClient && editingClient.status !== 'work') {
        setIsModalOpen(false);
        setTimeout(() => {
          setCelebrationName(data.fullName);
          setShowCelebration(true);
        }, 300);
      } else {
        toast.success('Cliente atualizado com sucesso!');
        setIsModalOpen(false);
      }
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar cliente: ' + error.message);
    },
  });

  const deleteClientMutation = trpc.clients.delete.useMutation({
    onSuccess: () => utils.clients.list.invalidate(),
  });

  const deleteWorkMutation = trpc.works.delete.useMutation({
    onSuccess: () => utils.works.list.invalidate(),
  });

  useEffect(() => {
    if (clientsData) setClients(clientsData as any[]);
  }, [clientsData]);

  useEffect(() => {
    if (worksData) setWorks(worksData as any[]);
  }, [worksData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationName, setCelebrationName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'client' | 'work'; id: number; name: string } | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    status: 'prospect',
    phone: '',
    birthDate: '',
    address: '',
    origin: '',
    contact: '',
    responsible: '',
    commission: '',
    workName: '',
    workValue: '',
    startDate: '',
    endDate: '',
    reminder: false,
  });

  useEffect(() => {
    const handleOpenAddModal = () => {
      openAddModal();
    };
    window.addEventListener('openAddClientModal', handleOpenAddModal);
    return () => {
      window.removeEventListener('openAddClientModal', handleOpenAddModal);
    };
  }, []);

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({
      fullName: '',
      status: 'prospect',
      phone: '',
      birthDate: '',
      address: '',
      origin: '',
      contact: '',
      responsible: '',
      commission: '',
      workName: '',
      workValue: '',
      startDate: '',
      endDate: '',
      reminder: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: any) => {
    setEditingClient(client);
    setFormData({
      fullName: client.fullName,
      status: client.status,
      phone: client.phone,
      birthDate: client.birthDate,
      address: client.address,
      origin: client.origin,
      contact: client.contact,
      responsible: client.responsible,
      commission: client.commission || '',
      workName: client.workName,
      workValue: client.workValue,
      startDate: client.startDate,
      endDate: client.endDate,
      reminder: !!client.reminder,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.fullName.trim()) {
      toast.error('Nome completo é obrigatório');
      return;
    }
    if (!formData.status) {
      toast.error('Status é obrigatório');
      return;
    }
    if (!formData.responsible) {
      toast.error('Responsável é obrigatório');
      return;
    }
    if (!formData.origin) {
      toast.error('Origem é obrigatória');
      return;
    }
    if (!formData.contact) {
      toast.error('Contato é obrigatório');
      return;
    }

    if (formData.status === 'work') {
      if (!formData.workName.trim()) {
        toast.error('Nome da obra é obrigatório');
        return;
      }
      if (!formData.workValue.trim()) {
        toast.error('Valor da obra é obrigatório');
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
    }

    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, ...formData });
    } else {
      createClientMutation.mutate({ ...formData });
    }
  };

  const groupedClients = {
    prospect: clients.filter((c: any) => c.status === 'prospect'),
    budget: clients.filter((c: any) => c.status === 'budget'),
    remarketing: clients.filter((c: any) => c.status === 'remarketing'),
    lost: clients.filter((c: any) => c.status === 'lost'),
  };

  if (!canAccessPage('clientes')) {
    return <AccessDenied />;
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        {Object.entries(groupedClients).map(([status, statusClients]) => (
          <div key={status}>
            <h2 className="font-semibold text-gray-900 mb-4">
              {status === 'prospect' && `Prospecção (${statusClients.length})`}
              {status === 'budget' && `Orçamento (${statusClients.length})`}
              {status === 'remarketing' && `Remarketing (${statusClients.length})`}
              {status === 'lost' && `Perdido (${statusClients.length})`}
            </h2>

            <div className="space-y-3">
              {statusClients.length === 0 ? (
                <EmptyColumnCard message="Nenhum cliente" />
              ) : (
                statusClients.map((client: any) => (
                  <div key={client.id}>
                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow relative group flex flex-col">
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(client)}
                          title="Editar cliente"
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <SquarePen size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'client', id: client.id, name: client.fullName })}
                          title="Excluir cliente"
                          className="text-gray-400 hover:text-red-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex flex-col flex-1 pr-8">
                        <p className="font-semibold text-gray-900 text-sm break-words">
                          {client.fullName}
                        </p>
                        <p className="text-gray-600 text-xs mt-1 break-words">
                          {client.contact}
                        </p>
                        <p className="text-gray-500 text-xs mt-1 break-words">
                          {client.responsible}
                        </p>
                      </div>

                      {!!client.reminder && (
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
              {editingClient ? 'Editar cliente' : 'Novo cliente'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium mb-2 block">Nome completo *</Label>
                <Input
                  id="fullName"
                  placeholder="Digite o nome completo"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                    {(editingClient ? STATUSES : CREATION_STATUSES).map((s) => (
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
                <Label htmlFor="phone" className="text-sm font-medium mb-2 block">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  className="w-full bg-white border border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="birthDate" className="text-sm font-medium mb-2 block">Data de nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full bg-white border border-gray-300"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium mb-2 block">Endereço completo</Label>
              <Input
                id="address"
                placeholder="Digite o endereço"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-white border border-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin" className="text-sm font-medium mb-2 block">Origem *</Label>
                <Select value={formData.origin} onValueChange={(value) => {
                  setFormData({ ...formData, origin: value, contact: '' });
                }}>
                  <SelectTrigger id="origin" className="w-full bg-white border border-gray-300">
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
                <Label htmlFor="contact" className="text-sm font-medium mb-2 block">Contato *</Label>
                {formData.origin === 'architect' ? (
                  <Select value={formData.contact} onValueChange={(value) => {
                    const selectedArchitect = (architectsData || []).find((a: any) => a.officeNameName === value);
                    const newCommission = selectedArchitect && selectedArchitect.commission === 'yes' ? selectedArchitect.officeNameName : '';
                    setFormData({ ...formData, contact: value, commission: newCommission });
                  }}>
                    <SelectTrigger id="contact" className="w-full bg-white border border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(architectsData || []).map((a: any) => (
                        <SelectItem key={a.id} value={a.officeNameName}>
                          {a.officeNameName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="contact"
                    placeholder="Nome do contato"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full bg-white border border-gray-300"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsible" className="text-sm font-medium mb-2 block">Responsável *</Label>
                <Select value={formData.responsible} onValueChange={(value) => setFormData({ ...formData, responsible: value })}>
                  <SelectTrigger id="responsible" className="w-full bg-white border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESPONSIBLE.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="commission" className="text-sm font-medium mb-2 block">Comissão</Label>
                {(() => {
                  const selectedArchitect = (architectsData || []).find((a: any) => a.officeNameName === formData.contact);
                  const isCommissionLocked = selectedArchitect && selectedArchitect.commission === 'yes';
                  return (
                    <Input
                      id="commission"
                      placeholder="Nome do beneficiário"
                      value={formData.commission}
                      onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                      disabled={isCommissionLocked}
                      className={`w-full bg-white border border-gray-300 ${
                        isCommissionLocked ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                      }`}
                    />
                  );
                })()}
              </div>
            </div>

            {formData.status === 'work' && (
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
            )}

            {formData.status === 'work' && (
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
            )}

            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="reminder"
                checked={formData.reminder}
                onCheckedChange={(checked) => setFormData({ ...formData, reminder: checked as boolean })}
              />
              <Label htmlFor="reminder" className="cursor-pointer text-sm">
                Lembrete
              </Label>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white">
              {editingClient ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteConfirm?.type === 'client' ? 'Excluir cliente?' : 'Excluir obra?'}
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
                  if (deleteConfirm.type === 'client') {
                    deleteClientMutation.mutate({ id: deleteConfirm.id });
                  } else if (deleteConfirm.type === 'work') {
                    deleteWorkMutation.mutate({ id: deleteConfirm.id });
                  }
                  toast.success('Item excluído com sucesso!');
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

      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50">
          <div className="bg-white rounded-lg p-8 text-center max-w-sm shadow-lg animate-in fade-in zoom-in duration-300">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Parabéns!</h3>
            <p className="text-gray-600 mb-4">
              Você fechou a obra de <strong>{celebrationName}</strong>!
            </p>
            <Button 
              onClick={() => {
                setShowCelebration(false);
                setIsModalOpen(false);
              }}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
