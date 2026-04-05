import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const InConstruction = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] px-4">
      <Card className="p-8 max-w-md w-full border border-border rounded-2xl shadow-sm">
        <div className="text-center space-y-4">
          {/* Ícone de Construção */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🔨</span>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900">Em Construção</h1>

          {/* Mensagem */}
          <p className="text-gray-500 text-sm leading-relaxed">
            Estamos trabalhando duro para trazer esta funcionalidade para você. Volte em breve!
          </p>

          {/* Botão */}
          <div className="pt-4">
            <Button
              onClick={() => setLocation('/painel')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-11"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InConstruction;
