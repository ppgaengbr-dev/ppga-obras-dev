import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SquarePen, Trash2, Bell } from "lucide-react";
import { toast } from "sonner";
import { formatPhone } from "@/lib/formatters";
import { trpc } from "@/lib/trpc";


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
  reminder?: boolean;
}

const STATUSES = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'followup', label: 'Follow-up' },
  { value: 'recovery', label: 'Recuperação' },
];

const COMMISSION_OPTIONS = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Não' },
];

export default function Architects() {
  const [architects, setArchitects] = useState<Architect[]>([]);
  const { data: architectsData } = trpc.architects.list.useQuery();
  const utils = trpc.useUtils();
  
  const createArchitectMutation = trpc.architects.create.useMutation({
    onSuccess: () => {
      utils.architects.list.invalidate();
      setIsModalOpen(false);
      toast.success('Arquiteto criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar arquiteto: ' + (error.message || 'Tente novamente'));
    },
  });
  const updateArchitectMutation = trpc.architects.update.useMutation({
    onSuccess: () => {
      utils.architects.list.invalidate();
      setIsModalOpen(false);
      toast.success('Arquiteto atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar arquiteto: ' + (error.message || 'Tente novamente'));
    },
  });
  const deleteArchitectMutation = trpc.architects.delete.useMutation({
    onSuccess: () => {
      utils.architects.list.invalidate();
      toast.success('Arquiteto deletado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao deletar arquiteto: ' + (error.message || 'Tente novamente'));
    },
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  
  // Sync data from tRPC
  useEffect(() => {
    if (architectsData) {
      const adaptedArchitects = architectsData.map((a: any) => ({
        ...a,
        reminder: a.reminder ? true : undefined,
      }));
      setArchitects(adaptedArchitects as Architect[]);
    }
  }, [architectsData]);
  const [formData, setFormData] = useState<Architect>({
    id: 0,
    officeNameName: '',
    status: 'active',
    address: '',
    architectName: '',
    phone: '',
    birthDate: '',
    commission: 'no',
    observation: '',
    reminder: false,
  });

  const openEditModal = (architect: Architect) => {
    setEditingId(architect.id);
    setFormData({ ...architect });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      id: 0,
      officeNameName: '',
      status: 'active',
      address: '',
      architectName: '',
      phone: '',
      birthDate: '',
      commission: 'no',
      observation: '',
      reminder: false,
    });
    setIsModalOpen(true);
  };

  // Listen for custom event from header button
  useEffect(() => {
    const handleOpenAddModal = () => {
      openCreateModal();
    };
    window.addEventListener('openAddArchitectModal', handleOpenAddModal);
    return () => {
      window.removeEventListener('openAddArchitectModal', handleOpenAddModal);
    };
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setEditingId(null);
      setFormData({
        id: 0,
        officeNameName: '',
        status: 'active',
        address: '',
        architectName: '',
        phone: '',
        birthDate: '',
        commission: 'no',
        observation: '',
        reminder: false,
      });
    }
  }, [isModalOpen]);

  const handleSave = () => {
    if (!formData.officeNameName.trim()) {
      toast.error('Nome do escritório é obrigatório');
      return;
    }
    if (!formData.status) {
      toast.error('Status é obrigatório');
      return;
    }

    if (editingId) {
      const updatedArchitect = { ...formData, id: editingId };
      // Call tRPC mutation to update - don't update local state
      updateArchitectMutation.mutate(updatedArchitect);
    } else {
      const newArchitect = { ...formData, id: 0 };
      // Call tRPC mutation to create - don't update local state
      createArchitectMutation.mutate(newArchitect);
    }
  };

  const handleDelete = (id: number) => {
    const architect = architects.find((a) => a.id === id);
    if (architect) {
      setDeleteConfirm({ id, name: architect.officeNameName });
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      // Call tRPC mutation to delete - don't update local state
      deleteArchitectMutation.mutate({ id: deleteConfirm.id });
      setDeleteConfirm(null);
    }
  };

  const groupedArchitects = STATUSES.reduce(
    (acc, status) => {
      acc[status.value] = architects.filter((a) => a.status === status.value);
      return acc;
    },
    {} as Record<string, Architect[]>
  );

  return (
    <>
      {/* Grid de 4 colunas */}
      <div className="grid grid-cols-4 gap-6">
        {STATUSES.map((status) => (
          <div key={status.value}>
            <div className="mb-4">
              <h3 className="font-semibold text-foreground">
                {status.label} ({groupedArchitects[status.value]?.length || 0})
              </h3>
            </div>

            <div className="space-y-3 min-h-96">
              {groupedArchitects[status.value]?.map((architect) => (
                <div key={architect.id} className="relative group">
                  <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow relative">
                    {/* Conteúdo do Card */}
                    <div className="flex flex-col flex-1 pr-8">
                      <p className="font-semibold text-foreground text-sm break-words">
                        {architect.officeNameName}
                      </p>
                      <p className="text-gray-500 text-xs mt-1 break-words">
                        {architect.architectName}
                      </p>
                      <p className="text-gray-500 text-xs mt-1 break-words">
                        {architect.phone}
                      </p>
                    </div>

                    {/* Ícones de Ação - Hover */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(architect)}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                        title="Editar"
                      >
                        <SquarePen size={16} className="text-primary flex-shrink-0" />
                      </button>
                      <button
                        onClick={() => handleDelete(architect.id)}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <Trash2 size={16} className="text-destructive flex-shrink-0" />
                      </button>
                    </div>

                    {/* Lembrete - Canto inferior direito */}
                    {architect.reminder && (
                      <div className="absolute bottom-3 right-3">
                        <Bell size={14} className="text-red-500 flex-shrink-0" />
                      </div>
                    )}
                  </Card>
                </div>
              ))}

              {groupedArchitects[status.value]?.length === 0 && (
                <Card className="p-4 text-center text-gray-400 text-sm">
                  Nenhum arquiteto
                </Card>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Arquiteto' : 'Novo Arquiteto'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Linha 1: Nome do escritório | Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="officeNameName" className="text-sm font-medium mb-2 block">Nome do escritório *</Label>
                <Input
                  id="officeNameName"
                  value={formData.officeNameName}
                  onChange={(e) => setFormData({ ...formData, officeNameName: e.target.value })}
                  placeholder="Nome do escritório"
                  className="w-full bg-white border border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-sm font-medium mb-2 block">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status" className="w-full bg-white border border-gray-300">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha 2: Endereço completo (2 colunas) */}
            <div>
              <Label htmlFor="address" className="text-sm font-medium mb-2 block">Endereço completo</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, complemento"
                className="w-full bg-white border border-gray-300"
              />
            </div>

            {/* Linha 3: Nome do arquiteto | Telefone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="architectName" className="text-sm font-medium mb-2 block">Nome do arquiteto</Label>
                <Input
                  id="architectName"
                  value={formData.architectName}
                  onChange={(e) => setFormData({ ...formData, architectName: e.target.value })}
                  placeholder="Nome completo"
                  className="w-full bg-white border border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium mb-2 block">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  placeholder="(11) 98765-4321"
                  className="w-full bg-white border border-gray-300"
                />
              </div>
            </div>

            {/* Linha 4: Data de nascimento | Comissão */}
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="commission" className="text-sm font-medium mb-2 block">Comissão</Label>
                <Select value={formData.commission} onValueChange={(value) => setFormData({ ...formData, commission: value })}>
                  <SelectTrigger id="commission" className="w-full bg-white border border-gray-300">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMISSION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observação */}
            <div>
              <Label htmlFor="observation" className="text-sm font-medium mb-2 block">Observação</Label>
              <Textarea
                id="observation"
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                placeholder="Adicione observações..."
                className="w-full bg-white border border-gray-300"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button onClick={() => setIsModalOpen(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white">
              {editingId ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Tem certeza que deseja deletar <strong>{deleteConfirm?.name}</strong>?
          </p>
          <div className="flex gap-3 justify-end">
            <Button onClick={() => setDeleteConfirm(null)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Deletar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
