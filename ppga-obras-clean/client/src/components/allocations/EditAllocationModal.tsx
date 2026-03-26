'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface Work {
  id: string;
  name: string;
}

interface Provider {
  id: string;
  fullName: string;
  category?: string;
  observation?: string;
  remuneration?: string;
  baseValue?: string;
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

interface EditAllocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocation: Allocation;
  works: Work[];
  providers: Provider[];
  onSuccess: (data: any) => Promise<void>;
}

export default function EditAllocationModal({
  open,
  onOpenChange,
  allocation,
  works,
  providers,
  onSuccess,
}: EditAllocationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  
  // Queries para categorias e remunerações
  const { data: categories = [] } = trpc.settings.getAllCategories.useQuery();
  const { data: remunerations = [] } = trpc.settings.getAllRemunerations.useQuery();
  
  // Usar refs para acessar os valores dos inputs diretamente do DOM
  const workIdRef = useRef<HTMLSelectElement>(null);
  const providerIdRef = useRef<HTMLSelectElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const observationRef = useRef<HTMLInputElement>(null);
  const remunerationRef = useRef<HTMLSelectElement>(null);
  const baseValueRef = useRef<HTMLInputElement>(null);

  // Sincronizar valores quando o modal abre ou a alocação muda
  useEffect(() => {
    if (open && allocation) {
      if (workIdRef.current) workIdRef.current.value = String(allocation.workId);
      if (providerIdRef.current) providerIdRef.current.value = String(allocation.providerId);
      if (startDateRef.current) startDateRef.current.value = allocation.startDate;
      if (endDateRef.current) endDateRef.current.value = allocation.endDate;
      if (categoryRef.current) categoryRef.current.value = allocation.category || '';
      if (observationRef.current) observationRef.current.value = allocation.observation || '';
      if (remunerationRef.current) remunerationRef.current.value = allocation.remuneration || '';
      if (baseValueRef.current) baseValueRef.current.value = allocation.baseValue || '';
      
      // Buscar e atualizar dados do prestador selecionado
      const provider = providers.find(p => String(p.id) === String(allocation.providerId));
      setSelectedProvider(provider || null);
    }
  }, [open, allocation, providers]);

  const handleProviderChange = () => {
    if (providerIdRef.current) {
      const providerId = providerIdRef.current.value;
      const provider = providers.find(p => String(p.id) === String(providerId));
      setSelectedProvider(provider || null);
      
      // Atualizar campos com dados do novo prestador se não foram editados
      if (provider) {
        if (categoryRef.current && !categoryRef.current.value) categoryRef.current.value = provider.category || '';
        if (observationRef.current && !observationRef.current.value) observationRef.current.value = provider.observation || '';
        if (remunerationRef.current && !remunerationRef.current.value) remunerationRef.current.value = provider.remuneration || '';
        if (baseValueRef.current && !baseValueRef.current.value) baseValueRef.current.value = provider.baseValue || '';
      }
    }
  };

  const handleSave = async () => {
    // Ler valores diretamente dos refs
    const workId = workIdRef.current?.value || '';
    const providerId = providerIdRef.current?.value || '';
    const startDate = startDateRef.current?.value || '';
    const endDate = endDateRef.current?.value || '';
    const category = categoryRef.current?.value || '';
    const observation = observationRef.current?.value || '';
    const remuneration = remunerationRef.current?.value || '';
    const baseValue = baseValueRef.current?.value || '';

    // Buscar nomes de obra e prestador
    const work = works.find(w => String(w.id) === String(workId));
    const provider = providers.find(p => String(p.id) === String(providerId));

    // Validar campos obrigatórios
    if (!workId) {
      toast.error('Selecione uma obra');
      return;
    }
    if (!providerId) {
      toast.error('Selecione um prestador');
      return;
    }
    if (!startDate) {
      toast.error('Data de início é obrigatória');
      return;
    }
    if (!endDate) {
      toast.error('Data de fim é obrigatória');
      return;
    }
    if (!work) {
      toast.error('Obra selecionada não encontrada');
      return;
    }
    if (!provider) {
      toast.error('Prestador selecionado não encontrado');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[DEBUG] Enviando dados (edit):', { workId, providerId, startDate, endDate, category, observation, remuneration, baseValue });
      await onSuccess({
        workId: Number(workId),
        workName: work.name,
        providerId: Number(providerId),
        providerName: provider.fullName,
        startDate,
        endDate,
        category: category || provider.category || '',
        observation: observation || provider.observation || '',
        remuneration: remuneration || provider.remuneration || '',
        baseValue: baseValue || provider.baseValue || '',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar alocação:', error);
      toast.error('Erro ao atualizar alocação');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Editar alocação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Linha 1: Prestador e Obra */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="providerId">Prestador *</Label>
              <select
                ref={providerIdRef}
                id="providerId"
                defaultValue=""
                onChange={handleProviderChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="">Selecione um prestador</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={String(provider.id)}>
                    {provider.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workId">Obra *</Label>
              <select
                ref={workIdRef}
                id="workId"
                defaultValue=""
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="">Selecione uma obra</option>
                {works.map((work) => (
                  <option key={work.id} value={String(work.id)}>
                    {work.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 2: Data de início e Data de fim */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de início *</Label>
              <input
                ref={startDateRef}
                id="startDate"
                type="date"
                defaultValue=""
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de fim *</Label>
              <input
                ref={endDateRef}
                id="endDate"
                type="date"
                defaultValue=""
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              />
            </div>
          </div>

          {/* Linha 3: Categoria e Observação */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <select
                ref={categoryRef}
                id="category"
                defaultValue=""
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observation">Observação</Label>
              <input
                ref={observationRef}
                id="observation"
                type="text"
                placeholder="Observação"
                defaultValue=""
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              />
            </div>
          </div>

          {/* Linha 4: Remuneração e Valor base */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="remuneration">Remuneração</Label>
              <select
                ref={remunerationRef}
                id="remuneration"
                defaultValue=""
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="">Selecione uma remuneração</option>
                {remunerations.map((remuneration: any) => (
                  <option key={remuneration.id} value={remuneration.name}>
                    {remuneration.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseValue">Valor base</Label>
              <input
                ref={baseValueRef}
                id="baseValue"
                type="text"
                placeholder="R$ 0,00"
                defaultValue=""
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting} className="bg-black hover:bg-gray-800 text-white">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
