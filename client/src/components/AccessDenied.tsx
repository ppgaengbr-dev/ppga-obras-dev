import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export default function AccessDenied({
  title = 'Acesso Negado',
  message = 'Você não tem permissão para visualizar essa página. Entre em contato com o suporte caso tenha algo errado.',
  showBackButton = true,
}: AccessDeniedProps) {
  const [, setLocation] = useLocation();

  const handleContactSupport = () => {
    const phone = '5551994550588';
    const supportMessage = 'Olá, preciso de acesso a uma página que está bloqueada.';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(supportMessage)}`, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-6">
        {/* Ícone de Cadeado */}
        <div className="flex justify-center">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-6">
            <Lock size={48} className="text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>

        {/* Mensagem */}
        <p className="text-lg text-muted-foreground max-w-md">
          {message}
        </p>

        {/* Botões */}
        <div className="flex gap-4 justify-center pt-4">
          {showBackButton && (
            <Button
              variant="outline"
              onClick={() => setLocation('/dashboard')}
              className="px-6"
            >
              Voltar para Dashboard
            </Button>
          )}
          <Button
            onClick={handleContactSupport}
            className="px-6 bg-green-600 hover:bg-green-700 text-white"
          >
            Falar com Suporte
          </Button>
        </div>
      </div>
    </div>
  );
}
