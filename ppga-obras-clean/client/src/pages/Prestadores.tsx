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
import { Plus, SquarePen, Trash2, Calendar } from 'lucide-react';
import { formatPhone } from '@/lib/formatters';
import { trpc } from '@/lib/trpc';

const STATUSES = [
  { value: 'active', label: 'Em atividade' },
  { value: 'waiting', label: 'Aguardando' },
  { value: 'unvalidated', label: 'Não validado' },
  { value: 'inactive', label: 'Inativo' },
];

// Categorias e remunerações serão puxadas do banco de dados

const SIZES = [
  { value: 'P', label: 'P' },
  { value: 'M', label: 'M' },
  { value: 'G', label: 'G' },
  { value: 'GG', label: 'GG' },
];

const SHOE_SIZES = [
  { value: '38', label: '38' },
  { value: '39', label: '39' },
  { value: '40', label: '40' },
  { value: '41', label: '41' },
  { value: '42', label: '42' },
  { value: '43', label: '43' },
  { value: '44', label: '44' },
];

const formatCPF = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

const formatCurrency = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  const number = parseInt(cleaned || '0', 10);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number / 100);
};

const formatDate = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

interface Prestador {
  id: number;
  fullName: string;
  status: string;
  cpf: string;
  birthDate: string;
  address: string;
  category: string;
  observation: string;
  remuneration: string;
  baseValue: string;
  uniformSize: string;
  shoeSize: string;
}

const openDatePicker = (inputId: string) => {
  const input = document.getElementById(inputId) as HTMLInputElement;
  if (!input) return;
  input.focus();
  if (typeof (input as any).showPicker === 'function') {
    try {
      (input as any).showPicker();
      return;
    } catch (e) {}
  }
  input.click();
};



export default function Prestadores() {
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [remunerations, setRemunerations] = useState<any[]>([]);
  const { data: prestadoresData } = trpc.prestadores.list.useQuery();
  const { data: categoriesData } = trpc.settings.getAllCategories.useQuery();
  const { data: remunerationsData } = trpc.settings.getAllRemunerations.useQuery();
  const utils = trpc.useUtils();
  
  const createPrestadorMutation = trpc.prestadores.create.useMutation({
    onSuccess: () => {
      utils.prestadores.list.invalidate();
      setIsModalOpen(false);
      toast.success('Prestador criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar prestador: ' + (error.message || 'Tente novamente'));
    },
  });
  const updatePrestadorMutation = trpc.prestadores.update.useMutation({
    onSuccess: () => {
      utils.prestadores.list.invalidate();
      setIsModalOpen(false);
      toast.success('Prestador atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar prestador: ' + (error.message || 'Tente novamente'));
    },
  });
  const deletePrestadorMutation = trpc.prestadores.delete.useMutation({
    onSuccess: () => {
      utils.prestadores.list.invalidate();
      toast.success('Prestador removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover prestador: ' + (error.message || 'Tente novamente'));
    },
  });

  // Sync data from tRPC
  useEffect(() => {
    if (prestadoresData) setPrestadores(prestadoresData as Prestador[]);
  }, [prestadoresData]);

  useEffect(() => {
    if (categoriesData) setCategories(categoriesData);
  }, [categoriesData]);

  useEffect(() => {
    if (remunerationsData) setRemunerations(remunerationsData);
  }, [remunerationsData]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrestador, setEditingPrestador] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    status: 'active',
    cpf: '',
    birthDate: '',
    address: '',
    category: 'construcao',
    observation: '',
    remuneration: 'empreitada',
    baseValue: '',
    uniformSize: 'M',
    shoeSize: '40',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: number; name: string } | null>(null);



  useEffect(() => {
    const handleOpenModal = () => {
      setEditingPrestador(null);
      setFormData({
        fullName: '',
        status: 'active',
        cpf: '',
        birthDate: '',
        address: '',
        category: 'construcao',
        observation: '',
        remuneration: 'empreitada',
        baseValue: '',
        uniformSize: 'M',
        shoeSize: '40',
      });
      setIsModalOpen(true);
    };

    window.addEventListener('openAddPrestadorModal', handleOpenModal);
    return () => window.removeEventListener('openAddPrestadorModal', handleOpenModal);
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setEditingPrestador(null);
      setFormData({
        fullName: '',
        status: 'active',
        cpf: '',
        birthDate: '',
        address: '',
        category: 'construcao',
        observation: '',
        remuneration: 'empreitada',
        baseValue: '',
        uniformSize: 'M',
        shoeSize: '40',
      });
    }
  }, [isModalOpen]);

  const openEditModal = (prestador: any) => {
    setEditingPrestador(prestador);
    setFormData({
      fullName: prestador.fullName,
      status: prestador.status,
      cpf: prestador.cpf,
      birthDate: prestador.birthDate,
      address: prestador.address,
      category: prestador.category,
      observation: prestador.observation,
      remuneration: prestador.remuneration,
      baseValue: prestador.baseValue,
      uniformSize: prestador.uniformSize,
      shoeSize: prestador.shoeSize,
    });
    setIsModalOpen(true);
  };

  const handleSavePrestador = () => {
    if (!formData.fullName.trim() || !formData.cpf.trim() || !formData.category || !formData.remuneration || !formData.baseValue.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingPrestador) {
      const updatedPrestador = { ...editingPrestador, ...formData };
      // Call tRPC mutation to update - don't update local state
      updatePrestadorMutation.mutate(updatedPrestador);
    } else {
      const newPrestador = {
        id: 0,
        ...formData,
      };
      // Call tRPC mutation to create - don't update local state
      createPrestadorMutation.mutate(newPrestador);
    }
  };

  const handleDeletePrestador = (id: number) => {
    // Call tRPC mutation to delete - don't update local state
    deletePrestadorMutation.mutate({ id });
  };

  const groupedPrestadores = {
    active: prestadores.filter((p: Prestador) => p.status === 'active'),
    waiting: prestadores.filter((p: Prestador) => p.status === 'waiting'),
    unvalidated: prestadores.filter((p: Prestador) => p.status === 'unvalidated'),
    inactive: prestadores.filter((p: Prestador) => p.status === 'inactive'),
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        {Object.entries(groupedPrestadores).map(([status, statusPrestadores]) => (
          <div key={status}>
            <h2 className="font-semibold text-gray-900 mb-4">
              {status === 'active' && `Em atividade (${statusPrestadores.length})`}
              {status === 'waiting' && `Aguardando (${statusPrestadores.length})`}
              {status === 'unvalidated' && `Não validado (${statusPrestadores.length})`}
              {status === 'inactive' && `Inativo (${statusPrestadores.length})`}
            </h2>

            <div className="space-y-3">
              {statusPrestadores.map((prestador: Prestador) => (
                <div key={prestador.id}>
                  <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow relative group flex flex-col">
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(prestador)}
                        title="Editar prestador"
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <SquarePen size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'prestador', id: prestador.id, name: prestador.fullName })}
                        title="Excluir prestador"
                        className="text-gray-400 hover:text-red-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex flex-col flex-1 pr-8">
                      <p className="font-semibold text-gray-900 text-sm break-words">
                        {prestador.fullName}
                      </p>
                      <p className="text-gray-600 text-xs mt-1 break-words">
                        {categories.find(c => c.name === prestador.category)?.name || prestador.category}
                      </p>
                      <p className="text-gray-500 text-xs mt-1 break-words">
                        {prestador.cpf}
                      </p>
                    </div>
                  </Card>
                </div>
              ))}

              {statusPrestadores.length === 0 && (
                <Card className="p-4 text-center text-gray-400 text-sm">
                  Nenhum prestador
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
              {editingPrestador ? 'Editar prestador' : 'Adicionar prestador'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Linha 1: Nome completo | Status */}
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
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha 2: CPF | Data de nascimento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cpf" className="text-sm font-medium mb-2 block">CPF *</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                  className="w-full bg-white border border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="birthDate" className="text-sm font-medium mb-2 block">Data de nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  placeholder="DD/MM/AAAA"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full bg-white border border-gray-300"
                />
              </div>
            </div>

            {/* Linha 3: Endereço completo (largo) */}
            <div>
              <Label htmlFor="address" className="text-sm font-medium mb-2 block">Endereço completo</Label>
              <Input
                id="address"
                placeholder="Digite o endereço completo"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-white border border-gray-300"
              />
            </div>

            {/* Linha 4: Categoria | Observação */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium mb-2 block">Categoria *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="category" className="w-full bg-white border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="observation" className="text-sm font-medium mb-2 block">Observação</Label>
                <Input
                  id="observation"
                  placeholder="Digite observações"
                  value={formData.observation}
                  onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                  className="w-full bg-white border border-gray-300"
                />
              </div>
            </div>

            {/* Linha 5: Remuneração | Valor base */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="remuneration" className="text-sm font-medium mb-2 block">Remuneração *</Label>
                <Select value={formData.remuneration} onValueChange={(value) => setFormData({ ...formData, remuneration: value })}>
                  <SelectTrigger id="remuneration" className="w-full bg-white border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {remunerations.map((r) => (
                      <SelectItem key={r.id} value={r.name}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="baseValue" className="text-sm font-medium mb-2 block">Valor base *</Label>
                <Input
                  id="baseValue"
                  placeholder="R$ 0,00"
                  value={formData.baseValue}
                  onChange={(e) => setFormData({ ...formData, baseValue: formatCurrency(e.target.value) })}
                  className="w-full bg-white border border-gray-300"
                />
              </div>
            </div>

            {/* Linha 6: Numeração uniforme | Numeração calçado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uniformSize" className="text-sm font-medium mb-2 block">Numeração uniforme</Label>
                <Select value={formData.uniformSize} onValueChange={(value) => setFormData({ ...formData, uniformSize: value })}>
                  <SelectTrigger id="uniformSize" className="w-full bg-white border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="shoeSize" className="text-sm font-medium mb-2 block">Numeração calçado</Label>
                <Select value={formData.shoeSize} onValueChange={(value) => setFormData({ ...formData, shoeSize: value })}>
                  <SelectTrigger id="shoeSize" className="w-full bg-white border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHOE_SIZES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="bg-white border border-gray-300 text-gray-900 hover:bg-white">
              Cancelar
            </Button>
            <Button onClick={handleSavePrestador} className="bg-gray-900 hover:bg-gray-800 text-white">
              {editingPrestador ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              Tem certeza que deseja excluir <strong>{deleteConfirm.name}</strong>?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="bg-white border border-gray-300 text-gray-900 hover:bg-white">
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  handleDeletePrestador(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
