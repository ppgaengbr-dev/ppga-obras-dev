import React from 'react';

const InConstruction = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
      <h1 className="text-4xl font-bold mb-4">Página em Construção</h1>
      <p className="text-lg text-center">Estamos trabalhando duro para trazer esta funcionalidade para você. Volte em breve!</p>
      <img src="/images/under_construction.png" alt="Em Construção" className="mt-8 w-64 h-auto" />
    </div>
  );
};

export default InConstruction;
