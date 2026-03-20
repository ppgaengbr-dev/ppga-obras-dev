'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'categories' | 'remunerations'>('categories');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  // Queries
  const { data: categories = [], refetch: refetchCategories } = trpc.categories.list.useQuery();
  const { data: remunerations = [], refetch: refetchRemunerations } = trpc.remunerations.list.useQuery();

  // Mutations
  const createCategoryMutation = trpc.categories.create.useMutation();
  const updateCategoryMutation = trpc.categories.update.useMutation();
  const deleteCategoryMutation = trpc.categories.delete.useMutation();

  const createRemunerationMutation = trpc.remunerations.create.useMutation();
  const updateRemunerationMutation = trpc.remunerations.update.useMutation();
  const deleteRemunerationMutation = trpc.remunerations.delete.useMutation();

  const handleAddCategory = async () => {
    if (!newItemName.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      await createCategoryMutation.mutateAsync({
        name: newItemName,
        description: newItemDescription,
      });
      toast.success('Categoria adicionada com sucesso!');
      setNewItemName('');
      setNewItemDescription('');
      refetchCategories();
    } catch (error) {
      toast.error('Erro ao adicionar categoria');
    }
  };

  const handleAddRemuneration = async () => {
    if (!newItemName.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      await createRemunerationMutation.mutateAsync({
        name: newItemName,
        description: newItemDescription,
      });
      toast.success('Remuneração adicionada com sucesso!');
      setNewItemName('');
      setNewItemDescription('');
      refetchRemunerations();
    } catch (error) {
      toast.error('Erro ao adicionar remuneração');
    }
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editingName.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      await updateCategoryMutation.mutateAsync({
        id,
        name: editingName,
        description: editingDescription,
      });
      toast.success('Categoria atualizada com sucesso!');
      setEditingId(null);
      setEditingName('');
      setEditingDescription('');
      refetchCategories();
    } catch (error) {
      toast.error('Erro ao atualizar categoria');
    }
  };

  const handleUpdateRemuneration = async (id: number) => {
    if (!editingName.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      await updateRemunerationMutation.mutateAsync({
        id,
        name: editingName,
        description: editingDescription,
      });
      toast.success('Remuneração atualizada com sucesso!');
      setEditingId(null);
      setEditingName('');
      setEditingDescription('');
      refetchRemunerations();
    } catch (error) {
      toast.error('Erro ao atualizar remuneração');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) return;

    try {
      await deleteCategoryMutation.mutateAsync({ id });
      toast.success('Categoria deletada com sucesso!');
      refetchCategories();
    } catch (error) {
      toast.error('Erro ao deletar categoria');
    }
  };

  const handleDeleteRemuneration = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta remuneração?')) return;

    try {
      await deleteRemunerationMutation.mutateAsync({ id });
      toast.success('Remuneração deletada com sucesso!');
      refetchRemunerations();
    } catch (error) {
      toast.error('Erro ao deletar remuneração');
    }
  };

  const startEditCategory = (category: any) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingDescription(category.description || '');
  };

  const startEditRemuneration = (remuneration: any) => {
    setEditingId(remuneration.id);
    setEditingName(remuneration.name);
    setEditingDescription(remuneration.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingDescription('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">Gerencie as categorias e remunerações do sistema</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-black text-black'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Categorias
        </button>
        <button
          onClick={() => setActiveTab('remunerations')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'remunerations'
              ? 'border-black text-black'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Remunerações
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Add New Category */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Adicionar Nova Categoria</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Nome *</Label>
                <input
                  id="category-name"
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ex: Construção"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category-description">Descrição</Label>
                <input
                  id="category-description"
                  type="text"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="Descrição opcional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm mt-1"
                />
              </div>
              <Button
                onClick={handleAddCategory}
                disabled={createCategoryMutation.isPending}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {createCategoryMutation.isPending ? 'Adicionando...' : 'Adicionar Categoria'}
              </Button>
            </div>
          </Card>

          {/* Categories List */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Categorias Existentes</h2>
            <div className="space-y-3">
              {categories.length === 0 ? (
                <p className="text-gray-500">Nenhuma categoria cadastrada</p>
              ) : (
                categories.map((category: any) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    {editingId === category.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                        />
                        <input
                          type="text"
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          placeholder="Descrição"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        {category.description && <p className="text-sm text-gray-600">{category.description}</p>}
                      </div>
                    )}
                    <div className="flex gap-2 ml-4">
                      {editingId === category.id ? (
                        <>
                          <Button
                            onClick={() => handleUpdateCategory(category.id)}
                            disabled={updateCategoryMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm"
                          >
                            Salvar
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            className="text-sm"
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => startEditCategory(category)}
                            variant="outline"
                            className="text-sm"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={deleteCategoryMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm"
                          >
                            Deletar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Remunerations Tab */}
      {activeTab === 'remunerations' && (
        <div className="space-y-6">
          {/* Add New Remuneration */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Adicionar Nova Remuneração</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="remuneration-name">Nome *</Label>
                <input
                  id="remuneration-name"
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ex: Empreitada"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm mt-1"
                />
              </div>
              <div>
                <Label htmlFor="remuneration-description">Descrição</Label>
                <input
                  id="remuneration-description"
                  type="text"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="Descrição opcional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm mt-1"
                />
              </div>
              <Button
                onClick={handleAddRemuneration}
                disabled={createRemunerationMutation.isPending}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {createRemunerationMutation.isPending ? 'Adicionando...' : 'Adicionar Remuneração'}
              </Button>
            </div>
          </Card>

          {/* Remunerations List */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Remunerações Existentes</h2>
            <div className="space-y-3">
              {remunerations.length === 0 ? (
                <p className="text-gray-500">Nenhuma remuneração cadastrada</p>
              ) : (
                remunerations.map((remuneration: any) => (
                  <div key={remuneration.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    {editingId === remuneration.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                        />
                        <input
                          type="text"
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          placeholder="Descrição"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900">{remuneration.name}</p>
                        {remuneration.description && <p className="text-sm text-gray-600">{remuneration.description}</p>}
                      </div>
                    )}
                    <div className="flex gap-2 ml-4">
                      {editingId === remuneration.id ? (
                        <>
                          <Button
                            onClick={() => handleUpdateRemuneration(remuneration.id)}
                            disabled={updateRemunerationMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm"
                          >
                            Salvar
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            className="text-sm"
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => startEditRemuneration(remuneration)}
                            variant="outline"
                            className="text-sm"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeleteRemuneration(remuneration.id)}
                            disabled={deleteRemunerationMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm"
                          >
                            Deletar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
