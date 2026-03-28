import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

/**
 * RootRedirect Component
 * 
 * Redireciona a rota raiz (/) baseado no status de autenticação:
 * - Se autenticado: redireciona para /dashboard
 * - Se não autenticado: redireciona para /login
 */
export function RootRedirect() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se o usuário está autenticado
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (!userLoading) {
      setIsLoading(false);
      
      if (user) {
        // Usuário autenticado, redirecionar para dashboard
        navigate('/dashboard');
      } else {
        // Usuário não autenticado, redirecionar para login
        navigate('/login');
      }
    }
  }, [user, userLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return null;
}

export default RootRedirect;
