'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('CLIENTE');
  const [selectedLinkedId, setSelectedLinkedId] = useState<number | null>(null);

  // Fetch pending users
  const { data: pendingUsers = [], refetch: refetchPending } = trpc.auth.getPendingUsers.useQuery();

  // Fetch all users
  const { data: allUsers = [] } = trpc.auth.getAllUsers.useQuery();

  // Fetch entities for linking
  const { data: architects = [] } = trpc.auth.getArchitects.useQuery();
  const { data: clients = [] } = trpc.auth.getClients.useQuery();
  const { data: providers = [] } = trpc.auth.getProviders.useQuery();

  // Get linked entities based on selected role
  const linkedEntities = useMemo(() => {
    switch (selectedRole) {
      case 'ARQUITETO':
        return architects;
      case 'CLIENTE':
        return clients;
      case 'PRESTADOR':
        return providers;
      default:
        return [];
    }
  }, [selectedRole, architects, clients, providers]);

  // Mutations
  const approveMutation = trpc.auth.approveUser.useMutation({
    onSuccess: () => {
      setShowApprovalModal(false);
      setSelectedUser(null);
      setSelectedRole('CLIENTE');
      setSelectedLinkedId(null);
      refetchPending();
      toast.success('Usuário aprovado com sucesso');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao aprovar usuário');
    },
  });

  const blockMutation = trpc.auth.blockUser.useMutation({
    onSuccess: () => {
      refetchPending();
      toast.success('Usuário bloqueado com sucesso');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao bloquear usuário');
    },
  });

  const handleApprove = (user: any) => {
    setSelectedUser(user);
    setSelectedRole('CLIENTE');
    setSelectedLinkedId(null);
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = () => {
    if (!selectedUser) return;

    // Validate linked fields for non-ADMIN roles
    if (selectedRole !== 'ADMIN') {
      if (!selectedLinkedId) {
        toast.error('Selecione uma entidade para vincular');
        return;
      }
    }

    approveMutation.mutate({
      userId: selectedUser.id,
      role: selectedRole,
      linkedType: selectedRole === 'ADMIN' ? null : selectedRole,
      linkedId: selectedRole === 'ADMIN' ? null : selectedLinkedId,
    });
  };

  const handleBlock = (userId: number) => {
    if (confirm('Tem certeza que deseja bloquear este usuário?')) {
      blockMutation.mutate({ userId });
    }
  };

  // Função para traduzir role
  const translateRole = (role: string) => {
    const translations: Record<string, string> = {
      'ADMIN': 'Administrador',
      'CLIENTE': 'Cliente',
      'ARQUITETO': 'Arquiteto',
      'PRESTADOR': 'Prestador',
    };
    return translations[role] || role;
  };

  // Função para traduzir status
  const translateStatus = (status: string) => {
    const translations: Record<string, string> = {
      'APPROVED': 'Aprovado',
      'BLOCKED': 'Bloqueado',
      'PENDING': 'Pendente',
    };
    return translations[status] || status;
  };

  // Função para obter o nome da entidade vinculada
  const getLinkedEntityName = (user: any) => {
    if (!user.linkedType || !user.linkedId) return 'Sem vínculo';
    
    let entities: any[] = [];
    switch (user.linkedType) {
      case 'ARQUITETO':
        entities = architects;
        break;
      case 'CLIENTE':
        entities = clients;
        break;
      case 'PRESTADOR':
        entities = providers;
        break;
    }
    
    const entity = entities.find(e => e.id === user.linkedId);
    return entity ? entity.name : 'Sem vínculo';
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Pending Users Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Usuários Pendentes ({pendingUsers.length})
          </h2>

          {pendingUsers.length === 0 ? (
            <p className="text-gray-500">Nenhum usuário pendente de aprovação</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Data de Cadastro</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user: any) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          {translateStatus(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleApprove(user)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleBlock(user.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold"
                        >
                          Bloquear
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* All Users Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Todos os Usuários ({allUsers.length})
          </h2>

          {allUsers.length === 0 ? (
            <p className="text-gray-500">Nenhum usuário cadastrado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Função</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vínculo</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user: any) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {translateRole(user.role)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          user.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {translateStatus(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getLinkedEntityName(user)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Usuário: {selectedUser?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Role Selection */}
            <div>
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Função
              </Label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setSelectedLinkedId(null);
                }}
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ADMIN">Administrador</option>
                <option value="CLIENTE">Cliente</option>
                <option value="ARQUITETO">Arquiteto</option>
                <option value="PRESTADOR">Prestador</option>
              </select>
            </div>

            {/* Linked Entity Selection (if not ADMIN) */}
            {selectedRole !== 'ADMIN' && (
              <div>
                <Label htmlFor="linked-entity" className="text-sm font-medium text-gray-700">
                  {selectedRole === 'ARQUITETO' && 'Selecione um Arquiteto'}
                  {selectedRole === 'CLIENTE' && 'Selecione um Cliente'}
                  {selectedRole === 'PRESTADOR' && 'Selecione um Prestador'}
                </Label>
                <select
                  id="linked-entity"
                  value={selectedLinkedId || ''}
                  onChange={(e) => setSelectedLinkedId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Definir</option>
                  {linkedEntities.map((entity: any) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowApprovalModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApprovalSubmit}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? 'Aprovando...' : 'Aprovar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
