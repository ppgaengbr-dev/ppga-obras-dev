import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { usePermission } from '../_core/hooks/usePermission';
import AccessDenied from '../components/AccessDenied';

export default function Simulator() {
  const { canAccessPage } = usePermission();
  
  if (!canAccessPage('simulador')) {
    return <AccessDenied />;
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Card className="p-8 max-w-md w-full border border-border rounded-2xl">
        <div className="text-center space-y-4">
          {/* Ícone de Construção */}
          <div className="flex justify-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-full p-4">
              <AlertCircle size={40} className="text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-foreground">Em Construção</h1>

          {/* Mensagem */}
          <p className="text-muted-foreground">
            O simulador de cálculo de valor de obra está sendo desenvolvido. 
            Em breve você poderá utilizar essa funcionalidade!
          </p>

          {/* Ícone de Engrenagem */}
          <div className="pt-4">
            <div className="text-4xl">🔧</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
