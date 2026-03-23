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
import { SquarePen, Trash2, Bell, Calendar, ChevronDown } from 'lucide-react';
import { formatPhone } from '@/lib/formatters';

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

const ARCHITECTS = [
  { value: 'Arquiteto 01', label: 'Arquiteto 01' },
  { value: 'Arquiteto 02', label: 'Arquiteto 02' },
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
  clientPhone?: string;
  clientBirthDate?: string;
  clientAddress?: string;
  clientOrigin?: string;
  clientContact?: string;
  reminder?: boolean;
};

// Funcoes de sincronizacao
const syncClientFromWork = (work: any) => {
  return {
    fullName: work.clientName,
    phone: work.clientPhone,
    birthDate: work.clientBirthDate,
    address: work.clientAddress,
    origin: work.clientOrigin,
    contact: work.clientContact,
    responsible: work.responsible,
    commission: work.commission,
  };
};

// Helper para abrir seletor de data
const openDatePicker = (inputId: string) => {
  const input = document.getElementById(inputId) as HTMLInputElement;
  if (!input) return;
  
  input.focus();
  
  // Tentar showPicker() para Chrome moderno
  if (typeof (input as any).showPicker === 'function') {
    try {
      (input as any).showPicker();
      return;
    } catch (e) {
      // Fallback se showPicker falhar
    }
  }
  
  // Fallback: click() para outros navegadores
  input.click();
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
  const [works, setWorks] = useState<Work[]>([]);
  const { data: worksData } = trpc.works.list.useQuery();
  const { data: architectsData } = trpc.architects.list.useQuery();
  const utils = trpc.useUtils();
  
  const createWorkMutation = trpc.works.create.useMutation({
    onSuccess: () => utils.works.list.invalidate(),
  });
  const updateWorkMutation = trpc.works.update.useMutation({
    onSuccess: () => {
      console.log('updateWorkMutation success');
      utils.works.list.invalidate();
    },
    onError: (error) => {
      console.error('updateWorkMutation error:', error);
      toast.error('Erro ao atualizar obra');
    },
  });
  const deleteWorkMutation = trpc.works.delete.useMutation({
    onSuccess: () => utils.works.list.invalidate(),
  });
  
  const updateClientMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      utils.works.list.invalidate(); // Invalidar works porque clientes convertidos aparecem em obras
    },
  });
  const deleteClientMutation = trpc.clients.delete.useMutation({
    onSuccess: () => utils.clients.list.invalidate(),
  });

  // Sync data from tRPC
  useEffect(() => {
    if (worksData) {
      const adaptedWorks = worksData.map((w: any) => ({
        ...w,
        reminder: w.reminder ? true : undefined,
      }));
      setWorks(adaptedWorks as Work[]);
    }
  }, [worksData]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editClientDetails, setEditClientDetails] = useState(false);
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
    setShowDetails(false);
    setEditClientDetails(false);
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
    setShowDetails(false);
    setEditClientDetails(false);
    
    let commission = work.commission || '';
    
    setFormData({
      clientName: work.clientName,
      status: work.status,
      workName: work.workName,
      workValue: work.workValue,
      startDate: work.startDate,
      endDate: work.endDate,
      clientPhone: work.clientPhone || '',
      clientBirthDate: work.clientBirthDate || '',
      clientAddress: work.clientAddress || '',
      clientOrigin: work.clientOrigin || '',
      clientContact: work.clientContact || '',
      responsible: work.responsible,
      commission: commission,
      clientCommission: commission,
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

    // Se selecionou "Voltar para Cliente", validações mínimas
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
      // Validações completas para salvar como obra
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

    // Se selecionou "Voltar para Cliente", remover da lista de obras
    if (formData.status === 'back_to_client') {
      if (editingWork) {
        // Revert work back to client status via tRPC
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
      // Se a obra tem clientId, significa que e um cliente convertido para obra
      if (editingWork.clientId) {
        // Atualizar como cliente
        const clientData = {
          id: editingWork.clientId,
          fullName: formData.clientName,
          phone: formData.clientPhone || '',
          birthDate: formData.clientBirthDate || '',
          address: formData.clientAddress || '',
          origin: formData.clientOrigin || '',
          contact: formData.clientContact || '',
          responsible: formData.responsible || '',
          status: formData.status === 'back_to_client' ? 'prospect' : 'work',
          workName: formData.workName || '',
          workValue: formData.workValue || '',
          startDate: formData.startDate || '',
          endDate: formData.endDate || '',
          workStatus: formData.status === 'back_to_client' ? 'Aguardando' : formData.status,
          commission: formData.clientCommission || '',
          reminder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        updateClientMutation.mutate(clientData);
      } else {
        // Atualizar como obra (tabela works)
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
      // Call tRPC mutation to create
      createWorkMutation.mutate(newWork);
      // NÃO adicionar ao estado local - deixar que a invalidate query retorne do servidor
      toast.success('Obra criada com sucesso!');
    }

    setIsModalOpen(false);
  };

  const handleDeleteWork = async (id: number) => {
    try {
      // Call tRPC mutation to delete
      await deleteWorkMutation.mutateAsync({ id });
      // Invalidate and refetch to ensure persistence
      await utils.works.list.invalidate();
      await utils.works.list.refetch();
      toast.success('Obra removida com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar obra:', error);
      toast.error('Erro ao remover obra');
    }
  };

  // Agrupar obras por status
  const groupedWorks = {
    waiting: works.filter((w: Work) => w.status === 'Aguardando'),
    in_progress: works.filter((w: Work) => w.status === 'Em andamento'),
    interrupted: works.filter((w: Work) => w.status === 'Interrompido'),
    completed: works.filter((w: Work) => w.status === 'Finalizado'),
  };

  return (
    <>
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
              {statusWorks.map((work: Work) => (
                <div key={work.id}>
                  <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow relative group flex flex-col">
                    {/* Ações do Card - Lado a lado (Editar e Excluir) */}
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

                    {/* Conteúdo do Card */}
                    <div className="flex flex-col flex-1 pr-8">
                      {/* Nome da Obra - Título Principal */}
                      <p className="font-semibold text-gray-900 text-sm break-words">
                        {work.workName}
                      </p>

                      {/* Cliente - Subtítulo */}
                      <p className="text-gray-600 text-xs mt-1 break-words">
                        {work.clientName}
                      </p>

                      {/* Responsável - Subtítulo */}
                      <p className="text-gray-500 text-xs mt-1 break-words">
                        {work.responsible}
                      </p>

                      {/* Valor - Subtítulo */}
                      <p className="text-gray-500 text-xs mt-1 break-words">
                        {work.workValue}
                      </p>
                    </div>

                    {/* Lembrete - Canto inferior direito */}
                    {work.reminder && (
                      <div className="absolute bottom-3 right-3">
                        <Bell size={14} className="text-red-500 flex-shrink-0" />
                      </div>
                    )}
                  </Card>
                </div>
              ))}

              {statusWorks.length === 0 && (
                <Card className="p-4 text-center text-gray-400 text-sm">
                  Nenhuma obra
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
            <DialogTitle>
              {editingWork ? 'Editar obra' : 'Nova obra'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4 max-h-[70vh] overflow-y-auto">
            {/* SEÇÃO SUPERIOR - SEMPRE VISÍVEL */}

            {/* LINHA 1: Nome completo | Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName" className="text-sm font-medium mb-2 block">Nome completo *</Label>
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

            {/* LINHA 2: Nome da obra | Valor total da obra */}
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

            {/* LINHA 3: Data de início | Data de término */}
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

            {/* Checkbox "Mostrar detalhes" logo após linha 3 */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="showDetails"
                  checked={showDetails}
                  onCheckedChange={(checked) => {
                    setShowDetails(checked as boolean);
                    if (!checked) {
                      setEditClientDetails(false);
                    }
                  }}
                />
                <Label htmlFor="showDetails" className="text-sm font-medium cursor-pointer">Mostrar detalhes</Label>
              </div>

              {showDetails && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editClientDetails"
                    checked={editClientDetails}
                    onChange={(e) => setEditClientDetails(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="editClientDetails" className="text-sm font-medium cursor-pointer">Editar cliente</Label>
                </div>
              )}
            </div>

            {/* SEÇÃO COLAPSÁVEL - Campos do cliente */}
            {showDetails && (
              <>
            {/* LINHA 4: Telefone | Data de nascimento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientPhone" className="text-sm font-medium mb-2 block">Telefone</Label>
                <Input
                   id="clientPhone"
                   placeholder="(00) 99999-9999"
                   value={formData.clientPhone}
                   onChange={(e) => setFormData({ ...formData, clientPhone: formatPhone(e.target.value) })}
                   disabled={!editClientDetails && showDetails}
                   className={!editClientDetails && showDetails ? "w-full bg-gray-100 border border-gray-300 text-gray-600" : "w-full bg-white border border-gray-300"}
                 />
              </div>
              <div>
                <Label htmlFor="clientBirthDate" className="text-sm font-medium mb-2 block">Data de nascimento</Label>
                <Input
                  id="clientBirthDate"
                  type="date"
                  value={formData.clientBirthDate}
                  onChange={(e) => setFormData({ ...formData, clientBirthDate: e.target.value })}
                  disabled={!editClientDetails && showDetails}
                  className={!editClientDetails && showDetails ? "w-full bg-gray-100 border border-gray-300 text-gray-600" : "w-full bg-white border border-gray-300"}
                />
              </div>
            </div>

            {/* LINHA 5: Endereço completo (full width) */}
            <div>
              <Label htmlFor="clientAddress" className="text-sm font-medium mb-2 block">Endereço completo</Label>
              <Input
                id="clientAddress"
                placeholder="Rua A, 123"
                value={formData.clientAddress}
                onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                disabled={!editClientDetails && showDetails}
                className={!editClientDetails && showDetails ? "w-full bg-gray-100 border border-gray-300 text-gray-600" : "w-full bg-white border border-gray-300"}
              />
            </div>

            {/* LINHA 6: Origem | Contato */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientOrigin" className="text-sm font-medium mb-2 block">Origem *</Label>
                <Select value={formData.clientOrigin} onValueChange={(value) => setFormData({ ...formData, clientOrigin: value })} disabled={!editClientDetails && showDetails}>
                  <SelectTrigger id="clientOrigin" className={!editClientDetails && showDetails ? "w-full bg-gray-100 border border-gray-300 text-gray-600" : "w-full bg-white border border-gray-300"}>
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
                <Label htmlFor="clientContact" className="text-sm font-medium mb-2 block">Contato *</Label>
                {formData.clientOrigin === 'architect' ? (
                  <Select value={formData.clientContact} onValueChange={(value) => {
                    // Buscar dados do arquiteto selecionado
                    const selectedArchitect = (architectsData || []).find((a: any) => a.officeNameName === value);
                    
                    // Se arquiteto tem comissão = yes, preencher automaticamente com o nome do escritório
                    const newCommission = selectedArchitect && selectedArchitect.commission === 'yes' ? selectedArchitect.officeNameName : '';
                    
                    setFormData({ ...formData, clientContact: value, clientCommission: newCommission });
                  }} disabled={!editClientDetails && showDetails}>
                    <SelectTrigger id="clientContact" className={!editClientDetails && showDetails ? "w-full bg-gray-100 border border-gray-300 text-gray-600" : "w-full bg-white border border-gray-300"}>
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
                    id="clientContact"
                    placeholder="Google"
                    value={formData.clientContact}
                    onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
                    disabled={!editClientDetails && showDetails}
                    className={!editClientDetails && showDetails ? "w-full bg-gray-100 border border-gray-300 text-gray-600" : "w-full bg-white border border-gray-300"}
                  />
                )}
              </div>
            </div>

            {/* LINHA 7: Responsável | Comissão */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsible" className="text-sm font-medium mb-2 block">Responsável *</Label>
                <Input
                  id="responsible"
                  placeholder="Digite o responsável"
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  disabled={!editClientDetails && showDetails}
                  className={!editClientDetails && showDetails ? "w-full bg-gray-100 border border-gray-300 text-gray-600" : "w-full bg-white border border-gray-300"}
                />
              </div>
              <div>
                <Label htmlFor="commission" className="text-sm font-medium mb-2 block">Comissão</Label>
                {(() => {
                  // Verificar se o arquiteto selecionado tem comissão = yes
                  const selectedArchitect = (architectsData || []).find((a: any) => a.officeNameName === formData.clientContact);
                  const isCommissionLocked = selectedArchitect && selectedArchitect.commission === 'yes';
                  
                  return (
                    <Input
                      id="commission"
                      placeholder="Nome do beneficiário"
                      value={formData.clientCommission}
                      onChange={(e) => setFormData({ ...formData, clientCommission: e.target.value })}
                      disabled={isCommissionLocked || (!editClientDetails && showDetails)}
                      className={`w-full bg-white border border-gray-300 ${
                        (isCommissionLocked || (!editClientDetails && showDetails)) ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                      }`}
                    />
                  );
                })()}
              </div>
            </div>
              </>
            )}
          </div>

          {/* Rodapé do Modal */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteConfirm?.type === 'client' ? 'Excluir cliente?' : 'Excluir obra?'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">
            Tem certeza que deseja excluir <strong>{deleteConfirm?.name}</strong>? Esta acao nao pode ser desfeita.
          </p>
          <DialogFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={async () => {
                if (deleteConfirm) {
                  try {
                    if (deleteConfirm.type === 'work') {
                      await deleteWorkMutation.mutateAsync({ id: deleteConfirm.id });
                      setWorks(works.filter((w: Work) => w.id !== deleteConfirm.id));
                    } else if (deleteConfirm.type === 'client') {
                      await deleteClientMutation.mutateAsync({ id: deleteConfirm.id });
                    }
                    toast.success('Item excluido com sucesso!');
                  } catch (error) {
                    console.error('Erro ao deletar:', error);
                    toast.error('Erro ao excluir item');
                  }
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
