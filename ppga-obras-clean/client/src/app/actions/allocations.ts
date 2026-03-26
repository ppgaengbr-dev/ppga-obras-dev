/**
 * Client-side actions para CRUD de alocações
 * Chama a API tRPC do backend para salvar os dados
 */

interface CreateAllocationInput {
  workId: string;
  providerId: string;
  providerName: string;
  startDate: string;
  endDate: string;
  category?: string;
  observation?: string;
  remuneration?: string;
  baseValue?: string;
}

interface UpdateAllocationInput extends CreateAllocationInput {
  id: string;
}

/**
 * Criar uma nova alocação
 */
export async function createAllocation(input: CreateAllocationInput) {
  try {
    console.log('[CLIENT ACTION] Criando alocação:', input);

    // Chamar a API tRPC do servidor
    const response = await fetch('http://localhost:3000/api/trpc/allocations.create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: input,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[CLIENT ACTION] Erro ao criar alocação:', error);
      throw new Error(error.message || 'Erro ao criar alocação');
    }

    const result = await response.json();
    console.log('[CLIENT ACTION] Alocação criada com sucesso:', result);

    // Disparar evento para revalidar a página
    window.dispatchEvent(new CustomEvent('allocations-updated'));

    return { success: true, data: result };
  } catch (error) {
    console.error('[CLIENT ACTION] Erro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Atualizar uma alocação existente
 */
export async function updateAllocation(input: UpdateAllocationInput) {
  try {
    console.log('[CLIENT ACTION] Atualizando alocação:', input);

    const response = await fetch('http://localhost:3000/api/trpc/allocations.update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: input,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[CLIENT ACTION] Erro ao atualizar alocação:', error);
      throw new Error(error.message || 'Erro ao atualizar alocação');
    }

    const result = await response.json();
    console.log('[CLIENT ACTION] Alocação atualizada com sucesso:', result);

    // Disparar evento para revalidar a página
    window.dispatchEvent(new CustomEvent('allocations-updated'));

    return { success: true, data: result };
  } catch (error) {
    console.error('[CLIENT ACTION] Erro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Deletar uma alocação
 */
export async function deleteAllocation(allocationId: string) {
  try {
    console.log('[CLIENT ACTION] Deletando alocação:', allocationId);

    const response = await fetch('http://localhost:3000/api/trpc/allocations.delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: { id: allocationId },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[CLIENT ACTION] Erro ao deletar alocação:', error);
      throw new Error(error.message || 'Erro ao deletar alocação');
    }

    const result = await response.json();
    console.log('[CLIENT ACTION] Alocação deletada com sucesso:', result);

    // Disparar evento para revalidar a página
    window.dispatchEvent(new CustomEvent('allocations-updated'));

    return { success: true, data: result };
  } catch (error) {
    console.error('[CLIENT ACTION] Erro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
