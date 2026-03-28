import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * ProtectedRoute Component
 * 
 * Protege rotas que exigem autenticação e role específico.
 * Se o usuário não estiver autenticado, redireciona para /login
 * Se não tiver o role necessário, redireciona para /dashboard
 */
export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se o usuário está autenticado
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (!userLoading) {
      setIsLoading(false);
      
      if (!user) {
        // Usuário não autenticado, redirecionar para login
        navigate('/login');
        setIsAuthenticated(false);
      } else if (requiredRoles && !requiredRoles.includes(user.role)) {
        // Usuário não tem o role necessário
        navigate('/dashboard');
        setIsAuthenticated(false);
      } else {
        // Usuário autenticado e com role correto
        setIsAuthenticated(true);
      }
    }
  }, [user, userLoading, navigate, requiredRoles]);

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

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
