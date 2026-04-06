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
import { SquarePen, Trash2 } from 'lucide-react';
import { formatPhone } from '@/lib/formatters';
import { trpc } from '@/lib/trpc';
import { usePermission } from '../_core/hooks/usePermission';
import AccessDenied from '../components/AccessDenied';
import { EmptyColumnCard } from '../components/EmptyColumnCard';
import { PageToolbar, FilterOption } from '../components/PageToolbar';
import { ResponsibleBadge } from '../components/ResponsibleBadge';

const STATUSES = [
  { value: 'active', label: 'Em atividade' },
  { value: 'waiting', label: 'Aguardando' },
  { value: 'unvalidated', label: 'Não validado' },
  { value: 'inactive', label: 'Inativo' },
];

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

export default function Prestadores() {
  const { canAccessPage } = usePermission();
  
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [remunerations, setRemunerations] = useState<any[]>([]);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
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

  useEffect(() => {
    if (!isModalOpen) {
      setEditingPrestador(null);
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
    if (!formData.fullName.trim()) {
      toast.error('Nome completo é obrigatório');
      return;
    }

    if (editingPrestador) {
      updatePrestadorMutation.mutate({ ...editingPrestador, ...formData });
    } else {
      createPrestadorMutation.mutate({ id: 0, ...formData });
    }
  };

  const groupedPrestadores = {
    active: prestadores.filter((p: Prestador) => p.status === 'active'),
    waiting: prestadores.filter((p: Prestador) => p.status === 'waiting'),
    unvalidated: prestadores.filter((p: Prestador) => p.status === 'unvalidated'),
    inactive: prestadores.filter((p: Prestador) => p.status === 'inactive'),
  };

  if (!canAccessPage('prestadores')) {
    return <AccessDenied />;
  }

  const filters: FilterOption[] = [
    { label: 'Status', options: STATUSES.map(s => s.label) },
    { label: 'Categoria', options: categories.map(c => c.name) },
    { label: 'Remuneração', options: remunerations.map(r => r.name) },
  ];

  return (
    <>
      <PageToolbar 
        filters={filters} 
        layout={layout} 
        onLayoutChange={setLayout} 
      />

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
              {statusPrestadores.length === 0 ? (
                <EmptyColumnCard message="Nenhum prestador" />
              ) : (
                statusPrestadores.map((prestador: Prestador) => (
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
                      <p className="text-gray-600 text-xs mt-1.5 break-words">
                        {prestador.category}
                      </p>
                      <div className="mt-1.5">
                        <ResponsibleBadge name={prestador.remuneration} />
                      </div>
                    </div>
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
              {editingPrestador ? 'Editar prestador' : 'Novo prestador'}
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
                    {STATUSES.map((s) => (
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseValue" className="text-sm font-medium mb-2 block">Valor base *</Label>
                <Input
                  id="baseValue"
                  placeholder="R$ 0,00"
                  value={formData.baseValue}
                  onChange={(e) => setFormData({ ...formData, baseValue: e.target.value })}
                  className="w-full bg-white border border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="cpf" className="text-sm font-medium mb-2 block">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full bg-white border border-gray-300"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePrestador} className="bg-gray-900 hover:bg-gray-800 text-white">
              {editingPrestador ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Excluir prestador?
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
                  deletePrestadorMutation.mutate({ id: deleteConfirm.id });
                  toast.success('Prestador excluído com sucesso!');
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
