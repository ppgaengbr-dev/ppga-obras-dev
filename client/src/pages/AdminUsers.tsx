import React, { useState } from 'react';
import { trpc } from '../_core/trpc';

export function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('CLIENTE');
  const [selectedLinkedType, setSelectedLinkedType] = useState<string | null>(null);
  const [selectedLinkedId, setSelectedLinkedId] = useState<number | null>(null);

  // Fetch pending users
  const { data: pendingUsers = [], refetch: refetchPending } = trpc.auth.getPendingUsers.useQuery();

  // Fetch all users
  const { data: allUsers = [] } = trpc.auth.getAllUsers.useQuery();

  // Mutations
  const approveMutation = trpc.auth.approveUser.useMutation({
    onSuccess: () => {
      setShowApprovalModal(false);
      setSelectedUser(null);
      refetchPending();
    },
  });

  const blockMutation = trpc.auth.blockUser.useMutation({
    onSuccess: () => {
      refetchPending();
    },
  });

  const handleApprove = (user: any) => {
    setSelectedUser(user);
    setSelectedRole('CLIENTE');
    setSelectedLinkedType(null);
    setSelectedLinkedId(null);
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = () => {
    if (!selectedUser) return;

    // Validate linked fields for non-ADMIN roles
    if (selectedRole !== 'ADMIN') {
      if (!selectedLinkedType || !selectedLinkedId) {
        alert('Selecione um vínculo obrigatório para usuários não-ADMIN');
        return;
      }
    }

    approveMutation.mutate({
      userId: selectedUser.id,
      role: selectedRole,
      linkedType: selectedLinkedType,
      linkedId: selectedLinkedId,
    });
  };

  const handleBlock = (userId: number) => {
    if (confirm('Tem certeza que deseja bloquear este usuário?')) {
      blockMutation.mutate({ userId });
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-600 mt-2">Configurações → Usuários</p>
        </div>

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
                          {user.status}
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
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          user.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.linkedType ? `${user.linkedType} (ID: ${user.linkedId})` : 'Sem vínculo'}
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
      {showApprovalModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Aprovar Usuário: {selectedUser.name}
            </h3>

            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Função
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="CLIENTE">CLIENTE</option>
                  <option value="ARQUITETO">ARQUITETO</option>
                  <option value="PRESTADOR">PRESTADOR</option>
                </select>
              </div>

              {/* Linked Type Selection (if not ADMIN) */}
              {selectedRole !== 'ADMIN' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Vínculo
                    </label>
                    <select
                      value={selectedLinkedType || ''}
                      onChange={(e) => setSelectedLinkedType(e.target.value || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione...</option>
                      <option value="CLIENTE">CLIENTE</option>
                      <option value="ARQUITETO">ARQUITETO</option>
                      <option value="PRESTADOR">PRESTADOR</option>
                    </select>
                  </div>

                  {/* Linked ID Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID do Vínculo
                    </label>
                    <input
                      type="number"
                      value={selectedLinkedId || ''}
                      onChange={(e) => setSelectedLinkedId(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="ID da entidade vinculada"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleApprovalSubmit}
                disabled={approveMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold"
              >
                {approveMutation.isPending ? 'Aprovando...' : 'Aprovar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
