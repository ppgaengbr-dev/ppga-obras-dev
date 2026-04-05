import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';

interface AccessDeniedProps {
  showBackButton?: boolean;
}

export default function AccessDenied({
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
      <Card className="p-8 max-w-md w-full border border-border rounded-2xl">
        <div className="text-center space-y-4">
          {/* Ícone de Cadeado */}
          <div className="flex justify-center">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4">
              <Lock size={40} className="text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-foreground">Acesso Negado</h1>

          {/* Mensagem */}
          <p className="text-muted-foreground">
            Você não tem permissão para visualizar essa página. Entre em contato com o suporte caso tenha algo errado.
          </p>

          {/* Botões */}
          <div className="flex gap-3 justify-center pt-4">
            {showBackButton && (
              <Button
                onClick={() => setLocation('/painel')}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
              >
                Voltar ao Dashboard
              </Button>
            )}
            <Button
              onClick={handleContactSupport}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Falar com Suporte
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
